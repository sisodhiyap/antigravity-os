async function checkEnvBody() {
  const res = await fetch('https://antigravity-os.vercel.app/.env');
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Content-Type:', res.headers.get('content-type'));
  console.log('Body start:', text.slice(0, 150));
  const isHtml = text.includes('<!doctype html>') || text.includes('<html');
  console.log('Is HTML SPA fallback rewrite?', isHtml);
}

checkEnvBody().catch(console.error);
