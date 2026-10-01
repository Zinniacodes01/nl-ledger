// Run a local preview first: ./dev.sh 8790
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node site/check-reflow.mjs [base URL] [evidence directory]
// Playwright is a verification tool, not a site dependency. Phone schedules stack; larger screens retain native scrollports.
import { mkdirSync, writeFileSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://localhost:8790';
const out = process.argv[3];
if (out) mkdirSync(out, { recursive: true });
const routes = [
  '/', '/priorities/', '/department/digital-government-and-service-newfoundland-and-labrador/',
  '/department/estimates-2026-27/', '/budget/', '/budget/2020-21/',
  '/search/?q=snow+clearing', '/search/?q=snow+cleering', '/search/?q=Zorblatt+Industries',
  '/bodies/', '/flags/', '/flags/no-competition/', '/members/', '/mha/wakeham-tony/',
  '/ministers/steve-crocker/', '/pay/', '/pay/nl-health-services/', '/supplier/8fd018745b/',
  '/item/8038fab331ae/', '/receipt/?income=30000', '/receipt/?income=10000000', '/receipt/?income=0',
  '/federal/', '/scale/', '/data/', '/about/', '/sources/', '/method/', '/method/receipt/', '/method/federal/',
  '/method/suppliers/', '/method/budget/', '/method/no-competition/', '/corrections/', '/help/', '/asked/', '/reflow-missing-page/'
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
await page.goto(base + '/bodies/');
const body = await page.locator('main a[href^="/body/"]').first().getAttribute('href');
if (!body) throw new Error('No public body route found');
routes.push(body);
const results = [];
for (const [width, enlargement] of [[320, 'normal'], [390, 'root200'], [390, 'text200']]) {
  await page.setViewportSize({ width, height: 844 });
  for (const theme of ['light', 'dark']) {
    for (const route of routes) {
      const response = await page.goto(base + route);
      const expectedStatus = route === '/reflow-missing-page/' ? 404 : 200;
      if (response.status() !== expectedStatus) throw new Error(`${route}: HTTP ${response.status()}`);
      await page.evaluate(async ({ theme, enlargement }) => {
        document.documentElement.dataset.theme = theme;
        await document.fonts.ready;
        if (enlargement === 'root200') document.documentElement.style.fontSize = '200%';
        if (enlargement === 'text200') {
          const styles = [...document.querySelectorAll('body, body *')].map(el => {
            const s = getComputedStyle(el);
            return [el, parseFloat(s.fontSize), parseFloat(s.lineHeight)];
          });
          for (const [el, size, height] of styles) {
            el.style.fontSize = `${size * 2}px`;
            if (Number.isFinite(height)) el.style.lineHeight = `${height * 2}px`;
          }
        }
        for (const el of document.querySelectorAll('main details')) el.open = true;
      }, { theme, enlargement });
      // Include the open phone menu; leave the feedback form unsent.
      await page.locator('.phone-menu').evaluateAll(es => es.forEach(el => el.open = true));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const geometry = await page.evaluate(() => {
        const width = document.documentElement.clientWidth;
        const offenders = [];
        const frames = [];
        const visible = el => {
          const r = el.getBoundingClientRect();
          return r.width && r.height && getComputedStyle(el).visibility !== 'hidden';
        };
        const label = el => `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).trim().replace(/\s+/g, '.') : ''}: ${(el.textContent || '').trim().slice(0, 75)}`;
        for (const el of document.querySelectorAll('body *')) {
          if (!visible(el) || el.closest('.vh, .fb-hp')) continue;
          // Offscreen table cells/code belong to explicit, reachable inner scrollports, never the page.
          const scrollport = el.closest('.sched-wrap, .copy pre');
          if (scrollport && scrollport !== el) continue;
          const r = el.getBoundingClientRect();
          if (r.right > width + 1 || r.left < -1) offenders.push({ element: label(el), left: r.left, right: r.right });
          if (el.matches('.receipt .amt, .rc-total > *, .codeat .btn')) {
            const frame = el.closest('.receipt, .codeat').getBoundingClientRect();
            if (r.right > frame.right + 1 || r.left < frame.left - 1) frames.push({ element: label(el), right: r.right, frameRight: frame.right });
          }
          // An element can fit while its actual words extend outside it.
          for (const node of el.childNodes) if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            const range = document.createRange(); range.selectNodeContents(node);
            for (const rect of range.getClientRects()) if (rect.right > width + 1 || rect.left < -1) offenders.push({ text: node.textContent.trim().slice(0, 75), left: rect.left, right: rect.right });
          }
        }
        return { viewport: width, document: document.documentElement.scrollWidth, offenders, frames };
      });
      const result = { route, width, theme, enlargement, ...geometry };
      results.push(result);
      if (geometry.document > width || geometry.offenders.length || geometry.frames.length) console.log('FAIL', JSON.stringify(result));
      if (out && ((width === 390 && enlargement === 'root200' && ['/', '/priorities/', '/department/digital-government-and-service-newfoundland-and-labrador/', '/supplier/8fd018745b/', '/flags/no-competition/', '/corrections/', '/ministers/steve-crocker/', '/item/8038fab331ae/', '/method/', '/receipt/?income=30000', '/receipt/?income=10000000'].includes(route)) || (width === 320 && theme === 'light' && route === '/sources/'))) {
        await page.locator('.phone-menu').evaluateAll(es => es.forEach(el => el.open = false));
        await page.screenshot({ path: `${out}/after-${route.replace(/[^a-z0-9]/gi, '_')}-${theme}.png`, fullPage: true });
      }
    }
  }
}
await browser.close();
const failures = results.filter(r => r.document > r.width || r.offenders.length || r.frames.length);
const summary = `${routes.length} routes × 3 text/width states × 2 themes = ${results.length} cases\nPages wider than viewport: ${results.filter(r => r.document > r.width).length}\nCases with elements/text past viewport: ${results.filter(r => r.offenders.length).length}\nCases with receipt/button frame overflow: ${results.filter(r => r.frames.length).length}\n${failures.length ? 'FAIL' : 'PASS'}: ${failures.length} failing cases`;
console.log(summary);
if (out) { writeFileSync(`${out}/reflow-results.json`, JSON.stringify(results, null, 2)); writeFileSync(`${out}/reflow-output.txt`, summary + '\n'); }
process.exitCode = failures.length ? 1 : 0;
