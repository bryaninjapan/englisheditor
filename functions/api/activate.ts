// @ts-ignore - D1Database type is defined in types.d.ts
/// <reference path="../types.d.ts" />

export async function onRequestPost(context: {
  request: Request;
  env: { DB: D1Database; GEMINI_API_KEY?: string };
}) {
  const { request, env } = context;

  try {
    const { code, deviceFingerprint, userEmail } = await request.json();

    // 验证输入
    if (!code || !deviceFingerprint) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: code, deviceFingerprint' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 验证激活码格式（XXXX-XXXX-XXXX-XXXX）
    const codePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!codePattern.test(code.toUpperCase())) {
      return new Response(JSON.stringify({ error: 'Invalid activation code format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const normalizedCode = code.toUpperCase();

    // 查询激活码
    const codeResult = await env.DB.prepare(
      'SELECT * FROM activation_codes WHERE code = ?'
    ).bind(normalizedCode).first<{
      id: number;
      code: string;
      type: string;
      status: string;
      max_uses: number;
      current_uses: number;
      expires_at: number | null;
      created_at: number;
    }>();

    if (!codeResult) {
      return new Response(JSON.stringify({ error: 'Activation code not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查状态
    if (codeResult.status !== 'active') {
      return new Response(
        JSON.stringify({ error: `Activation code is ${codeResult.status}` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 检查过期时间
    if (codeResult.expires_at && codeResult.expires_at < Date.now() / 1000) {
      // 更新状态为过期
      await env.DB.prepare('UPDATE activation_codes SET status = ? WHERE code = ?')
        .bind('expired', normalizedCode)
        .run();
      
      return new Response(JSON.stringify({ error: 'Activation code has expired' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查使用次数
    if (codeResult.current_uses >= codeResult.max_uses) {
      return new Response(JSON.stringify({ error: 'Activation code has reached maximum uses' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查设备是否已经激活过
    const existingActivation = await env.DB.prepare(
      'SELECT * FROM activations WHERE activation_code = ? AND device_fingerprint = ?'
    ).bind(normalizedCode, deviceFingerprint).first();

    if (existingActivation) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Device already activated with this code',
          activated: true,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 检查同一激活码是否已绑定太多设备（允许最多3个设备）
    const deviceCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM activations WHERE activation_code = ?'
    ).bind(normalizedCode).first<{ count: number }>();

    if (deviceCount && deviceCount.count >= 3) {
      return new Response(
        JSON.stringify({ error: 'Maximum devices (3) already activated with this code' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 创建激活记录
    const expiresAt = codeResult.expires_at ? codeResult.expires_at : null;

    await env.DB.prepare(
      `INSERT INTO activations (activation_code, device_fingerprint, user_email, expires_at)
       VALUES (?, ?, ?, ?)`
    )
      .bind(normalizedCode, deviceFingerprint, userEmail || null, expiresAt)
      .run();

    // 更新激活码使用次数
    await env.DB.prepare(
      'UPDATE activation_codes SET current_uses = current_uses + 1 WHERE code = ?'
    ).bind(normalizedCode).run();

    // 如果达到最大使用次数，更新状态
    if (codeResult.current_uses + 1 >= codeResult.max_uses) {
      await env.DB.prepare('UPDATE activation_codes SET status = ? WHERE code = ?')
        .bind('used', normalizedCode)
        .run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Activation successful',
        expiresAt: expiresAt,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in activate handler:', error);
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

