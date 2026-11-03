import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { menu } from '../src/domain.js';
import { marketingDocument } from '../src/marketing.js';
import { brand, pricing, contact, restaurant, exampleRestaurant, whatsappHref, sgd } from '../src/config.js';
import { handleRequest } from '../server.mjs';
import { EventEmitter } from 'node:events';

test('brand config is the single place for price, host, and the WhatsApp number', () => {
  assert.equal(brand.productName, 'TableHua');
  assert.equal(brand.tagline, 'Ah Hua serves every table.');
  assert.equal(brand.taglineZh, '每一桌，都有阿华招呼。');
  assert.equal(pricing.monthlyPerOutlet, 129);
  assert.equal(pricing.setup, 300);
  assert.equal(pricing.perBillFee, 0);
  assert.equal(pricing.founding.monthlyPerOutlet, 69);
  assert.equal(pricing.founding.restaurantCap, 10);
  assert.equal(contact.whatsappNumber, '6596304128');
  assert.equal(contact.whatsappMessage, "Hi, I'd like to know more about TableHua");
  assert.equal(whatsappHref(), "https://wa.me/6596304128?text=Hi%2C%20I'd%20like%20to%20know%20more%20about%20TableHua");
  assert.equal(restaurant.hostName, 'Ah Hua');
  assert.equal(restaurant.fictional, false);
  assert.equal(restaurant.shortName, 'Nan Hwa Chong');
  assert.equal(restaurant.established, 1927);
  assert.equal(restaurant.addressLines[0], '812/814/816 North Bridge Road');
  assert.equal(exampleRestaurant.shortName, 'Hua Yuan');
  assert.equal(contact.cta, 'WhatsApp us');
  assert.equal('person' in contact, false);
});

test('owner page states the offer and links WhatsApp us to the configured chat', () => {
  const html = marketingDocument();
  assert.match(html, /TableHua 招呼/);
  assert.match(html, new RegExp(brand.tagline));
  assert.match(html, new RegExp(brand.taglineZh));
  assert.ok(html.includes(sgd(pricing.monthlyPerOutlet)));
  assert.ok(html.includes(sgd(pricing.founding.monthlyPerOutlet)));
  assert.doesNotMatch(html, /EDGE Grant|claimed under a grant/i);
  assert.equal([...html.matchAll(/WhatsApp us/g)].length >= 3, true);
  assert.equal([...html.matchAll(/href="https:\/\/wa\.me\/6596304128\?text=Hi%2C%20I&#39;d%20like%20to%20know%20more%20about%20TableHua"/g)].length, 3);
  assert.doesNotMatch(html, /TODO/);
  assert.match(html, /href="\/demo"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /No per-bill fee/);
  assert.match(html, /WhatsApp us/);
  assert.doesNotMatch(html, /Marcus/);
  assert.doesNotMatch(html, /Hua Yuan/);
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

test('demo shell names Nan Hwa Chong and does not name a person', async () => {
  const html = await readFile(new URL('../demo/index.html', import.meta.url), 'utf8');
  assert.match(html, /Nan Hwa Chong Fish Head Steamboat/);
  assert.match(html, /南华昌/);
  assert.doesNotMatch(html, /Marcus|Hua Yuan/);
  assert.match(html, /noindex/);
});
