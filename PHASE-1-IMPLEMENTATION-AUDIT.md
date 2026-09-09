# RAFI Phase 1 Directive — Implementation Audit

**Audit date:** 2026-09-09  
**Repository:** `RAFI Robotiques et Machineries`  
**Compared against:** the supplied `Phase 1 Implementation Directive`  
**Constraint applied:** no visible human-facing additions or changes

## Executive summary

The repository implements a substantial part of Phase 1, especially the P0 URL,
crawl, canonical, hreflang, and metadata corrections. It does **not** yet satisfy
the complete directive or its final acceptance checklist.

The implemented work is primarily invisible and safe under the stated constraint:

- canonical and hreflang URL normalization;
- `robots.txt` and a canonical sitemap;
- broken social/logo URL correction;
- `noindex,follow` on the two duplicate English aliases;
- `WebSite`, `WebPage`, and `Service` JSON-LD additions;
- repeatable local SEO/site validation;
- earlier performance/code-structure changes that preserve existing images and animation.

The largest remaining gaps are live/deployment validation, live indexing evidence,
performance measurement, redirect infrastructure, and the business-owned manual
steps. A custom 404 page, configuration-driven sitemap, entity source of truth,
FAQ cleanup, CI configuration, and IndexNow key infrastructure have since been
implemented. Task 8 was correctly **not** implemented because it
would change visible content and requires owner approval.

## Status legend

- **Complete:** implemented and locally verified.
- **Partial:** some of the task is implemented, but one or more directive requirements remain.
- **Not implemented:** no corresponding implementation was added.
- **Blocked/external:** requires deployment, account access, verified business data, or an explicit hosting decision.
- **Intentionally not done:** correctly deferred because it conflicts with the absolute visible-content rule or requires approval.

## Task-by-task comparison

### Task 0 — Pre-flight repository audit

**Status: Partial.**

The repository and production URL assumptions were inspected during the earlier SEO
audit. The current implementation also validated the 12 HTML pages, canonical URL
set, local references, and runtime routes. However, the directive specifically
required a committed-or-scratch `AUDIT_NOTES.md` containing the exact file paths and
current canonical/hreflang values. That file was not created.

The exact current page groups are:

| Group | Files |
| --- | --- |
| French canonical pages | `index.html`, `services/index.html`, `realisations/index.html`, `contact/index.html`, `a-propos/index.html` |
| English canonical pages | `en/index.html`, `en/services/index.html`, `en/projects/index.html`, `en/contact/index.html`, `en/about/index.html` |
| English aliases | `en/a-propos/index.html`, `en/realisations/index.html` |

The repository contains `CNAME`; no `package.json` or build system was used as the
source of truth for this static export. Local serving is handled by `server.mjs`.

### Task 1 — URL contract

**Status: Complete, with local verification.**

Implemented:

- French canonical routes use the deployed root paths rather than `/fr/...`.
- English canonical routes use `/en/...` paths.
- The French homepage now has the four hreflang annotations.
- All ten preferred pages have reciprocal French/English/x-default annotations.
- JSON-LD and Open Graph URL references were normalized away from stale `/fr/...` paths.
- A repository search found no remaining absolute production `/fr/` references in HTML.
- No internal HTML links to `/en/a-propos/` or `/en/realisations/` remain.

Local checks confirmed all ten canonical routes return HTTP 200 through the local
server. Production verification remains pending deployment.

### Task 2 — `robots.txt` and `sitemap.xml`

**Status: Complete locally; production verification pending.**

Complete:

- Root `robots.txt` exists with `Allow: /` and the production sitemap URL.
- Root `sitemap.xml` exists.
- Sitemap contains only the ten preferred canonical URLs.
- Duplicate aliases are excluded.
- Local HTTP checks return 200 for both files.

Remaining production/deployment work:

- The sitemap does not yet include the requested `xhtml` alternate link namespace and
  per-URL alternate declarations.
- The sitemap does not yet include `lastmod` values.
- The generator must be run as part of the actual deployment process.

### Task 3 — Custom 404 page

**Status: Complete locally; production verification pending.**

Root `404.html` now exists in the incumbent RAFI visual system. The local
`server.mjs` returns HTTP 404 with the custom page for unknown paths. A random
production-path test remains pending deployment.

### Task 4 — Structured-data and social image URLs

**Status: Partial, with one important deviation from the directive.**

Complete:

- Stale references to `assets/images/logo.png` and `og-default.jpg` were removed from
  HTML.
- They were replaced with the existing live asset path:
  `assets/images/logo/rafi-mark-static.png`.
- Local site validation confirms the stale paths are gone.

Deviation:

The directive explicitly says that if no real 1200×630 Open Graph image exists, this
should be flagged as an asset gap rather than silently using a small logo mark for
social previews. The implementation used the existing mark for `og:image` and
`twitter:image` to eliminate broken URLs, but did not verify that it is an appropriate
social-share asset or create a `[NEEDS ASSET]` business-owner placeholder.

The correct follow-up is an asset-dimension/content verification and, if necessary,
an owner-supplied real project image. No image was added during this audit because the
visible-media rule and the directive prohibit inventing or fabricating that asset.

### Task 5 — Duplicate English routes

**Status: Partial, GitHub Pages Option A metadata portion implemented.**

Implemented:

- `/en/about/` is the preferred canonical route.
- `/en/projects/` is the preferred canonical route.
- `/en/a-propos/` remains accessible but is canonicalized to `/en/about/` and marked
  `noindex,follow`.
- `/en/realisations/` remains accessible but is canonicalized to `/en/projects/` and
  marked `noindex,follow`.
- Both aliases are excluded from the sitemap.
- No internal links point to the aliases.

Not implemented:

- The directive's thin moved-page/meta-refresh option was not implemented.
- No server-side 301 redirect exists.
- No Cloudflare Pages migration was performed; that would require a separate hosting
  decision and explicit approval.

This is an intentional conservative choice: it preserves the existing alias pages
and visible behavior while sending a no-index signal.

### Task 6 — Entity graph hardening

**Status: Partial.**

Implemented:

- Existing Organization/LocalBusiness/ProfessionalService data was preserved.
- `WebSite` JSON-LD was added to the homepages.
- `WebPage` JSON-LD was added to the pages.
- `Service` JSON-LD was added to the French and English services pages.
- Existing visible page titles and meta descriptions were used for the Service nodes.
- No unverified ICE, RC, social profiles, testimonials, ratings, or fabricated legal
  identifiers were added.

Implemented:

- `site.config.json` now defines the route and organization foundation.
- JSON-LD was consolidated into one generated `@graph` per page.
- The configuration and JSON-LD injector provide a maintainable source-of-truth path.

Remaining:

- The confirmed public spelling is `Rafi Robotiques et Machineries`; visible variants
  remain in existing HTML until a separate visible-copy normalization is approved.
- Existing naming variants have not been normalized. The HTML contains variants such
  as `Rafi Robotique et Machineries`, `Rafi Robotiques et Machineries`, and `RAFI
  Machineries & Robotique`. Normalizing these would affect visible copy in many places,
  so it was not done under the absolute no-visible-change rule.
- No `sameAs` property is currently asserted because no official external profile
  has been confirmed for association with the canonical domain.

### Task 7 — International hardening

**Status: Partial.**

Implemented:

- `inLanguage` is present in the generated WebPage JSON-LD.
- French/English canonical and alternate relationships are present.
- No new locale variants were created.

Not implemented:

- The requested English-copy neutrality review has not been formally recorded page by
  page. Visible copy was intentionally not rewritten.

### Task 8 — GEO extractability layer

**Status: Intentionally not implemented.**

This task explicitly changes visible prose and requires business-owner approval. It
was correctly excluded under the absolute rule: no new visible human-facing copy was
added, no existing copy was rewritten, and no hidden text was used as a substitute.

### Task 9 — FAQPage guidance

**Status: Resolved locally.**

The unmatched `FAQPage` blocks were removed from `index.html` and `en/index.html`.
No visible FAQ content was changed or removed.

### Task 10 — Performance / Core Web Vitals

**Status: Partial.**

Earlier local performance/code-structure work implemented several invisible runtime
improvements while preserving images and animation:

- deferred hero image fallback loading;
- reduced unnecessary animation/event work with requestAnimationFrame throttling;
- visibility-aware carousel timing;
- `content-visibility: auto` for below-fold project content;
- lazy Tally iframe loading was already present;
- Google Fonts preconnects were already present;
- many images already use lazy loading and explicit dimensions.

Remaining directive gaps:

- The English hero video still uses `preload="auto"`.
- No verified `poster` attribute was added to the hero video.
- `decoding="async"` and explicit dimensions are not uniformly present on every
  image.
- No complete before/after live Lighthouse or PageSpeed record was created.
- No production Core Web Vitals measurement was performed.

Changing the hero video preload or adding a verified poster can remain invisible, but
should be handled as a separate performance task with asset and visual regression
verification.

### Task 11 — IndexNow

**Status: Key infrastructure complete; post-deploy submission pending.**

An IndexNow key file now exists at the repository root. It must be deployed and then
used for a post-deploy URL submission. No external ping has been sent locally.

### Task 12 — Manual owner steps

**Status: Blocked/external.**

Not executable from the repository alone:

- Google Search Console verification and sitemap submission;
- Google URL inspection/indexing requests;
- Bing Webmaster Tools verification and sitemap submission;
- Google Business Profile completion;
- approval of visible GEO wording;
- hosting decision between GitHub Pages and a redirect-capable host.

### Task 13 — CI validation gate

**Status: Implemented locally; production-run confirmation pending.**

Existing local validators are:

- `scripts/check-site.mjs`
- `scripts/check-seo.mjs`

`.github/workflows/seo-guard.yml` now runs sitemap generation and the extended
`check-seo.mjs` against the production domain. The workflow result cannot be
confirmed until it runs in the repository's GitHub environment after deployment.

## Acceptance checklist comparison

| Directive acceptance item | Status | Evidence / gap |
| --- | --- | --- |
| Canonical URLs resolve and match deployed pages | Partial | Local HTTP verified; production deployment not verified |
| Hreflang pairs are reciprocal on ten indexable pages | Complete locally | `check-seo.mjs` passes four annotations per page |
| `robots.txt` returns 200 and references sitemap | Complete locally | Local HTTP verified |
| Sitemap contains ten canonical URLs | Complete locally | Local validator passes |
| No JSON-LD `/fr/...` references | Complete locally | Stale-reference scan passes |
| No broken image/social references | Partial | Broken paths removed; image suitability/dimensions not verified |
| Duplicate aliases noindex/canonicalized/excluded | Complete locally | Metadata and sitemap checks pass |
| Random URL returns custom 404 content | Complete locally | Production verification remains pending |
| Business naming identical everywhere | Not complete | Existing variants remain; visible normalization intentionally deferred |
| No new FAQPage tactic | Complete | Unmatched FAQPage blocks removed |
| No hidden/cloaked/off-screen text in this work | Complete | No hidden keyword text added |
| Task 8 wording approved before merge | Intentionally deferred | No visible GEO copy was changed |
| Live validation script passes | Not complete | `scripts/validate-seo.mjs` absent |

## Files created or changed by the implementation

Created:

- `robots.txt`
- `sitemap.xml`
- `SEO-GEO-CURRENT-REPORT.md`
- `scripts/normalize-seo.mjs`
- `scripts/check-seo.mjs`
- `scripts/check-site.mjs` from the earlier site-health work
- `.gitignore` from the earlier local-tooling work

Modified by the SEO normalization:

- all twelve `index.html` pages, including the two aliases;
- the changes are head-level metadata/JSON-LD changes except for previously existing
  page/runtime work in the working tree.

## Bottom line

The current work should be described as:

> **Phase 1 technical SEO foundation implemented locally, with P0 URL/crawl signals
> complete and local validation passing; public deployment validation, live indexing
> evidence, performance measurement, redirect infrastructure, and owner-controlled
> tasks remain.**

It should not be described as the full Phase 1 directive completed. The site has not
been deployed or verified from the public domain in this implementation pass.
