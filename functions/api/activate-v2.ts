// @ts-ignore - D1Database type is defined in types.d.ts
/// <reference path="../types.d.ts" />

// 使用激活码充值次数
export async function onRequestPost(context: {
  request: Request;
  env: { DB: D1Database };
}) {
  const { request, env } = context;

  try {
    const { code, deviceFingerprint } = await request.json();

    if (!code || !deviceFingerprint) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: code, deviceFingerprint' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 验证激活码格式
    const codePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!codePattern.test(code.toUpperCase())) {
      return new Response(JSON.stringify({ error: 'Invalid activation code format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedCode = code.toUpperCase();

    // 查询激活码
    const activationCode = await env.DB.prepare(
      'SELECT * FROM activation_codes WHERE code = ?'
    ).bind(normalizedCode).first<{
      id: number;
      code: string;
      type: string;
      credits: number;
      status: string;
    }>();

    if (!activationCode) {
      return new Response(JSON.stringify({ error: 'Activation code not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (activationCode.status !== 'active') {
      return new Response(
        JSON.stringify({ error: `Activation code is ${activationCode.status}` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    // 增加用户的剩余次数（支持叠加）
    const newRemainingCredits = user.remaining_credits + activationCode.credits;
    const newTotalCredits = user.total_credits + activationCode.credits;

    await env.DB.prepare(
      `UPDATE user_credits 
       SET remaining_credits = ?, total_credits = ?, last_updated = ?
       WHERE device_fingerprint = ?`
    )
      .bind(newRemainingCredits, newTotalCredits, Math.floor(Date.now() / 1000), deviceFingerprint)
      .run();

    // 记录激活码使用
    await env.DB.prepare(
      `INSERT INTO activation_usage (activation_code, device_fingerprint, credits_added)
       VALUES (?, ?, ?)`
    )
      .bind(normalizedCode, deviceFingerprint, activationCode.credits)
      .run();

    // 更新激活码使用统计
    await env.DB.prepare(
      'UPDATE activation_codes SET used_count = used_count + 1 WHERE code = ?'
    ).bind(normalizedCode).run();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully activated! Added ${activationCode.credits} credits.`,
        creditsAdded: activationCode.credits,
        remainingCredits: newRemainingCredits,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in activate-v2 handler:', error);
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

