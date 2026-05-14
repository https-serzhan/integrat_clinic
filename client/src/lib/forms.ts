export function normalizePhoneDigits(value: string): string {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

export function formatPhoneInput(value: string): string {
  const digits = normalizePhoneDigits(value);
  let formatted = '+7';

  if (digits.length > 0) formatted += ` (${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ')';
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += ` ${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += ` - ${digits.slice(8, 10)}`;

  return formatted;
}

export function toBackendPhone(value: string): string {
  return `7${normalizePhoneDigits(value)}`;
}

export interface ContactFormValues {
  fullname: string;
  phone: string;
  comment: string;
}

export interface ValidatedContactPayload extends ContactFormValues {
  phoneDigits: string;
}

export function validateContactForm(values: ContactFormValues): ValidatedContactPayload {
  const fullname = String(values.fullname || '').trim().replace(/\s+/g, ' ');
  const comment = String(values.comment || '').trim().replace(/\s+/g, ' ');
  const phoneDigits = normalizePhoneDigits(values.phone);

  if (fullname.length < 2) {
    throw new Error('Please enter your full name.');
  }

  if (!/^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі\s'-]+$/.test(fullname)) {
    throw new Error('Full name can contain only letters, spaces, apostrophes, or hyphens.');
  }

  if (phoneDigits.length !== 10) {
    throw new Error('Please enter a valid Kazakhstan phone number.');
  }

  if (comment.length < 5) {
    throw new Error('Please write a short comment.');
  }

  if (comment.length > 1000) {
    throw new Error('Comment must be 1000 characters or less.');
  }

  return {
    fullname,
    phone: `+7${phoneDigits}`,
    phoneDigits,
    comment
  };
}

export function toDateTimeLocal(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function nextSuggestedBookingSlot(): string {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(10, 0, 0, 0);
  return toDateTimeLocal(next);
}

export function toBookingIsoString(value: string): string {
  const normalized = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}:00.000Z`;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

export function isStrongPassword(value: string): boolean {
  const password = String(value || '');
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
