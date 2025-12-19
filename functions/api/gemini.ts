export async function onRequestPost(context: { request: Request; env: { GEMINI_API_KEY?: string } }) {
  const { request, env } = context;

  try {

    const { text, systemPrompt, model } = await request.json();

    // 验证输入
    if (!text || !systemPrompt || !model) {
      return new Response(JSON.stringify({ error: 'Missing required fields: text, systemPrompt, model' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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

    return new Response(JSON.stringify({ content }), {
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

