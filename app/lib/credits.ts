// 使用次数管理工具

export interface CreditsInfo {
  remainingCredits: number;
  freeTrialsUsed: number;
  freeTrialsRemaining: number;
  totalAvailable: number;
}

const CREDITS_STORAGE_KEY = 'user_credits';
const LAST_SYNC_KEY = 'credits_last_sync';

// 从 localStorage 获取使用次数（客户端缓存）
export function getLocalCredits(): CreditsInfo | null {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  
  try {
    const stored = localStorage.getItem(CREDITS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to parse credits from localStorage:', err);
  }
  return null;
}

// 保存使用次数到 localStorage
export function saveLocalCredits(credits: CreditsInfo): void {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(credits));
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (err) {
    console.error('Failed to save credits to localStorage:', err);
  }
}

// 从服务端同步使用次数
export async function syncCreditsFromServer(deviceFingerprint: string): Promise<CreditsInfo | null> {
  try {
    const response = await fetch('/api/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceFingerprint }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        const credits: CreditsInfo = {
          remainingCredits: data.remainingCredits || 0,
          freeTrialsUsed: data.freeTrialsUsed || 0,
          freeTrialsRemaining: data.freeTrialsRemaining || 0,
          totalAvailable: data.totalAvailable || 0,
        };
        saveLocalCredits(credits);
        return credits;
      }
    }
  } catch (err) {
    console.error('Failed to sync credits from server:', err);
  }
  return null;
}

// 初始化使用次数（如果是新用户，返回默认值）
export function initCredits(): CreditsInfo {
  // 检查是否在浏览器环境
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    // 服务端渲染时返回默认值
    return {
      remainingCredits: 0,
      freeTrialsUsed: 0,
      freeTrialsRemaining: 3,
      totalAvailable: 3,
    };
  }
  
  const local = getLocalCredits();
  if (local) {
    return local;
  }

  // 新用户：3次免费试用
  const defaultCredits: CreditsInfo = {
    remainingCredits: 0,
    freeTrialsUsed: 0,
    freeTrialsRemaining: 3,
    totalAvailable: 3,
  };
  saveLocalCredits(defaultCredits);
  return defaultCredits;
}

// 扣除使用次数（本地缓存）
export function deductLocalCredit(credits: CreditsInfo): CreditsInfo {
  const updated = { ...credits };

  if (updated.freeTrialsRemaining > 0) {
    // 使用免费试用次数
    updated.freeTrialsUsed += 1;
    updated.freeTrialsRemaining = Math.max(0, 3 - updated.freeTrialsUsed);
  } else {
    // 使用 credits
    updated.remainingCredits = Math.max(0, updated.remainingCredits - 1);
  }

  updated.totalAvailable = updated.freeTrialsRemaining + updated.remainingCredits;
  saveLocalCredits(updated);
  return updated;
}

// 增加使用次数（本地缓存）
export function addLocalCredits(credits: CreditsInfo, amount: number): CreditsInfo {
  const updated = {
    ...credits,
    remainingCredits: credits.remainingCredits + amount,
    totalAvailable: credits.totalAvailable + amount,
  };
  saveLocalCredits(updated);
  return updated;
}

