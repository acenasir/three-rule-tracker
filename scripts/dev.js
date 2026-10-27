// Local dev server for the static site. Run scripts/fetch-data.js first to fill data/bars/. Usage: node scripts/dev.js [port]
const http = require("http"), fs = require("fs"), path = require("path"), url = require("url");
const root = path.join(__dirname, ".."), port = +(process.argv[2] || 3000);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".md": "text/markdown" };

http.createServer((req, res) => {
  const u = url.parse(req.url);
  const file = path.join(root, u.pathname === "/" ? "index.html" : path.normalize(decodeURIComponent(u.pathname)));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Three-Rule Tracker on http://localhost:${port}`));
