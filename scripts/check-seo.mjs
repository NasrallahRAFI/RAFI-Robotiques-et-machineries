import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://rafirobotique.com';
const baseUrlArg = process.argv.find((argument) => argument.startsWith('--base-url='));
const fetchOrigin = (baseUrlArg?.slice('--base-url='.length) || 'http://localhost:4321').replace(/\/$/, '');
const failures = [];
const expectedCanonicalPaths = new Set(['/','/services/','/realisations/','/contact/','/a-propos/','/en/','/en/services/','/en/projects/','/en/contact/','/en/about/']);

function fail(message) { failures.push(message); }
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['.git', '.agents', '.codex'].includes(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name === 'index.html' ? [full] : [];
  });
}
function canonicalOf(source) {
  return /<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)/i.exec(source)?.[1] ?? null;
}

const sitemap = fs.existsSync(path.join(root, 'sitemap.xml')) ? fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8') : '';
if (!fs.existsSync(path.join(root, 'robots.txt'))) fail('robots.txt is missing');
if (!sitemap) fail('sitemap.xml is missing');
if (!sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')) fail('sitemap is missing the xhtml namespace');
for (const expected of expectedCanonicalPaths) {
  if (!sitemap.includes(`<loc>${origin}${expected}</loc>`)) fail(`sitemap is missing ${expected}`);
}
for (const canonical of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  if (!expectedCanonicalPaths.has(canonical[1].replace(origin, ''))) fail(`sitemap contains non-canonical URL ${canonical[1]}`);
}
const sitemapUrlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
if (sitemapUrlBlocks.length !== expectedCanonicalPaths.size) fail(`sitemap contains ${sitemapUrlBlocks.length} URL blocks; expected ${expectedCanonicalPaths.size}`);
for (const block of sitemapUrlBlocks) {
  if ((block.match(/<xhtml:link\b/g) || []).length !== 4) fail('sitemap URL block does not contain four hreflang alternates');
  if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(block)) fail('sitemap URL block is missing a valid lastmod date');
}

for (const file of walk(root)) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  const isAlias = relative === 'en/a-propos/index.html' || relative === 'en/realisations/index.html';
  const canonical = canonicalOf(source);
  if (!canonical || !expectedCanonicalPaths.has(canonical.replace(origin, ''))) fail(`${relative}: invalid canonical ${canonical ?? '(missing)'}`);
  if (source.includes(`${origin}/fr/`)) fail(`${relative}: stale /fr/ URL remains`);
  if (source.includes(`${origin}/assets/images/logo.png`) || source.includes(`${origin}/og-default.jpg`)) fail(`${relative}: stale missing asset URL remains`);
  const hreflangCount = (source.match(/hreflang=/gi) || []).length;
  if (hreflangCount !== 4) fail(`${relative}: expected four hreflang annotations, found ${hreflangCount}`);
  const expectedRobots = isAlias
    ? 'noindex,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
  if (!source.includes(`<meta name="robots" content="${expectedRobots}">`)) fail(`${relative}: crawl directives are missing or inconsistent`);
  if (!/<meta\s+property=["']og:locale:alternate["']/i.test(source)) fail(`${relative}: alternate Open Graph locale is missing`);
  if (!/<meta\s+property=["']og:image:alt["']/i.test(source)) fail(`${relative}: Open Graph image alt metadata is missing`);
  if (!/<meta\s+name=["']twitter:image:alt["']/i.test(source)) fail(`${relative}: Twitter image alt metadata is missing`);
  const webpageId = `${canonical}#webpage`;
  if (!source.includes(`"@id": "${webpageId}"`)) fail(`${relative}: WebPage JSON-LD is missing`);
  if (canonical === `${origin}/services/` || canonical === `${origin}/en/services/`) {
    if (!source.includes('"@type": "Service"')) fail(`${relative}: Service JSON-LD is missing`);
  }
  if (source.includes('"@type": "FAQPage"')) fail(`${relative}: FAQPage JSON-LD remains without a verified visible FAQ section`);
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  const routes = [...expectedCanonicalPaths];
  const alternates = [...new Set(routes.flatMap((route) => {
    const source = fs.readFileSync(path.join(root, route === '/' ? 'index.html' : `${route.slice(1)}index.html`), 'utf8');
    return [...source.matchAll(/hreflang=["'](?:fr|fr-MA|en|x-default)["'][^>]*href=["']([^"']+)/gi)].map((match) => new URL(match[1]).pathname);
  }))];
  const fetchPaths = [...new Set([...routes, ...alternates, '/robots.txt', '/sitemap.xml'])];
  for (const route of fetchPaths) {
    try {
      const response = await fetch(`${fetchOrigin}${route}`, { method: 'HEAD', redirect: 'manual' });
      if (response.status !== 200) failures.push(`${fetchOrigin}${route} returned HTTP ${response.status}`);
    } catch (error) {
      failures.push(`${fetchOrigin}${route} failed to fetch: ${error.message}`);
    }
  }
  if (failures.length) {
    console.error(failures.map((failure) => `- ${failure}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`SEO check passed: ${expectedCanonicalPaths.size} canonical URLs, alternates, crawl files, and bilingual annotations verified against ${fetchOrigin}.`);
  }
}
