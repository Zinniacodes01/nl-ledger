// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node site/check-tables.mjs [before|after] [URL] [evidence directory]
import './check-tables-unit.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { mkdirSync, writeFileSync } from 'node:fs';
const phase = process.argv[2] || 'after';
const base = process.argv[3] || 'http://localhost:8791';
const out = process.argv[4];
if (!out) throw Error('Supply an evidence directory');
mkdirSync(out, { recursive: true });
const routes = [
  '/priorities/',
  '/department/digital-government-and-service-newfoundland-and-labrador/',
  '/department/estimates-2026-27/',
  '/budget/',
  '/budget/2020-21/',
  '/flags/no-competition/',
  '/flags/severance/',
  '/bodies/',
  '/pay/',
  '/pay/nl-health-services/',
  '/members/',
  '/mha/wakeham-tony/',
  '/ministers/steve-crocker/',
  '/supplier/8fd018745b/',
  '/federal/',
  '/sources/',
  '/data/',
  '/method/receipt/',
  '/method/federal/',
  '/method/suppliers/',
  '/consulting/',
  '/scale/',
  '/search/?q=snow+clearing'
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.goto(base + '/bodies/');
routes.push(await page.locator('main a[href^="/body/"]').first().getAttribute('href'));
// Sources includes the report card; open disclosures to capture every table.
const results = [];
for (const route of routes) for (const width of [320, 390, 430, 1280]) for (const theme of ['light', 'dark']) {
  await page.setViewportSize({ width, height: 900 });
  const response = await page.goto(base + route);
  if (response.status() !== 200) throw Error(`${route}: HTTP ${response.status()}`);
  await page.evaluate(async theme => {
    document.documentElement.dataset.theme = theme;
    await document.fonts.ready;
    document.querySelectorAll('main details').forEach(e => e.open = true);
  }, theme);
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const tables = await page.locator('main table').count();
  const filename = `${phase}-${route.replace(/[^a-z0-9]/gi, '_')}-${width}-${theme}.png`;
  await page.screenshot({ path: out + '/' + filename, fullPage: true, animations: 'disabled' });
  const geometry = await page.evaluate(() => [...document.querySelectorAll('main table')].map(t => ({
    cols: t.rows[0]?.cells.length,
    stacked: getComputedStyle(t).display === 'block',
    overflow: t.parentElement.scrollWidth > t.parentElement.clientWidth + 1,
    hidden: [...t.querySelectorAll('tbody td')].filter(c => getComputedStyle(c).display === 'none').length,
    role: t.getAttribute('role')
  })));
  results.push({ route, width, theme, tables, filename, geometry });
}
await browser.close();
writeFileSync(out + '/' + phase + '-manifest.json', JSON.stringify(results, null, 2));
console.log(`${phase}: ${results.length} screenshots, ${routes.length} page types`);
if (phase === 'after' && results.some(r => r.width < 500 && r.geometry.some(t => t.overflow || t.hidden || !t.stacked || t.role !== 'table'))) {
  throw Error('Phone tables overflow, hide values or lose table semantics');
}
