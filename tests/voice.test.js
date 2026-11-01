import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVoicePlayer, speechLanguage } from '../src/voice.js';

function setup() {
  const events=[], errors=[], spoken=[];
  const synthesis={cancel(){},getVoices(){return [{lang:'en-SG'},{lang:'zh-CN'}];},speak(u){spoken.push(u);}};
  const player=createVoicePlayer({synthesis,Utterance:class{constructor(text){this.text=text;}},onState:active=>events.push(active),onError:()=>errors.push(true)});
  return {player,events,errors,spoken};
}
test('avatar speaks only during actual speech events and returns idle on completion',()=>{
  const {player,events,spoken}=setup();player.play('Hello!');assert.deepEqual(events,[false]);
  spoken[0].onstart();assert.equal(events.at(-1),true);spoken[0].onend();assert.equal(events.at(-1),false);
});
test('cancelled and replaced utterances cannot reset the current avatar',()=>{
  const {player,events,spoken,errors}=setup();player.play('First');const first=spoken[0];
  player.play('Second');spoken[1].onstart();first.onend();first.onerror({error:'network'});
  assert.equal(events.at(-1),true);assert.equal(errors.length,0);
  player.stop();spoken[1].onstart();assert.equal(events.at(-1),false);
});
test('playback failures clear the avatar and surface an honest fallback',()=>{
  const {player,events,spoken,errors}=setup();player.play('Hello');spoken[0].onstart();spoken[0].onerror({error:'not-allowed'});
  assert.equal(events.at(-1),false);assert.equal(errors.length,1);
});
test('English greetings with a Chinese name keep an English voice; Mandarin uses Chinese',()=>{
  assert.equal(speechLanguage('Hello! I’m Ah Hua 阿华. What would you like to eat?'),'en-SG');
  assert.equal(speechLanguage('好的，请检查购物车。'),'zh-CN');
  const {player,spoken}=setup();player.play('好的，请检查购物车。');assert.equal(spoken[0].voice.lang,'zh-CN');
});
test('selected language explicitly controls speech even when the text contains another script',()=>{
  const {player,spoken}=setup();
  player.play('Hello!', 'zh');assert.equal(spoken.at(-1).lang,'zh-CN');
  player.play('Can lah!', 'singlish');assert.equal(spoken.at(-1).lang,'en-SG');
  player.play('阿华 says hello.', 'en');assert.equal(spoken.at(-1).lang,'en-GB');
});
