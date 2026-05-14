export function toAssetUrl(path: string | null | undefined): string {
  const value = String(path || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  const normalized = value
    .replace(/\\/g, '/')
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\/+/, '');

  if (normalized.startsWith('assets/')) {
    return `${import.meta.env.BASE_URL}${normalized}`.replace(/([^:]\/)\/+/g, '$1');
  }

  return `${import.meta.env.BASE_URL}${normalized}`.replace(/([^:]\/)\/+/g, '$1');
}
