import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chat, initialState, addLines, makeLine, configureRecommendation, total } from '../src/domain.js';
import { languages, normaliseLanguage, replyText } from '../src/languages.js';

test('explicit reply selection overrides the language of customer input', () => {
  const s=initialState();s.replyLanguage='zh';
  assert.match(chat('recommend for 4',s).text,/为 4 位推荐/);
  s.replyLanguage='en';assert.match(chat('推荐四人餐',s).text,/For 4, how about/);
  s.replyLanguage='singlish';assert.match(chat('推荐四人餐',s).text,/4 people ah/);
});
test('reply language changes preserve the cart and dish proposals', () => {
  const s=initialState();addLines(s,[makeLine('rice',2)]);
  const original=structuredClone(s.cart), expected=chat('one prawn paste chicken',s).lines;
  for(const language of Object.keys(languages)) {
    s.replyLanguage=language;
    assert.deepEqual(chat('one prawn paste chicken',s).lines,expected);
    assert.deepEqual(s.cart,original);
    assert.equal(chat('one prawn paste chicken',s).language,language);
  }
});
test('safety, menu, cart, checkout and fallback replies follow every selected language', () => {
  const prompts=['shellfish allergy','call a server','checkout','review cart','vegan tofu','recommend for 4','remove rice','one chicken','show menu','hello'];
  for(const prompt of prompts) {
    const replies=Object.keys(languages).map(language=>chat(prompt,initialState(),language));
    assert.equal(new Set(replies.map(r=>r.text)).size,Object.keys(languages).length,prompt);
    assert.match(replies[1].text,/[\u3400-\u9fff]/,prompt);
  }
});
test('Malay and French requests understand common ordering and preference phrases',()=>{
  for(const [language,prompt] of [['ms','Cadangan untuk 4 orang, bajet $60, tidak pedas'],['fr','Conseillez-moi pour 4 personnes, budget $60, pas épicé']]){
    const r=chat(prompt,initialState(),language);
    assert.ok(r.lines.length>1);assert.ok(total(r.lines)<=6000);assert.ok(r.lines.every(x=>x.id!=='kang'));
    assert.equal(r.language,language);
  }
  assert.deepEqual(chat('dua nasi dan satu ayam',initialState(),'ms').lines.map(x=>[x.id,x.qty]),[['rice',2],['chicken',1]]);
  assert.deepEqual(chat('deux riz et un poulet',initialState(),'fr').lines.map(x=>[x.id,x.qty]),[['rice',2],['chicken',1]]);
  assert.match(chat('Quel est le prix du tofu ?',initialState(),'fr').text,/Prix indicatif/);
  assert.equal(chat('saya ada alahan',initialState(),'ms').lines.length,0);
});
test('guided meal settings replace earlier preferences without changing the cart',()=>{
  const s=initialState();addLines(s,[makeLine('rice',2)]);const original=structuredClone(s.cart);
  s.recommendationContext={pax:6,budget:1000,mild:true,noFish:true};
  configureRecommendation(s,{pax:2,budget:5000,spice:'spicy',avoid:'pork'});
  assert.equal(s.recommendationContext.noFish,false);assert.equal(s.recommendationContext.mild,false);
  const r=chat('Another suggestion',s,'ms');assert.ok(total(r.lines)<=5000);assert.ok(r.lines.every(x=>!['pork','ribs'].includes(x.id)));
  assert.deepEqual(s.cart,original);
  assert.throws(()=>configureRecommendation(s,{pax:0,budget:null,spice:'any',avoid:'none'}));
});
test('language confirmations and order confirmations are translated with safe defaults', () => {
  for(const language of Object.keys(languages)) {
    assert.ok(replyText(language,'switched'));
    assert.ok(replyText(language,'added'));
    assert.match(replyText(language,'submitted',{id:'AH-1001'}),/AH-1001/);
  }
  assert.equal(normaliseLanguage('invalid'),'en');assert.equal(normaliseLanguage('__proto__'),'en');
});
