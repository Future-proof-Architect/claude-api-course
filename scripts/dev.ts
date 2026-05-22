import { select } from "@inquirer/prompts";
import { readdirSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const lessonsDir = resolve(__dirname, "../lessons");

const lessons = readdirSync(lessonsDir)
  .filter((f) => f.endsWith(".ts"))
  .sort();

const mtime = (f: string) => statSync(`${lessonsDir}/${f}`).mtimeMs;
const latest = lessons.reduce((a, b) => mtime(a) >= mtime(b) ? a : b);

const chosen = await select({
  message: "Select a lesson to run:",
  choices: lessons.map((f) => ({ value: f, name: f.replace(".ts", "") })),
  default: latest,
});

spawn("tsx", [`lessons/${chosen}`], { stdio: "inherit" });
