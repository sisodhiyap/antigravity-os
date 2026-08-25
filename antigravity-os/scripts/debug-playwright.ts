import { chromium } from 'playwright';

async function debugPlaywright() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });

  page.on('console', (msg) => {
    console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.log(`[PAGE ERROR] ${err.message}`);
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      console.log(`[NETWORK ${res.status()}] ${res.url()}`);
    }
  });

  const res = await page.goto('https://antigravity-os.vercel.app', { waitUntil: 'networkidle' });
  console.log('Status:', res?.status());
  console.log('Title:', await page.title());

  await browser.close();
}

debugPlaywright().catch(console.error);
