#!/usr/bin/env node
// Generates apps/mobile/assets/logo.png from the favicon.svg design
// Uses only Node built-ins — no canvas dependency needed
// Creates a 1024x1024 PNG with blue gradient background and "RS" text

const fs = require('fs');
const path = require('path');

// We'll use sharp if available, otherwise fall back to writing a minimal PNG
// that encodes the SVG as a raster via svg2png approach

// Check for sharp
let sharp;
try { sharp = require('sharp'); } catch {}

// Check for @resvg/resvg-js
let resvg;
try { resvg = require('@resvg/resvg-js'); } catch {}

const SVG = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#g)"/>
  <text x="512" y="680" font-family="Arial Black, Arial, sans-serif" font-size="560" font-weight="900" fill="white" text-anchor="middle">RS</text>
</svg>`;

const outPath = path.join(__dirname, '../apps/mobile/assets/logo.png');

async function main() {
  if (resvg) {
    const { Resvg } = resvg;
    const renderer = new Resvg(SVG, { fitTo: { mode: 'width', value: 1024 } });
    const png = renderer.render().asPng();
    fs.writeFileSync(outPath, png);
    console.log('✓ logo.png generated via resvg-js');
    return;
  }

  if (sharp) {
    const buf = Buffer.from(SVG);
    await sharp(buf).resize(1024, 1024).png().toFile(outPath);
    console.log('✓ logo.png generated via sharp');
    return;
  }

  // Fallback: use macOS sips to convert SVG → PNG
  const { execSync } = require('child_process');
  const tmpSvg = path.join(__dirname, '_tmp_logo.svg');
  fs.writeFileSync(tmpSvg, SVG);
  try {
    // qlmanage can render SVG on macOS
    execSync(`qlmanage -t -s 1024 -o ${path.dirname(outPath)} ${tmpSvg} 2>/dev/null`);
    const rendered = path.join(path.dirname(outPath), '_tmp_logo.svg.png');
    if (fs.existsSync(rendered)) {
      fs.renameSync(rendered, outPath);
      console.log('✓ logo.png generated via qlmanage');
    } else {
      throw new Error('qlmanage output not found');
    }
  } catch {
    // Last resort: rsvg-convert
    try {
      execSync(`rsvg-convert -w 1024 -h 1024 ${tmpSvg} -o ${outPath}`);
      console.log('✓ logo.png generated via rsvg-convert');
    } catch {
      console.error('✗ Could not generate PNG. Install sharp: npm i sharp');
      console.log('SVG saved to:', tmpSvg);
      process.exit(1);
    }
  } finally {
    if (fs.existsSync(tmpSvg)) fs.unlinkSync(tmpSvg);
  }
}

main().catch(console.error);
