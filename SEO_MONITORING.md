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

- Pull request: [#8](https://github.com/teramoby/tera-help/pull/8), merged to `main` as `db907452e4f952a10c71310b9db5e25089a87c32`.
- GitHub Pages: [deployment run 35681176400](https://github.com/teramoby/tera-help/actions/runs/35681176400) completed successfully in 19 seconds, including the 28-page SEO validator.
- Live verification: all 28 sitemap URLs returned 200; the new bilingual model-page titles, bilingual platform chooser, privacy CSS cache version, long-string wrapping rule, and eight updated sitemap dates were present on production.
- Live mobile verification: at 320 px the three download-platform choices were visible without horizontal overflow; at 390 px the Chinese privacy page width matched the viewport exactly.
- Production download-page Lighthouse after deployment: Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP/LCP 1.8 s, TBT 0 ms, CLS 0.001, transfer 38 KiB.
- APK and DMG URLs continued to return 200 with their expected content types; their repository bytes and SHA-256 values were unchanged.

### Known limitations and next hypothesis

- Public search samples are region- and engine-dependent. Search Console ownership remains the highest-priority missing measurement because it can confirm indexing, Google-selected canonical URLs, impressions, clicks, and actual queries.
- Do not add more broad landing pages until indexing is confirmed. The next content hypothesis is to improve an existing guide or publish one evidence-based selection guide only if query data shows demand for comparing BYOK, platform coverage, independent model comparison, and shared Team Mode discussion.
- The next conversion hypothesis is that launch and FAQ pages could route high-intent readers to the localized download hub; verify current page behavior and indexing before changing them.

## 2026-09-29

### Baseline

- Repository: clean `main` synchronized from `origin/main` at `f7ce5fd` before this run.
- Availability: HTTPS homepage, `robots.txt`, and `sitemap.xml` returned 200; HTTP redirected to HTTPS with 301; a fabricated path returned a real 404.
- Sitemap and metadata: all 28 sitemap URLs returned 200 with exact self-canonical URLs and matching `en` / `zh-CN` / `x-default` alternates; every JSON-LD block present was parseable.
- Links: 48 normalized same-origin references returned 200. Twelve external anchor targets had no confirmed failure. xAI and two OpenAI Help URLs returned bot-denial responses; DeepSeek rejected `HEAD` but returned 200 to `GET`; the old Anthropic support link redirected twice before reaching a working page.
- Responsive behavior: all 28 sitemap pages at 320 px and 390 px, 56 combinations total, had no horizontal overflow.
- Production Lighthouse mobile samples: homepage Performance 99, Accessibility 100, Best Practices 100, SEO 100, FCP 1.2 s, LCP 2.1 s, TBT 0 ms, CLS 0.001, transfer 124 KiB; download hub 100/100/100/100, FCP 1.1 s, LCP 1.2 s, TBT 0 ms, CLS 0, transfer 38 KiB. A separate homepage sample scored Performance 100. These timing differences are normal single-run variance; transfer size is unchanged from 2026-09-22.
- Public search sample at 2026-09-29 10:05–10:13 China Standard Time: the exact brand query `tt by teramoby` now returned direct `app.teramoby.com` results for the getting-started guide, privacy page, and homepage; the sampled index described them as crawled six days earlier. Scoped `site:` samples also exposed the download and BYOK pages, while bare `site:app.teramoby.com` results varied by provider. No direct tt result appeared in the sampled results for `万能模型客户端`, `多模型 AI 客户端`, or `ChatGPT Claude Gemini DeepSeek 客户端`. These observations show brand discovery progress, not rankings, traffic, or complete index coverage.

### Evidence-backed changes

1. Added prominent localized links from the getting-started and launch pages to the all-platform download hub. The indexed getting-started page previously told search visitors to use a direct download link that did not exist in the article body, and the launch page had the same dead-end wording.
2. Reworked the final bilingual FAQ action from email-only support into a clear choice between downloading tt and emailing support. This completes the high-intent conversion hypothesis recorded on 2026-09-22 without adding a new landing page.
3. Replaced the permanently redirected Anthropic subscription/API explanation link with its current final `support.claude.com` URL.

No Android, iOS, or Mac application source was changed. APK, DMG, privacy promises, tracking behavior, and TeraJournal files and content were not modified.

### Regression results before deployment

- `node scripts/validate-seo.mjs`: 28 localized pages passed, including new assertions that the six guide, launch, and FAQ variants contain an in-content link to their localized download hub.
- `html-validate`: all 28 localized pages passed.
- Inline JavaScript parse check: 28 scripts passed.
- Browser responsive check: 28 pages at 320 px and 390 px, 56 combinations total, with zero horizontal-overflow failures.
- Browser conversion check at 390 px: all six new English and Chinese download actions rendered as tappable controls with the expected localized target.
- Local Lighthouse: getting-started guide and FAQ both scored 100/100/100/100; LCP was 1.1 s and 1.2 s respectively, with TBT 0 ms and CLS 0.
- The new final Anthropic support URL returned 200 directly.
- Release artifact hashes remained unchanged:
  - Android APK SHA-256: `391736033ead0db76c732f9cf87a8a1d595de3ce8fc75be53736d6ae4d7f3b1e`
  - Mac DMG SHA-256: `b99939af57918c37ade7118236a346a261e68e812ed6024da5b43201e1363558`

### Deployment

- Deployment details will be recorded after the reviewed change reaches `main` and GitHub Pages completes.

### Known limitations and next hypothesis

- Search Console remains the highest-priority missing measurement. Public search samples cannot confirm Google-selected canonicals, full index coverage, impressions, clicks, or query position.
- Do not create more broad keyword landing pages from public samples alone. If Search Console confirms that the localized pages are indexed but generic impressions remain weak, the next hypothesis is to earn relevant third-party references to the existing model, comparison, and download pages rather than repeating their content on new pages.
- The App Store listing remains unavailable in the mainland China storefront. Existing bilingual download and installation pages already disclose that limitation and route Chinese visitors to platform-appropriate options, so no additional copy was added in this run.
