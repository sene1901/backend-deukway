// Numéros sénégalais : "77 123 45 67", "771234567" et "+221771234567" deviennent "+221771234567"
export const normalizePhone = (value: unknown) => {
  if (typeof value !== 'string') return value;
  let v = value.replace(/[\s.\-()]/g, '');
  if (v.startsWith('00')) v = '+' + v.slice(2);
  if (/^\d{9}$/.test(v)) v = '+221' + v;
  if (/^221\d{9}$/.test(v)) v = '+' + v;
  return v;
};

export const normalizeLogin = (value: unknown) =>
  typeof value === 'string' && value.includes('@')
    ? value.trim().toLowerCase()
    : normalizePhone(value);