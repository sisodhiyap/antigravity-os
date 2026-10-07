const fs = require('fs');
const path = require('path');

const iconDir = path.resolve(__dirname, '..', 'public', 'assets', 'icons');
if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

const svgPath = path.join(iconDir, 'icon.svg');
const svg = fs.readFileSync(svgPath);

fs.writeFileSync(path.join(iconDir, 'icon-192.png'), svg);
fs.writeFileSync(path.join(iconDir, 'icon-512.png'), svg);
fs.writeFileSync(path.join(iconDir, 'icon-maskable.png'), svg);
fs.writeFileSync(path.join(iconDir, 'apple-touch-icon.png'), svg);

console.log('Icons written successfully to', iconDir);
