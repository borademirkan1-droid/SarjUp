import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MAX_WIDTH = 1920;
const LOGO_MAX_WIDTH = 400;
const PNG_QUALITY = 85;
const WEBP_QUALITY = 85;

const TARGET_DIRS = [
  path.join(ROOT, "public", "cihaz"),
  path.join(ROOT, "public", "galeri"),
];

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function formatKB(bytes) {
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

async function optimizeToPng(filePath, maxWidth) {
  const fileName = path.basename(filePath);
  const tempPath = `${filePath}.tmp`;

  const pipeline = sharp(filePath, { failOn: "none" }).rotate();
  const metadata = await pipeline.metadata();
  const width = metadata.width ?? maxWidth;

  let transformed = pipeline;
  if (width > maxWidth) {
    transformed = transformed.resize({ width: maxWidth, withoutEnlargement: true });
  }

  const info = await transformed
    .png({ quality: PNG_QUALITY, compressionLevel: 9, adaptiveFiltering: true })
    .toFile(tempPath);

  await fs.rename(tempPath, filePath);

  console.log(`✓ ${fileName} optimize edildi (${info.width}x${info.height}, ${formatKB(info.size)})`);
  return info;
}

async function createHeroWebP(heroPath) {
  const webpPath = path.join(path.dirname(heroPath), "cihaz-hero.webp");
  const info = await sharp(heroPath)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(webpPath);

  console.log(`✓ cihaz-hero.webp oluşturuldu (${info.width}x${info.height}, ${formatKB(info.size)})`);
}

async function optimizeDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()));

  for (const fileName of files) {
    const filePath = path.join(dirPath, fileName);
    await optimizeToPng(filePath, MAX_WIDTH);
  }
}

async function main() {
  console.log("Görsel optimizasyonu başlatılıyor...");

  for (const dirPath of TARGET_DIRS) {
    await optimizeDirectory(dirPath);
  }

  const logoPath = path.join(ROOT, "public", "logo.png");
  await optimizeToPng(logoPath, LOGO_MAX_WIDTH);

  const heroPath = path.join(ROOT, "public", "cihaz", "cihaz-hero.png");
  await createHeroWebP(heroPath);

  console.log("Tüm görseller optimize edildi.");
}

main().catch((error) => {
  console.error("Görsel optimizasyonunda hata oluştu:", error);
  process.exitCode = 1;
});
