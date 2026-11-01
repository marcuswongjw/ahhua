import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chat, initialState, total, addLines, makeLine } from '../src/domain.js';
const signature=r=>r.lines.map(x=>x.id).sort().join('|');

test('repeated requests offer different actual dish combinations',()=>{
  const s=initialState();
  const suggestions=Array.from({length:5},()=>chat('Recommend for 4',s));
  assert.equal(new Set(suggestions.map(signature)).size,5);
  assert.equal(s.cart.length,0);
});
test('budget and mild preferences shape the suggestion and survive another request',()=>{
  const s=initialState();
  const first=chat('Recommend for 4 people, budget $60, not spicy',s);
  assert.ok(first.lines.length>1);assert.ok(total(first.lines)<=6000);
  assert.ok(first.lines.every(x=>x.id!=='kang'));
  assert.match(first.text,/S\$60.00/);
  const second=chat('Another suggestion',s);
  assert.ok(total(second.lines)<=6000);assert.ok(second.lines.every(x=>x.id!=='kang'));
  assert.notEqual(signature(first),signature(second));assert.equal(s.recommendationContext.pax,4);
});
test('group size, pork and fish preferences and sold-out dishes affect selection',()=>{
  const s=initialState();s.unavailable=['chicken'];
  const r=chat('Recommend for 2 people, no pork, no fish',s);
  assert.ok(r.lines.every(x=>!['pork','ribs','grouper','pomfret','snapper','chicken'].includes(x.id)));
  assert.equal(r.lines.find(x=>x.id==='rice').qty,2);
  const large=chat('Recommend for 6 people',initialState());
  assert.equal(large.lines.find(x=>x.id==='rice').qty,6);
  assert.ok(large.lines.filter(x=>x.id!=='rice').every(x=>x.size==='Large'));
});
test('recommendation description names the actual dishes in each selected language',()=>{
  const s=initialState();s.unavailable=['grouper','chicken','tofu'];
  for(const language of ['en','zh','singlish']){
    const r=chat('Recommend for 4',s,language);
    assert.ok(r.lines.every(x=>!s.unavailable.includes(x.id)));
    if(language!=='zh')for(const line of r.lines)assert.ok(r.text.includes(line.name));
    else assert.doesNotMatch(r.text,/鱼头炉、虾酱鸡、豆腐/);
  }
});
test('cannot meet a tiny budget or an empty menu and never silently exceeds the budget',()=>{
  const s=initialState();const r=chat('Recommend for 4, budget $1',s);
  assert.equal(r.lines.length,0);assert.match(r.text,/couldn’t find/);
  s.unavailable=['grouper','pomfret','snapper','chicken','pork','ribs','tofu','kang','egg','rice'];
  assert.equal(chat('Another suggestion',s).lines.length,0);
});
test('avoids dishes already in the cart where alternatives exist',()=>{
  const s=initialState();addLines(s,[makeLine('grouper'),makeLine('chicken'),makeLine('tofu')]);
  const before=structuredClone(s.cart);const r=chat('Recommend for 4',s);
  assert.ok(r.lines.every(x=>!['grouper','chicken','tofu'].includes(x.id)));
  assert.deepEqual(s.cart,before);
});
