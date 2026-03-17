import { ref, computed, provide, inject } from 'vue';
import { validateLicense, isPro, generateKey } from '../../license';

export const LICENSE_KEY = Symbol('wz-demo-license');

export interface LicenseContext {
  licenseKey: ReturnType<typeof ref<string>>;
  licenseTier: ReturnType<typeof computed<string>>;
  isProUser: ReturnType<typeof computed<boolean>>;
  licenseTierLabel: ReturnType<typeof computed<{ text: string; class: string }>>;
  applyDemoKey: () => void;
}

export function useLicense() {
  const licenseKey = ref('');
  const licenseTier = computed(() => validateLicense(licenseKey.value));
  const isProUser   = computed(() => isPro(licenseTier.value));
  const licenseTierLabel = computed(() => {
    const t = licenseTier.value;
    if (t === 'enterprise') return { text: 'Enterprise ✓', class: 'bg-purple-100 text-purple-700' };
    if (t === 'pro')        return { text: 'Pro ✓',        class: 'bg-amber-100 text-amber-700' };
    return                         { text: 'Community',    class: 'bg-gray-100 text-gray-500' };
  });
  const applyDemoKey = () => { licenseKey.value = generateKey('PRO', 'DEMO0001'); };

  return { licenseKey, licenseTier, isProUser, licenseTierLabel, applyDemoKey };
}

export function provideLicense() {
  const ctx = useLicense();
  provide(LICENSE_KEY, ctx);
  return ctx;
}

export function injectLicense(): LicenseContext {
  const ctx = inject<LicenseContext>(LICENSE_KEY);
  if (!ctx) throw new Error('useLicense: provideLicense()가 상위 컴포넌트에서 호출되지 않았습니다.');
  return ctx;
}
