import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, makeLine, addLines, chat, total, submit, transition } from '../src/domain.js';

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
