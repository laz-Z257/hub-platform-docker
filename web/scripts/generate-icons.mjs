import sharp from "sharp";
import fs from "fs";
import path from "path";

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#25207E"/>
  <text x="256" y="330" font-family="Arial, sans-serif" font-size="240" font-weight="bold" fill="white" text-anchor="middle">H</text>
</svg>`;

async function generateIcons() {
  const iconsDir = path.join(process.cwd(), "public", "icons");
  fs.mkdirSync(iconsDir, { recursive: true });

  // Generate 192x192 PNG
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, "icon-192.png"));

  console.log("Generated icon-192.png");

  // Generate 512x512 PNG
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-512.png"));

  console.log("Generated icon-512.png");

  // Generate SVG sources referenced by manifest
  await fs.promises.writeFile(path.join(iconsDir, "icon-192.svg"), svgContent);
  await fs.promises.writeFile(path.join(iconsDir, "icon-512.svg"), svgContent);

  console.log("Generated icon-192.svg / icon-512.svg");

  // Update manifest.json
  const manifestPath = path.join(process.cwd(), "public", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  manifest.icons = [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
  ];

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("Updated manifest.json");
}

generateIcons().catch(console.error);
