import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

function svgBuffer(size) {
  const r = Math.round(size * 0.18);
  const innerOffset = Math.round(size * 0.1);
  const innerSize = Math.round(size * 0.8);
  const innerR = Math.round(size * 0.14);
  const fontSize = Math.round(size * 0.52);

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#0a0a0f"/>
  <rect x="${innerOffset}" y="${innerOffset}" width="${innerSize}" height="${innerSize}" rx="${innerR}" fill="#6366f1"/>
  <text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="${fontSize}" font-family="Arial, sans-serif" font-weight="bold">V</text>
</svg>`;
  return Buffer.from(svgStr);
}

const sizes = [
  { size: 192, file: "public/icons/icon-192x192.png" },
  { size: 512, file: "public/icons/icon-512x512.png" },
  { size: 180, file: "public/icons/apple-touch-icon.png" },
];

for (const { size, file } of sizes) {
  await sharp(svgBuffer(size)).png().toFile(file);
  console.log(`Created ${file}`);
}

console.log("All icons generated!");
