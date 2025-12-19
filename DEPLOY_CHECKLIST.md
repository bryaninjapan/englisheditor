# 部署检查清单

## ✅ 部署前检查

### 1. 代码准备
- [x] 所有功能已实现
- [x] 代码已通过构建测试 (`npm run build`)
- [x] 所有文件已提交到 Git

### 2. Cloudflare 配置

#### 步骤 1: 创建 D1 数据库
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **D1**
3. 点击 **"Create database"**
4. 填写信息：
   - **Database name**: `englisheditor-db`
   - **Region**: 选择离你最近的区域
5. 点击 **"Create"**
6. **重要**：复制数据库 ID（格式类似：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）

#### 步骤 2: 更新 wrangler.toml
打开 `wrangler.toml` 文件，将数据库 ID 填入两处：
```toml
[[d1_databases]]
binding = "DB"
database_name = "englisheditor-db"
database_id = "你的数据库ID"  # 填入这里

[env.production]
...

[[env.production.d1_databases]]
binding = "DB"
database_name = "englisheditor-db"
database_id = "你的数据库ID"  # 填入这里
```

#### 步骤 3: 初始化数据库
```bash
# 在生产环境执行 SQL schema
npx wrangler d1 execute englisheditor-db --file=./schema/schema_v2.sql
```

验证数据库表是否创建成功：
```bash
npx wrangler d1 execute englisheditor-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

应该看到以下表：
- activation_codes
- invite_codes
- user_credits
- activation_usage
- invite_usage
- usage_logs

### 3. 环境变量设置

#### 设置 Gemini API Key
```bash
npx wrangler pages secret put GEMINI_API_KEY
```
- 选择项目：`englisheditor`
- 输入你的 Gemini API Key（格式：`AIza...`）

#### 设置管理员 Token
```bash
npx wrangler pages secret put ADMIN_TOKEN
```
- 选择项目：`englisheditor`
- 输入一个强密码（建议使用密码生成器生成32+字符的随机字符串）
- **重要**：保存好这个 token，用于访问后台管理界面

### 4. 构建和部署

#### 构建项目
```bash
npm run build
```

#### 部署到 Cloudflare Pages
```bash
npm run deploy
```

或者手动部署：
```bash
npx wrangler pages deploy out
```

### 5. 验证部署

#### 检查部署状态
访问 Cloudflare Dashboard → Workers & Pages → Pages → `englisheditor`

#### 测试功能
1. **访问主页**：`https://your-project.pages.dev/`
   - 应该显示剩余使用次数
   - 前3次使用应该是免费的

2. **测试激活码**：
   - 访问 `/admin`
   - 使用 ADMIN_TOKEN 登录
   - 生成一个激活码
   - 访问 `/activate`
   - 输入激活码，应该成功添加100次使用

3. **测试邀请码**：
   - 在主页面点击 "Share" 生成邀请码
   - 在另一个设备/浏览器使用该邀请码
   - 双方应该各获得3次使用

4. **测试使用服务**：
   - 输入文本，点击 "Start Polishing"
   - 应该正常工作，并扣除使用次数

### 6. 常见问题排查

#### 数据库连接错误
- 检查 `wrangler.toml` 中的 `database_id` 是否正确
- 确认数据库已经在 Cloudflare Dashboard 创建

#### API 调用失败
- 检查 `GEMINI_API_KEY` 是否正确设置
- 查看 Cloudflare Workers 日志：Dashboard → Workers & Pages → 你的项目 → Logs

#### 激活码无法使用
- 检查数据库表是否正确创建
- 查看 Workers 日志中的错误信息

#### 后台管理无法访问
- 检查 `ADMIN_TOKEN` 是否正确设置
- 确认 token 在登录时输入正确

### 7. 首次使用后台管理

1. 访问 `https://your-project.pages.dev/admin`
2. 输入之前设置的 `ADMIN_TOKEN`
3. 登录后：
   - 在 **Generate Codes** 标签页生成激活码
   - 在 **Code List** 标签页查看激活码列表
   - 在 **Statistics** 标签页查看使用统计

### 8. 更新 Gumroad 链接

在以下文件中替换 Gumroad 链接为你的实际产品链接：
- `app/activate/page.tsx` (第 173 行附近)
- `app/page.tsx` (搜索 `gumroad`)

将 `https://your-gumroad-link.gumroad.com/l/englisheditor` 替换为你的实际链接。

---

## 📝 部署后建议

1. **备份数据库**：定期备份 D1 数据库（通过 Cloudflare Dashboard）
2. **监控使用情况**：定期查看后台管理统计
3. **轮换 API Key**：定期更换 Gemini API Key（如果泄露）
4. **更新管理员 Token**：如果 token 泄露，立即更换

## 🆘 需要帮助？

如果遇到问题：
1. 查看 Cloudflare Workers 日志
2. 检查浏览器控制台错误
3. 验证所有环境变量是否正确设置
4. 确认数据库 schema 已正确执行

