// src/license.ts

const SECRET = 'WZG2024X';

/** FNV-1a 32bit 해시 → base36 8자리 */
function fnv32(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).toUpperCase().padStart(7, '0');
}

export type LicenseTier = 'community' | 'pro' | 'enterprise';

/**
 * 라이선스 키 검증
 * 키 형식: WZGRID-{TIER}-{KEY_ID}-{CHECKSUM}
 * 예: WZGRID-PRO-A1B2C3D4-XXXXXXX
 */
export function validateLicense(key?: string): LicenseTier {
  if (!key) return 'community';

  const parts = key.trim().toUpperCase().split('-');
  if (parts.length !== 4 || parts[0] !== 'WZGRID') return 'community';

  const [, tier, keyId, checksum] = parts;
  const expected = fnv32(SECRET + tier + keyId);

  if (checksum !== expected) return 'community';

  if (tier === 'PRO') return 'pro';
  if (tier === 'ENT') return 'enterprise';

  return 'community';
}

export function isPro(tier: LicenseTier): boolean {
  return tier === 'pro' || tier === 'enterprise';
}

/**
 * 라이선스 키 생성 (서버 또는 관리자 도구에서 사용)
 * generateKey('PRO', 'A1B2C3D4') → 'WZGRID-PRO-A1B2C3D4-XXXXXXX'
 */
export function generateKey(tier: 'PRO' | 'ENT', keyId: string): string {
  const t = tier.toUpperCase();
  const id = keyId.toUpperCase();
  const checksum = fnv32(SECRET + t + id);
  return `WZGRID-${t}-${id}-${checksum}`;
}
