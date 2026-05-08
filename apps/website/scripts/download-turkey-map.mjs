import fs from "fs";
import path from "path";
import https from "https";

const urls = [
  "https://raw.githubusercontent.com/cihadturhan/tr-geojson/master/geo/tr-cities.json",
  "https://raw.githubusercontent.com/alpers/Turkey-Maps-GeoJSON/master/tr-cities.json",
  "https://gist.githubusercontent.com/ismailbaskin/2492570/raw/3e1547e0b56dc63183a5712e95e4a1f73ed5d574/turkiye-iller.json",
  "https://raw.githubusercontent.com/yusufnb/turkey-cities-geojson/main/turkey-cities.geojson",
];

const outputPath = path.resolve("public/data/turkey-cities.json");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`Download failed: ${res.statusCode} (${url})`));
          return;
        }

        const file = fs.createWriteStream(outputPath);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(url);
        });
        file.on("error", (err) => {
          reject(err);
        });
      })
      .on("error", (err) => reject(err));
  });
}

async function main() {
  let downloadedFrom = "";

  for (const url of urls) {
    try {
      await download(url);
      downloadedFrom = url;
      break;
    } catch (error) {
      console.error(String(error));
    }
  }

  if (!downloadedFrom) {
    console.error("Download error: all sources failed");
    process.exit(1);
  }

  console.log("✓ Turkey GeoJSON downloaded successfully");
  console.log(`✓ Source: ${downloadedFrom}`);

  const data = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  console.log("Type:", data.type);
  console.log("Features count:", data.features?.length);
  console.log("First feature properties:", data.features?.[0]?.properties);
  console.log("First feature geometry type:", data.features?.[0]?.geometry?.type);
}

main().catch((err) => {
  console.error("Download error:", err);
  process.exit(1);
});
