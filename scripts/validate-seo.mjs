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
  { file: 'zh/index.html', lang: 'zh-CN', canonical: `${SITE}/zh/`, alternate: `${SITE}/` },
  { file: 'zh/faq.html', lang: 'zh-CN', canonical: `${SITE}/zh/faq.html`, alternate: `${SITE}/faq.html` },
  { file: 'zh/blog-getting-started.html', lang: 'zh-CN', canonical: `${SITE}/zh/blog-getting-started.html`, alternate: `${SITE}/blog-getting-started.html` },
  { file: 'zh/launch.html', lang: 'zh-CN', canonical: `${SITE}/zh/launch.html`, alternate: `${SITE}/launch.html` },
  { file: 'zh/privacy.html', lang: 'zh-CN', canonical: `${SITE}/zh/privacy.html`, alternate: `${SITE}/privacy.html` },
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
  const references = [...html.matchAll(/\b(href|src|poster|data-hls)="([^"]+)"/g)]
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

  if (page.file.endsWith('index.html')) {
    const jsonLd = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)?.[1];
    assert(Boolean(jsonLd), `${label}: missing SoftwareApplication JSON-LD`);
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        assert(data['@type'] === 'SoftwareApplication', `${label}: incorrect JSON-LD type`);
        assert(data.url === page.canonical, `${label}: JSON-LD URL must match canonical`);
        assert(data.name === 'tt by teramoby', `${label}: JSON-LD brand mismatch`);
      } catch (error) {
        errors.push(`${label}: invalid JSON-LD (${error.message})`);
      }
    }
  }
}

const robots = await fs.readFile(path.join(ROOT, 'robots.txt'), 'utf8');
assert(robots.includes('Sitemap: https://app.teramoby.com/sitemap.xml'), 'robots.txt: sitemap declaration missing');

const sitemap = await fs.readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const page of pages) {
  assert(sitemap.includes(`<loc>${page.canonical}</loc>`), `sitemap.xml: missing ${page.canonical}`);
}
assert(count(sitemap, /<url>/g) === pages.length, `sitemap.xml: expected ${pages.length} URLs`);

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`SEO validation passed for ${pages.length} localized pages.`);
