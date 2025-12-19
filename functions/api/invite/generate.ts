// @ts-ignore - D1Database type is defined in types.d.ts
/// <reference path="../../types.d.ts" />

// 生成邀请码的工具函数
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 用户生成邀请码
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

    // 生成唯一邀请码
    let code = generateInviteCode();
    let attempts = 0;

    while (attempts < 10) {
      const existing = await env.DB.prepare('SELECT id FROM invite_codes WHERE code = ?')
        .bind(code)
        .first();

      if (!existing) {
        break;
      }

      code = generateInviteCode();
      attempts++;
    }

    if (attempts >= 10) {
      return new Response(JSON.stringify({ error: 'Failed to generate unique invite code' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 保存邀请码
    await env.DB.prepare(
      `INSERT INTO invite_codes (code, creator_fingerprint, credits, status)
       VALUES (?, ?, 3, 'active')`
    ).bind(code, deviceFingerprint).run();

    return new Response(
      JSON.stringify({
        success: true,
        inviteCode: code,
        message: 'Invite code generated successfully. Share it with friends to earn rewards!',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in invite-generate handler:', error);
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

