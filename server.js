const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const rootPath = path.resolve(root);
const port = Number(process.env.PORT) || 5173;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

http
  .createServer((req, res) => {
    const requestPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
    const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.resolve(root, safePath === "/" ? "index.html" : safePath.replace(/^[/\\]/, ""));

    if (!filePath.startsWith(rootPath)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Shopee Affiliate Upload Planner: http://127.0.0.1:${port}`);
  });
