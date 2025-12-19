# 快速部署命令

## 一键执行（按顺序）

### 1. 确认已登录 Cloudflare
```bash
npx wrangler login
```

### 2. 创建 D1 数据库（需要在 Dashboard 手动创建）
访问：https://dash.cloudflare.com/ → Workers & Pages → D1 → Create database
- 名称：`englisheditor-db`
- 复制数据库 ID

### 3. 更新 wrangler.toml
编辑 `wrangler.toml`，填入数据库 ID（两处）

### 4. 初始化数据库
```bash
npx wrangler d1 execute englisheditor-db --file=./schema/schema_v2.sql
```

验证表是否创建：
```bash
npx wrangler d1 execute englisheditor-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### 5. 设置环境变量
```bash
# 设置 Gemini API Key
npx wrangler pages secret put GEMINI_API_KEY

# 设置管理员 Token（建议使用密码生成器生成）
npx wrangler pages secret put ADMIN_TOKEN
```

### 6. 构建项目
```bash
npm run build
```

### 7. 部署
```bash
npm run deploy
```

或者：
```bash
npx wrangler pages deploy out
```

---

## 验证部署

### 检查部署状态
访问 Cloudflare Dashboard → Workers & Pages → Pages → englisheditor

### 访问应用
部署完成后会显示 URL，例如：`https://englisheditor-xxxxx.pages.dev`

### 测试流程
1. 访问主页，检查使用次数显示
2. 使用3次免费试用
3. 访问 `/admin`，使用 ADMIN_TOKEN 登录
4. 生成激活码
5. 访问 `/activate`，输入激活码
6. 验证使用次数增加100次

---

## 如需本地测试

```bash
# 启动开发服务器（不包含 Workers Functions）
npm run dev

# 注意：本地开发时无法测试 Cloudflare Functions，需要部署后才能测试完整功能
```

