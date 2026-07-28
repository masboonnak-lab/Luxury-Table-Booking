/** Digits only, so "081-234-5678" and "081 234 5678" are the same guest. */
export function normalisePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

const THAI_PHONE = /^0\d{8,9}$/;

export function isThaiPhone(digits: string): boolean {
  return THAI_PHONE.test(digits);
}
