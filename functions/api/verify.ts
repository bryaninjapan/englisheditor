// @ts-ignore - D1Database type is defined in types.d.ts
/// <reference path="../types.d.ts" />

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

    // 查找设备的激活记录
    const activation = await env.DB.prepare(
      `SELECT a.*, ac.type, ac.status as code_status 
       FROM activations a
       JOIN activation_codes ac ON a.activation_code = ac.code
       WHERE a.device_fingerprint = ?
       ORDER BY a.activated_at DESC
       LIMIT 1`
    ).bind(deviceFingerprint).first<{
      activation_code: string;
      expires_at: number | null;
      code_status: string;
    }>();

    if (!activation) {
      return new Response(
        JSON.stringify({ activated: false, message: 'Device not activated' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 检查激活码状态
    if (activation.code_status !== 'active') {
      return new Response(
        JSON.stringify({
          activated: false,
          message: 'Activation code is no longer active',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 检查是否过期
    if (activation.expires_at && activation.expires_at < Date.now() / 1000) {
      return new Response(
        JSON.stringify({ activated: false, message: 'Activation has expired' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 更新最后使用时间
    await env.DB.prepare(
      'UPDATE activations SET last_used_at = ? WHERE device_fingerprint = ? AND activation_code = ?'
    )
      .bind(Math.floor(Date.now() / 1000), deviceFingerprint, activation.activation_code)
      .run();

    return new Response(
      JSON.stringify({
        activated: true,
        expiresAt: activation.expires_at,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in verify handler:', error);
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

