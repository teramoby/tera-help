# SEO monitoring log

This file records evidence, changes, validation, deployment results, limitations, and the next testable hypothesis for recurring SEO work on `https://app.teramoby.com/`. Public search samples are directional only; they are not a substitute for Search Console impression, click, query, or index-coverage data.

## 2026-09-22

### Baseline

- Repository: clean `main` synchronized from `origin/main` at `de76120` before this run.
- Availability: HTTPS homepage, `robots.txt`, and `sitemap.xml` returned 200; HTTP redirected to HTTPS with 301; a fabricated path returned a real 404.
- Sitemap and metadata: 28 sitemap URLs returned 200 with matching self-canonical URLs, reciprocal `en` / `zh-CN` / `x-default` alternates, and parseable JSON-LD.
- Links: 48 unique internal targets returned 2xx/3xx. External automated checks found no confirmed broken destination; xAI and OpenAI Help returned bot-denial responses, which are not evidence of broken user-facing links.
- Homepage Lighthouse mobile sample: Performance 94, Accessibility 100, Best Practices 100, SEO 100; FCP 2.1 s, LCP 2.4 s, TBT 0 ms, CLS 0.001, transfer 124 KiB. The previous 2026-08-18 production baseline was 95/100/100/100 and 123 KiB, so the difference is normal measurement variance rather than a material regression.
- Public search sample at 2026-09-22 10:29–10:37 China Standard Time: no direct `app.teramoby.com` result was observed for `tt by teramoby`, `万能模型客户端`, `多模型 AI 客户端`, `ChatGPT Claude Gemini DeepSeek 客户端`, or sampled `site:app.teramoby.com` queries. The App Store listing and GitHub references were observable as indirect brand signals. These samples do not prove that Google has not indexed the site.

### Evidence-backed changes

1. Updated the English and Chinese model pages so their title, H1, description, social metadata, and CollectionPage description naturally identify tt as a multi-model AI client for ChatGPT, Claude, Gemini, and DeepSeek. This improves alignment with the observed product-discovery queries without creating a duplicate page.
2. Added a first-screen platform chooser to the bilingual download hub and moved the direct Android and Mac actions ahead of long introductory copy. APK safety guidance remains before the Android download button.
3. Fixed horizontal overflow on the bilingual privacy pages by allowing long monospaced technical endpoints to wrap. Before the fix, a 390 px viewport expanded to 485 px.

No Android, iOS, or Mac application source was changed. APK, DMG, and TeraJournal files and content were not modified.

### Regression results before deployment

- `node scripts/validate-seo.mjs`: 28 localized pages passed.
- `html-validate`: 28 localized pages passed.
- Inline JavaScript parse check: 26 scripts passed.
- Browser responsive check: 28 pages at 320 px and 390 px, 56 combinations total, with zero horizontal-overflow failures.
- Download conversion check at 320 px: all three platform choices are visible in the download-hub first screen; Android and Mac primary downloads are visible in their platform-page first screens.
- Local download-page Lighthouse: 100/100/100/100, LCP 1.1 s, TBT 0 ms, CLS 0.001.
- Release artifact hashes remained unchanged:
  - Android APK SHA-256: `391736033ead0db76c732f9cf87a8a1d595de3ce8fc75be53736d6ae4d7f3b1e`
  - Mac DMG SHA-256: `b99939af57918c37ade7118236a346a261e68e812ed6024da5b43201e1363558`

### Deployment

- Status: pending commit, merge, GitHub Pages deployment, and live verification.

### Known limitations and next hypothesis

- Public search samples are region- and engine-dependent. Search Console ownership remains the highest-priority missing measurement because it can confirm indexing, Google-selected canonical URLs, impressions, clicks, and actual queries.
- Do not add more broad landing pages until indexing is confirmed. The next content hypothesis is to improve an existing guide or publish one evidence-based selection guide only if query data shows demand for comparing BYOK, platform coverage, independent model comparison, and shared Team Mode discussion.
- The next conversion hypothesis is that launch and FAQ pages could route high-intent readers to the localized download hub; verify current page behavior and indexing before changing them.
