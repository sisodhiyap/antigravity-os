import { chromium } from 'playwright';

async function testLocalRuntime() {
  console.log('Testing Local Runtime vs Vercel Production...\n');

  // 1. Test localhost:3000
  let localResult: any = { url: 'http://localhost:3000', reachable: false };
  try {
    const res = await fetch('http://localhost:3000');
    localResult.reachable = res.status === 200;
    localResult.status = res.status;
    const text = await res.text();
    localResult.isAntigravity = text.includes('ANTIGRAVITY');
    localResult.isGreenLane = text.includes('Green Lane') || text.includes('GOVERNMENT');
    console.log(`Localhost 3000 -> HTTP ${res.status}, Antigravity: ${localResult.isAntigravity}, GreenLane: ${localResult.isGreenLane}`);
  } catch (e: any) {
    console.log(`Localhost 3000 error: ${e.message}`);
  }

  // 2. Test localhost:3001 (Verification Server if running)
  try {
    const res = await fetch('http://localhost:3001');
    console.log(`Localhost 3001 -> HTTP ${res.status}`);
  } catch (e: any) {
    console.log(`Localhost 3001 error: ${e.message}`);
  }

  // 3. Playwright inspection of localhost
  if (localResult.reachable) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const title = await page.title();
    const heading = await page.locator('h1').first().innerText();
    const navItems = await page.locator('nav a').allInnerTexts();
    console.log(`\nLocalhost Playwright Inspection:`);
    console.log(`  Title: "${title}"`);
    console.log(`  Heading: "${heading}"`);
    console.log(`  Nav Items: ${JSON.stringify(navItems.slice(0, 8))}`);
    await browser.close();
  }

  // 4. Playwright inspection of Vercel
  const browser = await chromium.launch({ headless: true });
  const vPage = await browser.newPage();
  await vPage.goto('https://antigravity-os.vercel.app', { waitUntil: 'networkidle' });
  const vTitle = await vPage.title();
  const vBodyText = await vPage.innerText('body');
  console.log(`\nVercel Production Playwright Inspection:`);
  console.log(`  Title: "${vTitle}"`);
  console.log(`  Body text snippet: "${vBodyText.slice(0, 200).replace(/\n/g, ' ')}"`);
  await browser.close();
}

testLocalRuntime().catch(console.error);
