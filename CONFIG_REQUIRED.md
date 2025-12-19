# 配置必需信息

在部署应用之前，需要配置以下信息：

## 1. 数据库 ID

在 `wrangler.toml` 文件中，将 `YOUR_DATABASE_ID_HERE` 替换为你的实际 D1 数据库 ID：

```toml
database_id = "你的数据库ID" # 从 Cloudflare Dashboard 获取
```

**获取数据库 ID**：
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → D1
3. 找到 `englisheditor-db` 数据库
4. 复制数据库 ID

## 2. Gumroad 产品链接

在 `app/lib/config.ts` 文件中，将占位符 URL 替换为你的实际 Gumroad 产品链接：

```typescript
export const GUMROAD_PRODUCT_URL = "https://你的用户名.gumroad.com/l/englisheditor";
```

**获取 Gumroad 链接**：
1. 登录 Gumroad
2. 进入你的产品页面
3. 复制产品链接

## 3. 环境变量（在 Cloudflare Dashboard 中设置）

以下环境变量需要在 Cloudflare Dashboard 中设置，**不要**提交到代码仓库：

- `GEMINI_API_KEY` - Gemini API 密钥
- `ADMIN_TOKEN` - 管理员访问令牌

**设置方法**：
```bash
npx wrangler pages secret put GEMINI_API_KEY
npx wrangler pages secret put ADMIN_TOKEN
```

或通过 Cloudflare Dashboard：
1. Workers & Pages → Pages → englisheditor → Settings
2. Environment Variables → 添加变量

## 安全提示

⚠️ **重要**：以下信息**永远不要**提交到 Git 仓库：
- API 密钥
- 管理员令牌
- 数据库连接字符串
- 任何敏感凭证

所有敏感信息都应该通过环境变量或 Cloudflare Secrets 管理。

