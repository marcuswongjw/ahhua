import { menu, money, dish, initialState, total, makeLine, addLines, submit, transition, chat } from './domain.js';
import { avatarMarkup } from './avatar.js';
import { createVoicePlayer } from './voice.js';
import { languages, normaliseLanguage, replyText } from './languages.js';

const $ = s => document.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const key = 'ah-hua-demo-v1';
let state = initialState();
try { const saved = JSON.parse(localStorage.getItem(key)); if (saved?.version === 1 && ['cart','orders','messages','calls','unavailable','proposal'].every(k => Array.isArray(saved[k]))) state = saved; } catch { /* A fresh session also works when browser storage is blocked. */ }
let role = 'customer', category = 'All dishes', draft = '', speaking = false, listening = false, recognition, lastVoiceError = '', search = '';
state.replyLanguage = normaliseLanguage(state.replyLanguage);
const localReply = (key, data) => replyText(state.replyLanguage, key, data);
let voicePlaying = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const voicePlayer = createVoicePlayer({ synthesis: window.speechSynthesis, Utterance: window.SpeechSynthesisUtterance,
  onState: active => { voicePlaying = active; updateAvatar(); },
  onError: () => toast('Spoken playback is unavailable. You can read every response in chat.') });
const queryTable = new URLSearchParams(location.search).get('table');
let table = /^\d{1,2}$/.test(queryTable || '') && +queryTable > 0 && +queryTable <= 20 ? queryTable.padStart(2, '0') : '08';
const count = () => state.cart.reduce((n,x)=>n+x.qty,0);
function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { toast('Browser storage is unavailable. Keep this page open to retain your demo.'); } }
function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(()=>$('#toast').classList.remove('show'), 5000); }
function act(fn) { try { fn(); save(); render(); } catch (e) { toast(e.message); } }
function speak(text, language = state.replyLanguage) {
  recognition?.abort(); listening = false; updateVoice();
  voicePlayer.play(text, language);
}
function updateAvatar() {
  const avatar = $('#ah-hua-avatar');
  if (avatar) avatar.dataset.state = listening ? 'listening' : voicePlaying ? 'speaking' : 'idle';
  const status = $('#avatar-status');
  if (status) status.textContent = listening ? 'I’m listening…' : voicePlaying ? 'Ah Hua is speaking…' : speechSupported ? 'Tap Ah Hua to hear my latest reply' : 'I’m here to help you choose';
  const stop = $('#stop-playback'); if (stop) stop.hidden = !voicePlaying;
}
function updateSpeaker() {
  const button = $('#speaker'); if (!button) return;
  button.textContent = !speechSupported ? 'Voice unavailable' : speaking ? 'Voice replies: on' : 'Turn on voice replies';
  button.setAttribute('aria-pressed', String(speaking));
  if ($('#voice-reply-help')) $('#voice-reply-help').textContent = !speechSupported ? 'Spoken replies aren’t available in this browser. Every reply appears in chat.' : speaking ? 'Ah Hua will read new replies aloud. Tap the avatar or Listen to replay.' : 'Want to hear Ah Hua? Turn on voice replies, or tap the avatar to try it.';
}
function reply(text) { state.messages.push({role:'host',text,language:state.replyLanguage}); if (speaking) speak(text); }
function send(text) {
  text = text.trim().slice(0, 500); if (!text) return;
  act(()=>{ state.messages.push({role:'customer',text}); const response = chat(text,state); state.proposal = response.lines; reply(response.text); state.messages = state.messages.slice(-80); draft = ''; });
  $('#message')?.focus();
}
function stopVoice() { recognition?.abort(); listening = false; voicePlayer.stop(); updateVoice(); }
function startVoice() {
  if (listening) { recognition?.stop(); return; }
  if (!SpeechRecognition || !window.isSecureContext) { toast('Speech input is unavailable here. Please type or choose from the menu.'); return; }
  voicePlayer.stop(); lastVoiceError = '';
  recognition = new SpeechRecognition(); recognition.lang = languages[normaliseLanguage(state.replyLanguage)].speech; recognition.continuous = false; recognition.interimResults = false;
  recognition.onstart = () => { listening = true; updateVoice(); };
  recognition.onresult = event => { draft = event.results[0][0].transcript.slice(0,500); const input = $('#message'); if (input) { input.value = draft; input.focus(); } toast('Speech captured. Review your words, then press Send.'); };
  recognition.onerror = event => { lastVoiceError = ({ 'not-allowed': 'Microphone permission was denied. You can still type or browse the menu.', 'no-speech': 'No speech detected. Tap Speak to try again, or type.', 'network': 'The browser speech service could not connect. Please type or choose dishes.', 'audio-capture': 'No microphone was found. Please type or browse the menu.', 'language-not-supported': 'That speech language is unavailable on this browser.' })[event.error] || 'Speech input stopped. You can still type or browse the menu.'; toast(lastVoiceError); };
  recognition.onend = () => { listening = false; updateVoice(); };
  try { recognition.start(); } catch { listening = false; toast('Could not start the microphone. Try again or type your message.'); }
}
function updateVoice() { const btn = $('#mic'); if (btn) { btn.textContent = listening ? '■ Stop listening' : '🎙 Speak'; btn.classList.toggle('listening', listening); btn.setAttribute('aria-pressed', String(listening)); } if ($('#voice-status')) $('#voice-status').textContent = listening ? 'Listening… speak now. Your transcript will appear above.' : lastVoiceError || (SpeechRecognition ? 'Tap Speak, then review the transcript before sending.' : 'Speech input isn’t supported here. Typing and menu selection are ready.'); updateAvatar(); }
const statusLabel = { pending:'Awaiting staff', approved:'Approved', preparing:'Cooking', ready:'Ready to serve', served:'Served', rejected:'Declined' };
function badge(status) { return `<span class="badge ${status}">${statusLabel[status]}</span>`; }
function orderLines(order) { return order.items.map(x=>`<li><b>${x.qty} × ${esc(x.name)}</b><span>${esc(x.size)}${x.notes ? ' · '+esc(x.notes) : ''}</span><strong>${money(x.qty*x.unitPrice)}</strong></li>`).join(''); }
function render() {
  state.replyLanguage = normaliseLanguage(state.replyLanguage);
  const pending = state.orders.filter(x=>x.status==='pending').length;
  $('#app').innerHTML = `
  <div class="demo-bar"><span class="dot"></span> DEMO EXPERIENCE <span class="demo-detail">Sample menu · No real orders or charges</span></div>
  <header class="topbar"><a class="brand" href="/" aria-label="Ah Hua home"><span class="seal">華</span><span>Ah Hua<small>阿华 · YOUR DINING COMPANION</small></span></a><div class="top-actions"><button class="text-button" data-action="call">♧ Call a server</button><span class="table-pill">Table ${table}</span></div></header>
  <nav class="role-nav" aria-label="Demo role"><button data-role="customer" class="${role==='customer'?'active':''}">Customer <span>点餐</span></button><button data-role="staff" class="${role==='staff'?'active':''}">Staff ${pending?`<i>${pending}</i>`:''}</button><button data-role="kitchen" class="${role==='kitchen'?'active':''}">Kitchen</button><div class="session-note">One browser · one demo restaurant</div><button class="reset" data-action="reset">Reset demo</button></nav>
  <main>${role==='customer' ? customer() : role==='staff' ? staff() : kitchen()}</main>
  ${role==='customer'&&state.cart.length?`<a class="mobile-cart-link" href="#table-cart"><span>View cart · ${count()} items</span><strong>${money(total(state.cart))} →</strong></a>`:''}
  <footer><span class="footer-mark">華</span> A little warmth. A good meal. <span>Independent concept demo · Not an official restaurant ordering service</span></footer>
  <dialog id="dish-dialog"></dialog><dialog id="reset-dialog"><form method="dialog"><h2>Start fresh?</h2><p>This clears this browser’s demo cart, conversations and tickets.</p><div class="dialog-actions"><button value="cancel" class="secondary">Keep exploring</button><button value="reset" class="primary">Reset demo</button></div></form></dialog>`;
  document.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{ draft=$('#message')?.value || draft; stopVoice(); role=b.dataset.role; render(); });
  document.querySelectorAll('[data-action="call"]').forEach(b=>b.onclick=()=>act(()=>{ if (state.calls.some(x=>x.table===table&&!x.done)) return toast('A simulated request is already waiting in Staff.'); state.calls.push({id:crypto.randomUUID(),table,done:false}); toast(`Demo server request for Table ${table} is in Staff.`); }));
  $('[data-action="reset"]').onclick=()=>{ const d=$('#reset-dialog'); d.showModal(); d.onclose=()=>{ if(d.returnValue==='reset')act(()=>{stopVoice();state=initialState();draft='';}); }; };
  if (role==='customer') bindCustomer(); else bindOperations();
}
function customer() {
  const shown = menu.filter(d=>(category==='All dishes'||d.category===category)&&`${d.name} ${d.cn}`.toLowerCase().includes(search.toLowerCase()));
  return `<section class="welcome"><div><div class="eyebrow">GOOD FOOD, GOOD COMPANY</div><h1>Come in. Make yourself at home.</h1><p>Speak to Ah Hua, drop a message, or find your next favourite below.</p></div><label class="table-select">TABLE NUMBER<select id="table" aria-label="Table number">${Array.from({length:20},(_,i)=>`<option ${String(i+1).padStart(2,'0')===table?'selected':''}>${String(i+1).padStart(2,'0')}</option>`).join('')}</select></label></section>
  <div class="dining-grid"><div class="left-column"><section class="host-card"><div class="host-heading">${avatarMarkup()}<div><h2>Have a chat with Ah Hua <span class="online-dot"></span></h2><p>English, 中文 & a little Singlish · Demo menu assistant</p></div><div class="reply-controls"><button id="speaker" class="icon-button" aria-pressed="${speaking}" ${speechSupported?'':'disabled'}>${speaking?'Voice replies: on':'Turn on voice replies'}</button><button id="stop-playback" class="text-button" hidden>Stop voice</button></div></div><div class="avatar-caption"><label class="reply-language-label">Ah Hua’s language · 回复语言<select id="reply-language" aria-label="Ah Hua reply language">${Object.entries(languages).map(([id,l])=>`<option value="${id}" ${state.replyLanguage===id?'selected':''}>${l.label}</option>`).join('')}</select></label><div class="language-voice-note">${state.replyLanguage==='zh'?'中文文字回复与普通话语音 · 麦克风识别普通话':state.replyLanguage==='singlish'?'Singlish replies · Singapore English voice where available':'English replies and speech input'}</div><span id="avatar-status" role="status"></span><p id="voice-reply-help"></p></div>
  <div class="chat-log" role="log" aria-label="Conversation with Ah Hua" aria-live="polite">${state.messages.map((m,i)=>`<div class="message ${m.role}" ${m.role==='host'?`lang="${languages[normaliseLanguage(m.language)].html}"`:''}><small>${m.role==='host'?'AH HUA':'YOU'}</small><div>${esc(m.text)}</div>${m.role==='host'&&speechSupported?`<button class="replay" data-replay="${i}" aria-label="Read response ${i+1} aloud">Listen ↗</button>`:''}</div>`).join('')}</div>
  ${state.proposal.length?`<div class="proposal"><b>${state.replyLanguage==='zh'?'为您推荐':'A suggestion for your table'}</b><ul>${state.proposal.map(x=>`<li>${x.qty} × ${esc(state.replyLanguage==='zh'?dish(x.id).cn:x.name)} <span>${esc(x.size)} · ${money(x.qty*x.unitPrice)}${x.notes?' · '+esc(x.notes):''}</span></li>`).join('')}</ul><div class="proposal-actions"><strong>${money(total(state.proposal))}</strong><button data-chat="Another suggestion" class="text-button">${state.replyLanguage==='zh'?'换一组推荐':'Another suggestion'}</button><button id="dismiss-proposal" class="text-button">Dismiss</button><button id="accept-proposal" class="primary small">Add suggestion to cart +</button></div></div>`:''}
  <div class="chat-bottom"><div class="suggestions"><button data-chat="Recommend for 4, not spicy">${state.replyLanguage==='zh'?'✧ 推荐四人餐':state.replyLanguage==='singlish'?'✧ Four pax, what’s good?':'✧ Recommend for 4'}</button><button data-chat="Two rice and one prawn paste chicken">${state.replyLanguage==='zh'?'试试示例点餐':'Try a sample order'}</button><button data-chat="Review my cart">${state.replyLanguage==='zh'?'查看购物车':'Review my cart'}</button></div><form id="chat-form"><label class="sr-only" for="message">Message Ah Hua</label><input id="message" maxlength="500" placeholder="${esc(localReply('placeholder'))}" value="${esc(draft)}" autocomplete="off"><button class="send" type="submit" aria-label="Send message">↑</button></form><div class="voice-controls"><button id="mic" class="voice-button" ${SpeechRecognition&&window.isSecureContext?'':'disabled'} aria-pressed="false">♩ Speak</button><span id="voice-status"></span></div><details class="voice-privacy"><summary>About voice & this demo</summary><p>Your browser may send audio to its speech provider. Ah Hua stores no recordings. Spoken replies use your device’s available voices. This is a limited, rule-based menu assistant; no AI service is connected. Allergy and dietary details need staff confirmation.</p></details></div></section>
  <section class="menu-section"><div class="section-top"><div><div class="eyebrow">MADE FOR SHARING</div><h2>Something for everyone.</h2></div><span class="sample-label">Illustrative menu & prices</span></div><div class="menu-tools"><div class="categories" aria-label="Menu category">${['All dishes','Steamboat','Favourites','Greens & sides'].map(c=>`<button data-category="${c}" aria-pressed="${category===c}" class="${category===c?'active':''}">${c}</button>`).join('')}</div><input id="search" aria-label="Search dishes" placeholder="Search dishes…" value="${esc(search)}"></div><div class="menu-grid">${shown.map(d=>`<article class="dish-card ${state.unavailable.includes(d.id)?'sold-out':''}"><div class="dish-art ${d.id}"><span>${d.icon}</span>${d.tag?`<em>${esc(d.tag)}</em>`:''}</div><div class="dish-info"><small>${d.cn}</small><h3>${d.name}</h3><p>${d.desc}</p><div class="dish-bottom"><strong>${money(d.price)} <small>${d.id==='rice'?'/ bowl':'from'}</small></strong><button class="add-dish" data-dish="${d.id}" ${state.unavailable.includes(d.id)?'disabled':''} aria-label="${state.unavailable.includes(d.id)?'Unavailable':'Customise'} ${d.name}">${state.unavailable.includes(d.id)?'Sold out':'+'}</button></div></div></article>`).join('')||'<p class="empty">No dishes match. Try another search.</p>'}</div><p class="menu-footnote">All prices, portions, recipes and allergen notes are illustrative and unverified. No GST or service charge is applied in this demo.</p></section></div>${cart()}</div>`;
}
function cart() {
  const orders=state.orders.filter(x=>x.table===table).slice().reverse();
  return `<aside class="cart-column" id="table-cart"><section class="cart-card"><div class="cart-title"><div><div class="eyebrow">A MEAL TO REMEMBER</div><h2>Your table order</h2></div><span class="cart-count">${count()}</span></div><div class="cart-body">${state.cart.length?state.cart.map((x,i)=>`<div class="cart-line"><div><h3>${esc(x.name)}</h3><p>${esc(x.size)}${x.notes?' · '+esc(x.notes):''}</p><small>${money(x.unitPrice)} each</small></div><div class="cart-line-end"><strong>${money(x.qty*x.unitPrice)}</strong><div class="quantity"><button data-qty="${i}" data-delta="-1" aria-label="Decrease ${esc(x.name)}">−</button><span>${x.qty}</span><button data-qty="${i}" data-delta="1" aria-label="Increase ${esc(x.name)}" ${x.qty>=20?'disabled':''}>+</button></div></div></div>`).join(''):`<div class="cart-empty"><div>🥢</div><h3>A good meal starts here.</h3><p>Add a favourite from the menu,<br>or let Ah Hua help you choose.</p></div>`}</div><div class="cart-summary"><div><span>Sample subtotal</span><strong>${money(total(state.cart))}</strong></div><p>Staff review every order before the kitchen starts.</p><button id="submit-order" class="primary wide" ${state.cart.length?'':'disabled'}>Send to staff <span>→</span></button><small class="safe-note">◇ Demo only. No payment required.</small></div></section>
  <div class="how-it-works"><span>01 <b>Choose together</b></span><span>02 <b>Staff approves</b></span><span>03 <b>Kitchen prepares</b></span></div>
  ${orders.length?`<section class="tracking"><div class="eyebrow">FROM YOUR TABLE</div><h2>Your orders</h2>${orders.map(o=>`<article class="tracking-order"><div><b>${o.id}</b>${badge(o.status)}</div><p>${o.items.reduce((n,x)=>n+x.qty,0)} items · ${money(total(o.items))}</p>${o.status==='rejected'?`<p class="reason">${esc(o.reason)}</p>`:`<div class="progress-track">${['pending','approved','preparing','ready','served'].map((s,i)=>`<span class="${['pending','approved','preparing','ready','served'].indexOf(o.status)>=i?'done':''}" title="${statusLabel[s]}"></span>`).join('')}</div>`}${o.status==='served'?o.paid?'<p class="receipt">Demo receipt · Amount charged S$0.00</p>':`<button class="secondary wide" data-receipt="${o.id}">Simulate receipt · No charge</button>`:''}</article>`).join('')}</section>`:''}</aside>`;
}
function staff() {
  return `<section class="ops-header"><div><div class="eyebrow">A LITTLE HUMAN TOUCH</div><h1>The service desk.</h1><p>Review each sample order. Only approved tickets reach the kitchen.</p></div><span class="ops-badge">STAFF SIMULATION · No sign-in needed</span></section><div class="ops-grid"><section><div class="section-top"><h2>Order approvals</h2><span>${state.orders.filter(x=>x.status==='pending').length} waiting</span></div>${state.orders.slice().reverse().map(o=>`<article class="order-card"><div class="order-top"><div><small>TABLE ${o.table}</small><h2>${o.id}</h2></div>${badge(o.status)}</div><ul class="order-lines">${orderLines(o)}</ul><div class="order-total">Sample subtotal <strong>${money(total(o.items))}</strong></div>${o.status==='pending'?`<label class="staff-check"><input type="checkbox" data-reviewed="${o.id}"> I reviewed sample dishes, notes and prices</label><label class="reason-label">Reason if declining<input data-reason="${o.id}" maxlength="160" placeholder="e.g. The kitchen has run out of grouper"></label><div class="button-row"><button class="secondary" data-status="rejected" data-order="${o.id}">Decline order</button><button class="primary" data-status="approved" data-order="${o.id}">Approve for kitchen →</button></div>`:o.reason?`<p>${esc(o.reason)}</p>`:''}</article>`).join('')||'<div class="empty-card">No orders waiting.<p>Switch to Customer, add a dish and send it here.</p></div>'}</section><aside><section class="ops-panel"><h2>Server requests</h2>${state.calls.filter(x=>!x.done).map(c=>`<div class="request"><span>♧ Table ${c.table}<small>Customer would like assistance</small></span><button class="secondary" data-resolve="${c.id}">Acknowledge</button></div>`).join('')||'<p>No open requests. All tables are happy.</p>'}</section><section class="ops-panel"><h2>Menu availability</h2><p>Try marking a dish sold out. The menu and approvals will reflect the change.</p>${menu.map(d=>`<label class="availability"><span>${d.name}</span><input type="checkbox" data-availability="${d.id}" ${state.unavailable.includes(d.id)?'':'checked'} aria-label="${esc(d.name)} available"></label>`).join('')}</section><p class="ops-note">These controls affect this browser’s demo only. There is no staff authentication, restaurant connection or shared server database.</p></aside></div>`;
}
function kitchen() {
  const active=state.orders.filter(x=>['approved','preparing','ready'].includes(x.status));
  return `<section class="ops-header"><div><div class="eyebrow">GOOD THINGS TAKE A LITTLE TIME</div><h1>Behind the pass.</h1><p>Approved orders, a warm wok, and a little teamwork.</p></div><span class="ops-badge">KITCHEN SIMULATION</span></section><div class="kitchen-board">${['approved','preparing','ready'].map(s=>`<section class="kitchen-lane"><h2><span class="lane-dot ${s}"></span>${{approved:'On the board',preparing:'In the kitchen',ready:'Ready to serve'}[s]}<small>${active.filter(o=>o.status===s).length}</small></h2>${active.filter(o=>o.status===s).map(o=>`<article class="kitchen-ticket"><div class="order-top"><div><small>TABLE ${o.table}</small><h2>${o.id}</h2></div><span class="ticket-symbol">✧</span></div><ul class="order-lines">${orderLines(o)}</ul><button class="${s==='ready'?'secondary':'primary'} wide" data-status="${{approved:'preparing',preparing:'ready',ready:'served'}[s]}" data-order="${o.id}">${{approved:'Start cooking',preparing:'Mark ready',ready:'Mark served'}[s]} →</button></article>`).join('')||'<div class="lane-empty">Nothing here just yet.</div>'}</section>`).join('')}</div><p class="menu-footnote">Tickets move manually in this simulation. Pending and declined orders never enter the kitchen.</p>`;
}
function bindCustomer() {
  $('#chat-form').onsubmit=e=>{e.preventDefault();send($('#message').value);};
  $('#message').oninput=e=>draft=e.target.value;
  $('#table').onchange=e=>{table=e.target.value;const url=new URL(location.href);url.searchParams.set('table',table);history.replaceState(null,'',url);render();};
  $('#mic').onclick=startVoice;
  $('#reply-language').onchange=e=>act(()=>{draft=$('#message').value;stopVoice();state.replyLanguage=normaliseLanguage(e.target.value);reply(localReply('switched'));state.messages=state.messages.slice(-80);});
  $('#speaker').onclick=()=>{speaking=!speaking;updateSpeaker();if(speaking)speak(localReply('voiceEnabled'));else voicePlayer.stop();};
  $('#stop-playback').onclick=()=>voicePlayer.stop();
  $('#ah-hua-avatar').onclick=()=>{if(!speechSupported){toast('Voice isn’t available in this browser. Chat with me below.');return;}speaking=true;updateSpeaker();const message=state.messages.findLast(m=>m.role==='host');speak(message?.text || localReply('welcome'),message?.language || null);};
  document.querySelectorAll('[data-replay]').forEach(b=>b.onclick=()=>{const m=state.messages[+b.dataset.replay];speak(m.text,m.language || null);});
  document.querySelectorAll('[data-chat]').forEach(b=>b.onclick=()=>send(b.dataset.chat));
  document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{draft=$('#message').value;category=b.dataset.category;render();});
  $('#search').oninput=e=>{const start=e.target.selectionStart;search=e.target.value;render();$('#search').focus();$('#search').setSelectionRange(start,start);};
  document.querySelectorAll('[data-dish]').forEach(b=>b.onclick=()=>openDish(b.dataset.dish));
  document.querySelectorAll('[data-qty]').forEach(b=>b.onclick=()=>act(()=>{const line=state.cart[+b.dataset.qty];line.qty+=+b.dataset.delta;if(line.qty<=0)state.cart.splice(+b.dataset.qty,1);}));
  $('#accept-proposal')?.addEventListener('click',()=>act(()=>{addLines(state,state.proposal);state.proposal=[];reply(localReply('added'));toast('Suggestion added to your shared cart.');}));
  $('#dismiss-proposal')?.addEventListener('click',()=>act(()=>{state.proposal=[];}));
  $('#submit-order').onclick=()=>act(()=>{const order=submit(state,table);reply(localReply('submitted',{id:order.id}));toast(`${order.id} sent for demo staff approval.`);});
  document.querySelectorAll('[data-receipt]').forEach(b=>b.onclick=()=>act(()=>{const o=state.orders.find(x=>x.id===b.dataset.receipt);if(o.status==='served')o.paid=true;toast('Simulated receipt created. Amount charged: S$0.00.');}));
  const log=$('.chat-log');log.scrollTop=log.scrollHeight;updateVoice();updateSpeaker();
}
function openDish(id) {
  const d=dish(id), dialog=$('#dish-dialog');
  dialog.innerHTML=`<form id="dish-form"><div class="dialog-top"><span class="eyebrow">FOR YOUR TABLE</span><button type="button" class="close-dialog" aria-label="Close dish details">×</button></div><div class="dialog-art">${d.icon}</div><small>${d.cn}</small><h2>${d.name}</h2><p>${d.desc}</p><div class="allergen-note"><b>Sample allergens:</b> ${esc(d.allergens)}. Recipe unverified. For allergies, call a server; no safety guarantee.</div><div class="dish-options"><label>Portion<select name="size"><option value="Regular">Regular · ${money(d.price)}</option>${id!=='rice'?`<option value="Large">Large · ${money(d.price+800)}</option>`:''}</select><small>${d.category==='Steamboat'?'Sample sharing portion; ask staff to confirm.':'Sample portion; ask staff to confirm.'}</small></label><label>Quantity<input name="qty" type="number" min="1" max="20" value="1" required></label></div><label>Anything we should know?<textarea name="notes" maxlength="160" placeholder="e.g. less chilli, sauce on the side"></textarea></label><p class="muted">Requests need staff confirmation.</p><button class="primary wide" type="submit">Add to shared cart +</button></form>`;
  dialog.showModal();$('.close-dialog').onclick=()=>dialog.close();
  $('#dish-form').onsubmit=e=>{e.preventDefault();const form=new FormData(e.target);try{addLines(state,[makeLine(id,Number(form.get('qty')),form.get('size'),form.get('notes'))]);save();dialog.close();render();toast(`${d.name} added to your cart.`);}catch(error){toast(error.message);}};
}
function bindOperations() {
  document.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>act(()=>{const id=b.dataset.order;if(b.dataset.status==='approved'&&!$(`[data-reviewed="${id}"]`).checked)throw Error('Review the dishes, notes and prices, then tick the review box.');transition(state,id,b.dataset.status,$(`[data-reason="${id}"]`)?.value||'');toast(`${id}: ${statusLabel[b.dataset.status]}`);}));
  document.querySelectorAll('[data-availability]').forEach(b=>b.onchange=()=>act(()=>{state.unavailable=b.checked?state.unavailable.filter(id=>id!==b.dataset.availability):[...new Set([...state.unavailable,b.dataset.availability])];}));
  document.querySelectorAll('[data-resolve]').forEach(b=>b.onclick=()=>act(()=>{state.calls.find(c=>c.id===b.dataset.resolve).done=true;toast('Simulated server request acknowledged.');}));
}
window.addEventListener('storage',event=>{if(event.key===key&&event.newValue){try{const incoming=JSON.parse(event.newValue);if(incoming.version===1){draft=$('#message')?.value||draft;state=incoming;render();}}catch{}}});
window.addEventListener('pagehide',stopVoice);
render();
