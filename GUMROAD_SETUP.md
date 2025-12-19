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
- 选择 **"Digital product"**
- 在 **"What do customers receive?"** 部分：
  - 选择 **"Nothing (for now)"** 或创建一个简单的文本文件说明

### 3. 配置产品设置

#### 重要设置
1. **Product URL**: 
   - Gumroad 会自动生成一个 URL，格式类似：`your-username.gumroad.com/l/englisheditor`
   - **复制这个 URL**，稍后需要在代码中使用

2. **After purchase**:
   - 选择 **"Show custom message"**
   - 在消息框中输入：
     ```
     Thank you for your purchase!
     
     Your activation code is: [ACTIVATION_CODE]
     
     To activate:
     1. Visit: https://your-domain.pages.dev/activate
     2. Enter your activation code
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

需要在以下文件中替换 Gumroad 链接：

1. **`app/page.tsx`** - 搜索 `gumroad` 并替换
2. **`app/activate/page.tsx`** - 搜索 `gumroad` 并替换
3. **`app/guide/page.tsx`** - 搜索 `gumroad` 并替换

将以下内容：
```typescript
href="https://your-gumroad-link.gumroad.com/l/englisheditor"
```

替换为你的实际 Gumroad 产品链接：
```typescript
href="https://your-username.gumroad.com/l/englisheditor"
```

## 第五步：自动发送激活码（高级功能）

### 使用 Gumroad Webhook（可选）

如果你想在用户购买后自动发送激活码，可以设置 Gumroad Webhook：

1. 在 Gumroad 产品设置中，找到 **"Webhooks"** 部分
2. 添加 Webhook URL（需要创建一个 API endpoint 来接收购买通知）
3. 当用户购买时，Gumroad 会发送 POST 请求到你的 Webhook
4. 你的服务器可以：
   - 生成激活码
   - 通过邮件发送给用户
   - 或显示在 Gumroad 的购买后页面

**注意**：这需要额外的后端开发工作。目前建议使用手动方式：在购买后页面显示激活码。

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

1. **激活码生成**：建议在后台管理系统中生成激活码，而不是在 Gumroad 中手动创建
2. **激活码格式**：使用统一的格式（如：XXXX-XXXX-XXXX-XXXX）
3. **记录购买**：在数据库中记录每个激活码对应的 Gumroad 订单 ID
4. **验证机制**：确保激活码只能使用一次（或按设计的使用次数）

## 下一步

完成 Gumroad 设置后：
1. 更新代码中的 Gumroad 链接
2. 测试购买流程
3. 部署更新后的应用
4. 开始推广你的产品！

