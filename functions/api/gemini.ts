// @ts-ignore - D1Database type is defined in types.d.ts
/// <reference path="../types.d.ts" />

export async function onRequestPost(context: {
  request: Request;
  env: { GEMINI_API_KEY?: string; DB?: D1Database };
}) {
  const { request, env } = context;

  try {
    const { text, systemPrompt, model, deviceFingerprint } = await request.json();

    // 验证输入
    if (!text || !systemPrompt || !model) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, systemPrompt, model' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 验证使用次数（如果提供了设备指纹和数据库）
    if (deviceFingerprint && env.DB) {
      // 查询用户记录
      let user = await env.DB.prepare(
        'SELECT * FROM user_credits WHERE device_fingerprint = ?'
      ).bind(deviceFingerprint).first<{
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
          remaining_credits: 0,
          free_trials_used: 0,
        };
      }

      // 检查是否有可用次数
      const freeTrialsRemaining = Math.max(0, 3 - user.free_trials_used);
      const totalAvailable = freeTrialsRemaining + user.remaining_credits;

      if (totalAvailable <= 0) {
        return new Response(
          JSON.stringify({
            error: 'No credits remaining. Please use an activation code or invite code to continue.',
            remainingCredits: 0,
            needsActivation: true,
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // 扣除次数（优先使用免费试用，然后使用 credits）
      let newFreeTrialsUsed = user.free_trials_used;
      let newRemainingCredits = user.remaining_credits;

      if (freeTrialsRemaining > 0) {
        // 使用免费试用次数
        newFreeTrialsUsed = user.free_trials_used + 1;
      } else {
        // 使用 credits
        newRemainingCredits = user.remaining_credits - 1;
      }

      // 更新用户记录
      await env.DB.prepare(
        `UPDATE user_credits 
         SET remaining_credits = ?, free_trials_used = ?, used_credits = used_credits + 1, last_updated = ?
         WHERE device_fingerprint = ?`
      )
        .bind(
          newRemainingCredits,
          newFreeTrialsUsed,
          Math.floor(Date.now() / 1000),
          deviceFingerprint
        )
        .run();

      // 记录使用日志
      await env.DB.prepare(
        `INSERT INTO usage_logs (device_fingerprint, credits_used, mode, used_at)
         VALUES (?, 1, ?, ?)`
      )
        .bind(deviceFingerprint, systemPrompt.includes('Legal') ? 'legal' : 'general', Math.floor(Date.now() / 1000))
        .run();
    }

    // 从环境变量获取 API key
    const apiKey = env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 处理模型 ID（处理别名）
    let modelId: string = model;
    if (model === "gemini-1.5-flash") {
      modelId = "gemini-1.5-flash-latest";
    } else if (model === "gemini-1.5-pro") {
      modelId = "gemini-1.5-pro-latest";
    }

    // 调用 Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              parts: [{ text }]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No content returned.";

    // 返回结果和剩余次数信息
    const responseData: any = { content };
    
    if (deviceFingerprint && env.DB) {
      // 查询更新后的用户记录
      const updatedUser = await env.DB.prepare(
        'SELECT remaining_credits, free_trials_used FROM user_credits WHERE device_fingerprint = ?'
      ).bind(deviceFingerprint).first<{
        remaining_credits: number;
        free_trials_used: number;
      }>();

      if (updatedUser) {
        const freeTrialsRemaining = Math.max(0, 3 - updatedUser.free_trials_used);
        responseData.remainingCredits = updatedUser.remaining_credits;
        responseData.freeTrialsUsed = updatedUser.free_trials_used;
        responseData.freeTrialsRemaining = freeTrialsRemaining;
        responseData.totalAvailable = freeTrialsRemaining + updatedUser.remaining_credits;
      }
    }

    return new Response(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error: any) {
    console.error('Error in Gemini API handler:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 处理 OPTIONS 请求（CORS preflight）
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

