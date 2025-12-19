# Cloudflare Pages 部署指南

## 前置要求

1. Cloudflare 账号
2. 已安装 Node.js 和 npm
3. Gemini API Key

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

这会打开浏览器，让你登录 Cloudflare 账号。

### 3. 创建 Cloudflare Pages 项目

首先，你需要先创建一个 Pages 项目（如果还没有）：

```bash
npx wrangler pages project create englisheditor
```

### 4. 设置 Gemini API Key

**重要：** 对于 Cloudflare Pages，需要使用 `pages secret put` 命令：

```bash
npx wrangler pages secret put GEMINI_API_KEY
```

当提示时：
1. 选择你的 Pages 项目（`englisheditor`）
2. 粘贴你的 Gemini API Key（格式：`AIza...`）

**注意：** 不要在命令中直接输入 API key，这是不安全的。应该使用交互式输入。

### 5. 构建项目

```bash
npm run build
```

这会生成 `out` 目录，包含静态文件。

### 6. 部署到 Cloudflare Pages

```bash
npm run deploy
```

或者使用：

```bash
npx wrangler pages deploy out
```

### 7. 在 Cloudflare Dashboard 中配置

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers & Pages
3. 找到你的项目 `englisheditor`
4. 确保环境变量 `GEMINI_API_KEY` 已设置

## 本地开发

### 使用 Next.js 开发服务器（推荐用于前端开发）

```bash
npm run dev
```

### 使用 Wrangler 本地测试（测试 Pages Functions）

```bash
npm run build
npm run pages:dev
```

这会启动本地服务器，包括 Pages Functions，方便测试 API 路由。

## 更新 API Key

如果以后需要更新 API Key：

```bash
npx wrangler pages secret put GEMINI_API_KEY
```

选择你的 Pages 项目，然后输入新的 API Key。

## 注意事项

- API Key 存储在 Cloudflare 的加密环境中，不会暴露给客户端
- 每次部署后，Pages Functions 会自动使用最新的代码和环境变量
- 如果遇到 CORS 错误，检查 `functions/api/gemini.ts` 中的 CORS 头设置

## 故障排查

### API 调用失败

1. 检查 API Key 是否正确设置：
   ```bash
   npx wrangler pages secret list
   ```
   
   注意：这只会显示 secret 名称列表，不会显示值（出于安全考虑）。

2. 检查 Worker 日志：
   - 在 Cloudflare Dashboard 中查看 Workers & Pages
   - 选择你的项目
   - 查看 Logs 标签

### 构建失败

确保：
- Node.js 版本 >= 18
- 所有依赖都已安装
- TypeScript 编译无错误

