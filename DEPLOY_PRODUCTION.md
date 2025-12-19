# 部署到 Production 环境

## 当前状态

使用 `wrangler pages deploy` 命令部署的版本默认是 **Preview** 环境。要将其提升为 **Production**，需要在 Cloudflare Dashboard 中手动操作。

## 方法 1: 通过 Settings 设置 Production 分支（推荐）

如果部署菜单中只有 "Delete deployment"，说明项目可能没有连接 Git 仓库。在这种情况下，需要通过 Settings 来配置：

### 步骤

1. **访问 Cloudflare Dashboard**
   - 打开 [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
   - 登录你的账号

2. **进入 Pages 项目设置**
   - 点击 **Workers & Pages**
   - 选择 **Pages**
   - 找到并点击 **englisheditor** 项目
   - 点击 **Settings** 标签

3. **配置 Production 分支**
   - 在 Settings 页面，找到 **Builds & deployments** 部分
   - 找到 **Production branch** 设置
   - 如果项目已连接 Git：
     - 设置为 `main`（或你的主分支名称）
     - 保存设置
   - 如果项目未连接 Git：
     - 需要先连接 Git 仓库（见方法 2）

4. **验证**
   - 返回 **Deployments** 标签
   - 查看部署列表，应该能看到标记为 "Production" 的部署
   - 访问 `https://main.englisheditor.pages.dev` 应该显示最新版本

### 如果菜单中没有 "Promote to production" 选项

这通常意味着：
- 项目没有连接 Git 仓库，所有部署都是手动部署（Preview）
- 需要通过 Git 集成来设置 Production 分支
- 或者需要连接 Git 后，推送到 production 分支才会自动创建 Production 部署

## 方法 2: 连接 Git 仓库并设置自动部署（最佳方案）

这是推荐的方法，可以确保每次推送到 `main` 分支时自动部署到 Production：

### 步骤

1. **连接 Git 仓库**
   - 在 Cloudflare Dashboard 中
   - 进入 **Workers & Pages** → **Pages** → **englisheditor** → **Settings**
   - 找到 **Builds & deployments** 部分
   - 点击 **"Connect to Git"** 或 **"Connect Git repository"**
   - 选择你的 Git 提供商（GitHub、GitLab 等）
   - 授权 Cloudflare 访问你的仓库
   - 选择仓库：`bryaninjapan/englisheditor`
   - 点击 **"Begin setup"**

2. **配置构建设置**
   - **Framework preset**: 选择 **Next.js**（或 **None** 如果使用自定义构建）
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/`（或留空）

3. **配置 Production 分支**
   - 在 **Builds & deployments** 设置中
   - 找到 **Production branch** 设置
   - 设置为 `main`（或你的主分支名称）
   - 保存设置

4. **触发首次部署**
   - 连接 Git 后，Cloudflare 会自动触发一次构建
   - 或者你可以推送一次到 `main` 分支来触发部署
   ```bash
   git push origin main
   ```

5. **验证自动部署**
   - 在 **Deployments** 标签中查看
   - 推送到 `main` 分支的部署应该自动标记为 "Production"
   - 访问 `https://main.englisheditor.pages.dev` 应该显示最新版本

## 方法 3: 使用 Wrangler CLI 部署（临时方案）

如果暂时无法连接 Git，可以使用 CLI 手动部署。但注意：**使用 `wrangler pages deploy` 部署的版本默认是 Preview**。

```bash
# 构建项目
npm run build

# 部署（这会创建一个新的部署，但标记为 Preview）
npx wrangler pages deploy out --project-name=englisheditor
```

**重要提示**：
- CLI 部署的版本默认是 Preview 环境
- 如果项目已连接 Git 并设置了 Production 分支，推送到 Git 的部署会自动成为 Production
- 建议使用方法 2（连接 Git）来获得自动 Production 部署

## 验证 Production 部署

部署成功后，验证以下内容：

1. **访问生产 URL**
   - Production URL: `https://main.englisheditor.pages.dev`
   - 确认页面正常加载

2. **检查环境配置**
   - 在 Cloudflare Dashboard 中
   - **Settings** → **Environment Variables**
   - 确认 **Production** 环境有：
     - ✅ `GEMINI_API_KEY` (Secret)
     - ✅ `ADMIN_TOKEN` (Secret)
   - **Settings** → **Functions** → **D1 Database bindings**
   - 确认 **Production** 环境有：
     - ✅ `DB` → `englisheditor-db`

3. **测试功能**
   - 测试文本编辑功能（应该能正常调用 Gemini API）
   - 测试激活码功能（应该能正常访问数据库）
   - 测试管理员后台（应该能正常登录）

## 重要提示

### Production vs Preview 环境

- **Production 环境**：
  - 使用 `main.englisheditor.pages.dev` 域名
  - 使用 Production 环境变量和绑定
  - 用于正式的生产环境

- **Preview 环境**：
  - 使用随机生成的子域名（如 `7cd67129.englisheditor.pages.dev`）
  - 使用 Preview 环境变量和绑定
  - 用于测试和预览

### 环境配置必须一致

确保 Production 和 Preview 环境都有：
- ✅ `GEMINI_API_KEY`
- ✅ `ADMIN_TOKEN`
- ✅ D1 Database binding (`DB` → `englisheditor-db`)

如果缺少任何配置，参考 `FIX_ENVIRONMENT_CONFIG.md` 进行修复。

## 故障排查

### 如果部署后功能不工作

1. **检查环境变量**
   - 确认 Production 环境有所有必需的环境变量
   - 等待几分钟让配置生效

2. **检查数据库绑定**
   - 确认 Production 环境有 D1 数据库绑定
   - 确认数据库 ID 正确

3. **查看日志**
   - 在 Cloudflare Dashboard 中查看部署日志
   - 检查是否有错误信息

### 如果菜单中只有 "Delete deployment"

这通常意味着项目没有连接 Git 仓库。解决方法：

1. **连接 Git 仓库**（推荐）
   - 按照方法 2 的步骤连接 Git
   - 设置 Production 分支为 `main`
   - 推送代码到 `main` 分支，会自动创建 Production 部署

2. **检查项目设置**
   - 在 Settings → Builds & deployments 中
   - 确认是否已连接 Git 仓库
   - 如果没有，点击 "Connect to Git" 进行连接

3. **权限问题**
   - 确认你的账号有 Pages 项目的管理权限
   - 确认有权限连接 Git 仓库

4. **联系支持**
   - 如果问题持续，可以联系 Cloudflare 支持

## 完成后的检查清单

- [ ] 部署已提升为 Production
- [ ] Production 环境有 `GEMINI_API_KEY`
- [ ] Production 环境有 `ADMIN_TOKEN`
- [ ] Production 环境有 D1 数据库绑定
- [ ] `https://main.englisheditor.pages.dev` 可以正常访问
- [ ] 文本编辑功能正常工作
- [ ] 激活码功能正常工作
- [ ] 管理员后台可以正常登录

