// @ts-ignore - D1Database type is defined in types.d.ts
/// <reference path="../types.d.ts" />

// 验证管理员 token
function verifyAdminToken(request: Request, env: { ADMIN_TOKEN?: string }): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === env.ADMIN_TOKEN;
}

export async function onRequestGet(context: {
  request: Request;
  env: { DB: D1Database; ADMIN_TOKEN?: string };
}) {
  const { request, env } = context;

  // 验证管理员权限
  if (!verifyAdminToken(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 总激活码数
    const totalCodes = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM activation_codes'
    ).first<{ count: number }>();

    // 按状态统计
    const statusStats = await env.DB.prepare(
      'SELECT status, COUNT(*) as count FROM activation_codes GROUP BY status'
    ).all<{ status: string; count: number }>();

    // 按类型统计
    const typeStats = await env.DB.prepare(
      'SELECT type, COUNT(*) as count FROM activation_codes GROUP BY type'
    ).all<{ type: string; count: number }>();

    // 总用户数（有使用记录的设备）
    const totalUsers = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM user_credits'
    ).first<{ count: number }>();

    // 活跃用户数（最近7天使用过）
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    const activeUsers = await env.DB.prepare(
      'SELECT COUNT(DISTINCT device_fingerprint) as count FROM usage_logs WHERE used_at > ?'
    ).bind(sevenDaysAgo).first<{ count: number }>();

    // 最近30天的激活码使用数
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const recentActivations = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM activation_usage WHERE activated_at > ?'
    ).bind(thirtyDaysAgo).first<{ count: number }>();

    // 总使用次数
    const totalUsage = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM usage_logs'
    ).first<{ count: number }>();

    // 邀请码统计
    const totalInviteCodes = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM invite_codes'
    ).first<{ count: number }>();

    const usedInviteCodes = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM invite_codes WHERE status = "used"'
    ).first<{ count: number }>();

    // 邀请码使用记录
    const totalInviteUsage = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM invite_usage'
    ).first<{ count: number }>();

    // 总发放的 credits（通过激活码）
    const totalCreditsDistributed = await env.DB.prepare(
      'SELECT SUM(credits_added) as total FROM activation_usage'
    ).first<{ total: number }>();

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalCodes: totalCodes?.count || 0,
          totalUsers: totalUsers?.count || 0,
          activeUsers: activeUsers?.count || 0,
          totalUsage: totalUsage?.count || 0,
          totalCreditsDistributed: totalCreditsDistributed?.total || 0,
          recentActivations: recentActivations?.count || 0,
          totalInviteCodes: totalInviteCodes?.count || 0,
          usedInviteCodes: usedInviteCodes?.count || 0,
          totalInviteUsage: totalInviteUsage?.count || 0,
          byStatus: statusStats.results.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
          }, {} as Record<string, number>),
          byType: typeStats.results.reduce((acc, item) => {
            acc[item.type] = item.count;
            return acc;
          }, {} as Record<string, number>),
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in stats handler:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

