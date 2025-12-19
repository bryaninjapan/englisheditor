# Gumroad 账户和产品设置指南

## 第一步：创建 Gumroad 账户

1. 访问 [Gumroad](https://gumroad.com/)
2. 点击右上角的 **"Sign up"** 或 **"Get started"**
3. 填写注册信息：
   - 邮箱地址
   - 密码
   - 用户名
4. 验证邮箱地址
5. 完成账户设置

## 第二步：创建产品

### 1. 进入产品创建页面

1. 登录 Gumroad 后，点击右上角的 **"Products"** 或 **"Add product"**
2. 选择 **"Digital product"**（数字产品）

### 2. 填写产品信息

#### 基本信息
- **Product name**: `English Editor Activation Code`
- **Description**: 
  ```
  Get 100 uses of our Professional English Editor! 
  
  Features:
  - AI-powered grammar checking
  - Vocabulary enhancement
  - Professional text polishing
  - General and Legal editing modes
  - No expiration date
  - Works on up to 3 devices
  
  After purchase, you'll receive an activation code that adds 100 uses to your account.
  ```

#### 定价设置
- **Price**: 设置你的价格（例如：$9.99, $19.99 等）
- **Currency**: 选择货币（USD, EUR, GBP 等）

#### 产品类型
- 选择 **"Digital product"**（数字产品）
- 在 **"What do customers receive?"**（客户收到什么？）部分：
  
  **推荐方案 1：自定义消息（推荐）**
  - 选择 **"Show custom message"**（显示自定义消息）
  - 在消息框中输入以下内容（英文）：
    ```
    Thank you for your purchase!
    
    Your activation code is: [ACTIVATION_CODE]
    
    To activate:
    1. Visit: https://your-domain.pages.dev/activate
    2. Enter your activation code
    3. Start using the editor!
    
    If you have any questions, please contact support.
    ```
  - **注意**：Gumroad 会自动将 `[ACTIVATION_CODE]` 替换为实际的激活码（如果使用 Gumroad 的自动生成功能）
  
  **推荐方案 2：文本文件**
  - 选择 **"Upload a file"**（上传文件）
  - 创建一个文本文件（如 `activation-instructions.txt`），内容如下（英文）：
    ```
    Thank you for purchasing Professional English Editor Activation Code!
    
    Your activation code: Please check the purchase confirmation page
    
    How to activate:
    1. Visit: https://your-domain.pages.dev/activate
    2. Enter your activation code
    3. Click "Activate" button
    4. Start using the editor!
    
    Your activation code adds 100 uses to your account.
    The activation code has no expiration date and can be used on up to 3 devices.
    
    If you have any questions, please contact support.
    ```
  - 上传该文件作为购买后交付内容
  
  **推荐方案 3：手动管理（适合小规模）**
  - 选择 **"Nothing (for now)"**（暂时不提供）
  - 在购买后，手动在后台管理系统生成激活码
  - 通过邮件或其他方式发送给客户
  - **优点**：可以更好地控制激活码的生成和分配
  - **缺点**：需要手动操作，不适合大规模销售

### 3. 配置产品设置

#### 重要设置
1. **Product URL**: 
   - Gumroad 会自动生成一个 URL，格式类似：`your-username.gumroad.com/l/englisheditor`
   - **复制这个 URL**，稍后需要在代码中使用

2. **After purchase**（购买后设置）:
   
   这里设置客户购买后看到的内容。根据你选择的交付方式：
   
   **如果选择了"Show custom message"（自定义消息）**：
   - 在消息框中输入购买后说明（已在上面"产品类型"部分说明）
   - 可以包含激活码占位符（如果使用 Gumroad 的自动生成功能）
   
   **如果选择了"Upload a file"（上传文件）**：
   - 客户会收到你上传的文件
   - 可以在文件中包含详细的激活说明
   
   **如果选择了"Nothing (for now)"（暂时不提供）**：
   - 建议在 **"After purchase"** 消息中说明（英文）：
     ```
     Thank you for your purchase!
     
     We will send your activation code via email within 24 hours.
     Please check your email (including spam folder).
     
     To activate:
     1. Visit: https://your-domain.pages.dev/activate
     2. Enter the activation code you received
     3. Start using the editor!
     
     If you have any questions, please contact support.
     ```

3. **Product visibility**: 
   - 选择 **"Public"**（公开）或 **"Unlisted"**（未列出，只有知道链接的人可以访问）

### 4. 保存并发布

1. 点击 **"Save"** 或 **"Publish"**
2. 产品创建完成！

## 第三步：获取产品链接

### 方法 1: 从产品页面获取

1. 进入你的产品页面
2. 复制浏览器地址栏中的 URL
3. URL 格式：`https://your-username.gumroad.com/l/englisheditor`

### 方法 2: 从产品设置获取

1. 进入产品编辑页面
2. 在 **"Product URL"** 部分可以看到完整链接
3. 复制该链接

## 第四步：集成到应用中

### 更新代码中的 Gumroad 链接

**重要**：创建 Gumroad 产品后，需要在代码中更新产品链接。

#### 方法 1：使用配置文件（推荐）

1. 打开 `app/lib/config.ts` 文件
2. 找到 `GUMROAD_PRODUCT_URL` 常量
3. 将占位符 URL 替换为你的实际 Gumroad 产品链接：
   ```typescript
   export const GUMROAD_PRODUCT_URL = "https://你的用户名.gumroad.com/l/englisheditor";
   ```
4. 保存文件并重新部署

#### 方法 2：手动替换（如果未使用配置文件）

需要在以下文件中搜索并替换 Gumroad 链接：

1. **`app/page.tsx`** - 搜索 `gumroad` 并替换
2. **`app/activate/page.tsx`** - 搜索 `gumroad` 并替换
3. **`app/guide/page.tsx`** - 搜索 `gumroad` 并替换

将以下内容：
```typescript
href="https://your-username.gumroad.com/l/englisheditor"
```

替换为你的实际 Gumroad 产品链接。

## 第五步：自动发送激活码（高级功能）

### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **自定义消息** | 简单快速，无需额外开发 | 需要手动管理激活码 | 小规模销售 |
| **上传文件** | 可以包含详细说明 | 需要手动创建和更新文件 | 中等规模 |
| **Webhook 自动** | 完全自动化，可扩展 | 需要后端开发 | 大规模销售 |

### 使用 Gumroad Webhook（高级，推荐用于大规模销售）

如果你想在用户购买后自动生成并发送激活码，可以设置 Gumroad Webhook：

#### 设置步骤

1. **创建 Webhook Endpoint**
   - 在你的 Cloudflare Workers 中创建一个新的 API endpoint
   - 例如：`/api/gumroad-webhook`
   - 这个 endpoint 需要：
     - 验证 Gumroad 的签名（安全）
     - 接收购买通知
     - 生成激活码
     - 存储到数据库
     - 返回激活码给 Gumroad（显示在购买后页面）

2. **在 Gumroad 中配置 Webhook**
   - 进入产品设置页面
   - 找到 **"Webhooks"** 或 **"Integrations"** 部分
   - 添加 Webhook URL：`https://your-domain.pages.dev/api/gumroad-webhook`
   - 选择触发事件：**"Sale"**（销售完成时）

3. **Webhook 数据格式**
   Gumroad 会发送 POST 请求，包含以下信息：
   ```json
   {
     "sale_id": "xxx",
     "email": "customer@example.com",
     "price": "9.99",
     "gumroad_fee": "0.70",
     "currency": "usd",
     "product_id": "xxx",
     "purchaser_id": "xxx",
     "created_at": "2024-01-01T00:00:00Z"
   }
   ```

4. **实现自动生成激活码**
   - Webhook 收到购买通知后
   - 调用后台管理 API 生成激活码
   - 将激活码返回给 Gumroad（显示在购买后页面）
   - 或通过邮件发送给客户

#### 示例 Webhook 实现（伪代码）

```typescript
// functions/api/gumroad-webhook.ts
export async function onRequestPost(context) {
  const { request, env } = context;
  
  // 1. 验证 Gumroad 签名
  const signature = request.headers.get('X-Gumroad-Signature');
  // ... 验证逻辑 ...
  
  // 2. 解析购买数据
  const purchaseData = await request.json();
  
  // 3. 生成激活码（调用管理 API）
  const activationCode = await generateActivationCode(env.DB);
  
  // 4. 存储购买记录
  await storePurchaseRecord(env.DB, {
    gumroadOrderId: purchaseData.sale_id,
    email: purchaseData.email,
    activationCode: activationCode,
    price: purchaseData.price
  });
  
  // 5. 返回激活码（Gumroad 会显示在购买后页面）
  return new Response(JSON.stringify({
    activation_code: activationCode,
    instructions: "访问 https://main.englisheditor.pages.dev/activate 进行激活"
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**注意**：
- Webhook 需要验证 Gumroad 的签名以确保安全
- 需要处理重复通知（Gumroad 可能会发送多次）
- 建议记录所有购买记录以便追踪

**目前建议**：如果刚开始销售，可以先使用"自定义消息"方案，等销售规模扩大后再考虑实现 Webhook 自动化。

## 第六步：测试购买流程

1. 使用测试模式或创建一个测试产品
2. 完成一次测试购买
3. 验证激活码是否正确显示
4. 测试激活码是否能在应用中正常使用

## 常见问题

### Q: 如何设置不同的价格？
A: 在 Gumroad 产品设置中可以设置：
- 固定价格
- 建议价格（让用户自己定价）
- 价格范围（最低价到建议价）

### Q: 如何添加折扣码？
A: 在 Gumroad 账户设置中，可以创建折扣码（Promo codes）：
1. 进入 **"Settings"** → **"Promo codes"**
2. 创建新的折扣码
3. 设置折扣百分比或固定金额
4. 设置有效期

### Q: 如何查看销售数据？
A: 在 Gumroad 仪表板中：
1. 点击 **"Analytics"**
2. 查看销售统计、收入、转化率等数据

### Q: 如何退款？
A: Gumroad 支持退款功能：
1. 进入订单管理页面
2. 找到对应订单
3. 点击 **"Refund"** 按钮

## 安全建议

1. **激活码生成**：
   - ✅ 在后台管理系统中生成激活码（推荐）
   - ✅ 使用统一的格式（如：XXXX-XXXX-XXXX-XXXX）
   - ✅ 确保激活码的唯一性
   - ❌ 不要在 Gumroad 中手动创建激活码（容易出错且难以管理）

2. **购买记录**：
   - 在数据库中记录每个激活码对应的 Gumroad 订单 ID
   - 记录购买者邮箱（如果提供）
   - 记录购买时间和价格
   - 这样可以：
     - 追踪销售情况
     - 处理退款时撤销激活码
     - 联系客户

3. **激活码验证**：
   - 确保激活码只能使用一次（或按设计的使用次数）
   - 验证激活码格式
   - 检查激活码状态（是否已被使用、是否过期等）

4. **退款处理**：
   - 如果客户申请退款，需要在后台管理系统中：
     - 标记激活码为"已撤销"
     - 从用户账户中扣除相应的使用次数（如果已激活）
     - 记录退款原因和时间

5. **数据备份**：
   - 定期备份数据库
   - 备份激活码列表
   - 备份购买记录

## 下一步

完成 Gumroad 设置后：
1. 更新代码中的 Gumroad 链接
2. 测试购买流程
3. 部署更新后的应用
4. 开始推广你的产品！

