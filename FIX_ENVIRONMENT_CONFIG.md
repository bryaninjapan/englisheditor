# 修复环境配置问题

## 问题描述

当前配置存在以下问题：
- **Production 环境**：有 `GEMINI_API_KEY` 和 `ADMIN_TOKEN`，但**缺少 D1 数据库绑定**
- **Preview 环境**：有 D1 数据库绑定，但**缺少环境变量**
- **所有部署都是 Preview 环境**

## 解决方案

需要在 Cloudflare Dashboard 中配置两个环境，确保它们都有完整的配置。

### 步骤 1: 在 Production 环境中添加 D1 数据库绑定

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Pages** → **englisheditor**
3. 点击 **Settings**（设置）标签
4. 在左侧菜单中找到 **Functions** 或 **Bindings**
5. 找到 **D1 Database bindings** 部分
6. 点击 **Add binding** 或 **Edit**
7. 配置如下：
   - **Variable name**: `DB`
   - **D1 Database**: 选择 `englisheditor-db`
   - **Environment**: 选择 **Production**
8. 点击 **Save**（保存）

### 步骤 2: 在 Preview 环境中添加环境变量

1. 在同一个 Settings 页面
2. 找到 **Environment Variables**（环境变量）
3. 在 **Preview** 部分，点击 **Add variable**
4. 添加以下两个变量：

   **变量 1: GEMINI_API_KEY**
   - Variable name: `GEMINI_API_KEY`
   - Value: 你的 Gemini API Key（从 Production 环境复制）
   - 点击 **Save**

   **变量 2: ADMIN_TOKEN**
   - Variable name: `ADMIN_TOKEN`
   - Value: 你的 Admin Token（从 Production 环境复制）
   - 点击 **Save**

### 步骤 3: 验证配置

#### 检查 Production 环境

1. 在 Settings 页面
2. 选择 **Production** 环境
3. 确认以下配置存在：
   - ✅ **Environment Variables**:
     - `GEMINI_API_KEY` (Secret)
     - `ADMIN_TOKEN` (Secret)
   - ✅ **D1 Database bindings**:
     - `DB` → `englisheditor-db`

#### 检查 Preview 环境

1. 在 Settings 页面
2. 选择 **Preview** 环境
3. 确认以下配置存在：
   - ✅ **Environment Variables**:
     - `GEMINI_API_KEY` (Secret)
     - `ADMIN_TOKEN` (Secret)
   - ✅ **D1 Database bindings**:
     - `DB` → `englisheditor-db`

### 步骤 4: 重新部署到 Production

配置完成后，需要重新部署以确保配置生效：

```bash
npm run build
npm run deploy
```

或者使用：

```bash
npx wrangler pages deploy out --project-name=englisheditor
```

## 重要提示

### 关于 Production vs Preview

- **Production 环境**：用于正式的生产环境（main.englisheditor.pages.dev）
- **Preview 环境**：用于预览部署（通常是分支或 PR 预览）

### 当前问题

如果所有部署都是 Preview 环境，可能是因为：
1. 没有设置 Production 分支
2. 或者部署命令没有指定环境

### 设置 Production 分支（如果需要）

1. 在 Cloudflare Dashboard 中
2. 进入 **Workers & Pages** → **Pages** → **englisheditor** → **Settings**
3. 找到 **Builds & deployments** 或 **Git integration**
4. 设置 Production 分支为 `main`（或你的主分支）

## 验证部署环境

部署后，可以通过以下方式验证：

1. **查看部署列表**：
   ```bash
   npx wrangler pages deployment list --project-name=englisheditor
   ```

2. **检查部署详情**：
   - 在 Cloudflare Dashboard 中查看部署详情
   - 确认 Environment 显示为 **Production** 而不是 **Preview**

## 故障排查

### 如果 D1 数据库绑定不显示

1. 确认数据库已创建：
   - 在 Cloudflare Dashboard 中
   - **Workers & Pages** → **D1**
   - 确认 `englisheditor-db` 存在

2. 确认数据库 ID 正确：
   - 在 `wrangler.toml` 中检查 `database_id`
   - 应该与 Dashboard 中的数据库 ID 一致

### 如果环境变量不生效

1. 等待几分钟让配置生效
2. 重新部署应用
3. 清除浏览器缓存并刷新

### 如果仍然无法访问数据库

1. 检查 Functions 代码中的绑定名称：
   - 应该使用 `env.DB` 访问数据库
   - 确认绑定名称与 Dashboard 中的一致

2. 查看 Cloudflare 日志：
   - 在 Dashboard 中查看 Workers & Pages 日志
   - 查找数据库相关的错误信息

## 完成后的配置

配置完成后，两个环境都应该有：

### Production 环境
- ✅ `GEMINI_API_KEY` (Secret)
- ✅ `ADMIN_TOKEN` (Secret)
- ✅ D1 Database binding: `DB` → `englisheditor-db`

### Preview 环境
- ✅ `GEMINI_API_KEY` (Secret)
- ✅ `ADMIN_TOKEN` (Secret)
- ✅ D1 Database binding: `DB` → `englisheditor-db`

## 需要帮助？

如果按照以上步骤操作后仍然遇到问题，请检查：
1. Cloudflare Dashboard 中的配置是否正确
2. 数据库 ID 是否正确
3. 环境变量是否已保存
4. 是否已重新部署

