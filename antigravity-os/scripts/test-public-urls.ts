import https from 'https';

async function testUrl(url: string) {
  try {
    const res = await fetch(url);
    console.log(`URL: ${url} -> Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Content length: ${text.length} bytes`);
    console.log(`Snippet: ${text.slice(0, 200)}...`);
    return { status: res.status, ok: res.ok };
  } catch (err: any) {
    console.error(`URL: ${url} -> Error: ${err.message}`);
    return { status: 0, error: err.message };
  }
}

async function main() {
  await testUrl('https://pathwise-app-8644.netlify.app');
  await testUrl('https://antigravity-os.vercel.app');
}

main().catch(console.error);
