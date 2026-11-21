export const LOCAL_PINS = ['110041', '110087', '110063'];
export const OTHER_WEST_DELHI_PINS = ['110015', '110018', '110026', '110027', '110058', '110059', '110064'];

export function checkPincode(pin, localPins = LOCAL_PINS) {
  const p = String(pin || '').trim();
  if (!/^\d{6}$/.test(p)) return { kind: 'error', text: 'Please enter a 6-digit pincode.' };
  if (localPins.includes(p)) {
    return { kind: 'local', text: '✅ Free delivery on orders from ₹295 within 5 km of Nangloi.' };
  }
  if (OTHER_WEST_DELHI_PINS.includes(p)) {
    return { kind: 'delhi', text: '🐾 We deliver here – delivery charges shown at checkout.' };
  }
  return { kind: 'outside', text: 'Not in your area yet – WhatsApp us.' };
}

export const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
