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
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status'); // active, used, expired, revoked
    const type = url.searchParams.get('type'); // purchase, invite, trial, admin
    const search = url.searchParams.get('search'); // 搜索激活码

    const offset = (page - 1) * limit;

    // 构建查询
    let whereConditions: string[] = [];
    let bindValues: any[] = [];

    if (status) {
      whereConditions.push('status = ?');
      bindValues.push(status);
    }

    if (type) {
      whereConditions.push('type = ?');
      bindValues.push(type);
    }

    if (search) {
      whereConditions.push('code LIKE ?');
      bindValues.push(`%${search.toUpperCase()}%`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 获取总数
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM activation_codes ${whereClause}`
    ).bind(...bindValues).first<{ total: number }>();

    const total = countResult?.total || 0;

    // 获取列表
    bindValues.push(limit, offset);
    const result = await env.DB.prepare(
      `SELECT 
        id, code, type, status, max_uses, current_uses, expires_at, created_at, created_by, metadata
       FROM activation_codes 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(...bindValues).all<{
      id: number;
      code: string;
      type: string;
      status: string;
      max_uses: number;
      current_uses: number;
      expires_at: number | null;
      created_at: number;
      created_by: string | null;
      metadata: string | null;
    }>();

    // 获取每个激活码的设备数量
    const codesWithDeviceCount = await Promise.all(
      result.results.map(async (code) => {
        const deviceCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM activations WHERE activation_code = ?'
        ).bind(code.code).first<{ count: number }>();

        return {
          ...code,
          deviceCount: deviceCount?.count || 0,
          metadata: code.metadata ? JSON.parse(code.metadata) : null,
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        codes: codesWithDeviceCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
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
    console.error('Error in list handler:', error);
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

