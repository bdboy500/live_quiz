const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const svgPath = path.join(__dirname, 'public', 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-icon.png', size: 180 },
    { name: 'favicon.png', size: 64 },
    { name: 'icon.png', size: 512 }
  ];

  for (const t of targets) {
    const outputPath = path.join(__dirname, 'public', t.name);
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${t.name} (${t.size}x${t.size})`);
  }

  // Copy favicon.png as favicon.ico as well
  fs.copyFileSync(path.join(__dirname, 'public', 'favicon.png'), path.join(__dirname, 'public', 'favicon.ico'));
  console.log('Copied favicon.ico');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
