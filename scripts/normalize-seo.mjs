import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');
const origin = 'https://rafirobotique.com';
const staticImage = `${origin}/assets/images/logo/rafi-mark-static.png`;

const routePairs = {
  '/': { fr: '/', en: '/en/' },
  '/services/': { fr: '/services/', en: '/en/services/' },
  '/realisations/': { fr: '/realisations/', en: '/en/projects/' },
  '/contact/': { fr: '/contact/', en: '/en/contact/' },
  '/a-propos/': { fr: '/a-propos/', en: '/en/about/' }
};

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (['.git', '.agents', '.codex'].includes(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name === 'index.html' ? [fullPath] : [];
  });
}

function routeFor(file) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  if (relative === 'index.html') return '/';
  if (relative === 'services/index.html') return '/services/';
  if (relative === 'realisations/index.html') return '/realisations/';
  if (relative === 'contact/index.html') return '/contact/';
  if (relative === 'a-propos/index.html') return '/a-propos/';
  if (relative === 'en/index.html') return '/en/';
  if (relative === 'en/services/index.html') return '/en/services/';
  if (relative === 'en/projects/index.html' || relative === 'en/realisations/index.html') return '/en/projects/';
  if (relative === 'en/contact/index.html') return '/en/contact/';
  if (relative === 'en/about/index.html' || relative === 'en/a-propos/index.html') return '/en/about/';
  throw new Error(`No route mapping for ${relative}`);
}

function pairFor(route) {
  if (route.startsWith('/en/')) {
    return Object.values(routePairs).find((pair) => pair.en === route) ?? routePairs['/'];
  }
  return routePairs[route] ?? routePairs['/'];
}

function alternateLinks(pair) {
  return [
    `  <link rel="alternate" hreflang="fr" href="${origin}${pair.fr}">`,
    `  <link rel="alternate" hreflang="fr-MA" href="${origin}${pair.fr}">`,
    `  <link rel="alternate" hreflang="en" href="${origin}${pair.en}">`,
    `  <link rel="alternate" hreflang="x-default" href="${origin}${pair.fr}">`
  ].join('\n');
}

function invisibleMetadata(source, route) {
  const isEnglish = /<html\s+lang=["']en["']/i.test(source);
  const alternateLocale = isEnglish ? 'fr_MA' : 'en_US';
  const tags = [
    `  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">`,
    `  <meta property="og:locale:alternate" content="${alternateLocale}">`,
    `  <meta property="og:image:alt" content="${isEnglish ? 'RAFI Robotics and Machinery industrial engineering' : 'Rafi Robotique et Machineries — ingénierie industrielle'}">`,
    `  <meta name="twitter:image:alt" content="${isEnglish ? 'RAFI Robotics and Machinery industrial engineering' : 'Rafi Robotique et Machineries — ingénierie industrielle'}">`
  ];

  for (const tag of tags) {
    const marker = tag.match(/(?:name|property)="([^"]+)"/)?.[1];
    if (marker && !new RegExp(`<(?:meta)\\s+(?:name|property)=["']${marker.replaceAll(':', '\\:')}["']`, 'i').test(source)) {
      source = source.replace('</head>', `${tag}\n</head>`);
    }
  }

  const title = /<title>([^<]+)<\/title>/i.exec(source)?.[1]?.replaceAll('&amp;', '&') ?? '';
  const webpageId = `${origin}${route}#webpage`;
  const websiteSchema = route === '/' || route === '/en/' ? `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "${origin}/#website",
    "url": "${origin}/",
    "name": "Rafi Robotique et Machineries",
    "publisher": { "@id": "${origin}/#organization" },
    "inLanguage": ["fr-MA", "en"]
  }
  </script>` : '';
  const webpageSchema = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "${webpageId}",
    "url": "${origin}${route}",
    "name": ${JSON.stringify(title)},
    "inLanguage": "${isEnglish ? 'en' : 'fr-MA'}",
    "isPartOf": { "@id": "${origin}/#website" },
    "about": { "@id": "${origin}/#organization" }
  }
  </script>`;

  if (!source.includes(`"@id": "${webpageId}"`)) source = source.replace('</head>', `${webpageSchema}\n</head>`);
  if (websiteSchema && !source.includes(`"@id": "${origin}/#website"`)) source = source.replace('</head>', `${websiteSchema}\n</head>`);
  return source;
}

function robotsDirective(source, isAlias) {
  const directive = isAlias
    ? 'noindex,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
  return source.replace(
    /<meta\s+name=["']robots["'][^>]*>/i,
    `  <meta name="robots" content="${directive}">`
  );
}

function serviceSchema(source, route) {
  if (route !== '/services/' && route !== '/en/services/') return source;
  if (source.includes('"@type": "Service"')) return source;

  const isEnglish = route.startsWith('/en/');
  const title = /<title>([^<]+)<\/title>/i.exec(source)?.[1]?.replaceAll('&amp;', '&') ?? '';
  const description = /<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i.exec(source)?.[1]?.replaceAll('&amp;', '&') ?? '';
  const schema = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "${origin}${route}#service",
    "name": ${JSON.stringify(title)},
    "description": ${JSON.stringify(description)},
    "serviceType": ${JSON.stringify(isEnglish ? 'Industrial engineering and automation services' : 'Services d’ingénierie industrielle et d’automatisation')},
    "provider": { "@id": "${origin}/#organization" },
    "areaServed": { "@type": "Country", "name": "Morocco" },
    "url": "${origin}${route}"
  }
  </script>`;
  return source.replace('</head>', `${schema}\n</head>`);
}

function removeUnmatchedFaqSchema(source) {
  return source.replace(
    /\s*<script\s+type=["']application\/ld\+json["']>\s*[\s\S]*?"@type"\s*:\s*["']FAQPage["'][\s\S]*?<\/script>/gi,
    ''
  );
}

const files = walk(root);
for (const file of files) {
  const route = routeFor(file);
  const pair = pairFor(route);
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  const isAlias = relative === 'en/a-propos/index.html' || relative === 'en/realisations/index.html';
  const canonical = route.startsWith('/en/') ? route : route;
  let source = fs.readFileSync(file, 'utf8');

  source = source
    .replaceAll(`${origin}/assets/images/logo.png`, staticImage)
    .replaceAll(`${origin}/og-default.jpg`, staticImage)
    .replaceAll(`${origin}/fr/`, `${origin}/`)
    .replaceAll(/(<meta\s+property=["']og:url["'][^>]*content=["'])[^"']*/gi, `$1${origin}${canonical}`)
    .replaceAll(/(<link\s+rel=["']canonical["'][^>]*href=["'])[^"']*/gi, `$1${origin}${canonical}`);

  source = source.replaceAll(/\s*<link\s+rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>/gi, '');
  const canonicalTag = new RegExp(`(<link\\s+rel=["']canonical["'][^>]*href=["']${origin.replaceAll('.', '\\.')}${canonical.replaceAll('/', '\\/')}["'][^>]*>)`, 'i');
  if (!canonicalTag.test(source)) throw new Error(`Canonical replacement failed for ${file}`);
  source = source.replace(canonicalTag, `$1\n${alternateLinks(pair)}`);
  source = invisibleMetadata(source, canonical);
  source = robotsDirective(source, isAlias);
  source = serviceSchema(source, canonical);
  source = removeUnmatchedFaqSchema(source);

  if (write) fs.writeFileSync(file, source);
  console.log(`${write ? 'normalized' : 'would normalize'} ${path.relative(root, file)}`);
}
