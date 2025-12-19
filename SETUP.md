# 完整设置指南

## 快速开始

### 1. 环境变量设置清单

部署前需要设置以下环境变量：

- ✅ `GEMINI_API_KEY` - Gemini API 密钥
- ✅ `ADMIN_TOKEN` - 后台管理访问令牌（强烈建议使用强密码）

### 2. 数据库初始化

```bash
# 1. 在 Cloudflare Dashboard 创建 D1 数据库
# 2. 更新 wrangler.toml 中的 database_id
# 3. 运行以下命令初始化数据库结构

npx wrangler d1 execute englisheditor-db --file=./schema/schema.sql
```

### 3. 首次生成激活码

部署完成后：

1. 访问 `https://your-domain.com/admin`
2. 使用 `ADMIN_TOKEN` 登录
3. 在 "Generate Codes" 标签页生成激活码
4. 复制生成的激活码给用户或用于 Gumroad 订单

### 4. Gumroad 产品链接

更新以下文件中的 Gumroad 链接：
- `app/activate/page.tsx` (第 173 行)
- `app/page.tsx` (第 324 行)

## 激活码类型说明

- **purchase**: 购买激活码（从 Gumroad 购买）
- **invite**: 邀请码（特殊权限）
- **trial**: 试用码（限时/限次）
- **admin**: 管理员生成

## 安全建议

1. **管理员 Token**: 使用强密码（推荐 32+ 字符的随机字符串）
2. **API Key**: 定期轮换 Gemini API Key
3. **激活码**: 不要在生产日志中记录完整激活码
4. **HTTPS**: 确保使用 HTTPS（Cloudflare Pages 默认启用）

## 故障排查

### 激活码无法使用

1. 检查数据库是否正确初始化
2. 检查激活码状态是否为 "active"
3. 检查是否过期
4. 检查是否达到最大使用次数

### 后台管理无法访问

1. 确认 `ADMIN_TOKEN` 已正确设置
2. 检查浏览器控制台是否有错误
3. 确认 API 调用返回的 HTTP 状态码

### API 调用失败

1. 检查 `GEMINI_API_KEY` 是否正确设置
2. 检查 API Key 是否有效且有足够配额
3. 查看 Cloudflare Workers 日志

## 数据库维护

### 查看激活码

```bash
npx wrangler d1 execute englisheditor-db --command "SELECT * FROM activation_codes LIMIT 10"
```

### 查看激活记录

```bash
npx wrangler d1 execute englisheditor-db --command "SELECT * FROM activations LIMIT 10"
```

### 清理过期激活码

```bash
npx wrangler d1 execute englisheditor-db --command "UPDATE activation_codes SET status = 'expired' WHERE expires_at < strftime('%s', 'now') AND status = 'active'"
```

