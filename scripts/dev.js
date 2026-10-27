// Local dev server: serves the static site and runs api/chart.js the way Vercel does. Usage: node scripts/dev.js [port]
const http = require("http"), fs = require("fs"), path = require("path"), url = require("url");
const root = path.join(__dirname, ".."), port = +(process.argv[2] || 3000);
const chart = require("../api/chart.js");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".md": "text/markdown" };

http.createServer(async (req, res) => {
  const u = url.parse(req.url, true);
  if (u.pathname === "/api/chart") {
    req.query = u.query;
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); };
    return chart(req, res);
  }
  const file = path.join(root, u.pathname === "/" ? "index.html" : path.normalize(u.pathname));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Three-Rule Tracker on http://localhost:${port}`));
