import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { menu } from '../src/domain.js';
import { marketingDocument } from '../src/marketing.js';
import { brand, pricing, contact, restaurant, whatsappHref, sgd } from '../src/config.js';
import { handleRequest } from '../server.mjs';
import { EventEmitter } from 'node:events';

test('brand config is the single place for price, host, and the TODO WhatsApp number', () => {
  assert.equal(brand.productName, 'TableHua');
  assert.equal(brand.tagline, 'Ah Hua serves every table.');
  assert.equal(brand.taglineZh, '每一桌，都有阿华招呼。');
  assert.equal(pricing.monthlyPerOutlet, 129);
  assert.equal(pricing.setup, 300);
  assert.equal(pricing.perBillFee, 0);
  assert.equal(pricing.founding.monthlyPerOutlet, 69);
  assert.equal(pricing.founding.restaurantCap, 10);
  assert.equal(contact.whatsappNumber, 'TODO');
  assert.equal(whatsappHref(), '');
  assert.equal(restaurant.hostName, 'Ah Hua');
  assert.equal(restaurant.fictional, true);
  assert.equal(restaurant.phone, 'TODO');
});

test('owner page states the offer, the grant line, and does not invent a WhatsApp number', () => {
  const html = marketingDocument();
  assert.match(html, /TableHua 招呼/);
  assert.match(html, new RegExp(brand.tagline));
  assert.match(html, new RegExp(brand.taglineZh));
  assert.ok(html.includes(sgd(pricing.monthlyPerOutlet)));
  assert.ok(html.includes(sgd(pricing.founding.monthlyPerOutlet)));
  assert.match(html, /You may be eligible for the EDGE Grant\. Ask us\./);
  assert.match(html, /whatsappNumber/);
  assert.doesNotMatch(html, /wa\.me\/659/);
  assert.match(html, /href="\/demo"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /No per-bill fee/);
});

test('sample menu has distinct descriptions, a fixed typo, and consistent simple greens', () => {
  assert.equal(new Set(menu.map(d => d.desc)).size, menu.length);
  assert.equal(menu.some(d => /witih|freshly cooked to order|Nan Hwa Chong/.test(`${d.name} ${d.desc}`)), false);
  const nai = menu.find(d => d.id === 'nai-bai');
  const kai = menu.find(d => d.id === 'kai-lan');
  assert.equal(kai.price, 1180);
  assert.equal(nai.price, 1280);
  assert.ok(menu.every(d => Number.isInteger(d.price) && d.price > 0));
});

test('dev server serves the owner page at / and offers live sync only on /demo', async () => {
  const home = await request('/');
  assert.equal(home.status, 200);
  assert.match(home.body, /TableHua/);
  assert.doesNotMatch(home.body, /data-live-sync/);
  const demo = await request('/demo');
  assert.equal(demo.status, 200);
  assert.match(demo.body, /data-live-sync="on"/);
  assert.match(demo.body, /src\/app\.js/);
});

function request(url) {
  const req = Object.assign(new EventEmitter(), { url, method: 'GET' });
  let status = 0;
  let body = '';
  const pending = handleRequest(req, {
    writeHead(code) { status = code; },
    setHeader() {},
    end(chunk) { body += chunk || ''; }
  });
  return Promise.resolve(pending).then(() => ({ status, body }));
}

test('demo shell does not name the previous real restaurant', async () => {
  const html = await readFile(new URL('../demo/index.html', import.meta.url), 'utf8');
  assert.match(html, new RegExp(restaurant.name));
  assert.doesNotMatch(html, /Nan Hwa Chong|南华昌/);
  assert.match(html, /noindex/);
});
