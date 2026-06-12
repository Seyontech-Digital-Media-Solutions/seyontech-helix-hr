import { cpSync, mkdirSync } from "fs";
import { resolve } from "path";

// Vercel puts _libs at /var/task/_libs
// node_modules must sit at /var/task/node_modules (i.e. dist/node_modules locally)
const tslibSrc = resolve("node_modules/tslib");
const dest = resolve("dist/node_modules/tslib");

mkdirSync(dest, { recursive: true });
cpSync(tslibSrc, dest, { recursive: true });
console.log(`✅ Copied tslib → ${dest}`);