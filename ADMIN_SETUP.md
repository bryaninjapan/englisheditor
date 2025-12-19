# Admin Panel Setup Guide

## 问题：出现 "Unauthorized" 错误

如果你在访问 `/admin` 页面并尝试生成激活码时看到 "Unauthorized" 错误，通常是因为：

1. **ADMIN_TOKEN 未设置** - 需要在 Cloudflare Pages 中设置
2. **输入的 token 不正确** - 前端输入的 token 必须与 Cloudflare 中设置的 ADMIN_TOKEN 完全一致

## 解决方案

### 方案 1: 确认 ADMIN_TOKEN 已设置

运行以下命令检查：

```bash
npx wrangler pages secret list
```

应该看到：
```
- ADMIN_TOKEN: Value Encrypted
- GEMINI_API_KEY: Value Encrypted
```

### 方案 2: 设置或重新设置 ADMIN_TOKEN

如果你还没有设置 ADMIN_TOKEN，或者忘记了之前设置的 token，可以重新设置：

```bash
npx wrangler pages secret put ADMIN_TOKEN
```

**重要提示：**
1. 当提示选择项目时，选择 `englisheditor`
2. 输入一个强密码作为 token（建议使用密码生成器生成32+字符的随机字符串）
3. **请务必保存好这个 token**，因为这是访问后台管理界面的唯一凭证
4. 设置后，需要重新部署才能生效（或者等待几分钟让 Cloudflare 更新）

### 方案 3: 使用正确的 Token 登录

1. 访问 https://main.englisheditor.pages.dev/admin
2. 在 "Admin Token" 输入框中，输入你之前在 Cloudflare 中设置的 `ADMIN_TOKEN`
3. 点击 "Login"
4. 登录成功后，你应该能看到管理面板

### 方案 4: 如果忘记了 Token

如果你忘记了之前设置的 ADMIN_TOKEN：

1. **重新设置**（推荐）：
   ```bash
   npx wrangler pages secret put ADMIN_TOKEN
   ```
   输入新的 token，然后使用新 token 登录

2. **查看 Cloudflare Dashboard**：
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 Workers & Pages → 选择 `englisheditor` 项目
   - 进入 Settings → Environment Variables
   - 注意：出于安全考虑，Cloudflare 不会显示已设置的 secret 值，只能看到名称

## 生成强密码 Token

建议使用以下方法生成强密码：

### 方法 1: 使用 OpenSSL（推荐）
```bash
openssl rand -base64 32
```

### 方法 2: 使用 Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 方法 3: 使用在线密码生成器
访问 https://www.random.org/passwords/ 生成强密码

## 验证设置

设置完成后：

1. **重新部署**（如果刚刚设置了新的 token）：
   ```bash
   npm run build
   npm run deploy
   ```

2. **测试登录**：
   - 访问 https://main.englisheditor.pages.dev/admin
   - 输入你设置的 ADMIN_TOKEN
   - 应该能够成功登录并看到管理面板

## 常见问题

### Q: 为什么我输入的 token 总是显示 "Unauthorized"？

A: 可能的原因：
- Token 与 Cloudflare 中设置的不完全一致（注意大小写、空格等）
- Token 刚刚设置，需要等待几分钟让 Cloudflare 更新
- 需要重新部署应用

### Q: 如何确认我的 token 是否正确？

A: 
1. 确认你在 Cloudflare 中设置的 token
2. 在前端输入时，确保完全一致（包括大小写、没有多余空格）
3. 如果还是不行，尝试重新设置 token

### Q: 可以设置多个管理员吗？

A: 当前系统只支持一个 ADMIN_TOKEN。如果需要多个管理员，可以：
- 共享同一个 token（不推荐，安全性较低）
- 或者修改代码支持多个 token（需要开发）

## 安全建议

1. **使用强密码**：建议使用32+字符的随机字符串
2. **不要分享 token**：只在需要访问管理面板的人员之间分享
3. **定期更换**：建议定期更换 ADMIN_TOKEN
4. **不要在代码中硬编码**：始终使用环境变量

