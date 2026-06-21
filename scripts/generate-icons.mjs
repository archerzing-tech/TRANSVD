/**
 * Generate Android app icons for TRANSVD
 *
 * Creates:
 * 1. Adaptive icon XML (foreground vector + background)
 * 2. PNG icons at all Android mipmap densities
 * 3. Standard PNG icons for Tauri bundle (32x32, 128x128, 256x256)
 */

import sharp from "sharp";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Icon sizes ──
const ANDROID_DENSITIES = [
  { density: "mdpi", size: 48 },
  { density: "hdpi", size: 72 },
  { density: "xhdpi", size: 96 },
  { density: "xxhdpi", size: 144 },
  { density: "xxxhdpi", size: 192 },
];

const TAURI_SIZES = [
  { name: "32x32.png", size: 32 },
  { name: "128x128.png", size: 128 },
  { name: "128x128@2x.png", size: 256 },
];

// ── SVG templates for the icon ──
// A minimalist green leaf silhouette

const SVG_FOREGROUND = `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108">
  <!-- Leaf body -->
  <path d="M54,22 C54,22 34,38 30,54 C26,70 38,86 54,86 C70,86 82,70 78,54 C74,38 54,22 54,22Z"
    stroke="#4ADE80" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <!-- Center vein -->
  <path d="M54,22 L54,84" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Left side veins -->
  <path d="M54,36 L38,44" stroke="#4ADE80" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M54,50 L34,58" stroke="#4ADE80" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M54,64 L40,72" stroke="#4ADE80" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Right side veins -->
  <path d="M54,36 L70,44" stroke="#4ADE80" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M54,50 L74,58" stroke="#4ADE80" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M54,64 L68,72" stroke="#4ADE80" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Stem -->
  <path d="M54,22 L54,14" stroke="#4ADE80" stroke-width="2.8" stroke-linecap="round"/>
</svg>`;

const SVG_BACKGROUND = `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108">
  <rect width="108" height="108" fill="#1A3A2A"/>
</svg>`;

// ── Helper: generate a colored circle PNG using sharp ──
async function generatePNG(size, outputPath) {
  // Render the SVG at the target size
  const svgBuffer = Buffer.from(SVG_FOREGROUND);
  
  // Create a composited image: background + foreground
  const bgBuffer = Buffer.from(SVG_BACKGROUND);
  
  const bg = await sharp(bgBuffer).resize(size, size).png().toBuffer();
  
  await sharp(bg)
    .composite([
      {
        input: await sharp(svgBuffer).resize(size, size).png().toBuffer(),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(outputPath);
  
  console.log(`  ✓ ${outputPath.split("/").pop()} (${size}x${size})`);
}

// ── Main ──
async function main() {
  console.log("🎨 Generating TRANSVD app icons...\n");

  // 1. Android mipmap PNGs
  console.log("📱 Android mipmap PNGs:");
  for (const { density, size } of ANDROID_DENSITIES) {
    const dir = join(ROOT, "src-tauri", "gen", "android", "app", "src", "main", "res", `mipmap-${density}`);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    await generatePNG(size, join(dir, "ic_launcher.png"));
  }

  // 2. Android adaptive icon XML
  console.log("\n🎨 Android adaptive icon XML:");
  
  const foregroundXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>`;

  const anydpiDir = join(ROOT, "icons", "android", "mipmap-anydpi-v26");
  if (!existsSync(anydpiDir)) mkdirSync(anydpiDir, { recursive: true });
  writeFileSync(join(anydpiDir, "ic_launcher.xml"), foregroundXml);
  console.log("  ✓ ic_launcher.xml (adaptive icon)");

  // Also update the gen/android version
  const genAnydpiDir = join(ROOT, "src-tauri", "gen", "android", "app", "src", "main", "res", "mipmap-anydpi-v26");
  if (!existsSync(genAnydpiDir)) mkdirSync(genAnydpiDir, { recursive: true });
  writeFileSync(join(genAnydpiDir, "ic_launcher.xml"), foregroundXml);
  console.log("  ✓ ic_launcher.xml (gen/android)");

  // Foreground vector drawable
  const fgDir = join(ROOT, "src-tauri", "gen", "android", "app", "src", "main", "res", "drawable-v24");
  if (!existsSync(fgDir)) mkdirSync(fgDir, { recursive: true });
  writeFileSync(join(fgDir, "ic_launcher_foreground.xml"), SVG_FOREGROUND.replace('xmlns="http://www.w3.org/2000/svg"', 'xmlns:android="http://schemas.android.com/apk/res/android"'));
  console.log("  ✓ ic_launcher_foreground.xml");

  // Background drawable (simple color)
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<color xmlns:android="http://schemas.android.com/apk/res/android">#1C1B18</color>`;
  
  const bgDir = join(ROOT, "src-tauri", "gen", "android", "app", "src", "main", "res", "drawable");
  if (!existsSync(bgDir)) mkdirSync(bgDir, { recursive: true });
  writeFileSync(join(bgDir, "ic_launcher_background.xml"), bgXml);
  console.log("  ✓ ic_launcher_background.xml");

  // Also update icons/android/
  const iconsBgDir = join(ROOT, "icons", "android", "drawable");
  if (!existsSync(iconsBgDir)) mkdirSync(iconsBgDir, { recursive: true });
  writeFileSync(join(iconsBgDir, "ic_launcher_background.xml"), bgXml);
  console.log("  ✓ ic_launcher_background.xml (icons/android)");

  const iconsFgDir = join(ROOT, "icons", "android", "drawable-v24");
  if (!existsSync(iconsFgDir)) mkdirSync(iconsFgDir, { recursive: true });
  writeFileSync(join(iconsFgDir, "ic_launcher_foreground.xml"), SVG_FOREGROUND.replace('xmlns="http://www.w3.org/2000/svg"', 'xmlns:android="http://schemas.android.com/apk/res/android"'));
  console.log("  ✓ ic_launcher_foreground.xml (icons/android)");

  const iconsValuesDir = join(ROOT, "icons", "android", "values");
  if (!existsSync(iconsValuesDir)) mkdirSync(iconsValuesDir, { recursive: true });
  writeFileSync(join(iconsValuesDir, "ic_launcher_background.xml"), bgXml);
  console.log("  ✓ ic_launcher_background.xml (icons/android/values)");

  // 3. Tauri bundle PNGs
  console.log("\n🖥️  Tauri bundle PNGs:");
  for (const { name, size } of TAURI_SIZES) {
    await generatePNG(size, join(ROOT, "icons", name));
  }

  // 4. Generate Simplified logo for headers
  // Create a smaller icon for the public folder
  const publicIconsDir = join(ROOT, "public");
  if (!existsSync(publicIconsDir)) mkdirSync(publicIconsDir, { recursive: true });
  
  console.log("\n✨ Done! All icons generated.");
}

main().catch(console.error);
