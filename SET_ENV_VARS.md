# 设置环境变量

## 重要提示
这些命令需要交互式输入，无法自动执行。请按照以下步骤操作：

## 步骤 1: 设置 Gemini API Key

运行命令：
```bash
npx wrangler pages secret put GEMINI_API_KEY
```

当提示时：
1. 选择你的 Pages 项目：`englisheditor`
2. 输入你的 Gemini API Key（格式：`AIza...`）
3. 按 Enter 确认

## 步骤 2: 设置管理员 Token

运行命令：
```bash
npx wrangler pages secret put ADMIN_TOKEN
```

当提示时：
1. 选择你的 Pages 项目：`englisheditor`
2. 输入一个强密码作为管理员 token
   - **建议**：使用密码生成器生成32+字符的随机字符串
   - **重要**：请保存好这个 token，用于访问后台管理界面 `/admin`
3. 按 Enter 确认

## 验证设置

设置完成后，可以验证：
```bash
npx wrangler pages secret list
```

应该看到两个 secret：
- `GEMINI_API_KEY`
- `ADMIN_TOKEN`

## 完成设置后

运行以下命令继续部署：
```bash
npm run build
npm run deploy
```

