-- 激活码表
CREATE TABLE IF NOT EXISTS activation_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'purchase', -- 'purchase', 'invite', 'trial', 'admin'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'used', 'expired', 'revoked'
  max_uses INTEGER DEFAULT 1, -- 最大使用次数
  current_uses INTEGER DEFAULT 0, -- 当前使用次数
  expires_at INTEGER, -- Unix timestamp, NULL = 永不过期
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  created_by TEXT, -- 创建者（管理员用户名）
  metadata TEXT -- JSON: {gumroad_order_id, user_email, etc.}
);

-- 设备激活记录表
CREATE TABLE IF NOT EXISTS activations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activation_code TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL, -- 设备唯一标识
  user_email TEXT, -- 可选的用户邮箱
  activated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  last_used_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  expires_at INTEGER, -- 基于激活码的过期时间
  FOREIGN KEY (activation_code) REFERENCES activation_codes(code)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_code ON activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_code_status ON activation_codes(code, status);
CREATE INDEX IF NOT EXISTS idx_device ON activations(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_code_device ON activations(activation_code, device_fingerprint);

