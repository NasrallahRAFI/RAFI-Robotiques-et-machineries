import { readFileSync, writeFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url), 'utf8'));

for (const route of config.routes.filter((entry) => entry.sourceFile)) {
  const fileUrl = new URL(`../${route.sourceFile}`, import.meta.url);
  const source = readFileSync(fileUrl, 'utf8');
  const headEnd = source.indexOf('</head>');
  if (headEnd < 0) throw new Error(`Missing </head> in ${route.sourceFile}`);
  const head = source.slice(0, headEnd);
  const scripts = [...head.matchAll(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) throw new Error(`No JSON-LD blocks found in ${route.sourceFile}`);

  const nodes = scripts.flatMap((match) => {
    const parsed = JSON.parse(match[1].trim());
    return Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
  }).filter((node) => node['@type'] !== 'FAQPage');

  const organization = config.organization;
  const language = route.lang === 'en' ? 'en' : 'fr';
  const inventionRoutes = new Set(['/', '/a-propos/', '/en/', '/en/about/', '/en/a-propos/']);
  const isType = (node, type) => Array.isArray(node['@type'])
    ? node['@type'].includes(type)
    : node['@type'] === type;
  const organizationNode = {
    '@type': 'Organization',
    '@id': organization['@id'],
    name: organization.name,
    alternateName: organization.alternateName,
    url: organization.url,
    logo: organization.logo,
    email: organization.email,
    telephone: organization.telephone,
    description: organization.descriptions[language],
    address: organization.address,
    areaServed: organization.areaServed,
    knowsAbout: organization.knowsAbout[language]
  };
  const websiteNode = {
    '@type': 'WebSite',
    '@id': config.website['@id'],
    url: organization.url,
    name: config.website.name,
    alternateName: config.website.alternateName,
    inLanguage: config.website.inLanguage,
    publisher: { '@id': organization['@id'] }
  };
  const normalizedNodes = nodes
    .filter((node) => node['@id'] !== organization['@id'] && node['@id'] !== config.website['@id'])
    .filter((node) => !isType(node, 'CreativeWork') || inventionRoutes.has(route.path))
    .map((node) => {
      const { '@context': _context, ...nodeWithoutContext } = node;
      if (isType(node, 'Service')) {
        return {
          ...nodeWithoutContext,
          name: config.service.names[language],
          description: config.service.descriptions[language],
          serviceType: config.service.serviceTypes[language],
          provider: { '@id': organization['@id'] },
          areaServed: organization.areaServed
        };
      }
      if (isType(node, 'CreativeWork')) {
        const {
          award: _legacyAwardField,
          creator: _legacyCreator,
          dateCreated: _legacyDateCreated,
          ...workWithoutUnverifiedAttribution
        } = nodeWithoutContext;
        return {
          ...workWithoutUnverifiedAttribution,
          '@id': config.invention['@id'],
          name: config.invention.names[language],
          description: config.invention.descriptions[language],
          datePublished: config.invention.datePublished,
          identifier: config.invention.identifier,
          countryOfOrigin: config.invention.countryOfOrigin,
          inLanguage: language === 'en' ? 'en' : 'fr-MA'
        };
      }
      if (isType(node, 'WebPage') && inventionRoutes.has(route.path)) {
        return {
          ...nodeWithoutContext,
          mentions: { '@id': config.invention['@id'] }
        };
      }
      return nodeWithoutContext;
    });
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organizationNode, websiteNode, ...normalizedNodes]
  };
  const replacement = `  <script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n  </script>`;
  const headWithoutJsonLd = head
    .replace(/\s*<script\s+type=["']application\/ld\+json["']\s*>[\s\S]*?<\/script>/gi, '')
    .replace(/<meta\s+name=["'](?:geo\.position|ICBM)["'][^>]*>/gi, '')
    .replace(/^[ \t]+$/gm, '')
    .trimEnd();
  writeFileSync(fileUrl, `${headWithoutJsonLd}\n${replacement}\n</head>${source.slice(headEnd + '</head>'.length)}`);
  console.log(`consolidated JSON-LD: ${route.sourceFile}`);
}
