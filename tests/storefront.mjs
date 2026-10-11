import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { runInNewContext } from 'node:vm';

// Run against a production build, with a server owned and stopped by this test.
const port = 4178;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', value => { serverLog += value; });
server.stderr.on('data', value => { serverLog += value; });
let browser;
let portableServer;
let passed = 0;
const errors = [];
const check = (condition, label) => { assert.ok(condition, label); passed++; console.log(`PASS ${passed}: ${label}`); };
const waitFor = async (fn, label, timeout = 8000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await fn()) return;
    await new Promise(resolve => setTimeout(resolve, 70));
  }
  throw new Error(`Timeout: ${label}`);
};

try {
  await waitFor(async () => { try { return (await fetch(origin)).ok; } catch { return false; } }, `preview server: ${serverLog}`);
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(origin, { waitUntil: 'networkidle' });
  check((await page.title()).startsWith('Manveo'), 'Manveo page renders from the production build');
  check(await page.locator('html').getAttribute('lang') === 'sv', 'Swedish language retained');
  check(!(await page.locator('body').innerText()).match(/Knitla|Verifierad kund|Vad våra kunder säger|★/i), 'No source branding, reviews or testimonial stars');
  check(await page.locator('.gallery-thumbnails button').count() === 6, 'Six product gallery slides');
  for (let i = 0; i < 6; i++) {
    await page.locator('.gallery-thumbnails button').nth(i).click();
    check((await page.locator('.gallery-count').innerText()) === `${i + 1} / 6`, `Gallery thumbnail ${i + 1} changes the main image`);
  }
  await page.getByRole('button', { name: 'Nästa produktbild', exact: true }).click();
  check((await page.locator('.gallery-count').innerText()) === '1 / 6', 'Gallery wraps after the last slide');
  await page.locator('.gallery-stage').focus();
  await page.keyboard.press('ArrowLeft');
  check((await page.locator('.gallery-count').innerText()) === '6 / 6', 'Gallery supports keyboard navigation');
  await page.getByRole('button', { name: 'Förstora produktbild' }).click();
  check(await page.locator('dialog.lightbox').isVisible(), 'Image zoom opens a modal');
  await page.getByRole('button', { name: 'Nästa förstorade bild' }).click();
  check((await page.locator('.lightbox-controls span').innerText()) === '1 / 6', 'Zoom gallery navigates and wraps');
  await page.keyboard.press('Escape');
  check(await page.locator('dialog').count() === 0, 'Escape closes the modal');
  await page.locator('.bundle').nth(1).click();
  await page.locator('.thread-addon').click();
  await page.locator('form .add-to-cart').click();
  check(await page.locator('.cart-item').count() === 2, 'Selected two-kit bundle and threads added as two lines');
  check((await page.locator('.cart-subtotal strong').innerText()) === '598 kr', 'Bundle price plus thread price is 598 kr');
  await page.getByRole('button', { name: 'Öka antal Manveo – 2 Kit', exact: true }).click();
  check((await page.locator('.cart-subtotal strong').innerText()).replace(/\s/g, '') === '1097kr', 'Quantity updates total using bundle pricing');
  await page.getByRole('button', { name: 'Gå till kassan', exact: true }).click();
  check((await page.getByRole('status').innerText()).includes('ingen betalning har gjorts'), 'Unconfigured checkout explains that no payment occurred');
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Öppna kundvagn/ }).click();
  check(await page.locator('.cart-item').count() === 2 && (await page.locator('.cart-subtotal strong').innerText()).replace(/\s/g, '') === '1097kr', 'Cart persists after reload');
  await page.getByRole('button', { name: 'Ta bort Manveo Färgtrådar™', exact: true }).click();
  check((await page.locator('.cart-subtotal strong').innerText()) === '998 kr', 'Removing an item updates the total');
  await page.getByRole('button', { name: 'Minska antal Manveo – 2 Kit', exact: true }).click();
  await page.getByRole('button', { name: 'Minska antal Manveo – 2 Kit', exact: true }).click();
  check(await page.locator('.empty-cart').isVisible(), 'Decreasing the last item to zero produces the empty cart');
  await page.keyboard.press('Escape');
  for (const [index, name] of ['Inspiration', 'Bevara mer'].entries()) {
    const carousel = page.locator('.carousel').nth(index);
    await carousel.scrollIntoViewIfNeeded();
    check(await carousel.locator('.carousel-card').count() === 4, `${name} has four implemented cards`);
    for (let i = 1; i < 4; i++) {
      await carousel.getByRole('button', { name: `Nästa: ${name}`, exact: true }).click();
      await waitFor(async () => (await carousel.locator('.slide-counter').innerText()).startsWith(`0${i + 1}`), `${name} slide ${i + 1}`);
      await waitFor(async () => carousel.locator('.carousel-card').nth(i).evaluate(el => Math.abs(el.getBoundingClientRect().left - el.parentElement.getBoundingClientRect().left) < 3), `${name} scroll position`);
      check(true, `${name} slide ${i + 1} is reachable and aligned`);
    }
    await carousel.getByRole('button', { name: `Nästa: ${name}`, exact: true }).click();
    await waitFor(async () => (await carousel.locator('.slide-counter').innerText()).startsWith('01'), `${name} wrap`);
    check(true, `${name} wraps to its first slide`);
  }
  const questions = page.locator('.faq-list details');
  check(await questions.count() === 6, 'All six FAQ questions included');
  for (let i = 0; i < 6; i++) {
    await questions.nth(i).locator('summary').click();
    check(await questions.nth(i).getAttribute('open') !== null && await questions.nth(i).locator('p').isVisible(), `FAQ answer ${i + 1} opens`);
    await questions.nth(i).locator('summary').click();
  }
  for (const image of await page.locator('main img').all()) {
    await image.evaluate(el => { el.loading = 'eager'; });
  }
  await waitFor(() => page.locator('main img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), 'all local images loaded');
  check(true, 'Every main-content image loads successfully');
  check(await page.evaluate(() => [...document.images].every(image => !image.src.startsWith('http') || image.src.startsWith(location.origin))), 'All artwork is local, with no source-site hotlinks');
  check(await page.evaluate(() => ![...document.querySelectorAll('link,style')].some(el => (el.href || el.innerText).includes('fonts.googleapis.com'))), 'Fonts are self-hosted');
  await mkdir('test-results', { recursive: true });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}px`);
    check(await page.locator('.gallery-stage').evaluate(el => el.getBoundingClientRect().width > 250), `Product gallery retains its full width at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.getByRole('button', { name: 'Öppna meny' }).click();
  check(await page.locator('.menu-drawer').isVisible(), 'Mobile menu opens');
  await page.locator('.drawer-nav').getByRole('link', { name: 'Så fungerar det' }).click();
  check(await page.locator('dialog').count() === 0 && page.url().endsWith('#sa-fungerar-det'), 'Mobile navigation closes the menu and reaches the section');
  await waitFor(() => page.locator('.sticky-cart').evaluate(el => el.classList.contains('visible')), 'sticky cart appears');
  await page.locator('.sticky-cart button').click();
  check(await page.locator('.cart-item').count() === 1, 'Sticky purchase button uses the current selection');
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const beforeSwipe = await page.locator('.gallery-count').innerText();
  await page.locator('.gallery-stage').evaluate(el => {
    const first = new Touch({ identifier: 0, target: el, clientX: 280, clientY: 200 });
    const last = new Touch({ identifier: 0, target: el, clientX: 50, clientY: 200 });
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [first] }));
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [last] }));
  });
  check((await page.locator('.gallery-count').innerText()) !== beforeSwipe, 'Mobile gallery responds to horizontal swipe');
  await page.locator('.gallery-thumbnails button').first().click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Integritetspolicy', exact: true }).click();
  check(await page.locator('.info-modal').isVisible(), 'Footer information opens a readable dialog');
  await page.keyboard.press('Escape');
  // A malformed previous cart must not make the storefront crash.
  await page.evaluate(() => localStorage.setItem('manveo-cart-v1', '[{"id":"unknown","quantity":1},{"id":"kit-1","quantity":-5},null]'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Öppna kundvagn/ }).click();
  check(await page.locator('.empty-cart').isVisible(), 'Invalid stored cart data is safely rejected');
  // Verify the actual file:// path when the browser permits it. Managed cloud
  // Chromium blocks that scheme; keep its policy and report the check as skipped.
  const fileContext = await browser.newContext({ offline: true });
  const filePage = await fileContext.newPage();
  try {
    await filePage.goto(pathToFileURL(resolve('index.html')).href);
    await filePage.waitForURL(/\/manveo\.html$/);
    await filePage.locator('h1').waitFor();
    check((await filePage.locator('h1').innerText()).includes('Manveo'), 'Double-click entry opens the portable page over file://');
  } catch (error) {
    if (!error.message.includes('ERR_BLOCKED_BY_ADMINISTRATOR')) throw error;
    console.log('SKIP: Direct file:// browser navigation is blocked by the cloud administrator; portable-page and redirect checks follow.');
  } finally {
    await fileContext.close();
  }
  for (const entry of ['index.html', 'dist/index.html']) {
    const html = await readFile(entry, 'utf8');
    const redirect = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    let destination;
    const location = { protocol: 'file:', href: pathToFileURL(resolve(entry)).href, hash: '#fragor', replace: url => { destination = url; } };
    runInNewContext(redirect, { location, URL });
    check(destination === new URL('./manveo.html#fragor', location.href).href, `${entry} redirects local openings to the portable file and preserves the anchor`);
    destination = null;
    runInNewContext(redirect, { location: { ...location, protocol: 'https:' }, URL });
    check(destination === null, `${entry} does not redirect the hosted application`);
  }
  // Serve only the downloadable artifacts, with ordinary HTTP. This exercises
  // the committed HTML without Vite compiling it or a source-code server.
  const portableFiles = new Map([
    ['/manveo.html', resolve('manveo.html')],
    ['/public/favicon.svg', resolve('public/favicon.svg')],
    ...(await readdir('public/images')).map(name => [`/public/images/${name}`, resolve('public/images', name)]),
  ]);
  portableServer = createServer(async (request, response) => {
    const file = portableFiles.get(new URL(request.url, 'http://127.0.0.1').pathname);
    if (!file) { response.writeHead(404); response.end(); return; }
    try {
      const bytes = await readFile(file);
      response.writeHead(200, { 'Content-Type': { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' }[extname(file)] });
      response.end(bytes);
    } catch { response.writeHead(500); response.end(); }
  });
  await new Promise(resolve => portableServer.listen(0, '127.0.0.1', resolve));
  const portableOrigin = `http://127.0.0.1:${portableServer.address().port}`;
  const portableContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const localPage = await portableContext.newPage();
  const localErrors = [];
  const remoteRequests = [];
  localPage.on('pageerror', error => localErrors.push(error.message));
  localPage.on('request', request => {
    if (/^https?:/.test(request.url()) && !request.url().startsWith(`${portableOrigin}/`) && !request.url().startsWith(`${origin}/`)) remoteRequests.push(request.url());
  });
  localPage.on('response', response => { if (response.status() >= 400) localErrors.push(`${response.status()} ${response.url()}`); });
  for (const [entry, url] of [['manveo.html', `${portableOrigin}/manveo.html`], ['dist/manveo.html', `${origin}/manveo.html`]]) {
    await localPage.goto(url);
    await localPage.locator('h1').waitFor();
    check((await localPage.locator('h1').innerText()).includes('Manveo'), `${entry} renders as a precompiled static document`);
    check(await localPage.locator('script[type="module"], script[src]').count() === 0, `${entry} needs no external JavaScript modules`);
    await localPage.locator('main img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
    await waitFor(() => localPage.locator('main img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), `${entry} local images load`);
    check(true, `${entry} loads every packaged image`);
    await localPage.locator('.gallery-thumbnails button').nth(2).click();
    check((await localPage.locator('.gallery-count').innerText()) === '3 / 6', `${entry} gallery is interactive`);
    await localPage.locator('.bundle').nth(1).click();
    await localPage.locator('form .add-to-cart').click();
    check(await localPage.locator('.cart-item').count() > 0, `${entry} cart opens`);
    await localPage.keyboard.press('Escape');
    await localPage.locator('.faq-list summary').first().click();
    check(await localPage.locator('.faq-list details').first().getAttribute('open') !== null, `${entry} FAQ works`);
    await localPage.evaluate(() => { try { localStorage.clear(); } catch {} });
  }
  check(localErrors.length === 0, `No errors in portable documents: ${localErrors.join('; ')}`);
  check(remoteRequests.length === 0, 'Portable documents do not request external resources');
  await portableContext.close();
  check(errors.length === 0, `No browser errors or failed HTTP requests: ${errors.join('; ')}`);
  console.log(`\n${passed} checks passed. Screenshots: test-results/desktop.png, test-results/mobile.png`);
} finally {
  if (browser) await browser.close();
  if (portableServer) await new Promise(resolve => portableServer.close(resolve));
  server.kill('SIGTERM');
}
