import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initialState, makeLine, addLines, chat, total, submit, transition,
  requestService, tableSummary, settleTable, toggleOrderItem,
  getTableSession, applyOp, STATIONS, getDishStation, SET_MENUS,
  fireHeldItem, hurryItem, voidItem, guestBreakdown, closeTableSession,
  getEReceipt, dish, STORED_VALUE_TIERS, COUPON_TEMPLATES,
  getMember, registerMember, topUpMemberBalance, applyCoupon,
  removeCoupon, payWithMemberBalance, submitReview, createBanquetBooking,
  createQueueTicket, transferQueueToTable,
  DEFAULT_CART_RULES, evaluateCartRules, recordAhHuaEvent, getAhHuaSalesMetrics
} from '../src/domain.js';
import { computeDishBadge } from '../src/lore.js';
import { handleRequest } from '../server.mjs';
import { EventEmitter } from 'node:events';

test('typed multilingual order proposals require confirmation and share manual cart', () => {
  const s=initialState();
  addLines(s,[makeLine('chicken')]);
  const r=chat('two rice and one prawn paste chicken',s);
  assert.deepEqual(r.lines.map(x=>[x.id,x.qty]),[['rice',2],['chicken',1]]);
  assert.equal(s.cart.length,1);
  addLines(s,r.lines);
  assert.equal(s.cart.find(x=>x.id==='chicken').qty,2);
  assert.equal(total(s.cart),3300);
  assert.deepEqual(chat('两碗白饭和一份虾酱鸡',s).lines.map(x=>[x.id,x.qty]),[['rice',2],['chicken',1]]);
});
test('staff approval gates the kitchen and requires legal transitions', () => {
  const s=initialState();addLines(s,[makeLine('grouper',1,'Large','Less chilli')]);
  const order=submit(s,'08');assert.equal(order.status,'pending');assert.equal(s.cart.length,0);assert.equal(total(order.items),5600);
  assert.throws(()=>transition(s,order.id,'preparing'));
  for(const status of ['approved','preparing','ready','served']) transition(s,order.id,status);
  assert.equal(order.status,'served');assert.equal(order.paid,false);
  assert.throws(()=>transition(s,order.id,'approved'));
});
test('sold out changes block cart, submit and staff approval atomically', () => {
  const s=initialState();addLines(s,[makeLine('chicken')]);s.unavailable=['rice'];
  assert.throws(()=>addLines(s,[makeLine('tofu'),makeLine('rice')]));assert.equal(s.cart.length,1);
  s.unavailable=['chicken'];assert.throws(()=>submit(s,'08'));
  s.unavailable=[];const order=submit(s,'08');s.unavailable=['chicken'];assert.throws(()=>transition(s,order.id,'approved'));
  assert.throws(()=>transition(s,order.id,'rejected',''));
  transition(s,order.id,'rejected','Sold out');assert.equal(order.reason,'Sold out');
});
test('quantities, prices, variants and notes are bounded', () => {
  for(const n of [0,-1,21,1.5,NaN])assert.throws(()=>makeLine('rice',n));
  assert.throws(()=>makeLine('rice',1,'Large'));assert.throws(()=>makeLine('unknown'));
  const s=initialState();addLines(s,[{...makeLine('rice'),unitPrice:0}]);assert.equal(total(s.cart),150);
  addLines(s,[makeLine('rice',19)]);assert.throws(()=>addLines(s,[makeLine('rice')]));assert.equal(s.cart[0].qty,20);
  assert.equal(makeLine('tofu',1,'Regular','x'.repeat(500)).notes.length,160);
});
test('allergies, exclusions, price inquiries and dietary constraints never add dishes', () => {
  const s=initialState();
  for(const text of ['I am allergic to shellfish, chicken please','不要白饭','remove chicken','vegan tofu','grouper price']) assert.equal(chat(text,s).lines.length,0,text);
  assert.equal(s.cart.length,0);
});
test('specific fish selections override generic steamboat matching', () => {
  const s=initialState();assert.deepEqual(chat('one pomfret steamboat',s).lines.map(x=>x.id),['pomfret']);
  const r=chat('Recommend for 5 pax, not spicy',s);assert.equal(r.lines.find(x=>x.id==='rice').qty,5);assert.equal(r.lines.find(x=>x.id==='grouper').size,'Large');assert.ok(r.lines.every(x=>x.notes));
});
test('price inquiries do not accidentally match rice inside the word price', () => {
  const response=chat('What is the price of tofu?',initialState());
  assert.match(response.text,/Homemade Beancurd/);assert.doesNotMatch(response.text,/Steamed Rice/);
  assert.equal(response.lines.length,0);
});
test('submitted order snapshots cannot change when a later cart changes', () => {
  const s=initialState();addLines(s,[makeLine('rice',2)]);const order=submit(s,'08');addLines(s,[makeLine('rice',3)]);assert.equal(order.items[0].qty,2);assert.equal(s.cart[0].qty,3);
});
test('multi-round communal table tab, bill splitting and S$0.00 settlement', () => {
  const s = initialState();
  addLines(s, [makeLine('grouper', 1, 'Regular', 'Charcoal milky broth'), makeLine('tea', 1)]);
  const round1 = submit(s, '08');
  assert.equal(round1.round, 1);
  addLines(s, [makeLine('yam', 1), makeLine('rice', 4)]);
  const round2 = submit(s, '08');
  assert.equal(round2.round, 2);
  const summary = tableSummary(s, '08', 4);
  assert.equal(summary.rounds, 2);
  assert.equal(summary.subtotal, 6600);
  assert.equal(summary.subtotalPerPax, 1650);
  assert.equal(summary.serviceCharge, 660);
  assert.equal(summary.gst, 653);
  assert.equal(summary.grandTotal, 7913);
  assert.equal(summary.amountCharged, 0);
  assert.throws(() => settleTable(s, '08'));
  for (const status of ['approved', 'preparing', 'ready', 'served']) transition(s, round1.id, status);
  assert.equal(settleTable(s, '08'), 1);
  assert.equal(round1.paid, true);
  assert.equal(round2.paid, false);
});
test('actionable table service requests and kitchen item check-offs', () => {
  const s = initialState();
  const soup = requestService(s, '05', 'soup');
  assert.equal(soup.type, 'soup');
  assert.match(soup.label, /broth/);
  assert.throws(() => requestService(s, '05', 'soup'));
  const tea = requestService(s, '05', 'tea');
  assert.equal(tea.type, 'tea');
  assert.equal(s.calls.filter(c => c.table === '05' && !c.done).length, 2);

  addLines(s, [makeLine('chicken', 1), makeLine('barley', 2)]);
  assert.throws(() => makeLine('barley', 1, 'Large'));
  const order = submit(s, '05');
  assert.deepEqual(toggleOrderItem(s, order.id, 1), [1]);
  assert.deepEqual(toggleOrderItem(s, order.id, 0), [0, 1]);
  assert.deepEqual(toggleOrderItem(s, order.id, 1), [0]);
});
test('hybrid live sync server broadcasts state updates across connected clients', async () => {
  const sseChunks = [];
  const sseReq = Object.assign(new EventEmitter(), { url: '/api/events', method: 'GET' });
  const sseRes = { writeHead() {}, write(chunk) { sseChunks.push(chunk); } };
  await handleRequest(sseReq, sseRes);
  assert.ok(sseChunks.length >= 1);

  const s = initialState();
  addLines(s, [makeLine('calamansi', 2)]);
  const postReq = Object.assign(new EventEmitter(), { url: '/api/state', method: 'POST', setEncoding() {} });
  let postStatus = 0;
  const postPromise = handleRequest(postReq, { writeHead(code) { postStatus = code; }, end() {} });
  postReq.emit('data', JSON.stringify({ state: s, senderId: 'test-client' }));
  postReq.emit('end');
  await postPromise;
  assert.equal(postStatus, 200);

  let getBody = '';
  await handleRequest({ url: '/api/state', method: 'GET' }, { writeHead() {}, end(b) { getBody = b; } });
  const data = JSON.parse(getBody);
  assert.equal(data.state.cart[0].id, 'calamansi');
  assert.equal(data.state.cart[0].qty, 2);
  sseReq.emit('close');
});

test('multi-table session isolation separates carts and proposals by tableId', () => {
  const s = initialState();
  addLines(s, [makeLine('rice', 2)], '08');
  addLines(s, [makeLine('chicken', 1)], '12');

  const sess8 = getTableSession(s, '08');
  const sess12 = getTableSession(s, '12');

  assert.equal(sess8.cart.length, 1);
  assert.equal(sess8.cart[0].id, 'rice');
  assert.equal(sess8.cart[0].qty, 2);

  assert.equal(sess12.cart.length, 1);
  assert.equal(sess12.cart[0].id, 'chicken');
  assert.equal(sess12.cart[0].qty, 1);

  // Submitting table 08 leaves table 12 intact
  const order8 = submit(s, '08');
  assert.equal(order8.table, '08');
  assert.equal(sess8.cart.length, 0);
  assert.equal(sess12.cart.length, 1);
  assert.equal(sess12.cart[0].id, 'chicken');
});

test('applyOp supports atomic operations without overwriting concurrent sessions', () => {
  const s = initialState();
  applyOp(s, { type: 'ADD_LINES', table: '05', lines: [makeLine('tofu', 1)] });
  const sess5 = getTableSession(s, '05');
  assert.equal(sess5.cart[0].id, 'tofu');
  assert.equal(sess5.cart[0].qty, 1);

  // Atomic update qty
  applyOp(s, { type: 'UPDATE_QTY', table: '05', lineIndex: 0, delta: 2 });
  assert.equal(sess5.cart[0].qty, 3);

  // Atomic submit order
  applyOp(s, { type: 'SUBMIT_ORDER', table: '05' });
  assert.equal(sess5.cart.length, 0);
  assert.equal(s.orders.length, 1);
  assert.equal(s.orders[0].table, '05');
  assert.equal(s.orders[0].items[0].id, 'tofu');
  assert.equal(s.orders[0].items[0].qty, 3);

  // Atomic transition
  applyOp(s, { type: 'TRANSITION_ORDER', id: s.orders[0].id, status: 'approved' });
  assert.equal(s.orders[0].status, 'approved');

  // Atomic service request
  applyOp(s, { type: 'REQUEST_SERVICE', table: '05', serviceType: 'soup' });
  assert.equal(s.calls.filter(c => c.table === '05' && c.type === 'soup').length, 1);
});

test('computeDishBadge dynamically reflects verified order counts or authentic culinary attributes', () => {
  const s = initialState();
  // With 0 orders, returns authentic heritage tags
  const tag = computeDishBadge('grouper-steamboat', s);
  assert.equal(tag, '⚡ Low-fat Tender Grouper');

  // Add 5 orders of red snapper steamboat
  s.orders.push({
    id: 'AH-1001',
    table: '01',
    round: 1,
    status: 'approved',
    items: [{ id: 'red-snapper-steamboat', qty: 5 }]
  });

  const liveBadge = computeDishBadge('red-snapper-steamboat', s);
  assert.equal(liveBadge, '🔥 Ordered 5× today');
});

test('server /api/op endpoint processes atomic operations with state versioning', async () => {
  const postReq = Object.assign(new EventEmitter(), { url: '/api/op', method: 'POST', setEncoding() {} });
  let postStatus = 0;
  let postBody = '';
  const postPromise = handleRequest(postReq, {
    writeHead(code) { postStatus = code; },
    end(b) { postBody = b; }
  });

  postReq.emit('data', JSON.stringify({
    op: { type: 'ADD_LINES', table: '15', lines: [makeLine('rice', 3)] },
    senderId: 'client-test'
  }));
  postReq.emit('end');
  await postPromise;

  assert.equal(postStatus, 200);
  const res = JSON.parse(postBody);
  assert.equal(res.ok, true);
  assert.ok(res.version >= 1);

  // Check state via GET
  let getBody = '';
  await handleRequest({ url: '/api/state', method: 'GET' }, { writeHead() {}, end(b) { getBody = b; } });
  const data = JSON.parse(getBody);
  const sess15 = data.state.sessions?.['15'];
  assert.ok(sess15);
  assert.equal(sess15.cart[0].id, 'rice');
  assert.equal(sess15.cart[0].qty, 3);
});

test('station routing assigns proper kitchen station to each dish and line', () => {
  assert.equal(getDishStation(dish('pomfret')), 'steamboat');
  assert.equal(getDishStation(dish('chicken')), 'wok');
  assert.equal(getDishStation(dish('tea')), 'bar');
  assert.equal(getDishStation({ id: 'orh-nee', category: 'Dessert' }), 'dessert');

  const line = makeLine('grouper', 1);
  assert.equal(line.station, 'steamboat');
  assert.equal(line.timing, 'fire');

  const heldLine = makeLine('tea', 2, 'Regular', 'Post-meal tea', 'hold');
  assert.equal(heldLine.station, 'bar');
  assert.equal(heldLine.timing, 'hold');
});

test('auto-fire routes normal orders directly to approved while flagging high-risk orders', () => {
  const s = initialState();
  
  // Normal order with autoFire: true -> auto-approved
  addLines(s, [makeLine('chicken', 1), makeLine('rice', 2)], '08');
  const normalOrder = submit(s, '08', { autoFire: true });
  assert.equal(normalOrder.status, 'approved');
  assert.equal(normalOrder.flaggedReason, null);

  // High total order (> $250) -> stays pending
  addLines(s, [
    makeLine('pomfret', 2, 'Large'),
    makeLine('grouper', 3, 'Large'),
    makeLine('pork', 4)
  ], '09');
  const highValOrder = submit(s, '09', { autoFire: true });
  assert.equal(highValOrder.status, 'pending');
  assert.ok(highValOrder.flaggedReason.includes('>S$250'));

  // High single item quantity (>= 5) -> stays pending
  addLines(s, [makeLine('chicken', 6)], '10');
  const highQtyOrder = submit(s, '10', { autoFire: true });
  assert.equal(highQtyOrder.status, 'pending');
  assert.ok(highQtyOrder.flaggedReason.includes('≥5'));
});

test('hold and fire mechanism controls serving timing and updates atomically', () => {
  const s = initialState();
  const heldTea = makeLine('tea', 2, 'Regular', 'Serve after hotpot', 'hold');
  addLines(s, [makeLine('chicken', 1), heldTea], '04');
  
  const order = submit(s, '04', { autoFire: true });
  assert.equal(order.items[0].timing, 'fire');
  assert.equal(order.items[1].timing, 'hold');

  // Fire held item
  fireHeldItem(s, order.id, 1);
  assert.equal(order.items[1].timing, 'fire');

  // Verify applyOp supports FIRE_HELD_ITEM
  order.items[1].timing = 'hold';
  applyOp(s, { type: 'FIRE_HELD_ITEM', orderId: order.id, itemIndex: 1 });
  assert.equal(order.items[1].timing, 'fire');
});

test('hurry and void items update kitchen state and bill computation accurately', () => {
  const s = initialState();
  addLines(s, [makeLine('chicken', 1), makeLine('rice', 2)], '05');
  const order = submit(s, '05', { autoFire: true });

  // Hurry chicken
  hurryItem(s, '05', order.id, 0, 'Har Cheong Gai');
  assert.equal(order.items[0].hurried, true);
  assert.ok(s.calls.some(c => c.table === '05' && c.type === 'hurry'));

  // Initial bill before void (chicken 1500 + 2*rice 300 = 1800)
  const initialSummary = tableSummary(s, '05');
  assert.equal(initialSummary.subtotal, 1800);

  // Void rice
  voidItem(s, '05', order.id, 1, 'Sold out in kitchen');
  assert.equal(order.items[1].voided, true);
  assert.equal(order.items[1].voidReason, 'Sold out in kitchen');

  // Bill after void should exclude voided item
  const postVoidSummary = tableSummary(s, '05');
  assert.equal(postVoidSummary.subtotal, 1500); // Only chicken charges
});

test('guest breakdown attributes items and computes itemized split', () => {
  const s = initialState();
  const aliceChicken = makeLine('chicken', 1);
  aliceChicken.addedBy = 'Alice';
  aliceChicken.guestEmoji = '🦐';

  const bobRice = makeLine('rice', 2);
  bobRice.addedBy = 'Bob';
  bobRice.guestEmoji = '☕';

  addLines(s, [aliceChicken, bobRice], '06');
  submit(s, '06', { autoFire: true });

  const breakdown = guestBreakdown(s, '06');
  assert.equal(breakdown.length, 2);

  const alice = breakdown.find(g => g.guestName === 'Alice');
  assert.ok(alice);
  assert.equal(alice.subtotal, 1500);
  assert.equal(alice.items.length, 1);

  const bob = breakdown.find(g => g.guestName === 'Bob');
  assert.ok(bob);
  assert.equal(bob.subtotal, 300);
  assert.equal(bob.items.length, 1);
});

test('set menus provide curated banquet configurations with slot choices', () => {
  assert.ok(SET_MENUS.length >= 3);
  const couple = SET_MENUS.find(m => m.id === 'set-2pax');
  assert.ok(couple);
  assert.equal(couple.pax, 2);
  assert.equal(couple.slots.length, 3);
  assert.ok(couple.fixedItems.length > 0);

  const prosperity = SET_MENUS.find(m => m.id === 'set-8pax');
  assert.ok(prosperity);
  assert.equal(prosperity.pax, 8);
  assert.ok(prosperity.slots.some(sl => sl.options.some(o => o.id === 'pomfret')));
});

test('close table session clears cart and resets table lifecycle', () => {
  const s = initialState();
  addLines(s, [makeLine('chicken', 1)], '07');
  const order = submit(s, '07', { autoFire: true });

  const sessBefore = getTableSession(s, '07');
  assert.equal(sessBefore.status, 'dining');

  closeTableSession(s, '07');
  const sessAfter = getTableSession(s, '07');
  assert.equal(sessAfter.cart.length, 0);
  assert.equal(sessAfter.status, 'closed');
});

test('getEReceipt formats formal Singapore tax invoice with GST Reg No', () => {
  const s = initialState();
  addLines(s, [makeLine('chicken', 1), makeLine('rice', 2)], '11');
  submit(s, '11', { autoFire: true });

  const receipt = getEReceipt(s, '11', 2);
  assert.equal(receipt.merchant.gstReg, 'M9-0012345-X');
  assert.equal(receipt.table, '11');
  assert.equal(receipt.subtotal, 1800);
  assert.equal(receipt.serviceCharge, 180); // 10%
  assert.equal(receipt.gst, 178); // 9% of (1800 + 180) = 178.2 -> 178
  assert.equal(receipt.grandTotal, 2158);
  assert.equal(receipt.items.length, 2);
});

test('member registration saves profile, awards welcome points and waives tea fee', () => {
  const s = initialState();
  const m = registerMember(s, { phone: '91234567', name: 'Marcus Wong', email: 'marcus@example.com' });
  assert.equal(m.phone, '91234567');
  assert.equal(m.name, 'Marcus Wong');
  assert.equal(m.points, 100);
  assert.equal(m.teaWaived, true);
  assert.ok(m.coupons.includes('WELCOME-TEA'));

  // Fetching member
  const found = getMember(s, '91234567');
  assert.equal(found.phone, '91234567');

  // Verify applyOp handles REGISTER_MEMBER
  applyOp(s, { type: 'REGISTER_MEMBER', phone: '87654321', name: 'Tan Ah Huat' });
  assert.equal(getMember(s, '87654321').name, 'Tan Ah Huat');
});

test('stored value top-up adds credit, tier upgrades and bonus points', () => {
  const s = initialState();
  registerMember(s, { phone: '91234567', name: 'Marcus' });

  // Top up S$200 get S$230
  const m = topUpMemberBalance(s, '91234567', 20000, 23000);
  assert.equal(m.balance, 23000);
  assert.equal(m.tier, 'Silver');
  assert.equal(m.points, 100 + 200); // welcome + 1 pt per S$1

  // Top up S$500 get S$600 via applyOp
  applyOp(s, { type: 'TOP_UP_STORED_VALUE', phone: '91234567', payCents: 50000, creditCents: 60000 });
  const updated = getMember(s, '91234567');
  assert.equal(updated.balance, 83000);
  assert.equal(updated.tier, 'Gold');
});

test('coupon application adjusts table summary subtotal and tax calculation accurately', () => {
  const s = initialState();
  addLines(s, [makeLine('pomfret', 1), makeLine('chicken', 1)], '12'); // 5800 + 1500 = 7300
  submit(s, '12', { autoFire: true });

  const rawSummary = tableSummary(s, '12');
  assert.equal(rawSummary.subtotal, 7300);
  assert.equal(rawSummary.discount, 0);

  // Apply STEAMBOAT-10 (S$10 off min S$60)
  applyCoupon(s, '12', 'STEAMBOAT-10');
  const discountedSummary = tableSummary(s, '12');
  assert.equal(discountedSummary.rawSubtotal, 7300);
  assert.equal(discountedSummary.discount, 1000);
  assert.equal(discountedSummary.subtotal, 6300); // 7300 - 1000
  assert.equal(discountedSummary.serviceCharge, 630); // 10% of 6300
  assert.equal(discountedSummary.gst, 624); // 9% of (6300 + 630) = 623.7 -> 624
  assert.equal(discountedSummary.grandTotal, 6300 + 630 + 624);

  // Remove coupon
  removeCoupon(s, '12');
  assert.equal(tableSummary(s, '12').subtotal, 7300);
});

test('pay with member balance settles bill and deducts exact grandTotal', () => {
  const s = initialState();
  registerMember(s, { phone: '91234567', name: 'Marcus' });
  topUpMemberBalance(s, '91234567', 10000, 11000); // balance = 11000 (S$110)

  addLines(s, [makeLine('chicken', 1), makeLine('rice', 2)], '14'); // Subtotal 1800, Grand Total 2158
  const ord = submit(s, '14', { autoFire: true });
  transition(s, ord.id, 'preparing');
  transition(s, ord.id, 'ready');
  transition(s, ord.id, 'served');

  const payment = payWithMemberBalance(s, '14', '91234567');
  assert.equal(payment.success, true);
  assert.equal(payment.remainingBalance, 11000 - 2158);
  assert.equal(ord.paid, true);
});

test('review capture stores 5-star rating and awards member bonus points', () => {
  const s = initialState();
  registerMember(s, { phone: '91234567', name: 'Marcus' });
  const pointsBefore = getMember(s, '91234567').points;

  const rev = submitReview(s, {
    table: '15',
    phone: '91234567',
    rating: 5,
    tags: ['Charcoal Broth', 'Fast Service'],
    comment: 'Best fish head steamboat in Singapore!'
  });

  assert.equal(rev.rating, 5);
  assert.equal(s.reviews.length, 1);
  assert.equal(getMember(s, '91234567').points, pointsBefore + 50);
});

test('banquet booking reserves CNY/celebration sets with deposit', () => {
  const s = initialState();
  const booking = createBanquetBooking(s, {
    name: 'Wong Family',
    phone: '91234567',
    date: '2026-02-15',
    time: '18:30',
    pax: 8,
    setId: 'set-8pax',
    notes: 'Near entrance please'
  });

  assert.ok(booking.id.startsWith('NHC-BANQ-'));
  assert.equal(booking.depositPaid, true);
  assert.equal(booking.pax, 8);
  assert.equal(s.banquets.length, 1);
});

test('queue ticket creates pre-order cart and transfers seamlessly to seated table', () => {
  const s = initialState();
  const ticket = createQueueTicket(s, 4, 'Wong Party');
  assert.equal(ticket.queueId, 'Q-01');
  assert.equal(ticket.pax, 4);

  // Add items in queue
  ticket.cart.push(makeLine('grouper', 1), makeLine('chicken', 1));

  // Customer is seated at Table 16
  const session = transferQueueToTable(s, 'Q-01', '16');
  assert.equal(session.cart.length, 2);
  assert.equal(ticket.status, 'seated');
  assert.equal(ticket.table, '16');
});

test('salesperson metrics track cart check upsell, revenue, and chip conversions', () => {
  const s = initialState();
  assert.equal(s.ahHuaAnalytics.cartCheckImpressions, 0);

  // Record impressions and acceptances
  recordAhHuaEvent(s, 'CART_CHECK_IMPRESSION');
  recordAhHuaEvent(s, 'CART_CHECK_IMPRESSION');
  recordAhHuaEvent(s, 'CART_CHECK_ACCEPTED', { cents: 1300 });

  recordAhHuaEvent(s, 'CHIP_CLICK');
  recordAhHuaEvent(s, 'CHIP_CLICK');
  recordAhHuaEvent(s, 'CHIP_CONVERSION');

  recordAhHuaEvent(s, 'PROPOSAL_SHOWN');
  recordAhHuaEvent(s, 'PROPOSAL_ACCEPTED', { cents: 2500 });

  const metrics = getAhHuaSalesMetrics(s);
  assert.equal(metrics.cartCheckImpressions, 2);
  assert.equal(metrics.cartCheckAccepted, 1);
  assert.equal(metrics.cartCheckRate, 50); // 1/2 = 50%
  assert.equal(metrics.cartCheckRevenue, 1300);
  assert.equal(metrics.chipConversionRate, 50); // 1/2 = 50%
  assert.equal(metrics.proposalsAccepted, 1);
  assert.equal(metrics.totalExtraRevenue, 1300 + 2500); // 3800 cents (S$38.00)
});

test('portion intelligence warns on over-ordering based on head count (pax) and preserves customer trust', () => {
  // Table of 2 ordering 6 food dishes + steamboat (way too much food)
  const cart = [
    makeLine('pomfret', 1),
    makeLine('chicken', 1),
    makeLine('tofu', 1),
    makeLine('kang', 1),
    makeLine('pork', 1),
    makeLine('ribs', 1),
    makeLine('rice', 2)
  ];

  const check = evaluateCartRules(cart, { pax: 2 });
  assert.ok(check);
  assert.equal(check.type, 'portion_guard');
  assert.equal(check.isOverOrder, true);
  assert.match(check.message, /2 guests/);

  const checkZh = evaluateCartRules(cart, { pax: 2, language: 'zh' });
  assert.match(checkZh.message, /2 位用餐/);

  // Reasonable order for 4 pax: 1 steamboat + 2 dishes + rice -> no portion guard warning
  const normalCart = [
    makeLine('grouper', 1),
    makeLine('chicken', 1),
    makeLine('kang', 1),
    makeLine('rice', 4)
  ];
  const normalCheck = evaluateCartRules(normalCart, { pax: 4 });
  // Over-order guard should not fire on normal table
  assert.notEqual(normalCheck?.type, 'portion_guard');
});

test('data-driven cart rules decouple starters from zi char and allow operator toggle', () => {
  const s = initialState();
  
  // Test missing rice rule: 2 zi char dishes without staple
  const gravyCart = [
    makeLine('tofu', 1),
    makeLine('pork', 1)
  ];
  const riceCheck = evaluateCartRules(gravyCart, { pax: 4, rulesConfig: s.cartRules });
  assert.equal(riceCheck?.type, 'missing_rice');
  assert.equal(riceCheck?.dishId, 'rice');

  // Test steamboat starter rule: steamboat without quick starter
  const steamboatCart = [
    makeLine('pomfret', 1)
  ];
  const starterCheck = evaluateCartRules(steamboatCart, { pax: 4, rulesConfig: s.cartRules });
  assert.equal(starterCheck?.type, 'missing_starter');
  assert.equal(starterCheck?.dishId, 'chicken');

  // Operator toggles off steamboat_starter rule via applyOp
  applyOp(s, { type: 'TOGGLE_CART_RULE', ruleId: 'steamboat_starter', enabled: false });
  const disabledCheck = evaluateCartRules(steamboatCart, { pax: 4, rulesConfig: s.cartRules });
  // Now should fall through to cooling_drinks rule rather than disabled starter rule
  assert.equal(disabledCheck?.type, 'missing_drink');
});

test('session gear synchronizes table transitions to stage upon order submission', () => {
  const s = initialState();
  const session = getTableSession(s, '08');
  assert.equal(session.gear, 'dock');

  // Submit order for Table 08
  addLines(s, [makeLine('grouper', 1)], '08');
  submit(s, '08');

  // Session gear is now stage, so all devices connected to Table 08 switch to Center Stage together
  assert.equal(session.gear, 'stage');

  // Client toggles gear back to dock via SET_TABLE_GEAR op
  applyOp(s, { type: 'SET_TABLE_GEAR', table: '08', gear: 'dock' });
  assert.equal(session.gear, 'dock');
});

test('explicit line attribution defaults safely to Table without leaking viewer identity', () => {
  const line = makeLine('tofu', 1);
  assert.equal(line.addedBy, 'Table');
  assert.equal(line.guestEmoji, '👥');

  const namedLine = makeLine('chicken', 1, 'Regular', '', 'fire', 'Uncle Lim', '👴');
  assert.equal(namedLine.addedBy, 'Uncle Lim');
  assert.equal(namedLine.guestEmoji, '👴');
});
