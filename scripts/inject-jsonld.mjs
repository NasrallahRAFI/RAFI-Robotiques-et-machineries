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
  const normalizedNodes = nodes.map((node) => {
    if (node['@id'] !== organization['@id']) return node;
    const { sameAs: _sameAs, ...nodeWithoutSameAs } = node;
    return {
      ...nodeWithoutSameAs,
      name: organization.legalName,
      legalName: organization.legalName,
      ...(organization.sameAs ? { sameAs: organization.sameAs } : {})
    };
  });
  const graph = {
    '@context': 'https://schema.org',
    '@graph': normalizedNodes
  };
  const replacement = `  <script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n  </script>`;
  const headWithoutJsonLd = head.replace(/\s*<script\s+type=["']application\/ld\+json["']\s*>[\s\S]*?<\/script>/gi, '').trimEnd();
  writeFileSync(fileUrl, `${headWithoutJsonLd}\n${replacement}\n</head>${source.slice(headEnd + '</head>'.length)}`);
  console.log(`consolidated JSON-LD: ${route.sourceFile}`);
}
