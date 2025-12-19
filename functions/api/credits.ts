// @ts-ignore - D1Database type is defined in types.d.ts
/// <reference path="../types.d.ts" />

// 获取用户剩余次数
export async function onRequestPost(context: {
  request: Request;
  env: { DB: D1Database };
}) {
  const { request, env } = context;

  try {
    const { deviceFingerprint } = await request.json();

    if (!deviceFingerprint) {
      return new Response(JSON.stringify({ error: 'Missing deviceFingerprint' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 查询或创建用户记录
    let user = await env.DB.prepare(
      'SELECT * FROM user_credits WHERE device_fingerprint = ?'
    ).bind(deviceFingerprint).first<{
      device_fingerprint: string;
      total_credits: number;
      used_credits: number;
      remaining_credits: number;
      free_trials_used: number;
    }>();

    // 如果用户不存在，创建新用户（3次免费试用）
    if (!user) {
      await env.DB.prepare(
        `INSERT INTO user_credits (device_fingerprint, total_credits, used_credits, remaining_credits, free_trials_used)
         VALUES (?, 0, 0, 0, 0)`
      ).bind(deviceFingerprint).run();

      user = {
        device_fingerprint: deviceFingerprint,
        total_credits: 0,
        used_credits: 0,
        remaining_credits: 0,
        free_trials_used: 0,
      };
    }

    // 计算剩余可用次数（免费试用 + 剩余 credits）
    const freeTrialsRemaining = Math.max(0, 3 - user.free_trials_used);
    const availableCredits = freeTrialsRemaining + user.remaining_credits;

    return new Response(
      JSON.stringify({
        success: true,
        remainingCredits: user.remaining_credits,
        freeTrialsUsed: user.free_trials_used,
        freeTrialsRemaining,
        totalAvailable: availableCredits,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in credits handler:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

