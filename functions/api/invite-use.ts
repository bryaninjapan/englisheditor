// @ts-ignore - D1Database type is defined in types.d.ts
/// <reference path="../types.d.ts" />

// 使用邀请码
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

    const normalizedCode = code.toUpperCase().replace(/-/g, '');

    // 查询邀请码（支持有/无连字符的格式）
    const inviteCode = await env.DB.prepare(
      'SELECT * FROM invite_codes WHERE code = ? OR REPLACE(code, "-", "") = ?'
    ).bind(code.toUpperCase(), normalizedCode).first<{
      id: number;
      code: string;
      creator_fingerprint: string;
      credits: number;
      status: string;
      used_by_fingerprint: string | null;
    }>();

    if (!inviteCode) {
      return new Response(JSON.stringify({ error: 'Invite code not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (inviteCode.status !== 'active') {
      return new Response(
        JSON.stringify({ error: `Invite code is ${inviteCode.status}` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 防止自邀请
    if (inviteCode.creator_fingerprint === deviceFingerprint) {
      return new Response(
        JSON.stringify({ error: 'You cannot use your own invite code' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 检查是否已被使用
    if (inviteCode.used_by_fingerprint) {
      return new Response(JSON.stringify({ error: 'Invite code has already been used' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 检查被邀请者是否已经使用过其他邀请码
    const existingInviteUsage = await env.DB.prepare(
      'SELECT id FROM invite_usage WHERE invitee_fingerprint = ?'
    ).bind(deviceFingerprint).first();

    if (existingInviteUsage) {
      return new Response(
        JSON.stringify({ error: 'You have already used an invite code' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 获取或创建邀请者用户记录
    let inviter = await env.DB.prepare(
      'SELECT * FROM user_credits WHERE device_fingerprint = ?'
    ).bind(inviteCode.creator_fingerprint).first<{
      remaining_credits: number;
      total_credits: number;
    }>();

    if (!inviter) {
      await env.DB.prepare(
        `INSERT INTO user_credits (device_fingerprint, total_credits, used_credits, remaining_credits, free_trials_used)
         VALUES (?, 0, 0, 0, 0)`
      ).bind(inviteCode.creator_fingerprint).run();
      inviter = { remaining_credits: 0, total_credits: 0 };
    }

    // 获取或创建被邀请者用户记录
    let invitee = await env.DB.prepare(
      'SELECT * FROM user_credits WHERE device_fingerprint = ?'
    ).bind(deviceFingerprint).first<{
      remaining_credits: number;
      total_credits: number;
    }>();

    if (!invitee) {
      await env.DB.prepare(
        `INSERT INTO user_credits (device_fingerprint, total_credits, used_credits, remaining_credits, free_trials_used)
         VALUES (?, 0, 0, 0, 0)`
      ).bind(deviceFingerprint).run();
      invitee = { remaining_credits: 0, total_credits: 0 };
    }

    const creditsToGive = inviteCode.credits; // 默认3次

    // 更新邀请者（增加3次）
    const inviterNewCredits = inviter.remaining_credits + creditsToGive;
    await env.DB.prepare(
      `UPDATE user_credits 
       SET remaining_credits = ?, total_credits = total_credits + ?, last_updated = ?
       WHERE device_fingerprint = ?`
    )
      .bind(
        inviterNewCredits,
        creditsToGive,
        Math.floor(Date.now() / 1000),
        inviteCode.creator_fingerprint
      )
      .run();

    // 更新被邀请者（增加3次）
    const inviteeNewCredits = invitee.remaining_credits + creditsToGive;
    await env.DB.prepare(
      `UPDATE user_credits 
       SET remaining_credits = ?, total_credits = total_credits + ?, last_updated = ?
       WHERE device_fingerprint = ?`
    )
      .bind(inviteeNewCredits, creditsToGive, Math.floor(Date.now() / 1000), deviceFingerprint)
      .run();

    // 标记邀请码为已使用
    await env.DB.prepare(
      `UPDATE invite_codes 
       SET status = 'used', used_by_fingerprint = ?, used_at = ?
       WHERE code = ?`
    )
      .bind(deviceFingerprint, Math.floor(Date.now() / 1000), inviteCode.code)
      .run();

    // 记录邀请使用
    await env.DB.prepare(
      `INSERT INTO invite_usage (invite_code, inviter_fingerprint, invitee_fingerprint, credits_given)
       VALUES (?, ?, ?, ?)`
    )
      .bind(inviteCode.code, inviteCode.creator_fingerprint, deviceFingerprint, creditsToGive)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully used invite code! Both you and the inviter received ${creditsToGive} credits.`,
        creditsAdded: creditsToGive,
        remainingCredits: inviteeNewCredits,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in invite-use handler:', error);
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

