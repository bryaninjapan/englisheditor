# 快速设置 Production 部署

## 问题

在 Cloudflare Dashboard 中，部署菜单只有 "Delete deployment"，没有 "Promote to production" 选项。

## 原因

这是因为项目没有连接 Git 仓库。使用 `wrangler pages deploy` 手动部署的版本都是 Preview 环境。

## 解决方案：连接 Git 仓库

### 步骤 1: 在 Cloudflare Dashboard 中连接 Git

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Pages** → **englisheditor**
3. 点击 **Settings** 标签
4. 找到 **Builds & deployments** 部分
5. 点击 **"Connect to Git"** 或 **"Connect Git repository"** 按钮

### 步骤 2: 授权并选择仓库

1. 选择 Git 提供商（GitHub、GitLab 等）
2. 授权 Cloudflare 访问你的账号
3. 选择仓库：`bryaninjapan/englisheditor`
4. 点击 **"Begin setup"**

### 步骤 3: 配置构建设置

在构建设置页面，填写：

- **Framework preset**: `Next.js`（或选择 `None` 使用自定义）
- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory**: `/`（留空也可以）

### 步骤 4: 设置 Production 分支

1. 在 **Builds & deployments** 设置中
2. 找到 **Production branch** 设置
3. 设置为 `main`
4. 保存设置

### 步骤 5: 触发首次部署

连接 Git 后，Cloudflare 会自动触发一次构建。或者手动推送：

```bash
git push origin main
```

### 步骤 6: 验证

1. 在 **Deployments** 标签中查看
2. 来自 `main` 分支的部署应该自动标记为 **"Production"**
3. 访问 `https://main.englisheditor.pages.dev` 确认正常

## 完成后的效果

- ✅ 每次推送到 `main` 分支，自动部署到 Production
- ✅ 部署列表会显示 "Production" 标记
- ✅ `https://main.englisheditor.pages.dev` 自动更新为最新版本

## 注意事项

1. **环境变量配置**
   - 确保 Production 环境有 `GEMINI_API_KEY` 和 `ADMIN_TOKEN`
   - 确保 Production 环境有 D1 数据库绑定

2. **构建时间**
   - 首次构建可能需要几分钟
   - 后续构建通常更快

3. **分支策略**
   - `main` 分支 → Production 环境
   - 其他分支 → Preview 环境

## 如果遇到问题

### 构建失败

1. 检查构建日志中的错误信息
2. 确认 `package.json` 中的构建脚本正确
3. 确认 `next.config.ts` 配置正确

### 环境变量不生效

1. 在 Settings → Environment Variables 中检查
2. 确认 Production 环境有所有必需的变量
3. 等待几分钟让配置生效

### 数据库绑定不工作

1. 在 Settings → Functions → D1 Database bindings 中检查
2. 确认 Production 环境有 `DB` 绑定
3. 确认数据库 ID 正确

## 参考文档

- 详细步骤：`DEPLOY_PRODUCTION.md`
- 环境配置：`FIX_ENVIRONMENT_CONFIG.md`

