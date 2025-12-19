// 生成设备唯一标识
export function generateDeviceFingerprint(): string {
  // 尝试从 localStorage 获取已存储的指纹
  const stored = localStorage.getItem('device_fingerprint');
  if (stored) {
    return stored;
  }

  // 生成新的设备指纹
  const components: string[] = [];

  // 浏览器信息
  components.push(navigator.userAgent);
  components.push(navigator.language);
  components.push(String(navigator.hardwareConcurrency || 'unknown'));

  // 屏幕信息
  components.push(`${screen.width}x${screen.height}`);
  components.push(String(screen.colorDepth));

  // 时区
  components.push(String(new Date().getTimezoneOffset()));

  // Canvas 指纹（如果支持）
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
      components.push(canvas.toDataURL());
    }
  } catch (e) {
    // Canvas 不可用时忽略
  }

  // 生成 UUID v4 作为随机部分
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  components.push(uuid);

  // 合并所有组件并生成哈希
  const combined = components.join('|');
  
  // 简单哈希函数（用于生成固定长度的标识）
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // 生成最终指纹（32字符）
  const fingerprint = Math.abs(hash).toString(16).padStart(32, '0').substring(0, 32);
  
  // 存储到 localStorage
  localStorage.setItem('device_fingerprint', fingerprint);
  
  return fingerprint;
}

