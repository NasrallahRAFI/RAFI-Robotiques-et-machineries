# RAFI Robotiques et Machineries — Current SEO/GEO Report

**Audit date:** 2026-09-09  
**Domain audited:** `https://rafirobotique.com`  
**Repository:** `RAFI Robotiques et machineries`  
**Audit type:** current technical SEO, local/entity SEO, and Generative Engine Optimization (GEO) assessment  
**Status:** assessment and high-level optimization proposal; no SEO implementation was made in this report pass

## Executive assessment

RAFI has a strong raw content foundation: a real business identity, a Casablanca location, bilingual French/English pages, industrial service descriptions, project evidence, contact details, images, and JSON-LD structured data. The site is also delivered as crawlable static HTML rather than relying on client-side rendering for its core copy.

However, the current production SEO system has two release-blocking indexability problems:

1. The production French pages are served at root paths such as `/services/` and `/realisations/`, but their canonical and `hreflang` annotations point to `/fr/services/` and `/fr/realisations/`. Those `/fr/...` URLs currently return `404`.
2. The production domain currently returns `404` for both `/robots.txt` and `/sitemap.xml`.

These problems can cause search engines to receive contradictory URL signals, waste crawl attempts, select the wrong canonical, and miss the preferred URL inventory. They should be resolved before investing heavily in new content or authority building.

The site can be made substantially more search-ready, but no legitimate SEO or GEO program can guarantee a ranking, a first-page position, inclusion in an AI answer, or even indexing of every URL. Google explicitly states that meeting technical requirements and best practices does not guarantee crawling, indexing, or serving, and that structured data does not guarantee a rich result. The realistic guarantee is implementation quality, accurate measurement, and a controlled process for improving discoverability and relevance.

## Evidence and method

This report combines:

- Local repository inspection of all 12 HTML pages, the `CNAME`, local assets, JSON-LD, canonical tags, `hreflang`, titles, descriptions, headings, and route structure.
- Live HTTP checks against the production domain on 2026-09-09.
- Search visibility checks for the public domain.
- Current official search guidance from Google Search Central and Bing Webmaster Tools.

The live checks were performed against the deployed site, not only the local files. This distinction is important because the deployed URL architecture currently differs from the canonical URL architecture declared in the HTML.

## 1. Current architecture

### Deployment and domain

| Area | Current state | SEO implication |
| --- | --- | --- |
| Primary domain | `rafirobotique.com` | Clear branded domain and HTTPS production origin |
| Repository deployment marker | `CNAME` contains `rafirobotique.com` | Strong evidence of GitHub Pages-style static hosting |
| Live server | Response headers identify GitHub/Fastly caching | Static delivery is suitable for stable HTML, images, CSS, and media |
| Local development server | `server.mjs`, port `4321` | Useful for QA, but it is not the production SEO server |
| Application type | Static HTML/CSS/inline JavaScript | Core text is directly present in HTML and crawlable |
| Page count | 12 HTML documents in the checkout | Small enough for a manually controlled sitemap, but generation is preferable |
| Languages | French and English page sets | Good international targeting potential, currently undermined by URL inconsistencies |
| External services | Google Fonts and a Tally form iframe | Adds third-party dependencies and should be monitored for performance and accessibility |
| Media | Local WebP/JPG/PNG imagery and a local hero MP4 | Strong visual proof, but media metadata and discovery should be formalized |

### Current route inventory

The following live route results were verified:

| Live URL | HTTP status | Intended role |
| --- | ---: | --- |
| `/` | 200 | French homepage |
| `/en/` | 200 | English homepage |
| `/services/` | 200 | French services |
| `/realisations/` | 200 | French projects/case studies |
| `/contact/` | 200 | French contact |
| `/a-propos/` | 200 | French about |
| `/en/services/` | 200 | English services |
| `/en/projects/` | 200 | English projects/case studies |
| `/en/contact/` | 200 | English contact |
| `/en/about/` | 200 | English about |
| `/fr/services/` | 404 | Declared by current French canonical/hreflang tags, but not deployed |
| `/fr/realisations/` | 404 | Declared by current French canonical/hreflang tags, but not deployed |
| `/fr/contact/` | 404 | Declared by current French canonical/hreflang tags, but not deployed |
| `/fr/a-propos/` | 404 | Declared by current French canonical/hreflang tags, but not deployed |
| `/robots.txt` | 404 | Missing crawler policy and sitemap discovery entry point |
| `/sitemap.xml` | 404 | Missing preferred URL inventory |

### Architecture observations

The current site appears to be a static export assembled from generated or component-derived page markup. The pages contain repeated headers, footers, navigation scripts, structured data, and style blocks. This is functional for a small site but creates SEO maintenance risk:

- Metadata changes need to remain synchronized across duplicated pages.
- Language links and canonical URLs can drift, as has already happened.
- Organization data is repeated across documents and contains inconsistent asset URLs.
- There are duplicate English route aliases such as `/en/a-propos/` and `/en/about/`, plus `/en/projects/` and `/en/realisations/`.
- The site has no visible source-of-truth configuration for business identity, service names, locations, language pairs, or canonical routes.

The highest-value structural improvement is not adding more tags. It is introducing one canonical content and URL model that generates or validates every page consistently.

### Public search footprint observation

A public-domain search surfaced an older-looking result at `/nos-competence/` with historical wording and a separate legacy WordPress-hosted project result. This suggests that the brand may have residual or mixed historical search signals in addition to the current GitHub Pages deployment. This is not proof that those URLs are currently indexed or harmful, but it is a reason to inspect Google Search Console's indexed URLs and decide whether legacy URLs should return a useful 200, a relevant 301, or a deliberate 410/404.

## 2. Current SEO signals

### Strengths already present

The local pages currently provide a useful baseline:

- Every inspected HTML page has a language attribute.
- Every inspected page has one `h1`.
- Pages generally have unique titles and meta descriptions.
- Pages contain self-declared canonical tags.
- French and English pages include `hreflang` annotations.
- JSON-LD is present on the home, services, projects, about, and contact pages.
- The organization is described with `Organization`, `LocalBusiness`, and `ProfessionalService` types.
- The business name, Casablanca location, phone number, email address, areas served, and service expertise are represented in the content or structured data.
- Project pages contain real case-study subjects such as welding robotics, CNC retrofit, PLC programming, mechanical repair, and industrial automation.
- Images generally have meaningful `alt` text in the local checker output.
- The main content is present in HTML and does not depend entirely on JavaScript for discovery.

### High-priority defects

#### P0 — Canonical and `hreflang` URLs point to live 404 pages

The deployed French pages are available at root paths, but the current French HTML declares URLs such as:

```text
https://rafirobotique.com/fr/services/
https://rafirobotique.com/fr/realisations/
https://rafirobotique.com/fr/contact/
https://rafirobotique.com/fr/a-propos/
```

The live server returned 404 for all of these URLs. This affects:

- `rel="canonical"`
- French `hreflang`
- `fr-MA` `hreflang`
- `x-default` in several pages
- Breadcrumb URLs in JSON-LD
- Organization and page relationships embedded in structured data

This is the most urgent issue in the report. The site must choose one URL architecture and make every canonical, alternate, sitemap, internal link, breadcrumb, and structured-data URL agree with it.

#### P0 — `robots.txt` and `sitemap.xml` are absent in production

Both files returned 404. This does not automatically block crawling, but it removes two important control and discovery mechanisms. The missing sitemap is especially avoidable because the site has a small, known URL inventory.

Recommended minimum `robots.txt` after the URL contract is fixed:

```text
User-agent: *
Allow: /

Sitemap: https://rafirobotique.com/sitemap.xml
```

The sitemap must contain only the preferred, live, indexable canonical URLs—not dead `/fr/...` URLs or duplicate aliases.

#### P1 — Structured-data asset URLs are inconsistent or missing

The local JSON-LD repeatedly references:

```text
https://rafirobotique.com/assets/images/logo.png
https://rafirobotique.com/og-default.jpg
```

The repository inspection found no local `assets/images/logo.png` and no local `og-default.jpg`. The actual logo assets include paths such as:

```text
/assets/images/logo/rafi-mark-static.png
/assets/images/logo/rafi-pignon.png
```

The same issue affects `og:image` and Twitter image metadata on several pages. Social crawlers and structured-data consumers may receive broken image URLs, weakening previews and entity confidence.

#### P1 — Duplicate and contradictory English aliases

The checkout includes both:

- `/en/about/` and `/en/a-propos/`
- `/en/projects/` and `/en/realisations/`

Some of these aliases canonicalize to one preferred page, but all aliases must be checked for status, redirect behavior, internal linking, metadata, and `hreflang` reciprocity. A cleaner architecture would select one English route per concept and permanently redirect or remove the duplicate alias.

#### P1 — Root French homepage has weaker international annotations than inner pages

The live root homepage returned no `hreflang` tags in the live inspection, while `/en/` returned four. This should be normalized so the French and English homepages point to each other consistently.

#### P2 — Business identity is not yet modeled as one durable entity graph

The organization data is a good start, but the implementation should be consolidated and expanded carefully with verified fields:

- one stable `@id` for the organization;
- `url`, correct `logo`, correct image, email, phone, and address;
- `sameAs` links to verified official profiles only;
- service and project relationships;
- `areaServed` limited to truthful operating areas;
- `openingHoursSpecification` only when the published hours are confirmed;
- `contactPoint` only when the contact purpose is accurate;
- consistent name spelling: `Rafi Robotiques et Machineries` versus other variants.

Structured data must describe visible, truthful content. It is not a place to add claims that are not present on the page.

## 3. Current business and search opportunity

### Activity represented by the site

The site presents RAFI as a Casablanca-based industrial engineering and machinery company with a Morocco and international service orientation. The strongest factual themes currently represented are:

1. Custom machine design and fabrication.
2. Industrial robotics, including 5-axis welding systems.
3. CNC retrofit, renovation, and digitization.
4. Siemens PLC, HMI, industrial controls, and automation programming.
5. Mechanical repair, diagnosis, calibration, and rehabilitation.
6. Precision machining, sheet metal work, waterjet work, and heavy fabrication.
7. Industrial project documentation and case studies.
8. A Moroccan-developed control unit and an invention related to assembly and welding.

### Highest-value search themes

The opportunity is not to target one broad phrase such as “robotics company.” The site can build qualified visibility around specific commercial problems and locations:

#### French / Morocco-local intent

- bureau d’études automatisme industriel Casablanca;
- conception machine spéciale Maroc;
- retrofitage CNC Maroc;
- réparation machine CNC Casablanca;
- programmation automate Siemens Maroc;
- robot soudage industriel Maroc;
- maintenance machine-outil Casablanca;
- modernisation machine industrielle Maroc;
- reprogrammation PLC sur site Maroc;
- usinage mécanique industriel Casablanca.

#### English / international intent

- industrial machinery design Morocco;
- CNC retrofit Morocco;
- Siemens PLC programming Morocco;
- 5-axis welding robot engineering;
- industrial machine repair Casablanca;
- custom automation machinery Morocco;
- industrial control retrofit North Africa.

These are opportunity themes, not guaranteed rankings. They should be validated against Search Console queries, Google Business Profile insights, qualified lead language, and competitor SERPs before becoming a final keyword map.

### Content opportunities

The current site has project proof but mostly presents it inside consolidated pages. Search and generative systems benefit when each important service and project has a clear, indexable, self-contained document with:

- a precise problem statement;
- machine type and industrial context;
- location and service area;
- constraints and method;
- technologies used;
- measurable or verifiable outcome;
- images with descriptive filenames and alt text;
- related service links;
- a clear contact action;
- authorship or responsible engineering team where truthful;
- date or project status where truthful.

The content should not invent client results, percentages, certifications, guarantees, or performance claims. Existing project evidence is more valuable than generic AI-generated articles.

## 4. GEO / generative search readiness

GEO should be treated as making the business easy to identify, retrieve, verify, summarize, and cite—not as inserting hidden “AI keywords.”

Google’s current guidance says ordinary SEO fundamentals remain relevant to generative search, and that AI features rely on indexed, crawlable pages. Google also explicitly says that special files such as `llms.txt` are not required for Google Search or its generative features.

### What the site should do for GEO

#### Make answers extractable

Each priority page should answer, near the beginning:

- Who is RAFI?
- Where does RAFI operate?
- What specific industrial problem does this page solve?
- Which machines, controls, and technologies are involved?
- What evidence proves the capability?
- How does a prospect start a technical conversation?

Use short factual answer paragraphs, descriptive headings, and compact specification lists alongside the more editorial visual treatment.

#### Establish entity consistency

Use the same verified business name, location, phone, email, logo, and domain across:

- the website;
- Google Business Profile;
- Bing Places / Bing Webmaster Tools;
- LinkedIn company profile;
- official social profiles;
- supplier or industry directories;
- case-study references where permitted.

#### Publish first-party evidence

The strongest GEO asset is original, attributable knowledge:

- technical case studies;
- before/after repair documentation;
- diagrams or patent material;
- project constraints and engineering decisions;
- maintenance and retrofit explanations;
- local industrial context from actual field experience.

Avoid producing large volumes of generic “what is robotics” pages. Google’s current AI guidance favors useful, reliable, non-commodity content and warns against assuming there is a special AI markup shortcut.

#### Improve citation-worthiness

Pages should contain quotable factual statements that are clear without surrounding design context, for example:

> RAFI designs, fabricates, programs, repairs, and retrofits industrial machinery from Casablanca, Morocco.

The final wording must be verified by the business. The point is not the exact sentence; it is that the site should state its identity and capabilities plainly enough for retrieval and citation.

## 5. Recommended high-level SEO/GEO architecture

### Phase 0 — Truth and URL contract

Create one source-of-truth document or configuration containing:

- canonical domain;
- French route map;
- English route map;
- language pair relationships;
- organization name and legal/public spelling;
- address, phone, email, opening hours;
- service taxonomy;
- approved areas served;
- approved social/profile URLs;
- image and logo URLs.

Add an automated validation gate that fails deployment when:

- a canonical URL returns anything other than 200;
- an `hreflang` URL is not reciprocal;
- a sitemap URL is not live;
- a structured-data image is missing;
- an internal link points to a dead route;
- a page has duplicate or missing title, description, or `h1`.

### Phase 1 — Indexability release

Ship these together:

1. Correct French canonical URLs to match the actual deployed root paths, or intentionally deploy the `/fr/` architecture and redirect the current root French paths.
2. Normalize English duplicate aliases.
3. Add a valid root `robots.txt`.
4. Add a canonical-only `sitemap.xml`.
5. Normalize French/English `hreflang` pairs and ensure reciprocity.
6. Add a real 404 page and ensure missing routes return HTTP 404.
7. Register and verify the domain in Google Search Console and Bing Webmaster Tools.
8. Submit the sitemap and inspect every canonical page.

### Phase 2 — Entity and structured-data hardening

Consolidate JSON-LD generation and validate it against the visible page. Recommended graph components:

- `Organization` / appropriate `LocalBusiness` subtype;
- `WebSite`;
- `WebPage`;
- `BreadcrumbList`;
- `Service` for individual service pages;
- `CreativeWork` or `Article` only when the page is genuinely a project document or editorial article;
- `ImageObject` only where it adds accurate image metadata;
- `sameAs` for verified official profiles.

Do not add review, rating, FAQ, product, or certification markup unless the page visibly and truthfully supports it and the feature guidelines permit it.

### Phase 3 — Service and case-study information architecture

Keep the visual portfolio experience, but give important subjects stable URL-level documents. A recommended structure is:

```text
/
/services/
/services/conception-machine-speciale/
/services/retrofitage-cnc/
/services/programmation-plc-siemens/
/services/reparation-machine-industrielle/
/realisations/
/realisations/armasteel-robot-soudage-5-axes/
/realisations/matissar-reprogrammation-plc/
/realisations/univers-acier-retrofit-cnc/
/contact/
/a-propos/
/en/...
```

Only create a page when there is enough real, non-duplicated evidence to justify it. Thin duplicate pages can dilute the site.

### Phase 4 — Local authority and reputation

For local visibility:

- fully complete and verify Google Business Profile;
- keep name, address, phone, category, hours, website, and service areas consistent;
- add real project images and regular updates;
- request genuine client reviews without incentives or fabricated wording;
- build relevant Moroccan industrial citations and supplier/partner references;
- link official social profiles with `sameAs` only after verification.

For international authority:

- earn mentions from real partners, industrial associations, suppliers, clients, and trade publications;
- publish project evidence that those organizations can link to;
- avoid purchased or irrelevant backlink packages.

### Phase 5 — Measurement and iteration

Track monthly:

- indexed pages versus submitted pages;
- canonical and duplicate URL reports;
- impressions, clicks, CTR, and average position by language and service;
- branded versus non-branded queries;
- Morocco/Casablanca query performance;
- qualified contact conversions from organic traffic;
- Core Web Vitals and mobile performance;
- Bing Webmaster and IndexNow submission status;
- AI/generative visibility where reporting is available, without treating third-party GEO scores as authoritative.

The business KPI should be qualified technical conversations and project opportunities, not raw traffic alone.

## 6. Recommended priority backlog

### 6.1 Completed in the current local implementation

The following changes were applied without adding or changing visible page content:

- canonical and `hreflang` URLs were aligned to the live French root routes and `/en/` English routes;
- `robots.txt` and `sitemap.xml` were added;
- broken social/logo metadata references were corrected;
- crawl directives, alternate Open Graph locale, social-image alt metadata, and machine-readable `WebSite`/`WebPage` relationships were added in the document head only;
- legacy English aliases `/en/a-propos/` and `/en/realisations/` retain their visible pages but now carry `noindex,follow`, while their canonical equivalents remain indexable;
- existing French and English services pages now expose an accurate `Service` JSON-LD entity in the document head, derived from their existing title and description;
- `scripts/check-seo.mjs` and `scripts/check-site.mjs` pass against the local export.

The business owner has confirmed GitHub Pages as the hosting platform, the custom
domain `https://rafirobotique.com/`, the public name `Rafi Robotiques et Machineries`,
and `assets/images/logo/rafi-mark-static.png` as the approved current brand/social
image. Search Console and Bing verification remain external operational steps.

| Priority | Action | Expected value | Acceptance criterion |
| --- | --- | --- | --- |
| P0 | Fix French canonical/hreflang/JSON-LD URL contract | Removes contradictory index signals | Every declared canonical and language URL returns 200 and matches the intended page |
| P0 | Publish `robots.txt` and `sitemap.xml` | Improves discovery and crawl control | Both return 200; sitemap contains only live canonical URLs |
| P1 | Replace missing logo and social-image URLs | Improves entity and sharing signals | Every referenced image returns 200 with correct content type |
| P1 | Consolidate duplicate English routes | Reduces duplication and crawl ambiguity | One preferred route per page; aliases redirect or are removed |
| P1 | Verify Google Search Console and Bing Webmaster Tools | Creates actual indexing evidence | All canonical pages inspected; sitemap processed without blocking errors |
| P1 | Consolidate metadata/JSON-LD generation | Prevents future drift | One source of truth plus automated validation in deployment |
| P2 | Create dedicated service pages | Captures high-intent commercial searches | Each page has unique copy, evidence, canonical, schema, and CTA |
| P2 | Create evidence-led project pages | Builds topical authority and citation material | Each project page contains verified problem, method, result, media, and links |
| P2 | Strengthen Google Business Profile and genuine reviews | Improves local discovery and trust | Profile is complete, verified, consistent, and actively maintained |
| P2 | Add relevant industrial authority references | Improves off-site trust | Real organizations link or mention the business |
| P3 | Add IndexNow for Bing-participating engines | Accelerates update notification | Updated URLs are submitted automatically after release |

## 7. Definition of success

The first success gate is not “rank #1.” It is:

1. Every preferred page is live, crawlable, canonical, and represented in the sitemap.
2. Google and Bing accept the URL inventory without critical errors.
3. French and English language signals are reciprocal and accurate.
4. Entity and service data is consistent across the website and business profiles.
5. Search Console begins showing impressions for branded and non-branded service queries.
6. Qualified organic inquiries increase over a measured baseline.
7. Project and service pages become useful sources that search systems and AI systems can retrieve, summarize, and cite.

## Official references

- [Google: Optimizing your website for generative AI features in Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: Canonicalization and duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: Local Business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: General structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Bing Webmaster Tools: IndexNow](https://www.bing.com/webmasters/help/indexnow-0z209wby)

## Bottom line

RAFI does not need a speculative “AI SEO hack.” It needs a reliable canonical URL system, live crawler files, corrected entity assets, consolidated bilingual architecture, and a sustained evidence-led content and authority program.

Those changes can materially improve crawlability, indexation quality, local relevance, qualified search visibility, and the chance of being cited by generative systems. They cannot honestly guarantee rankings or search inclusion, because those decisions remain controlled by search engines and depend on competition, relevance, quality, authority, location, query intent, and ongoing site health.
