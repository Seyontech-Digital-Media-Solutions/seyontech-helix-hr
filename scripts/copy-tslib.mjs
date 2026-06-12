import { cpSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

// Find where _libs lives in the build output
const targets = [
  "dist/_libs",
  "dist/server/_libs", 
  ".output/_libs",
  ".output/server/_libs",
];

const tslibSrc = resolve("node_modules/tslib");

for (const target of targets) {
  if (existsSync(target)) {
    const dest = resolve(target, "../node_modules/tslib");
    mkdirSync(dest, { recursive: true });
    cpSync(tslibSrc, dest, { recursive: true });
    console.log(`✅ Copied tslib to ${dest}`);
  }
}

console.log("✅ copy-tslib done");