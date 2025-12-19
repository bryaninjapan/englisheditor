# 通过 Cloudflare Dashboard 管理 ADMIN_TOKEN

本指南将教你如何通过 Cloudflare Dashboard (dash.cloudflare.com) 来设置、查看和更新 ADMIN_TOKEN。

## 步骤 1: 登录 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 使用你的 Cloudflare 账号登录

## 步骤 2: 进入 Pages 项目设置

1. 在左侧导航栏中，点击 **Workers & Pages**
2. 在顶部标签栏中，点击 **Pages**
3. 找到你的项目：**englisheditor**
4. 点击项目名称进入项目详情页

## 步骤 3: 访问环境变量设置

1. 在项目详情页顶部，点击 **Settings**（设置）标签
2. 在左侧设置菜单中，找到 **Environment Variables**（环境变量）
3. 点击 **Environment Variables** 进入环境变量管理页面

## 步骤 4: 管理 ADMIN_TOKEN

### 查看现有的环境变量

在环境变量页面，你会看到两个部分：
- **Production（生产环境）**
- **Preview（预览环境）**

每个环境都可以有独立的环境变量。

### 设置或更新 ADMIN_TOKEN

#### 方式 A: 添加新的 ADMIN_TOKEN（如果还没有）

1. 在 **Production** 部分，点击 **Add variable**（添加变量）按钮
2. 在 **Variable name**（变量名）中输入：`ADMIN_TOKEN`
   - **注意**：必须完全匹配，区分大小写
3. 在 **Value**（值）中输入你的管理员 token
   - **建议**：使用强密码（32+ 字符的随机字符串）
   - 可以使用下面的命令生成：
     ```bash
     openssl rand -base64 32
     ```
     或
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```
4. 点击 **Save**（保存）按钮

#### 方式 B: 更新现有的 ADMIN_TOKEN

1. 在 **Production** 部分，找到 `ADMIN_TOKEN` 变量
2. 点击变量右侧的 **Edit**（编辑）图标（通常是铅笔图标 ✏️）
3. 在 **Value**（值）输入框中，清空旧值并输入新的 token
4. 点击 **Save**（保存）按钮

#### 方式 C: 删除并重新创建（如果编辑不可用）

1. 找到 `ADMIN_TOKEN` 变量
2. 点击右侧的 **Delete**（删除）图标（通常是垃圾桶图标 🗑️）
3. 确认删除操作
4. 按照"方式 A"重新添加新的 token

## 步骤 5: 保存并等待生效

1. 更改后，Cloudflare 会自动保存
2. **重要**：更改可能需要几分钟时间才能生效
3. 建议等待 2-5 分钟后测试

## 步骤 6: 验证设置

### 方法 1: 通过 Dashboard 验证

1. 返回 **Environment Variables** 页面
2. 确认 `ADMIN_TOKEN` 显示在列表中
3. **注意**：出于安全考虑，Cloudflare 不会显示变量的值，只会显示名称和加密状态

### 方法 2: 通过命令行验证（可选）

运行以下命令：

```bash
npx wrangler pages secret list
```

应该看到：
```
- ADMIN_TOKEN: Value Encrypted
- GEMINI_API_KEY: Value Encrypted
```

### 方法 3: 通过 Admin 面板测试

1. 访问 https://main.englisheditor.pages.dev/admin
2. 在 "Admin Token" 输入框中，输入你刚才设置的 `ADMIN_TOKEN`
3. 点击 **Login**
4. 如果登录成功并看到管理面板，说明 token 已正确设置

## 生成强密码 Token

在设置 ADMIN_TOKEN 之前，建议先生成一个强密码：

### 方法 1: 使用 OpenSSL（推荐）

```bash
openssl rand -base64 32
```

输出示例：
```
kX8mP2vN9qR5tY7wZ1aB3cD4eF6gH8iJ0kL2mN4oP6qR
```

### 方法 2: 使用 Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 方法 3: 使用 Python

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 方法 4: 使用在线密码生成器

访问以下网站生成强密码：
- https://www.random.org/passwords/
- https://1password.com/password-generator/

**建议**：选择长度 32-64 字符，包含大小写字母、数字和特殊字符。

## 界面导航说明

由于 Cloudflare Dashboard 界面可能因地区或更新而略有不同，如果找不到某些选项：

### 查找 Environment Variables 的位置：

1. **方式 1**：Settings → Environment Variables
2. **方式 2**：Settings → Variables
3. **方式 3**：Settings → Secrets

### 按钮图标说明：

- **添加变量**：通常在列表右上角，显示为 "+" 或 "Add variable"
- **编辑**：在每行变量的右侧，通常是铅笔图标 ✏️ 或 "Edit" 文字链接
- **删除**：在每行变量的右侧，通常是垃圾桶图标 🗑️ 或 "Delete" 文字链接

## 常见问题

### Q1: Dashboard 中看不到 Environment Variables 选项？

**A**: 请检查：
- 确保已登录 Cloudflare Dashboard
- 进入了正确的 Pages 项目（englisheditor）
- 在 **Settings** 标签页下查找
- 如果仍然找不到，可能需要：
  - 刷新页面
  - 检查账号权限（确保有管理员权限）

### Q2: 更改后多久生效？

**A**: 
- **通常**：2-5 分钟
- **最多**：可能需要 10-15 分钟

如果更改后仍然无效：
1. 等待几分钟后再试
2. 清除浏览器缓存并刷新页面
3. 尝试使用隐身/无痕模式访问 admin 页面
4. 如果仍然不行，可以尝试重新部署（可选）：
   ```bash
   npm run build
   npm run deploy
   ```

### Q3: 如何知道 token 是否正确设置？

**A**: 可以通过以下方式验证：
1. ✅ Dashboard 中看到 `ADMIN_TOKEN` 在列表中
2. ✅ 使用该 token 可以成功登录 `/admin` 页面
3. ✅ 使用命令行 `npx wrangler pages secret list` 可以看到 `ADMIN_TOKEN: Value Encrypted`

### Q4: 我可以看到 token 的值吗？

**A**: **不可以**。出于安全考虑，Cloudflare Dashboard **不会显示**已设置的环境变量的值。

如果你忘记了 token：
1. 删除旧的 `ADMIN_TOKEN`
2. 创建新的 `ADMIN_TOKEN` 并保存
3. 使用新 token 登录

### Q5: Production 和 Preview 环境有什么区别？

**A**: 
- **Production（生产环境）**：用于正式的生产环境（main.englisheditor.pages.dev）
- **Preview（预览环境）**：用于预览部署（通常是 PR 预览或分支预览）

**建议**：
- 如果你只在生产环境使用，只需在 **Production** 中设置 `ADMIN_TOKEN`
- 如果需要在预览环境测试，也可以在 **Preview** 中设置相同的 token

### Q6: 更改 token 后需要重新部署吗？

**A**: **通常不需要**。环境变量的更改会在几分钟内自动生效，不需要重新部署。

但是，如果更改后很长时间（超过 15 分钟）仍未生效，可以尝试：
1. 清除浏览器缓存
2. 重新部署项目（可选）：
   ```bash
   npm run build
   npm run deploy
   ```

### Q7: 如何确保 token 安全？

**A**: 建议：
1. ✅ 使用强密码（32+ 字符的随机字符串）
2. ✅ 不要在代码中硬编码 token
3. ✅ 不要在 Git 仓库中提交 token
4. ✅ 使用密码管理器保存 token
5. ✅ 定期更换 token（建议每 3-6 个月）
6. ✅ 只在需要访问管理面板的人员之间分享 token

## 安全建议

### 1. 使用强密码

建议使用至少 32 字符的随机字符串，包含：
- 大小写字母
- 数字
- 特殊字符（可选）

### 2. 安全存储

**重要**：请在安全的地方保存你的 ADMIN_TOKEN：
- ✅ 密码管理器（如 1Password、LastPass、Bitwarden）- **推荐**
- ✅ 加密的文档
- ✅ 安全笔记应用

**不要**：
- ❌ 保存在纯文本文件中
- ❌ 发送到不安全的聊天应用
- ❌ 存储在浏览器书签中
- ❌ 写在便利贴上（除非物理安全）

### 3. 访问控制

- 只在需要访问管理面板的人员之间分享 token
- 如果团队成员离开，及时更改 token
- 考虑定期更换 token（每 3-6 个月）

### 4. 监控

- 定期检查激活码的使用情况
- 如果发现异常使用，立即更改 token
- 查看 Cloudflare 的访问日志（如果有）

## 完成设置后

设置完成后，你可以：

1. **测试登录**：
   - 访问 https://main.englisheditor.pages.dev/admin
   - 使用新设置的 token 登录
   - 应该能看到管理面板

2. **生成激活码**：
   - 登录后，点击 "Generate Codes" 标签
   - 填写表单（类型、使用次数、数量等）
   - 点击 "Generate Codes" 按钮
   - 复制生成的激活码

3. **查看激活码列表**：
   - 点击 "Code List" 标签
   - 查看所有已生成的激活码
   - 可以搜索、筛选和复制激活码

4. **查看统计信息**：
   - 点击 "Statistics" 标签
   - 查看使用统计、用户数量、激活码使用情况等

## 相关文档

如果需要更多帮助，请参考：

- `ADMIN_SETUP.md` - 完整的设置和故障排查指南
- `DEPLOY.md` - 部署相关文档
- `SET_ENV_VARS.md` - 通过命令行设置环境变量

## 需要帮助？

如果按照以上步骤操作后仍然遇到问题：

1. 检查 Cloudflare Dashboard 是否有错误提示
2. 查看浏览器控制台是否有错误信息（F12）
3. 尝试使用命令行方式设置（参考 `SET_ENV_VARS.md`）
4. 检查 Cloudflare 服务状态：https://www.cloudflarestatus.com/
