import { readFileSync, statSync, writeFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url), 'utf8'));
const baseUrl = config.baseUrl.replace(/\/$/, '');
const indexableRoutes = config.routes.filter((route) => route.indexable !== false);

const blocks = indexableRoutes.map((route) => {
  const lastmod = statSync(new URL(`../${route.sourceFile}`, import.meta.url)).mtime.toISOString().slice(0, 10);
  const alternates = route.alternates
    .map((alternate) => `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${baseUrl}${alternate.path}"/>`)
    .join('\n');
  return `  <url>\n    <loc>${baseUrl}${route.path}</loc>\n${alternates}\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
}).join('\n\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n${blocks}\n\n</urlset>\n`;
writeFileSync(new URL('../sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml regenerated — ${indexableRoutes.length} URLs`);
