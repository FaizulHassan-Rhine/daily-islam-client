import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";

const dir = path.resolve("public/icons");
const svg = await readFile(path.join(dir, "icon.svg"));

await sharp(svg).resize(192, 192).png().toFile(path.join(dir, "icon-192.png"));
await sharp(svg).resize(512, 512).png().toFile(path.join(dir, "icon-512.png"));
await sharp(svg).resize(180, 180).png().toFile(path.join(dir, "apple-touch-icon.png"));
console.log("icons written");
