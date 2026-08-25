import fs from 'fs';
import path from 'path';

async function forensicInspect() {
  console.log('Fetching https://antigravity-os.vercel.app ...');
  const res = await fetch('https://antigravity-os.vercel.app', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  console.log('Status:', res.status, res.statusText);
  console.log('Headers:');
  res.headers.forEach((val, key) => console.log(`  ${key}: ${val}`));

  const html = await res.text();
  console.log('\n--- HTML Content (Length: ' + html.length + ') ---');
  console.log(html);

  // Extract scripts
  const scriptMatches = html.match(/src="([^"]+)"/g) || [];
  console.log('\n--- Script / Asset References ---');
  for (const s of scriptMatches) {
    console.log(s);
    const scriptUrl = s.replace('src="', '').replace('"', '');
    const fullUrl = scriptUrl.startsWith('http') ? scriptUrl : `https://antigravity-os.vercel.app${scriptUrl}`;
    try {
      const sRes = await fetch(fullUrl);
      const sText = await sRes.text();
      console.log(`  -> Content of ${scriptUrl} (${sText.length} bytes):`);
      console.log(`     Sample: ${sText.slice(0, 300)}...`);

      // Search script for strings
      const terms = [
        "Green Lane",
        "THE GOVERNMENT WANTS TO SHUT YOU DOWN",
        "DEPLOY SHIELD NOW",
        "WE ONLY GET PAID WHEN YOU ARE SAFE",
        "RED STATE",
        "GREEN STATE",
        "ANTIGRAVITY",
        "Master Workspace",
        "AI Control Center",
        "Website Factory"
      ];
      for (const t of terms) {
        if (sText.includes(t) || sText.toLowerCase().includes(t.toLowerCase())) {
          console.log(`     >>> MATCH FOUND for "${t}" in ${scriptUrl}`);
        }
      }
    } catch (e: any) {
      console.log(`  -> Failed to fetch script ${fullUrl}: ${e.message}`);
    }
  }
}

forensicInspect().catch(console.error);
