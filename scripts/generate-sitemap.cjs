const fs = require("fs");
const path = require("path");

const BASE_URL = "https://karangholap.com";
const PAGES_DIR = path.resolve(__dirname, "..", "src", "pages");

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function filenameToRoute(name) {
  // remove extension
  const base = name.replace(/\.(tsx|ts|jsx|js)$/i, "");
  if (base.toLowerCase() === "index") return "/";
  if (base.toLowerCase() === "notfound" || base.toLowerCase() === "admin") return null; // skip 404 & admin

  // Convert PascalCase/CamelCase to kebab-case and lowercase
  const withDashes = base
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();

  return `/${withDashes}`;
}

function discoverPages() {
  if (!fs.existsSync(PAGES_DIR)) return [];

  const files = fs.readdirSync(PAGES_DIR);
  const pages = [];

  for (const f of files) {
    const full = path.join(PAGES_DIR, f);
    const stat = fs.statSync(full);
    if (stat.isFile() && /\.(tsx|ts|jsx|js)$/i.test(f)) {
      const route = filenameToRoute(f);
      if (!route) continue;
      pages.push({ file: full, route, mtime: stat.mtime });
    }
    // shallow: ignore subdirectories for now
  }

  // ensure root exists
  if (!pages.find((p) => p.route === "/")) {
    // try to find Index.* specifically
    const indexPath = path.join(PAGES_DIR, "Index.tsx");
    if (fs.existsSync(indexPath)) {
      const stat = fs.statSync(indexPath);
      pages.push({ file: indexPath, route: "/", mtime: stat.mtime });
    }
  }

  return pages;
}

function buildSitemap() {
  const pages = discoverPages();

  if (pages.length === 0) {
    console.warn("No pages discovered; falling back to root sitemap entry");
  }

  const urlset = (pages.length ? pages : [{ route: "/", mtime: new Date() }])
    .map((p) => {
      const lastmod = formatDate(new Date(p.mtime));
      return `  <url>\n    <loc>${BASE_URL}${p.route}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;

  const outDir = path.resolve(__dirname, "..", "public");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, "sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf8");
  console.log(`Wrote sitemap to ${outPath}`);
}

if (require.main === module) {
  buildSitemap();
}

module.exports = { buildSitemap };
