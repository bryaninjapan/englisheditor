# 重新设置 ADMIN_TOKEN - 快速指南

如果 admin token 错误导致无法进入后台，请按照以下步骤重新设置。

## 方法 1: 通过 Cloudflare Dashboard（推荐，最简单）

### 步骤 1: 生成新的 Token

打开终端，运行以下命令生成一个安全的 token：

```bash
openssl rand -base64 32
```

复制输出的 token（例如：`kX8mP2vN9qR5tY7wZ1aB3cD4eF6gH8iJ0kL2mN4oP6qR`）

**重要**：请保存好这个 token，稍后需要使用它登录！

### 步骤 2: 访问 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录你的 Cloudflare 账号

### 步骤 3: 进入环境变量设置

1. 在左侧导航栏，点击 **Workers & Pages**
2. 点击顶部 **Pages** 标签
3. 找到项目 **englisheditor**，点击进入
4. 点击顶部 **Settings**（设置）标签
5. 在左侧菜单，点击 **Environment Variables**（环境变量）

### 步骤 4: 更新 ADMIN_TOKEN

#### 如果 ADMIN_TOKEN 已存在：

1. 在 **Production** 部分，找到 `ADMIN_TOKEN`
2. 点击右侧的 **Edit**（编辑）图标（通常是铅笔图标 ✏️）
3. 在 **Value**（值）输入框中，删除旧值
4. 粘贴刚才生成的新 token
5. 点击 **Save**（保存）

#### 如果 ADMIN_TOKEN 不存在：

1. 在 **Production** 部分，点击 **Add variable**（添加变量）
2. **Variable name**: 输入 `ADMIN_TOKEN`（必须完全匹配，区分大小写）
3. **Value**: 粘贴刚才生成的新 token
4. 点击 **Save**（保存）

### 步骤 5: 等待生效

- 等待 **2-5 分钟** 让更改生效

### 步骤 6: 使用新 Token 登录

1. 访问 https://main.englisheditor.pages.dev/admin
2. 在 "Admin Token" 输入框中，输入刚才设置的新 token
   - **注意**：确保完全一致，没有多余的空格
3. 点击 **Login**
4. 应该能够成功登录并看到管理面板

---

## 方法 2: 通过命令行

### 步骤 1: 生成新的 Token

```bash
openssl rand -base64 32
```

复制输出的 token。

### 步骤 2: 设置新的 Token

```bash
npx wrangler pages secret put ADMIN_TOKEN
```

当提示时：
1. 选择项目：输入 `englisheditor` 或选择对应的选项
2. 输入新的 token：粘贴刚才生成的 token
3. 按 Enter 确认

### 步骤 3: 等待生效

等待 **2-5 分钟** 让更改生效。

### 步骤 4: 使用新 Token 登录

1. 访问 https://main.englisheditor.pages.dev/admin
2. 输入新设置的 token
3. 点击 **Login**

---

## 如果仍然无法登录

### 检查 1: 确认 Token 已设置

运行以下命令检查：

```bash
npx wrangler pages secret list
```

应该看到：
```
- ADMIN_TOKEN: Value Encrypted
- GEMINI_API_KEY: Value Encrypted
```

### 检查 2: 清除浏览器缓存

1. 打开浏览器开发者工具（按 F12）
2. 进入 **Application**（应用）标签
3. 左侧找到 **Local Storage** → `https://main.englisheditor.pages.dev`
4. 找到 `admin_token`，右键删除
5. 刷新页面，重新输入 token 登录

### 检查 3: 等待更长时间

有时更改可能需要 **5-10 分钟** 才能生效。请耐心等待。

### 检查 4: 检查 Token 输入

确保：
- ✅ Token 中没有多余的空格（前后或中间）
- ✅ Token 完全一致（区分大小写）
- ✅ 复制粘贴时没有包含额外的字符

### 检查 5: 尝试重新部署（可选）

如果等待很久仍然无效，可以尝试重新部署：

```bash
npm run build
npm run deploy
```

---

## 快速参考

### 生成 Token 的命令

```bash
# 方法 1: OpenSSL（推荐）
openssl rand -base64 32

# 方法 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 检查 Token 是否设置

```bash
npx wrangler pages secret list
```

### 重新设置 Token（命令行）

```bash
npx wrangler pages secret put ADMIN_TOKEN
```

---

## 安全建议

1. **保存 Token**：将 token 保存在安全的地方（如密码管理器）
2. **不要分享**：不要在代码、Git 仓库或公开场合分享 token
3. **定期更换**：建议每 3-6 个月更换一次 token

---

## 需要更多帮助？

- 详细的操作指南：`ADMIN_TOKEN_DASHBOARD.md`
- 故障排查指南：`ADMIN_TOKEN_TROUBLESHOOTING.md`
- 完整设置指南：`ADMIN_SETUP.md`

