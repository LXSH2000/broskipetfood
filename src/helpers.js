export const LOCAL_PINS = ['110041', '110087', '110063', '110027', '110058', '110015', '110026', '110034', '110056'];

export function checkPincode(pin, localPins = LOCAL_PINS) {
  const p = String(pin || '').trim();
  if (!/^\d{6}$/.test(p)) return { kind: 'error', text: 'Please enter a 6-digit pincode.' };
  if (localPins.includes(p)) {
    return { kind: 'local', text: '✅ Fast local delivery available! Dispatched fresh from Nangloi within 24 hours. Free delivery on orders ₹299+.' };
  }
  if (p.startsWith('110')) {
    return { kind: 'delhi', text: '🐾 We deliver across Delhi by local courier (24–48 hours). Delivery charge is confirmed on WhatsApp before you pay.' };
  }
  return { kind: 'outside', text: 'We deliver only in Delhi right now. WhatsApp us and we will tell you when we reach your area.' };
}

export const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
