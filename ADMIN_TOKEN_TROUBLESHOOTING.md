# ADMIN_TOKEN 故障排查指南

如果你看到 "Unauthorized" 错误，说明 token 验证失败。本指南将帮助你解决这个问题。

## 问题诊断

### 步骤 1: 确认 ADMIN_TOKEN 已设置

运行以下命令检查：

```bash
npx wrangler pages secret list
```

应该看到：
```
- ADMIN_TOKEN: Value Encrypted
- GEMINI_API_KEY: Value Encrypted
```

如果看不到 `ADMIN_TOKEN`，说明还没有设置，请先设置（见步骤 2）。

### 步骤 2: 确认你输入的 token 是正确的

**常见问题**：输入的 token 与 Cloudflare 中设置的不一致。

可能的原因：
- ❌ Token 中有多余的空格
- ❌ Token 大小写不匹配（如果包含字母）
- ❌ 复制粘贴时包含了额外的字符
- ❌ 使用了错误的 token（可能是旧的 token）

### 步骤 3: 重新设置 ADMIN_TOKEN（推荐解决方案）

如果你不确定当前的 token 是什么，最简单的方法是重新设置：

#### 方式 A: 通过 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → Pages → englisheditor → Settings → Environment Variables
3. 找到 `ADMIN_TOKEN`，点击 **Edit**
4. 生成一个新的强密码 token（见下方"生成 Token"部分）
5. 输入新的 token 并保存
6. 等待 2-5 分钟
7. 使用新 token 登录 admin 面板

#### 方式 B: 通过命令行

1. 生成一个新的 token：
   ```bash
   openssl rand -base64 32
   ```

2. 复制输出的 token（例如：`kX8mP2vN9qR5tY7wZ1aB3cD4eF6gH8iJ0kL2mN4oP6qR`）

3. 设置新的 token：
   ```bash
   npx wrangler pages secret put ADMIN_TOKEN
   ```
   
   当提示时：
   - 选择项目：`englisheditor`
   - 粘贴刚才生成的 token
   - 按 Enter 确认

4. 等待 2-5 分钟

5. 使用新 token 登录 admin 面板

## 生成安全的 Token

使用以下任一方法生成强密码 token：

### 方法 1: OpenSSL（推荐）

```bash
openssl rand -base64 32
```

### 方法 2: Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 方法 3: Python

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**建议**：生成的 token 应该：
- 至少 32 字符
- 包含大小写字母和数字
- 随机生成，不要使用常见的密码

## 完整重置流程

如果你想完全重置 ADMIN_TOKEN，按以下步骤操作：

### 1. 删除旧的 token（通过 Dashboard）

1. 访问 Cloudflare Dashboard
2. Workers & Pages → Pages → englisheditor → Settings → Environment Variables
3. 找到 `ADMIN_TOKEN`，点击 **Delete**（删除）图标
4. 确认删除

### 2. 创建新的 token

使用上述任一方法生成新的 token。

### 3. 设置新 token（通过 Dashboard）

1. 在同一页面，点击 **Add variable**
2. Variable name: `ADMIN_TOKEN`
3. Value: 粘贴刚才生成的 token
4. 点击 **Save**

### 4. 等待生效

等待 2-5 分钟让更改生效。

### 5. 清除本地存储并重新登录

1. 打开浏览器开发者工具（F12）
2. 进入 **Application**（应用）标签
3. 左侧找到 **Local Storage** → `https://main.englisheditor.pages.dev`
4. 找到 `admin_token`，右键删除
5. 或者直接访问 admin 页面，点击 **Logout**（如果有登录）

### 6. 使用新 token 登录

1. 访问 https://main.englisheditor.pages.dev/admin
2. 输入新设置的 token
3. 点击 **Login**
4. 应该能够成功登录

## 验证 Token 是否正确

### 方法 1: 通过 Admin 面板测试

1. 访问 https://main.englisheditor.pages.dev/admin
2. 输入 token
3. 点击 Login
4. 如果登录成功，说明 token 正确

### 方法 2: 检查浏览器网络请求

1. 打开浏览器开发者工具（F12）
2. 进入 **Network**（网络）标签
3. 访问 admin 页面并登录
4. 点击 "Generate Codes" 按钮
5. 查看 `/admin/generate` 请求
6. 点击该请求，查看 **Headers**（请求头）
7. 找到 `Authorization: Bearer <your-token>`
8. 确认 token 部分与你输入的完全一致（没有多余空格或字符）

### 方法 3: 使用命令行测试（高级）

如果你想在本地测试 token 是否正确，可以使用以下方法：

**注意**：这需要访问 Cloudflare 的 API，比较复杂。建议直接使用上述方法。

## 常见错误和解决方案

### 错误 1: "Unauthorized" 但 token 已设置

**原因**：输入的 token 与 Cloudflare 中设置的不一致。

**解决方案**：
1. 确认你输入的 token 与 Dashboard/命令行中设置的完全一致
2. 检查是否有空格（前后或中间）
3. 如果不确定，重新设置 token（见"完整重置流程"）

### 错误 2: 更改 token 后仍然无效

**原因**：更改还没有生效，或浏览器缓存了旧的 token。

**解决方案**：
1. 等待 5-10 分钟后再试
2. 清除浏览器缓存和 Local Storage
3. 使用隐身/无痕模式测试
4. 尝试重新部署（可选）：
   ```bash
   npm run build
   npm run deploy
   ```

### 错误 3: Dashboard 中找不到 Environment Variables

**原因**：可能不在正确的页面，或权限不足。

**解决方案**：
1. 确认已登录 Cloudflare Dashboard
2. 确认进入了正确的项目（englisheditor）
3. 确认在 **Settings** 标签页下
4. 如果仍然找不到，尝试刷新页面
5. 检查账号是否有管理员权限

### 错误 4: Token 中有特殊字符导致问题

**原因**：某些特殊字符可能在复制粘贴时出现问题。

**解决方案**：
1. 使用 base64 编码的 token（推荐使用 `openssl rand -base64 32`）
2. 避免使用包含引号、反斜杠等特殊字符的 token
3. 如果必须使用特殊字符，确保完全匹配（包括大小写）

## 安全检查清单

在设置 ADMIN_TOKEN 之前，确认：

- ✅ 使用强密码（32+ 字符）
- ✅ Token 是随机生成的，不是常见密码
- ✅ Token 已安全保存（密码管理器）
- ✅ 没有在代码中硬编码 token
- ✅ 没有在 Git 仓库中提交 token
- ✅ 只在需要的人员之间分享 token

## 测试流程

设置完成后，按以下流程测试：

1. **生成 Token**
   ```bash
   openssl rand -base64 32
   ```

2. **设置 Token**
   - 通过 Dashboard 或命令行设置

3. **等待生效**
   - 等待 2-5 分钟

4. **清除本地存储**
   - 在浏览器中清除 Local Storage 或使用 Logout

5. **测试登录**
   - 访问 /admin 页面
   - 输入 token
   - 点击 Login

6. **测试功能**
   - 登录成功后，尝试生成激活码
   - 如果成功，说明一切正常

## 仍然无法解决？

如果按照以上步骤操作后仍然无法解决：

1. **检查 Cloudflare 状态**
   - 访问 https://www.cloudflarestatus.com/
   - 确认 Cloudflare 服务正常运行

2. **查看日志**
   - 在 Cloudflare Dashboard 中查看 Workers & Pages 日志
   - 查看是否有错误信息

3. **联系支持**
   - 参考 `ADMIN_SETUP.md` 获取更多帮助
   - 参考 `ADMIN_TOKEN_DASHBOARD.md` 查看 Dashboard 操作指南

4. **尝试重新部署**
   ```bash
   npm run build
   npm run deploy
   ```

