export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // 预设密码
  const CORRECT_PASSWORD = env.DOCS_SHADOW;
  if (!CORRECT_PASSWORD) {
    return new Response("管理员未设置访问密码，请检查 Cloudflare 环境变量。", { status: 500 });
  }

  // 检查 Cookie 验证状态
  const cookie = request.headers.get("Cookie") || "";
  if (cookie.includes("shadow_auth=true")) {
    return await next();
  }

  // 处理密码提交
  if (request.method === "POST") {
    const formData = await request.formData();
    const password = formData.get("password");

    if (password === CORRECT_PASSWORD) {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": url.pathname,
          "Set-Cookie": "shadow_auth=true; Path=/; Secure; SameSite=Strict; Max-Age=604800", // 有效期 1 天
        },
      });
    } else {
      // 密码错误返回，带一个错误提示参数
      return new Response(renderLoginScreen(true), {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }
  }

  // 默认返回登录界面
  return new Response(renderLoginScreen(false), {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}

// 简单的登录页面模板
function renderLoginScreen(isError) {
  return `
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>内容受限 - ituknown</title>
  <style>
    body {
      font-family: -apple-system, system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f4f4f7;
    }

    .card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 320px;
      text-align: center;
    }

    input {
      width: 100%;
      padding: 12px;
      margin: 1rem 0;
      border: 1px solid #ddd;
      border-radius: 6px;
      box-sizing: border-box;
    }

    button {
      width: 100%;
      padding: 12px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    button:hover {
      background: #1d4ed8;
    }

    .error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
  </style>
</head>

<body>
  <div class="card">
    <h3>🔒 访问受限</h3>
    <p style="color: #666; font-size: 0.9rem;">请输入密码以查看受限内容</p>
    <form method="POST">
      <input type="password" name="password" placeholder="输入密码" autofocus>
      ${isError ? `<div class="error">密码不正确，请重试</div>` : ''}
      <button type="submit">确认访问</button>
    </form>
  </div>
</body>

</html>
  `;
}