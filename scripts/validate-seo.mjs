import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://app.teramoby.com';
const pages = [
  { file: 'index.html', lang: 'en', canonical: `${SITE}/`, alternate: `${SITE}/zh/` },
  { file: 'faq.html', lang: 'en', canonical: `${SITE}/faq.html`, alternate: `${SITE}/zh/faq.html` },
  { file: 'blog-getting-started.html', lang: 'en', canonical: `${SITE}/blog-getting-started.html`, alternate: `${SITE}/zh/blog-getting-started.html` },
  { file: 'launch.html', lang: 'en', canonical: `${SITE}/launch.html`, alternate: `${SITE}/zh/launch.html` },
  { file: 'privacy.html', lang: 'en', canonical: `${SITE}/privacy.html`, alternate: `${SITE}/zh/privacy.html` },
  { file: 'byok-privacy.html', lang: 'en', canonical: `${SITE}/byok-privacy.html`, alternate: `${SITE}/zh/byok-privacy.html` },
  { file: 'models.html', lang: 'en', canonical: `${SITE}/models.html`, alternate: `${SITE}/zh/models.html` },
  { file: 'team-mode.html', lang: 'en', canonical: `${SITE}/team-mode.html`, alternate: `${SITE}/zh/team-mode.html` },
  { file: 'compare-ai-models.html', lang: 'en', canonical: `${SITE}/compare-ai-models.html`, alternate: `${SITE}/zh/compare-ai-models.html` },
  { file: 'download.html', lang: 'en', canonical: `${SITE}/download.html`, alternate: `${SITE}/zh/download.html` },
  { file: 'zh/index.html', lang: 'zh-CN', canonical: `${SITE}/zh/`, alternate: `${SITE}/` },
  { file: 'zh/faq.html', lang: 'zh-CN', canonical: `${SITE}/zh/faq.html`, alternate: `${SITE}/faq.html` },
  { file: 'zh/blog-getting-started.html', lang: 'zh-CN', canonical: `${SITE}/zh/blog-getting-started.html`, alternate: `${SITE}/blog-getting-started.html` },
  { file: 'zh/launch.html', lang: 'zh-CN', canonical: `${SITE}/zh/launch.html`, alternate: `${SITE}/launch.html` },
  { file: 'zh/privacy.html', lang: 'zh-CN', canonical: `${SITE}/zh/privacy.html`, alternate: `${SITE}/privacy.html` },
  { file: 'zh/byok-privacy.html', lang: 'zh-CN', canonical: `${SITE}/zh/byok-privacy.html`, alternate: `${SITE}/byok-privacy.html` },
  { file: 'zh/models.html', lang: 'zh-CN', canonical: `${SITE}/zh/models.html`, alternate: `${SITE}/models.html` },
  { file: 'zh/team-mode.html', lang: 'zh-CN', canonical: `${SITE}/zh/team-mode.html`, alternate: `${SITE}/team-mode.html` },
  { file: 'zh/compare-ai-models.html', lang: 'zh-CN', canonical: `${SITE}/zh/compare-ai-models.html`, alternate: `${SITE}/compare-ai-models.html` },
  { file: 'zh/download.html', lang: 'zh-CN', canonical: `${SITE}/zh/download.html`, alternate: `${SITE}/download.html` },
];

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function count(html, pattern) {
  return [...html.matchAll(pattern)].length;
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, '').replace(/&[a-zA-Z#0-9]+;/g, ' ').trim();
}

async function validateInternalReferences(html, page) {
  const references = [...html.matchAll(/\b(href|src|poster|data-hls|data-mp4)="([^"]+)"/g)]
    .map(match => ({ attribute: match[1], value: match[2] }));
  for (const { attribute, value } of references) {
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(value)) continue;
    const cleanValue = value.split('#')[0].split('?')[0];
    if (!cleanValue) continue;
    const base = cleanValue.startsWith('/')
      ? path.join(ROOT, cleanValue.slice(1))
      : path.resolve(ROOT, path.dirname(page.file), cleanValue);
    const target = cleanValue.endsWith('/') ? path.join(base, 'index.html') : base;
    try {
      await fs.access(target);
    } catch {
      errors.push(`${page.file}: missing internal ${attribute} target ${value}`);
    }
  }
}

for (const page of pages) {
  const html = await fs.readFile(path.join(ROOT, page.file), 'utf8');
  const label = page.file;
  const alternateLang = page.lang === 'en' ? 'zh-CN' : 'en';
  const xDefault = page.lang === 'en' ? page.canonical : page.alternate;

  assert(html.includes(`<html lang="${page.lang}">`), `${label}: incorrect html lang`);
  assert(count(html, /<title>[^<]+<\/title>/g) === 1, `${label}: requires exactly one non-empty title`);
  assert(count(html, /<meta name="description" content="[^"]+">/g) === 1, `${label}: requires exactly one meta description`);
  assert(html.includes(`<link rel="canonical" href="${page.canonical}">`), `${label}: incorrect canonical`);
  assert(
    new RegExp(`<link rel="alternate" hreflang="${alternateLang}" href="${escapeRegex(page.alternate)}">`).test(html),
    `${label}: missing reciprocal alternate`,
  );
  assert(html.includes(`<link rel="alternate" hreflang="x-default" href="${xDefault}">`), `${label}: incorrect x-default`);
  assert(count(html, /<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/g) === 1, `${label}: requires exactly one h1`);
  const h1 = html.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/)?.[1] ?? '';
  assert(stripTags(h1).length > 2, `${label}: h1 must contain static text`);
  assert(!html.includes('data-i18n='), `${label}: unresolved data-i18n attribute`);
  assert(!html.includes('const i18n ='), `${label}: client-side translation dictionary remains`);
  assert(!html.includes("localStorage.getItem('tera-lang')"), `${label}: browser-language switching remains`);
  await validateInternalReferences(html, page);

  const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)]
    .map(match => match[1]);
  const jsonLd = [];
  for (const block of jsonLdBlocks) {
    try {
      jsonLd.push(JSON.parse(block));
    } catch (error) {
      errors.push(`${label}: invalid JSON-LD (${error.message})`);
    }
  }

  if (page.file.endsWith('index.html')) {
    const app = jsonLd.find(data => data['@type'] === 'SoftwareApplication');
    assert(Boolean(app), `${label}: missing SoftwareApplication JSON-LD`);
    if (app) {
      assert(app.url === page.canonical, `${label}: JSON-LD URL must match canonical`);
      assert(app.name === 'tt by teramoby', `${label}: JSON-LD brand mismatch`);
    }
  }

  if (page.file === 'index.html' || page.file === 'zh/index.html') {
    assert(html.includes('preload="none"'), `${label}: hero video must not preload`);
    assert(html.includes('data-mp4="/media/tt-hero.mp4"'), `${label}: deferred hero MP4 source missing`);
    assert(!html.includes('src="/media/tt-hero.mp4"'), `${label}: hero MP4 must not load eagerly`);
    assert(!html.includes('data-hls='), `${label}: duplicate HLS source must not return`);
    assert(html.includes('class="hero-video-toggle"'), `${label}: opt-in video control missing`);
  }

  if (page.file === 'index.html') {
    assert(jsonLd.some(data => data['@type'] === 'WebSite'), `${label}: missing WebSite JSON-LD`);
    assert(jsonLd.some(data => data['@type'] === 'Organization'), `${label}: missing Organization JSON-LD`);
  }

  if (page.file.endsWith('models.html') || page.file.endsWith('team-mode.html') || page.file.endsWith('byok-privacy.html') || page.file.endsWith('blog-getting-started.html') || page.file.endsWith('compare-ai-models.html') || page.file.endsWith('download.html')) {
    const types = jsonLd.flatMap(data => data['@graph']?.map(item => item['@type']) ?? [data['@type']]);
    assert(types.includes('BreadcrumbList'), `${label}: missing BreadcrumbList JSON-LD`);
    if (page.file.endsWith('compare-ai-models.html')) {
      assert(types.includes('Article'), `${label}: missing Article JSON-LD`);
    }
    if (page.file.endsWith('download.html')) {
      assert(types.includes('WebPage'), `${label}: missing WebPage JSON-LD`);
    }
  }

  if (page.file.endsWith('faq.html')) {
    assert(html.includes('function toggle(trigger)'), `${label}: FAQ toggle implementation missing`);
    assert(html.includes("trigger.setAttribute('role', 'button')"), `${label}: FAQ controls must expose button semantics`);
    assert(html.includes("trigger.setAttribute('tabindex', '0')"), `${label}: FAQ controls must be keyboard focusable`);
    assert(html.includes("trigger.setAttribute('aria-expanded', 'false')"), `${label}: FAQ controls must expose expanded state`);
    assert(html.includes("answer.setAttribute('aria-hidden', 'true')"), `${label}: collapsed FAQ answers must be hidden from assistive technology`);
    assert(html.includes('answer.inert = true'), `${label}: collapsed FAQ answers must not expose focusable content`);
    assert(html.includes("event.key !== 'Enter' && event.key !== ' '"), `${label}: FAQ controls must support Enter and Space`);
  }
}

for (const file of ['journal/index.html', 'journal/privacy.html']) {
  const html = await fs.readFile(path.join(ROOT, file), 'utf8');
  assert(
    count(html, /<meta name="robots" content="noindex,follow">/g) === 1,
    `${file}: requires exactly one noindex,follow directive`,
  );
}

const robots = await fs.readFile(path.join(ROOT, 'robots.txt'), 'utf8');
assert(robots.includes('Sitemap: https://app.teramoby.com/sitemap.xml'), 'robots.txt: sitemap declaration missing');

const sitemap = await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1]);
for (const page of pages) {
  const entry = sitemapEntries.find(block => block.includes(`<loc>${page.canonical}</loc>`));
  assert(Boolean(entry), `sitemap.xml: missing ${page.canonical}`);
  if (!entry) continue;
  const english = page.lang === 'en' ? page.canonical : page.alternate;
  const chinese = page.lang === 'zh-CN' ? page.canonical : page.alternate;
  assert(
    entry.includes(`<xhtml:link rel="alternate" hreflang="en" href="${english}" />`),
    `sitemap.xml: incorrect English alternate for ${page.canonical}`,
  );
  assert(
    entry.includes(`<xhtml:link rel="alternate" hreflang="zh-CN" href="${chinese}" />`),
    `sitemap.xml: incorrect Chinese alternate for ${page.canonical}`,
  );
  assert(
    entry.includes(`<xhtml:link rel="alternate" hreflang="x-default" href="${english}" />`),
    `sitemap.xml: incorrect x-default for ${page.canonical}`,
  );
}
assert(count(sitemap, /<url>/g) === pages.length, `sitemap.xml: expected ${pages.length} URLs`);

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`SEO validation passed for ${pages.length} localized pages.`);
