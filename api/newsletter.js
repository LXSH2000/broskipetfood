const emailValid = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  const body = req.body || {};
  if (!emailValid(body.email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  res.status(200).json({
    status: 'demo',
    message: 'Demo complete. Your email was not stored or subscribed.'
  });
}
