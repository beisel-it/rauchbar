import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { previewBaseUrl, screenshotCaptures } from "./capture-config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const outputDir = path.join(rootDir, "artifacts", "readme-screenshots");
const serverScript = path.join(__dirname, "server.mjs");

const chromiumCandidates = [
  process.env.CHROMIUM_BIN,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
].filter(Boolean);

const chromiumBin = chromiumCandidates.find((candidate) => existsSync(candidate));

if (!chromiumBin) {
  console.error("No Chromium binary found for screenshot capture.");
  process.exit(1);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureOutputDir() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
}

function startServer() {
  const child = spawn(process.execPath, [serverScript], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  return child;
}

function runChromiumCapture({ url, file, size }) {
  const outputPath = path.join(outputDir, file);

  return new Promise((resolve, reject) => {
    const child = spawn(
      chromiumBin,
      [
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-sandbox",
        `--window-size=${size}`,
        `--screenshot=${outputPath}`,
        url,
      ],
      {
        cwd: rootDir,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve(outputPath);
        return;
      }

      reject(new Error(`Chromium exited with code ${code}: ${stderr}`));
    });
  });
}

const server = startServer();

try {
  await ensureOutputDir();
  await wait(1200);

  for (const capture of screenshotCaptures) {
    const filePath = await runChromiumCapture({
      ...capture,
      url: `${previewBaseUrl}${capture.route}`,
    });
    console.log(`Captured ${path.relative(rootDir, filePath)}`);
  }
} finally {
  server.kill("SIGINT");
}
