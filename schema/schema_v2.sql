-- 激活码表（管理员生成，付费用户使用）
CREATE TABLE IF NOT EXISTS activation_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'paid', -- 'paid' 付费版
  credits INTEGER NOT NULL DEFAULT 100, -- 激活码给予的使用次数
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'used', 'revoked'
  used_count INTEGER DEFAULT 0, -- 已使用次数（统计用）
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  created_by TEXT, -- 创建者（管理员用户名）
  metadata TEXT -- JSON: {gumroad_order_id, etc.}
);

-- 邀请码表（用户生成）
CREATE TABLE IF NOT EXISTS invite_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  creator_fingerprint TEXT NOT NULL, -- 创建邀请码的设备指纹
  credits INTEGER NOT NULL DEFAULT 3, -- 邀请码给予的使用次数（邀请者和被邀请者各获得）
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'used', 'expired'
  used_by_fingerprint TEXT, -- 使用此邀请码的设备指纹（被邀请者）
  used_at INTEGER, -- 使用时间
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 用户使用次数表（服务端记录，防止篡改）
CREATE TABLE IF NOT EXISTS user_credits (
  device_fingerprint TEXT PRIMARY KEY,
  total_credits INTEGER NOT NULL DEFAULT 0, -- 总次数
  used_credits INTEGER NOT NULL DEFAULT 0, -- 已使用次数
  remaining_credits INTEGER NOT NULL DEFAULT 0, -- 剩余次数
  last_updated INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  free_trials_used INTEGER NOT NULL DEFAULT 0 -- 已使用的免费试用次数（最多3次）
);

-- 激活码使用记录（记录每次激活码使用）
CREATE TABLE IF NOT EXISTS activation_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activation_code TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  credits_added INTEGER NOT NULL, -- 此次激活增加的次数
  activated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (activation_code) REFERENCES activation_codes(code)
);

-- 邀请码使用记录
CREATE TABLE IF NOT EXISTS invite_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invite_code TEXT NOT NULL,
  inviter_fingerprint TEXT NOT NULL, -- 邀请者
  invitee_fingerprint TEXT NOT NULL, -- 被邀请者
  credits_given INTEGER NOT NULL, -- 双方各获得的次数
  used_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (invite_code) REFERENCES invite_codes(code)
);

-- 使用记录表（记录每次AI调用）
CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_fingerprint TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1, -- 本次使用的次数
  mode TEXT, -- 'general' or 'legal'
  used_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_activation_code ON activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_user_fingerprint ON user_credits(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_usage_logs_fingerprint ON usage_logs(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_activation_usage_code ON activation_usage(activation_code);
CREATE INDEX IF NOT EXISTS idx_activation_usage_device ON activation_usage(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_invite_usage_code ON invite_usage(invite_code);

