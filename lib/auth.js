export async function token() {
  const data = new TextEncoder().encode('inv:' + (process.env.APP_PASSWORD || ''));
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
