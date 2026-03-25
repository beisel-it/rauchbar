import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

function getArgValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const host = getArgValue("--host", "127.0.0.1");
const port = Number(getArgValue("--port", "4173"));

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function resolveFile(urlPath) {
  const cleanPath = urlPath.split("?")[0];
  const normalized = cleanPath === "/" ? "/index.html" : cleanPath;
  const fullPath = path.normalize(path.join(publicDir, normalized));

  if (!fullPath.startsWith(publicDir)) {
    return null;
  }

  return fullPath;
}

const server = createServer(async (req, res) => {
  const target = resolveFile(req.url || "/");

  if (!target || !existsSync(target)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  try {
    const ext = path.extname(target);
    const body = await readFile(target);
    res.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentTypes[ext] || "application/octet-stream",
    });
    res.end(body);
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(`Preview server error: ${error instanceof Error ? error.message : "unknown"}`);
  }
});

server.listen(port, host, () => {
  console.log(`Rauchbar UX preview available at http://${host}:${port}`);
});
