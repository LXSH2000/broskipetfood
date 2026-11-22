export async function checkPincode(pin) {
  const p = String(pin || '').trim();
  if (!/^\d{6}$/.test(p)) {
    return {
      ok: false,
      error: 'Please enter a 6-digit pincode.',
      deliverable: false,
      pin: p,
      waitlist_count: 0
    };
  }

  try {
    let portal = null;
    if (typeof window !== 'undefined') {
      if (window.BroskiPortal && typeof window.BroskiPortal.getClient === 'function') {
        portal = window.BroskiPortal.getClient();
      }
    }

    if (portal) {
      const { data, error } = await portal.rpc('check_pincode', { p_pincode: p });
      if (!error && data) {
        return {
          ok: true,
          pin: p,
          deliverable: !!data.deliverable,
          waitlist_count: Number(data.waitlist_count || 0),
          fee: data.fee,
          zone: data.zone,
          eta: data.eta
        };
      }
    } else if (typeof window !== 'undefined' && window.BROSKI_CONFIG?.SUPABASE_URL && window.BROSKI_CONFIG?.SUPABASE_ANON_KEY) {
      const res = await fetch(`${window.BROSKI_CONFIG.SUPABASE_URL}/rest/v1/rpc/check_pincode`, {
        method: 'POST',
        headers: {
          apikey: window.BROSKI_CONFIG.SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_pincode: p })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        return {
          ok: true,
          pin: p,
          deliverable: !!data.deliverable,
          waitlist_count: Number(data.waitlist_count || 0),
          fee: data.fee,
          zone: data.zone,
          eta: data.eta
        };
      }
    }
  } catch (err) {
    console.warn('[checkPincode] RPC error, using fallback:', err);
  }

  // Fallback: Nangloi 110041 is Zone A (deliverable)
  return {
    ok: true,
    pin: p,
    deliverable: p === '110041',
    waitlist_count: 0
  };
}

export const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
