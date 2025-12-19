// @ts-ignore - D1Database type is defined in types.d.ts
/// <reference path="../types.d.ts" />

// 生成激活码的工具函数
function generateActivationCode(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
  return [
    uuid.substring(0, 4),
    uuid.substring(4, 8),
    uuid.substring(8, 12),
    uuid.substring(12, 16),
  ].join('-');
}

// 验证管理员 token
function verifyAdminToken(request: Request, env: { ADMIN_TOKEN?: string }): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === env.ADMIN_TOKEN;
}

export async function onRequestPost(context: {
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
    const { type = 'purchase', maxUses = 1, expiresDays, count = 1, metadata } = await request.json();

    if (!type || !['purchase', 'invite', 'trial', 'admin'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid type. Must be: purchase, invite, trial, or admin' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (count < 1 || count > 100) {
      return new Response(JSON.stringify({ error: 'Count must be between 1 and 100' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const codes: string[] = [];
    const expiresAt = expiresDays ? Math.floor(Date.now() / 1000) + (expiresDays * 24 * 60 * 60) : null;

    // 批量生成激活码
    for (let i = 0; i < count; i++) {
      let code = generateActivationCode();
      let attempts = 0;
      
      // 确保生成的码是唯一的（最多尝试10次）
      while (attempts < 10) {
        const existing = await env.DB.prepare('SELECT id FROM activation_codes WHERE code = ?')
          .bind(code)
          .first();
        
        if (!existing) {
          break;
        }
        
        code = generateActivationCode();
        attempts++;
      }

      if (attempts >= 10) {
        return new Response(JSON.stringify({ error: 'Failed to generate unique code' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 插入数据库
      await env.DB.prepare(
        `INSERT INTO activation_codes (code, type, status, max_uses, expires_at, metadata)
         VALUES (?, ?, 'active', ?, ?, ?)`
      )
        .bind(code, type, maxUses, expiresAt, metadata ? JSON.stringify(metadata) : null)
        .run();

      codes.push(code);
    }

    return new Response(
      JSON.stringify({
        success: true,
        codes,
        count: codes.length,
        type,
        maxUses,
        expiresAt,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in generate handler:', error);
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

