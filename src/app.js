import {
  menu, money, dish, initialState, total, makeLine, addLines, submit, transition,
  chat, configureRecommendation, serviceTypes, requestService, tableSummary, settleTable, toggleOrderItem
} from './domain.js';
import { avatarMarkup } from './avatar.js';
import { createVoicePlayer } from './voice.js';
import { languages, normaliseLanguage, replyText, uiText, plannerMessage, dishName, categoryName } from './languages.js';
import {
  QUICK_CHIPS, LORE_ANSWERS, STORY_CARDS, SCARCITY_BADGES, GUEST_PERSONAS, POPULAR_MODIFIERS
} from './lore.js';

const $ = s => document.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const key = 'ah-hua-demo-v1';
const clientId = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : String(Math.random());
let state = initialState();
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved?.version === 1 && ['cart', 'orders', 'messages', 'calls', 'unavailable', 'proposal'].every(k => Array.isArray(saved[k]))) state = saved;
} catch { /* A fresh session also works when browser storage is blocked. */ }

let role = 'customer';
let category = 'All dishes';
let menuFilter = 'all';
let draft = '';
let speaking = false;
let listening = false;
let recognition;
let lastVoiceError = '';
let search = '';
let splitPax = 4;
let staffTableFilter = 'all';
let syncMode = 'local';
let connectedPeers = 1;

let customerGear = 'dock'; // 'dock' (Gear 1: Menu Browsing) | 'stage' (Gear 2: Post-Order Concierge)
let activeStoryIndex = 0;
let currentGuest = null;
try {
  const savedGuest = sessionStorage.getItem('ah-hua-guest');
  if (savedGuest) currentGuest = JSON.parse(savedGuest);
} catch {}
if (!currentGuest || !currentGuest.name) {
  const hash = Array.from(clientId).reduce((a, c) => a + c.charCodeAt(0), 0);
  currentGuest = GUEST_PERSONAS[Math.abs(hash) % GUEST_PERSONAS.length];
  try { sessionStorage.setItem('ah-hua-guest', JSON.stringify(currentGuest)); } catch {}
}
let dockSpeechText = 'Table 08 · Charcoal steamboat simmering fresh—1 pot is great to share!';


state.replyLanguage = normaliseLanguage(state.replyLanguage);
const localReply = (keyName, data) => replyText(state.replyLanguage, keyName, data);
const T = keyName => uiText(state.replyLanguage, keyName);
let plannerOpen = true;
let voicePlaying = false;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const voicePlayer = createVoicePlayer({
  synthesis: window.speechSynthesis,
  Utterance: window.SpeechSynthesisUtterance,
  onState: active => { voicePlaying = active; updateAvatar(); },
  onError: () => toast('Spoken playback is unavailable. You can read every response in chat.')
});

const queryTable = new URLSearchParams(location.search).get('table');
const queryLang = new URLSearchParams(location.search).get('lang');
let table = /^\d{1,2}$/.test(queryTable || '') && +queryTable > 0 && +queryTable <= 20 ? queryTable.padStart(2, '0') : '08';
if (queryLang) {
  state.replyLanguage = normaliseLanguage(queryLang);
}
let largeFont = false;
try {
  largeFont = localStorage.getItem('ah-hua-large-font') === 'true';
} catch {}
if (largeFont && typeof document !== 'undefined') {
  document.body?.classList.add('large-text');
}

function hapticPulse() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try { navigator.vibrate(12); } catch {}
  }
}
const count = () => state.cart.reduce((n, x) => n + x.qty, 0);

// Modern Web Guidance: Top-layer discrete display transition probe & light-dismiss fallback
let supportsDisplayTransition;
function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit() {
  return window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
}

async function closeTopLayer(element) {
  if (!element?.open) return;
  if (!supportsTopLayerExit()) {
    element.setAttribute('data-closing', '');
    const animations = element.getAnimations?.({ subtree: true }) || [];
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map(a => a.finished)),
        new Promise(r => setTimeout(r, 2000))
      ]);
    }
    if (!element.hasAttribute('data-closing')) return;
    element.removeAttribute('data-closing');
  }
  element.close();
}

function wireDialog(dialog) {
  if (!dialog || dialog.dataset.wired) return;
  dialog.dataset.wired = 'true';
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeTopLayer(dialog);
  });
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (isDialogContent) return;
      closeTopLayer(dialog);
    });
  }
}

// Hybrid live sync: BroadcastChannel + localStorage + Server-Sent Events (/api/events)
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('ah-hua-demo-sync') : null;
channel?.addEventListener('message', event => {
  if (event.data?.senderId !== clientId && event.data?.state?.version === 1) {
    draft = $('#message')?.value || draft;
    state = event.data.state;
    render();
  }
});

function pushServerState() {
  if (syncMode !== 'live') return;
  fetch('/api/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, senderId: clientId })
  }).catch(() => {});
}

function connectLiveSync() {
  if (typeof EventSource !== 'function') return;
  try {
    const es = new EventSource('/api/events');
    es.onmessage = event => {
      try {
        const packet = JSON.parse(event.data);
        syncMode = 'live';
        connectedPeers = packet.clients || 1;
        if (packet.senderId === 'init') {
          const localHasActivity = state.orders.length || state.cart.length || state.calls.length || state.messages.length > 1;
          const serverHasActivity = packet.state?.orders?.length || packet.state?.cart?.length || packet.state?.calls?.length;
          if (serverHasActivity && !localHasActivity) {
            state = packet.state;
            try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
          } else if (localHasActivity) {
            pushServerState();
          }
          render();
          return;
        }
        if (packet.senderId === 'presence') {
          const pill = $('#sync-pill');
          if (pill) pill.textContent = `● Live sync (${connectedPeers} ${connectedPeers === 1 ? 'screen' : 'screens'})`;
          return;
        }
        if (packet.senderId !== clientId && packet.state?.version === 1) {
          draft = $('#message')?.value || draft;
          state = packet.state;
          try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
          render();
        }
      } catch {}
    };
    es.onerror = () => {
      syncMode = 'local';
      es.close();
    };
  } catch {}
}

function save() {
  try { localStorage.setItem(key, JSON.stringify(state)); } catch { toast('Browser storage is unavailable. Keep this page open to retain your demo.'); }
  channel?.postMessage({ senderId: clientId, state });
  pushServerState();
}

function toast(text) {
  $('#toast').textContent = text;
  $('#toast').classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $('#toast').classList.remove('show'), 5000);
}

function act(fn) {
  try { fn(); save(); render(); } catch (e) { toast(e.message); }
}

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

function reply(text) {
  state.messages.push({ role: 'host', text, language: state.replyLanguage });
  if (speaking) speak(text);
}

function send(text, displayText = text) {
  text = text.trim().slice(0, 500); if (!text) return;
  act(() => {
    state.messages.push({ role: 'customer', text: String(displayText).slice(0, 500) });
    const response = chat(text, state);
    state.proposal = response.lines;
    reply(response.text);
    state.messages = state.messages.slice(-80);
    draft = '';
  });
  $('#message')?.focus();
}

function stopVoice() { recognition?.abort(); listening = false; voicePlayer.stop(); updateVoice(); }

function startVoice() {
  if (listening) { recognition?.stop(); return; }
  if (!SpeechRecognition || !window.isSecureContext) { toast('Speech input is unavailable here. Please type or choose from the menu.'); return; }
  voicePlayer.stop(); lastVoiceError = '';
  recognition = new SpeechRecognition();
  recognition.lang = languages[normaliseLanguage(state.replyLanguage)].speech;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onstart = () => { listening = true; updateVoice(); };
  recognition.onresult = event => {
    draft = event.results[0][0].transcript.slice(0, 500);
    const input = $('#message');
    if (input) { input.value = draft; input.focus(); }
    toast('Speech captured. Review your words, then press Send.');
  };
  recognition.onerror = event => {
    lastVoiceError = ({
      'not-allowed': 'Microphone permission was denied. You can still type or browse the menu.',
      'no-speech': 'No speech detected. Tap Speak to try again, or type.',
      'network': 'The browser speech service could not connect. Please type or choose dishes.',
      'audio-capture': 'No microphone was found. Please type or browse the menu.',
      'language-not-supported': 'That speech language is unavailable on this browser.'
    })[event.error] || 'Speech input stopped. You can still type or browse the menu.';
    toast(lastVoiceError);
  };
  recognition.onend = () => { listening = false; updateVoice(); };
  try { recognition.start(); } catch { listening = false; toast('Could not start the microphone. Try again or type your message.'); }
}

function updateVoice() {
  const btn = $('#mic');
  if (btn) {
    btn.textContent = listening ? '■ Stop listening' : '🎙 Speak';
    btn.classList.toggle('listening', listening);
    btn.setAttribute('aria-pressed', String(listening));
  }
  if ($('#voice-status')) {
    $('#voice-status').textContent = listening
      ? 'Listening… speak now. Your transcript will appear above.'
      : lastVoiceError || (SpeechRecognition ? 'Tap Speak, then review the transcript before sending.' : 'Speech input isn’t supported here. Typing and menu selection are ready.');
  }
  updateAvatar();
}

const statusLabel = {
  pending: 'Awaiting staff',
  approved: 'Approved',
  preparing: 'Cooking',
  ready: 'Ready to serve',
  served: 'Served',
  rejected: 'Declined'
};

function badge(status) { return `<span class="badge ${status}">${statusLabel[status]}</span>`; }

function relativeTime(iso) {
  if (!iso) return 'Just now';
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return mins < 1 ? 'Just now' : `${mins}m ago`;
}

function orderLines(order, interactiveKitchen = false) {
  const checked = new Set(Array.isArray(order.checkedItems) ? order.checkedItems : []);
  return order.items.map((x, i) => {
    const isChecked = checked.has(i);
    if (interactiveKitchen) {
      return `<li class="checkable-line ${isChecked ? 'checked' : ''}"><button type="button" class="line-check-btn" data-check-order="${order.id}" data-check-item="${i}" aria-pressed="${isChecked}"><span class="check-box">${isChecked ? '✓' : ''}</span><div><b>${x.qty} × ${esc(x.name)}</b><span>${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''}</span></div></button><strong>${money(x.qty * x.unitPrice)}</strong></li>`;
    }
    return `<li class="${isChecked ? 'plated-line' : ''}"><b>${x.qty} × ${esc(x.name)} ${isChecked ? '<em class="plated-tag">✓ Plated</em>' : ''}</b><span>${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''}</span><strong>${money(x.qty * x.unitPrice)}</strong></li>`;
  }).join('');
}

function render() {
  const prevScrollY = window.scrollY;
  state.replyLanguage = normaliseLanguage(state.replyLanguage);
  const pending = state.orders.filter(x => x.status === 'pending').length;
  const openCalls = state.calls.filter(x => !x.done).length;
  const activeKitchen = state.orders.filter(x => ['approved', 'preparing', 'ready'].includes(x.status)).length;
  const staffBadgeCount = pending + openCalls;

  $('#app').innerHTML = `
  <div class="demo-bar"><span class="dot"></span> NAN HWA CHONG (南华昌) · EST. 1927 <span class="demo-detail">Interactive table ordering · Authentic fish head steamboat</span></div>
  <header class="topbar">
    <a class="brand" href="/" aria-label="Nan Hwa Chong home">
      <span class="seal"><img class="seal-img" src="https://ucarecdn.com/3fcbba39-c037-4087-9aa9-c018c3ec8d87/-/crop/330x330/144,0/-/preview/" alt="南华昌" onerror="this.style.display='none';this.parentElement.textContent='南';" /></span>
      <span>Nan Hwa Chong<small>南华昌 (亚秋) 鱼头炉 · EST. 1927</small></span>
    </a>
    <div class="top-actions">
      <div class="top-lang-dropdown" aria-label="Language selection · 选择语言">
        <span class="lang-globe-icon" aria-hidden="true">🌐</span>
        <select id="top-language-select" aria-label="Select language · 选择语言">
          ${Object.entries(languages).map(([id, l]) => `<option value="${id}" ${state.replyLanguage === id ? 'selected' : ''}>${l.label}</option>`).join('')}
        </select>
      </div>
      <button type="button" class="font-toggle-btn ${largeFont ? 'active' : ''}" id="toggle-large-font" aria-label="Toggle large text mode · 大字模式" title="Large text mode for elders · 长辈大字模式">
        <span class="font-icon" aria-hidden="true">Aa</span><span>${largeFont ? esc(T('standardMode')) : esc(T('elderMode'))}</span>
      </button>
      <button type="button" class="text-button service-trigger" data-action="call">♧ Call a server</button>
      <button type="button" class="table-pill" data-open-qr="${table}" title="Show Table ${table} QR & details">Table ${table} <span>⊞</span></button>
    </div>
  </header>
  <nav class="role-nav" aria-label="Demo role">
    <button type="button" data-role="customer" class="${role === 'customer' ? 'active' : ''}">Customer <span>点餐</span></button>
    <button type="button" data-role="staff" class="${role === 'staff' ? 'active' : ''}">Staff ${staffBadgeCount ? `<i>${staffBadgeCount}</i>` : ''}</button>
    <button type="button" data-role="kitchen" class="${role === 'kitchen' ? 'active' : ''}">Kitchen ${activeKitchen ? `<i>${activeKitchen}</i>` : ''}</button>
    <div class="session-note" id="sync-pill">${syncMode === 'live' ? `● Live sync (${connectedPeers} ${connectedPeers === 1 ? 'screen' : 'screens'})` : '● Local browser sync'}</div>
    <button type="button" class="reset" data-action="reset">Reset demo</button>
  </nav>
  <main>${role === 'customer' ? customer() : role === 'staff' ? staff() : kitchen()}</main>
  ${role === 'customer' && state.cart.length ? `
    <aside class="floating-order-bar" aria-label="Table order summary">
      <button type="button" class="floating-cart-btn" id="open-mobile-cart" aria-label="Review cart with ${count()} items">
        <span class="floating-cart-badge">🛒 ${count()} items</span>
        <span class="floating-cart-total">${money(total(state.cart))}</span>
        <span class="floating-cart-label">${esc(T('reviewOrder'))} →</span>
      </button>
    </aside>
    <a class="mobile-cart-link sr-only" href="#table-cart"><span>View cart · ${count()} items</span><strong>${money(total(state.cart))} →</strong></a>
  ` : ''}
  <footer><span class="footer-mark">南</span> Nan Hwa Chong (南华昌) Fish Head Steamboat Corner · Traditional Teochew Taste Since 1927 <span>North Bridge Road &amp; Jalan Sultan · Singapore</span></footer>
  <dialog id="dish-dialog" closedby="any" aria-labelledby="dish-dialog-title"></dialog>
  <dialog id="bill-dialog" closedby="any" aria-labelledby="bill-dialog-title"></dialog>
  <dialog id="service-dialog" closedby="any" aria-labelledby="service-dialog-title"></dialog>
  <dialog id="order-success-dialog" closedby="any" aria-labelledby="order-success-dialog-title"></dialog>
  <dialog id="qr-dialog" closedby="any" aria-labelledby="qr-dialog-title"></dialog>
  <dialog id="steamboat-guide-dialog" closedby="any" aria-labelledby="steamboat-guide-title"></dialog>
  <dialog id="mobile-cart-dialog" class="bottom-sheet-dialog" closedby="any" aria-labelledby="mobile-cart-dialog-title"></dialog>
  <dialog id="ah-hua-dialog" class="bottom-sheet-dialog" closedby="any" aria-labelledby="ah-hua-dialog-title"></dialog>
  <dialog id="cart-check-dialog" closedby="any" aria-labelledby="cart-check-dialog-title"></dialog>
  <dialog id="reset-dialog" closedby="any" aria-labelledby="reset-dialog-title">
    <form method="dialog">
      <h2 id="reset-dialog-title">Start fresh?</h2>
      <p>This clears this demo’s cart, conversations, table requests and kitchen tickets.</p>
      <div class="dialog-actions">
        <button value="cancel" class="secondary">Keep exploring</button>
        <button value="reset" class="primary">Reset demo</button>
      </div>
    </form>
  </dialog>`;

  ['#dish-dialog', '#bill-dialog', '#service-dialog', '#order-success-dialog', '#qr-dialog', '#steamboat-guide-dialog', '#mobile-cart-dialog', '#ah-hua-dialog', '#cart-check-dialog', '#reset-dialog'].forEach(sel => wireDialog($(sel)));

  document.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => {
    draft = $('#message')?.value || draft;
    stopVoice();
    role = b.dataset.role;
    render();
  }));
  document.querySelectorAll('[data-action="call"]').forEach(b => b.addEventListener('click', () => openServiceModal()));
  document.querySelectorAll('[data-open-qr]').forEach(b => b.addEventListener('click', () => openQrDialog(b.dataset.openQr)));
  $('#toggle-large-font')?.addEventListener('click', () => {
    hapticPulse();
    largeFont = !largeFont;
    try { localStorage.setItem('ah-hua-large-font', String(largeFont)); } catch {}
    document.body.classList.toggle('large-text', largeFont);
    render();
    toast(largeFont ? (state.replyLanguage === 'zh' ? '已开启长辈大字模式' : 'Large text mode enabled for easier reading') : (state.replyLanguage === 'zh' ? '已恢复标准字体' : 'Standard text size restored'));
  });
  $('[data-action="reset"]').addEventListener('click', () => {
    const d = $('#reset-dialog');
    d.showModal();
    d.onclose = () => {
      if (d.returnValue === 'reset') act(() => { stopVoice(); state = initialState(); draft = ''; });
    };
  });
  if (role === 'customer') bindCustomer(); else bindOperations();
  window.scrollTo(0, prevScrollY);
}

function mealPlanner() {
  const c = state.recommendationContext || {};
  const budgets = [null, 3000, 5000, 6000, 8000, 10000, 15000, ...(c.budget != null ? [c.budget] : [])];
  return `<details id="meal-planner" class="meal-planner" ${plannerOpen ? 'open' : ''}>
    <summary>✧ ${esc(T('plan'))}<span>↗</span></summary>
    <form id="meal-planner-form">
      <div class="planner-fields">
        <label for="planner-pax">${esc(T('people'))}<select id="planner-pax">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${(c.pax || 4) === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label>
        <label for="planner-budget">${esc(T('budget'))}<select id="planner-budget">${[...new Set(budgets)].map(v => `<option value="${v ?? ''}" ${(c.budget ?? null) === v ? 'selected' : ''}>${v === null ? esc(T('any')) : money(v)}</option>`).join('')}</select></label>
        <label for="planner-spice">${esc(T('spice'))}<select id="planner-spice"><option value="any">${esc(T('any'))}</option><option value="mild" ${c.mild ? 'selected' : ''}>${esc(T('mild'))}</option><option value="spicy" ${c.spice === 'spicy' ? 'selected' : ''}>${esc(T('spicy'))}</option></select></label>
        <label for="planner-avoid">${esc(T('avoid'))}<select id="planner-avoid"><option value="none">${esc(T('none'))}</option><option value="pork" ${c.noPork ? 'selected' : ''}>${esc(T('pork'))}</option><option value="fish" ${c.noFish ? 'selected' : ''}>${esc(T('fish'))}</option></select></label>
      </div>
      <button class="primary wide" type="submit">${esc(T('build'))}</button>
    </form>
  </details>`;
}

function bindPlanner() {
  $('#meal-planner').ontoggle = e => { plannerOpen = e.target.open; };
  $('#start-planner').addEventListener('click', () => {
    plannerOpen = true;
    $('#meal-planner').open = true;
    $('#planner-pax').focus();
  });
  $('#meal-planner-form').addEventListener('submit', e => {
    e.preventDefault();
    const pax = Number($('#planner-pax').value);
    const budget = $('#planner-budget').value === '' ? null : Number($('#planner-budget').value);
    try {
      configureRecommendation(state, { pax, budget, spice: $('#planner-spice').value, avoid: $('#planner-avoid').value });
      splitPax = pax;
      plannerOpen = false;
      send('Recommend for ' + pax, plannerMessage(state.replyLanguage, pax, budget));
    } catch (error) {
      toast(error.message);
    }
  });
}

function matchesFilter(d) {
  if (menuFilter === 'signatures') return Boolean(d.tag) || (d.popularity || 0) >= 90;
  if (menuFilter === 'mild') return (d.spicyLevel || 0) === 0 && d.id !== 'kang';
  if (menuFilter === 'nopork') return d.category !== 'Chicken & Pork' && !['pork', 'ribs'].includes(d.id) && !/pork|rib|intestine|trotter|猪|肉碎|排骨/i.test(`${d.name} ${d.cn}`);
  return true;
}

function updateDockSpeech() {
  const activeOrders = state.orders.filter(o => o.table === table && ['pending', 'approved', 'preparing'].includes(o.status));
  if (activeOrders.length) {
    const o = activeOrders[activeOrders.length - 1];
    dockSpeechText = `Round ${o.round || 1} is cooking (~12m)! Tap me for heritage story & service →`;
  } else if (state.cart.length) {
    dockSpeechText = `Table ${table} · ${count()} items in cart! Looking delicious!`;
  } else {
    dockSpeechText = `Table ${table}? Our charcoal steamboat is simmering fresh—1 pot is great to share!`;
  }
  const dockTextEl = document.getElementById('dock-speech-text');
  if (dockTextEl) dockTextEl.innerHTML = `<span>${esc(dockSpeechText)}</span>`;
}

function handleLoreChip(chipId) {
  const langKey = state.replyLanguage === 'zh' ? 'zh' : state.replyLanguage === 'singlish' ? 'singlish' : 'en';
  const ans = LORE_ANSWERS[chipId]?.[langKey] || LORE_ANSWERS[chipId]?.en || 'Nan Hwa Chong has served authentic Teochew charcoal steamboat since 1927.';
  const qChip = [...QUICK_CHIPS.viewing, ...QUICK_CHIPS.waiting].find(c => c.id === chipId);
  const questionText = qChip?.label || 'Dish question';

  act(() => {
    state.messages.push({ role: 'customer', text: questionText, language: state.replyLanguage });
    state.messages.push({ role: 'host', text: ans, language: state.replyLanguage });
    save();
  });

  const bubbleEl = document.getElementById('stage-speech-bubble');
  if (bubbleEl) {
    bubbleEl.textContent = ans;
    bubbleEl.classList.remove('pulse-highlight');
    void bubbleEl.offsetWidth;
    bubbleEl.classList.add('pulse-highlight');
  }

  dockSpeechText = ans.slice(0, 85) + '...';
  const dockTextEl = document.getElementById('dock-speech-text');
  if (dockTextEl) dockTextEl.innerHTML = `<span>${esc(dockSpeechText)}</span>`;

  if (speaking && speechSupported) {
    voicePlayer.speak(ans, state.replyLanguage);
  }
  toast(`Ah Hua: ${ans.slice(0, 60)}...`);
  render();
}

function checkCartRules(cartItems) {
  const ziCharIds = ['kang', 'pork', 'ribs', 'tofu', 'egg', 'sambal-prawn', 'chicken'];
  const ziCharCount = cartItems.filter(x => ziCharIds.includes(x.id)).reduce((n, x) => n + x.qty, 0);
  const riceCount = cartItems.filter(x => x.id === 'rice').reduce((n, x) => n + x.qty, 0);

  if (ziCharCount >= 2 && riceCount === 0 && !state.unavailable.includes('rice')) {
    const isZh = state.replyLanguage === 'zh';
    const isSinglish = state.replyLanguage === 'singlish';
    return {
      type: 'missing_rice',
      dishId: 'rice',
      suggestQty: 2,
      title: isZh ? '点白饭了吗？' : 'Missing White Rice?',
      message: isZh
        ? `您点了 ${ziCharCount} 道浓香多汁的经典煮炒，但尚未添加米饭。确认不需要来 2 碗茉莉香米饭（每碗 S$1.50）吗？`
        : isSinglish
          ? `Wah, you ordered ${ziCharCount} zi char dishes with rich gravy but zero rice leh! Sure don't need fluffy Jasmine rice (S$1.50) to eat together?`
          : `You ordered ${ziCharCount} savoury zi char dishes with rich gravy, but zero white rice! Confirm no need fragrant Jasmine rice (S$1.50)?`,
      actionLabel: isZh ? '+ 添加2碗白饭并下单' : '+ Add 2 White Rice (S$3.00) & Send Order',
      skipLabel: isZh ? '不需要米饭，直接下单 →' : 'No rice needed, Send as is →'
    };
  }

  const steamboatCount = cartItems.filter(x => ['pomfret', 'grouper', 'snapper', 'song-fish-head'].includes(x.id)).reduce((n, x) => n + x.qty, 0);
  const starterCount = cartItems.filter(x => ['chicken', 'prawn-paste', 'tofu'].includes(x.id)).reduce((n, x) => n + x.qty, 0);

  if (steamboatCount >= 1 && starterCount === 0 && !state.unavailable.includes('chicken')) {
    const isZh = state.replyLanguage === 'zh';
    const isSinglish = state.replyLanguage === 'singlish';
    return {
      type: 'missing_starter',
      dishId: 'chicken',
      suggestQty: 1,
      title: isZh ? '等候鱼头炉时的开胃前菜？' : 'Starter while Steamboat Simmers?',
      message: isZh
        ? `提示：炭火鱼头炉起炭慢煨需约12分钟。要不要先来一份招牌现炸虾酱鸡（S$13.00），边吃边等？`
        : isSinglish
          ? `Heads up ah! Charcoal steamboat takes ~12 mins to fire up and simmer. Want me to send out some Har Cheong Gai (Prawn Paste Chicken) first so you can makan while waiting?`
          : `Heads up! The charcoal steamboat takes ~12 mins to fire up and simmer. Want to send out our signature Har Cheong Gai (Prawn Paste Chicken) first so you can makan while waiting?`,
      actionLabel: isZh ? '+ 添加招牌虾酱鸡并下单' : '+ Add Har Cheong Gai (S$13.00) & Send',
      skipLabel: isZh ? '不需要前菜，直接下单 →' : 'Steamboat only, Send as is →'
    };
  }

  return null;
}

function executeOrderSubmission() {
  let order;
  act(() => {
    order = submit(state, table);
    reply(localReply('submitted', { id: order.id }));
  });
  if (order) {
    customerGear = 'stage';
    updateDockSpeech();
    triggerOrderAnimation();
    hapticPulse();
    render();
    toast(`🎉 Order ${order.id} sent to kitchen! Ah Hua is now on Center Stage.`);
  }
}

function handleOrderSubmit() {
  const check = checkCartRules(state.cart);
  if (check) {
    openCartCheckDialog(check);
  } else {
    executeOrderSubmission();
  }
}

function openCartCheckDialog(check) {
  const dialog = $('#cart-check-dialog');
  if (!dialog) {
    executeOrderSubmission();
    return;
  }
  dialog.innerHTML = `<div class="cart-check-body">
    <div class="dialog-top">
      <span class="eyebrow">AH HUA CART CHECK · 点单贴心提示</span>
      <button type="button" class="close-dialog" aria-label="Close cart check">×</button>
    </div>
    <div class="cart-check-hero">
      ${avatarMarkup()}
      <div class="cart-check-speech">
        <strong>${esc(check.title)}</strong>
        <p>${esc(check.message)}</p>
      </div>
    </div>
    <div class="cart-check-actions">
      <button type="button" class="primary wide" id="cart-check-accept-btn">${esc(check.actionLabel)}</button>
      <button type="button" class="secondary wide" id="cart-check-skip-btn">${esc(check.skipLabel)}</button>
    </div>
  </div>`;

  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#cart-check-accept-btn').onclick = () => {
    act(() => {
      addLines(state, [{
        id: check.dishId,
        qty: check.suggestQty,
        size: 'Regular',
        notes: 'Added via Ah Hua recommendation',
        addedBy: currentGuest.name,
        guestEmoji: currentGuest.emoji
      }]);
    });
    closeTopLayer(dialog);
    executeOrderSubmission();
  };
  dialog.querySelector('#cart-check-skip-btn').onclick = () => {
    closeTopLayer(dialog);
    executeOrderSubmission();
  };
}

function getStageGreeting(latestOrder) {
  if (state.replyLanguage === 'zh') {
    return latestOrder
      ? `您的第 ${latestOrder.round || 1} 轮订单已下发厨房！百年传统炭火慢炖大约需要12分钟。在此期间，您可以探索潮州老饕吃法，或随时轻触呼叫桌边服务。`
      : '欢迎来到南华昌！您可以随时浏览菜单点单，或向我咨询潮州鱼头炉的经典搭配。';
  }
  if (state.replyLanguage === 'singlish') {
    return latestOrder
      ? `Order ${latestOrder.id} fired to kitchen already! Charcoal pot simmering fresh ~12 mins. While waiting, check out how regulars makan this or ask me any questions lah!`
      : 'Welcome to Nan Hwa Chong! Feel free to browse menu or tap me for recommendation lah!';
  }
  return latestOrder
    ? `Order ${latestOrder.id} is cooking in the kitchen! The charcoal braziers take ~12 minutes to gently simmer the broth. Meanwhile, discover our heritage eating guide or tap for table service below.`
    : 'Welcome to Nan Hwa Chong! Explore our menu or let Ah Hua assist your table.';
}

function renderStoryCardContent(story) {
  if (!story) return '';
  if (story.id === 'masterclass') {
    return `
      <div class="story-badge">${esc(story.badge)}</div>
      <h3>${esc(story.title)}</h3>
      <p class="story-subtitle">${esc(story.subtitle)}</p>
      <div class="masterclass-steps">
        ${story.steps.map(s => `
          <div class="mc-step">
            <span class="mc-step-num">${s.num}</span>
            <div>
              <strong>${esc(s.head)}</strong>
              <p>${esc(s.body)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  if (story.id === 'charcoal') {
    return `
      <div class="story-badge">${esc(story.badge)}</div>
      <h3>${esc(story.title)}</h3>
      <p class="story-subtitle">${esc(story.subtitle)}</p>
      <blockquote class="story-quote">${esc(story.quote)}</blockquote>
      <p class="story-text">${esc(story.text)}</p>
    `;
  }
  if (story.id === 'loop') {
    return `
      <div class="story-badge">${esc(story.badge)}</div>
      <h3>${esc(story.title)}</h3>
      <p class="story-subtitle">${esc(story.subtitle)}</p>
      <div class="walk-spots">
        ${story.spots.map(s => `
          <div class="walk-spot">
            <span class="walk-icon">${s.icon}</span>
            <div>
              <strong>${esc(s.name)}</strong>
              <small>${esc(s.dist)}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  if (story.id === 'slang') {
    return `
      <div class="story-badge">${esc(story.badge)}</div>
      <h3>${esc(story.title)}</h3>
      <p class="story-subtitle">${esc(story.subtitle)}</p>
      <div class="slang-list">
        ${story.slangs.map(s => `
          <div class="slang-item">
            <span class="slang-word">${esc(s.word)}</span>
            <p>${esc(s.meaning)}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
  return '';
}

function renderStoryCard() {
  const cardEl = $('#active-story-card');
  if (cardEl) {
    cardEl.innerHTML = renderStoryCardContent(STORY_CARDS[activeStoryIndex]);
  }
  document.querySelectorAll('.story-tab-pill').forEach((pill, i) => {
    pill.classList.toggle('active', i === activeStoryIndex);
  });
  document.querySelectorAll('.story-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === activeStoryIndex);
  });
}

function renderCenterStage(summary) {
  const activeOrders = state.orders.filter(o => o.table === table && ['pending', 'approved', 'preparing', 'ready'].includes(o.status));
  const latestOrder = activeOrders[activeOrders.length - 1] || state.orders.filter(o => o.table === table).slice(-1)[0];
  const nextRound = summary.rounds + 1;
  const story = STORY_CARDS[activeStoryIndex] || STORY_CARDS[0];

  return `<section class="welcome">
    <div>
      <div class="eyebrow-row">
        <span class="eyebrow">NAN HWA CHONG · EST. 1927 · 百年老字号传统炭火鱼头炉</span>
        <span class="table-peer-chip" title="Live table sync"><span class="live-dot"></span> Table ${table} · Live table sync ${connectedPeers > 1 ? `(${connectedPeers} diners in sync)` : ''} · You: <strong class="guest-name-pill">${currentGuest.emoji} ${currentGuest.name}</strong></span>
      </div>
      <h1>${esc(T('welcomeTitle'))}${table}${state.replyLanguage === 'zh' ? esc(T('welcomeTitleSuffix') || ' 桌') : ''}</h1>
      <p>Concierge Stage · Table companionship while kitchen prepares your meal</p>
    </div>
    <div class="welcome-controls">
      <label class="table-select">TABLE NUMBER
        <select id="table" aria-label="Table number">${Array.from({ length: 20 }, (_, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${String(i + 1).padStart(2, '0') === table ? 'selected' : ''}>Table ${String(i + 1).padStart(2, '0')}</option>`).join('')}</select>
      </label>
    </div>
  </section>

  <div class="stage-container">
    ${latestOrder ? `
      <div class="stage-order-tracker">
        <div class="tracker-top">
          <div>
            <div class="eyebrow">ORDER IN PROGRESS · TABLE ${table}</div>
            <h2>Order ${latestOrder.id} ${latestOrder.round ? `· Round ${latestOrder.round}` : ''}</h2>
          </div>
          ${badge(latestOrder.status)}
        </div>
        <div class="tracker-stepper">
          ${['pending', 'approved', 'preparing', 'ready', 'served'].map((s, idx) => {
            const currentIdx = ['pending', 'approved', 'preparing', 'ready', 'served'].indexOf(latestOrder.status);
            const isDone = currentIdx >= idx;
            const isCurrent = currentIdx === idx;
            const labels = {
              pending: 'Pending Staff',
              approved: 'Approved',
              preparing: 'Charcoal Simmering (~12m)',
              ready: 'Ready',
              served: 'Served'
            };
            return `<div class="step-point ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
              <div class="step-dot"></div>
              <span>${labels[s]}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="tracker-items-summary">
          <span><b>Items in this round:</b> ${latestOrder.items.map(x => `${x.qty}× ${esc(dishName(state.replyLanguage, dish(x.id)))}`).join(', ')}</span>
          <strong>${money(total(latestOrder.items))}</strong>
        </div>
        <div class="tracker-actions">
          <button type="button" class="primary small" id="stage-back-to-menu-btn">← Add More Dishes (Round ${nextRound})</button>
          <button type="button" class="secondary small bill-chip" data-open-bill>🧾 Table Bill & PayNow SGQR (${money(summary.subtotal)})</button>
        </div>
      </div>
    ` : `
      <div class="stage-order-tracker">
        <div class="eyebrow">TABLE ${table} · READY TO ORDER</div>
        <h2>No orders submitted yet</h2>
        <p>Explore our heritage dishes and start Round 1!</p>
        <div class="tracker-actions" style="margin-top:12px;">
          <button type="button" class="primary" id="stage-back-to-menu-btn">Browse Full Menu & Order →</button>
        </div>
      </div>
    `}

    <div class="stage-hero-card">
      <div class="stage-hero-top">
        ${avatarMarkup()}
        <div class="stage-hero-speech">
          <div class="speech-bubble-tag">AH HUA CONCIERGE · 阿华说</div>
          <p id="stage-speech-bubble" class="stage-bubble-text">${esc(getStageGreeting(latestOrder))}</p>
        </div>
      </div>

      <div class="stage-chips-bar">
        <span class="stage-chips-title">Tap for instant 0ms answers from Ah Hua:</span>
        <div class="stage-chips-scroll">
          ${QUICK_CHIPS.waiting.map(c => `<button type="button" class="stage-chip-btn" data-stage-chip="${c.id}">${c.label}</button>`).join('')}
        </div>
      </div>

      <div class="story-carousel-container" aria-label="Heritage story feed">
        <div class="story-tabs">
          ${STORY_CARDS.map((card, i) => `
            <button type="button" class="story-tab-pill ${activeStoryIndex === i ? 'active' : ''}" data-story-tab="${i}">
              ${card.badge}
            </button>
          `).join('')}
        </div>
        <div class="story-card" id="active-story-card">
          ${renderStoryCardContent(story)}
        </div>
        <div class="story-carousel-nav">
          <button type="button" class="story-nav-btn prev" id="story-prev-btn" aria-label="Previous story">← Prev Story</button>
          <div class="story-dots">
            ${STORY_CARDS.map((_, i) => `<span class="story-dot ${activeStoryIndex === i ? 'active' : ''}"></span>`).join('')}
          </div>
          <button type="button" class="story-nav-btn next" id="story-next-btn" aria-label="Next story">Next Story →</button>
        </div>
      </div>

      <div class="human-escalation-panel">
        <div class="escalation-header">
          <div>
            <span class="eyebrow">HUMAN STAFF ASSISTANCE · 桌面叫人</span>
            <h3>1-Tap Floor Staff Escalation</h3>
          </div>
          <small>Fires instant alert to floor staff terminal</small>
        </div>
        <div class="escalation-grid">
          <button type="button" class="escalation-btn" data-quick-service="tea">
            <span class="esc-icon">🍵</span>
            <strong>Refill Broth / Tea</strong>
            <small>加高汤 / 续茶水</small>
          </button>
          <button type="button" class="escalation-btn" data-quick-service="bowls">
            <span class="esc-icon">🥢</span>
            <strong>Extra Bowls & Chilli</strong>
            <small>加小碗 / 辣椒酱油</small>
          </button>
          <button type="button" class="escalation-btn" data-quick-service="plates">
            <span class="esc-icon">🍽️</span>
            <strong>Clear Empty Plates</strong>
            <small>换骨碟 / 收空盘</small>
          </button>
          <button type="button" class="escalation-btn" data-quick-service="takeaway">
            <span class="esc-icon">🥡</span>
            <strong>Takeaway Boxes</strong>
            <small>打包盒 / 打包袋</small>
          </button>
        </div>
      </div>

      <div class="tracker-actions" style="margin-top: 10px; justify-content: center;">
        <button type="button" class="secondary" id="stage-bottom-menu-btn">← Browse Menu to Add More Dishes</button>
      </div>
    </div>
  </div>`;
}

function openAhHuaDialog() {
  const dialog = $('#ah-hua-dialog');
  if (!dialog) return;
  const renderContent = () => {
    dialog.innerHTML = `<div class="ah-hua-sheet-body">
      <div class="dialog-top">
        <span class="eyebrow">AH HUA CONCIERGE · 智能点餐助手</span>
        <button type="button" class="close-dialog" aria-label="Close Ah Hua">×</button>
      </div>
      <div class="ah-hua-sheet-header">
        ${avatarMarkup()}
        <div>
          <h3>Chat with Ah Hua <span class="online-dot"></span></h3>
          <p>Nan Hwa Chong Host · English · 中文 · Singlish</p>
          <small class="host-lang-note">Replies in <b>${languages[state.replyLanguage].label}</b></small>
        </div>
        <button type="button" id="sheet-speaker" class="icon-button" aria-pressed="${speaking}" ${speechSupported ? '' : 'disabled'}>${speaking ? 'Voice: on' : 'Voice: off'}</button>
      </div>
      <div class="quick-chips-section">
        <span class="quick-chips-label">Instant 0ms Questions (Tap to ask):</span>
        <div class="quick-chips-row">
          ${QUICK_CHIPS.viewing.map(c => `<button type="button" class="quick-chip-btn" data-lore-chip="${c.id}">${c.label}</button>`).join('')}
        </div>
      </div>
      ${mealPlanner()}
      <div class="chat-log sheet-chat-log" role="log" aria-label="Conversation with Ah Hua">
        ${state.messages.map((m, i) => `<div class="message ${m.role}"><small>${m.role === 'host' ? 'AH HUA' : 'YOU'}</small><div>${esc(m.text)}</div>${m.role === 'host' && speechSupported ? `<button type="button" class="replay" data-replay="${i}">Listen ↗</button>` : ''}</div>`).join('')}
      </div>
      ${state.proposal.length ? `<div class="proposal"><b>${esc(T('suggestion'))}</b><ul>${state.proposal.map((x, i) => `<li><div>${x.qty} × ${esc(dishName(state.replyLanguage, dish(x.id)))} <span>${esc(x.size)} · ${money(x.qty * x.unitPrice)}${x.notes ? ' · ' + esc(x.notes) : ''}</span></div><button type="button" class="proposal-remove" data-remove-proposal="${i}">×</button></li>`).join('')}</ul><div class="proposal-actions"><strong>${money(total(state.proposal))}</strong><button type="button" id="sheet-accept-proposal" class="primary small">${esc(T('add'))}</button></div></div>` : ''}
      <div class="chat-bottom">
        <form id="sheet-chat-form">
          <input id="sheet-message" maxlength="500" placeholder="${esc(localReply('placeholder'))}" value="">
          <button class="send" type="submit" aria-label="Send message">↑</button>
        </form>
        <div class="voice-controls">
          <button type="button" id="sheet-mic" class="voice-button" ${SpeechRecognition && window.isSecureContext ? '' : 'disabled'}>🎙 Speak</button>
          <span id="sheet-voice-status"></span>
        </div>
      </div>
    </div>`;

    dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
    dialog.querySelector('#sheet-speaker').onclick = () => {
      speaking = !speaking;
      updateSpeaker();
      renderContent();
      if (speaking) speak(localReply('voiceEnabled')); else voicePlayer.stop();
    };
    dialog.querySelectorAll('[data-lore-chip]').forEach(b => {
      b.onclick = () => {
        handleLoreChip(b.dataset.loreChip);
        renderContent();
      };
    });
    dialog.querySelector('#sheet-chat-form').onsubmit = e => {
      e.preventDefault();
      const val = dialog.querySelector('#sheet-message').value;
      if (val) {
        send(val);
        dialog.querySelector('#sheet-message').value = '';
        renderContent();
      }
    };
    dialog.querySelector('#sheet-accept-proposal')?.addEventListener('click', () => act(() => {
      addLines(state, state.proposal);
      state.proposal = [];
      reply(localReply('added'));
      renderContent();
      render();
      toast('Suggestion added to shared cart.');
    }));
    bindPlanner();
    const log = dialog.querySelector('.sheet-chat-log');
    if (log) log.scrollTop = log.scrollHeight;
  };

  renderContent();
  dialog.showModal();
}

function customer() {
  const summary = tableSummary(state, table, splitPax);
  if (customerGear === 'stage') {
    return renderCenterStage(summary);
  }
  const activeOrders = state.orders.filter(o => o.table === table && ['pending', 'approved', 'preparing', 'ready'].includes(o.status));
  const latestOrder = activeOrders[activeOrders.length - 1];

  const shown = menu.filter(d =>
    (category === 'All dishes' || d.category === category) &&
    matchesFilter(d) &&
    `${d.name} ${d.cn} ${dishName(state.replyLanguage, d)} ${d.desc}`.toLowerCase().includes(search.toLowerCase())
  );
  const activeTableCalls = state.calls.filter(c => c.table === table && !c.done);

  return `<section class="welcome">
    <div>
      <div class="eyebrow-row">
        <span class="eyebrow">NAN HWA CHONG · EST. 1927 · 百年老字号传统炭火鱼头炉</span>
        <span class="table-peer-chip" title="Live table sync"><span class="live-dot"></span> Table ${table} · Live table sync ${connectedPeers > 1 ? `(${connectedPeers} diners in sync)` : ''} · You: <strong class="guest-name-pill">${currentGuest.emoji} ${currentGuest.name}</strong></span>
      </div>
      <h1>${esc(T('welcomeTitle'))}${table}${state.replyLanguage === 'zh' ? esc(T('welcomeTitleSuffix') || ' 桌') : ''}</h1>
      <p>${esc(T('tableSubtitle'))}</p>
    </div>
    <div class="welcome-controls">
      <label class="table-select">TABLE NUMBER
        <select id="table" aria-label="Table number">${Array.from({ length: 20 }, (_, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${String(i + 1).padStart(2, '0') === table ? 'selected' : ''}>Table ${String(i + 1).padStart(2, '0')}</option>`).join('')}</select>
      </label>
    </div>
  </section>

  ${latestOrder ? `<div class="active-stage-banner">
    <span>🍲 Round ${latestOrder.round || 1} (${latestOrder.id}) is simmering in the kitchen (~12 mins)</span>
    <button type="button" id="switch-to-stage-btn" class="stage-switch-btn">Enter Concierge Stage →</button>
  </div>` : ''}

  <section class="service-bar" aria-label="Quick table service">
    <div class="service-bar-label">
      <span class="eyebrow">AT YOUR TABLE · 桌面服务</span>
      <strong>Need a top-up or extra bowls?</strong>
    </div>
    <div class="service-buttons">
      <button type="button" class="service-chip guide-chip" id="open-steamboat-guide">${esc(T('potGuide'))}</button>
      <button type="button" class="service-chip" data-service="soup">${esc(T('soupRefill'))}</button>
      <button type="button" class="service-chip" data-service="tea">${esc(T('teaRefill'))}</button>
      <button type="button" class="service-chip" data-service="bowls">${esc(T('extraBowls'))}</button>
      <button type="button" class="service-chip" data-service="chilli">${esc(T('cutChilli'))}</button>
      <button type="button" class="service-chip" data-service-more title="More table service options">🛎️ More...</button>
      <button type="button" class="service-chip bill-chip" data-open-bill>${esc(T('tableBill'))}${summary.subtotal ? ` · ${money(summary.subtotal)}` : ''}</button>
    </div>
    ${activeTableCalls.length ? `<div class="active-calls-strip" role="status"><span>Waiting for staff:</span>${activeTableCalls.map(c => `<span class="call-pill">${serviceTypes[c.type || 'assistance']?.icon || '♧'} ${esc(c.label || 'Customer would like assistance')}</span>`).join('')}</div>` : ''}
  </section>

  <section class="spotlight-strip" aria-label="Trending & Most Ordered at Ah Hua">
    <div class="spotlight-header">
      <span class="eyebrow">POPULAR WITH FAMILIES · 招牌热点</span>
      <span class="spotlight-count">Top picks for table sharing</span>
    </div>
    <div class="spotlight-scroll">
      ${menu.filter(d => (d.popularity || 0) >= 90).map(d => {
        const soldOut = state.unavailable.includes(d.id);
        const inCartQty = state.cart.filter(x => x.id === d.id).reduce((n, x) => n + x.qty, 0);
        return `<div class="spotlight-card ${inCartQty ? 'in-cart' : ''}">
          ${d.image ? `<img class="spotlight-photo" src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy">` : `<span class="spotlight-icon">${d.icon}</span>`}
          <div class="spotlight-info">
            <small>${d.cn}</small>
            <strong>${esc(dishName(state.replyLanguage, d))}</strong>
            <span>${money(d.price)}</span>
          </div>
          <button type="button" class="spotlight-add" data-quick-add="${d.id}" ${soldOut ? 'disabled' : ''} aria-label="Add ${esc(d.name)}">
            ${soldOut ? 'Sold out' : inCartQty ? `+${inCartQty}` : '+'}
          </button>
        </div>`;
      }).join('')}
    </div>
  </section>

  <div class="dining-grid">
    <div class="left-column">
      <section class="host-card dock-collapsed">
        <div class="host-heading">
          ${avatarMarkup()}
          <div>
            <h2>Have a chat with Ah Hua <span class="online-dot"></span></h2>
            <p>Nan Hwa Chong Digital Host · English · 中文 · Singlish · Melayu · Français</p>
          </div>
          <div class="reply-controls">
            <button type="button" id="speaker" class="icon-button" aria-pressed="${speaking}" ${speechSupported ? '' : 'disabled'}>${speaking ? 'Voice replies: on' : 'Turn on voice replies'}</button>
            <button type="button" id="stop-playback" class="text-button" hidden>Stop voice</button>
          </div>
        </div>
        <div class="avatar-caption">
          <div class="host-caption-row">
            <span class="host-role-badge">Ah Hua · Nan Hwa Chong Host</span>
            <span class="host-lang-note">Replies in <b>${languages[state.replyLanguage].label}</b></span>
          </div>
          <div class="language-voice-note">${esc(T('voiceNote'))}</div>
          <span id="avatar-status" role="status"></span>
          <p id="voice-reply-help"></p>
        </div>
        ${mealPlanner()}
        <div class="chat-log" role="log" aria-label="Conversation with Ah Hua" aria-live="polite">
          ${state.messages.map((m, i) => `<div class="message ${m.role}" ${m.role === 'host' ? `lang="${languages[normaliseLanguage(m.language)].html}"` : ''}><small>${m.role === 'host' ? 'AH HUA' : 'YOU'}</small><div>${esc(m.text)}</div>${m.role === 'host' && speechSupported ? `<button type="button" class="replay" data-replay="${i}" aria-label="Read response ${i + 1} aloud">Listen ↗</button>` : ''}</div>`).join('')}
        </div>
        ${state.proposal.length ? `<div class="proposal"><b>${esc(T('suggestion'))}</b><ul>${state.proposal.map((x, i) => `<li><div>${x.qty} × ${esc(dishName(state.replyLanguage, dish(x.id)))} <span>${esc(x.size)} · ${money(x.qty * x.unitPrice)}${x.notes ? ' · ' + esc(x.notes) : ''}</span></div><button type="button" class="proposal-remove" data-remove-proposal="${i}" aria-label="${esc(T('remove'))} ${esc(dishName(state.replyLanguage, dish(x.id)))}">×</button></li>`).join('')}</ul><div class="proposal-actions"><strong>${money(total(state.proposal))}</strong><button type="button" data-chat="Another suggestion" class="text-button">${esc(T('another'))}</button><button type="button" id="cheaper-proposal" class="text-button">${esc(T('cheaper'))}</button><button type="button" id="edit-preferences" class="text-button">${esc(T('edit'))}</button><button type="button" id="dismiss-proposal" class="text-button">${esc(T('dismiss'))}</button><button type="button" id="accept-proposal" class="primary small">${esc(T('add'))}</button></div></div>` : ''}
        <div class="chat-bottom">
          <div class="suggestions">
            <button type="button" id="start-planner">${esc(T('recommend'))}</button>
            <button type="button" data-chat="Another suggestion">${esc(T('another'))}</button>
            <button type="button" data-chat="Review my cart">${esc(T('review'))}</button>
          </div>
          <form id="chat-form">
            <label class="sr-only" for="message">Message Ah Hua</label>
            <input id="message" maxlength="500" placeholder="${esc(localReply('placeholder'))}" value="${esc(draft)}">
            <button class="send" type="submit" aria-label="Send message">↑</button>
          </form>
          <div class="voice-controls">
            <button type="button" id="mic" class="voice-button" ${SpeechRecognition && window.isSecureContext ? '' : 'disabled'} aria-pressed="false">🎙 Speak</button>
            <span id="voice-status"></span>
          </div>
          <details class="voice-privacy">
            <summary>About voice & this demo</summary>
            <p>Your browser may send audio to its speech provider. Ah Hua stores no recordings. Spoken replies use your device’s available voices. This is a limited, rule-based menu assistant; no AI service is connected. Allergy and dietary details need staff confirmation.</p>
          </details>
        </div>
      </section>

      <section class="menu-section">
        <div class="section-top">
          <div>
            <div class="eyebrow">NAN HWA CHONG HERITAGE · 南华昌传统鱼头炉与煮炒</div>
            <h2>Authentic Teochew charcoal steamboat & zi char.</h2>
          </div>
          <span class="sample-label">100+ Authentic Dishes & Real Photos</span>
        </div>
        <search class="menu-tools sticky-categories" aria-label="Filter and search menu">
          <div class="categories" aria-label="Menu category">
            ${[
              'All dishes',
              'Steamboat',
              'Specialty',
              'Crayfish & Seafood',
              'Chicken & Pork',
              'Egg & Tofu',
              'Vegetables',
              'Rice & Noodles',
              'Soup',
              'Drinks & Tea'
            ].map(c => `<button type="button" data-category="${c}" aria-pressed="${category === c}" class="category-pill ${category === c ? 'active' : ''}">${esc(categoryName(state.replyLanguage, c))}</button>`).join('')}
          </div>
          <div class="filter-search-row">
            <div class="dietary-filters" aria-label="Quick menu filters">
              ${[
                ['all', esc(T('filterAll'))],
                ['signatures', esc(T('filterSignatures'))],
                ['mild', esc(T('filterMild'))],
                ['nopork', esc(T('filterNoPork'))]
              ].map(([id, label]) => `<button type="button" class="filter-pill ${menuFilter === id ? 'active' : ''}" data-filter="${id}" aria-pressed="${menuFilter === id}">${label}</button>`).join('')}
            </div>
            <div class="search-wrap">
              <input id="search" type="search" aria-label="Search dishes" placeholder="${state.replyLanguage === 'zh' ? '搜索菜品或拼音…' : 'Search dishes or 中文…'}" value="${esc(search)}">
              ${search ? `<button type="button" id="clear-search" class="clear-search-btn" aria-label="Clear search">×</button>` : ''}
            </div>
          </div>
        </search>
        <div class="menu-grid">
          ${shown.map(d => {
            const soldOut = state.unavailable.includes(d.id);
            const inCartQty = state.cart.filter(x => x.id === d.id).reduce((n, x) => n + x.qty, 0);
            const tableOrders = state.orders.filter(o => o.table === table);
            const tableOrderedQty = tableOrders.flatMap(o => o.items.filter(x => x.id === d.id)).reduce((n, x) => n + x.qty, 0);
            const scarcityBadge = SCARCITY_BADGES[d.id];
            return `<article class="dish-card ${soldOut ? 'sold-out' : ''} ${inCartQty ? 'in-cart' : ''}">
              <div class="dish-art ${d.id} ${d.image ? 'has-photo' : ''}">
                ${d.image ? `<img class="dish-photo" src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy">` : `<span>${d.icon}</span>`}
                <div class="dish-badges-overlay">
                  ${(d.popularity || 0) >= 95 ? `<span class="dish-badge bestseller" title="Top table favourite">👑 Top Pick</span>` : d.tag ? `<span class="dish-badge tag">${esc(d.tag)}</span>` : ''}
                  ${scarcityBadge ? `<span class="dish-badge scarcity" title="Real-time table demand">${scarcityBadge}</span>` : ''}
                  ${d.spicyLevel === 1 ? `<span class="dish-badge spice-mild" title="Mild spicy">🌶️ Mild</span>` : d.spicyLevel >= 2 ? `<span class="dish-badge spice-hot" title="Spicy heat">🌶️🌶️ Spicy</span>` : ''}
                  ${d.category === 'Steamboat' && !['grouper', 'pomfret', 'snapper', 'song-fish-head'].includes(d.id) ? `<span class="dish-badge steamboat-side" title="Add to steamboat broth">🍲 Pot Side</span>` : ''}
                  ${tableOrderedQty ? `<span class="dish-badge prev-ordered" title="Already ordered by Table ${table}">✓ ${tableOrderedQty} ${esc(T('orderedBadge'))}</span>` : ''}
                </div>
                ${inCartQty ? `<b class="in-cart-badge">${inCartQty} in cart</b>` : ''}
              </div>
              <div class="dish-info">
                <div class="dish-meta-row">
                  <small>${d.cn}</small>
                  <span class="dish-category-tag">${esc(d.category)}</span>
                </div>
                ${tableOrderedQty ? `<div class="ordered-table-indicator" role="status">✓ Table ${table} already ordered ${tableOrderedQty} in earlier round</div>` : ''}
                <h3>${esc(dishName(state.replyLanguage, d))}</h3>
                <p>${esc(d.desc)}</p>
                ${d.modifiers?.length ? `<div class="modifier-preview">${d.modifiers.slice(0, 2).map(m => `<span>${esc(m)}</span>`).join('')}</div>` : ''}
                <div class="dish-bottom">
                  <strong>${money(d.price)} <small>${d.singleSize ? (d.id === 'rice' ? '/ bowl' : '') : 'from'}</small></strong>
                  <div class="dish-card-actions">
                    ${!soldOut ? (inCartQty > 0 ? `
                      <div class="card-stepper" aria-label="Quantity of ${esc(d.name)} in cart">
                        <button type="button" class="card-stepper-btn minus" data-card-qty="${d.id}" data-delta="-1" aria-label="Decrease ${esc(d.name)}">−</button>
                        <span class="card-stepper-val" aria-live="polite">${inCartQty}</span>
                        <button type="button" class="card-stepper-btn plus" data-card-qty="${d.id}" data-delta="1" aria-label="Increase ${esc(d.name)}" ${inCartQty >= 20 ? 'disabled' : ''}>+</button>
                      </div>
                      <button type="button" class="card-customise-btn" data-dish="${d.id}" aria-label="Customise flavours or size for ${esc(d.name)}" title="Options">⚙️</button>
                    ` : `
                      <button type="button" class="quick-add-btn" data-quick-add="${d.id}" aria-label="Quick add 1 ${esc(d.name)}">+1 Add</button>
                      <button type="button" class="add-dish" data-dish="${d.id}" aria-label="Customise ${esc(d.name)}">+</button>
                    `) : `<span class="sold-out-pill">Sold out</span>`}
                  </div>
                </div>
              </div>
            </article>`;
          }).join('') || '<p class="empty">No dishes match. Try another search or filter.</p>'}
        </div>
        <p class="menu-footnote">All prices, portions, recipes and allergen notes are illustrative and unverified. No real GST or service charge is billed in this demo.</p>
      </section>
    </div>
    ${cart(summary)}
  </div>
  <aside class="ah-hua-floating-dock" id="ah-hua-dock" aria-label="Ah Hua Assistant">
    <button type="button" class="dock-avatar-btn" id="dock-avatar-trigger" aria-label="Open Ah Hua Concierge">
      <div class="dock-avatar-circle">
        <span class="dock-avatar-emoji">👨‍🍳</span>
        <span class="dock-online-dot"></span>
      </div>
      <div class="dock-speech-bubble" id="dock-speech-text">
        <span>${esc(dockSpeechText)}</span>
      </div>
    </button>
  </aside>`;
}

function cart(summary) {
  const orders = state.orders.filter(x => x.table === table).slice().reverse();
  const nextRound = summary.rounds + 1;
  return `<aside class="cart-column" id="table-cart">
    <section class="cart-card">
      <div class="cart-title">
        <div>
          <div class="eyebrow">TABLE ${table} · ${esc(T('round').toUpperCase())} ${nextRound}</div>
          <h2>Your table order</h2>
        </div>
        <span class="cart-count">${count()}</span>
      </div>
      <div class="cart-body">
        ${state.cart.length ? state.cart.map((x, i) => `<div class="cart-line">
          <div>
            <h3>${esc(x.name)}</h3>
            <p>${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''}</p>
            <small>${money(x.unitPrice)} each</small>
            <div><span class="cart-guest-tag">${x.guestEmoji || currentGuest.emoji || '👤'} ${esc(x.addedBy || currentGuest.name)}</span></div>
          </div>
          <div class="cart-line-end">
            <strong>${money(x.qty * x.unitPrice)}</strong>
            <div class="quantity">
              <button type="button" data-qty="${i}" data-delta="-1" aria-label="Decrease ${esc(x.name)}">−</button>
              <span>${x.qty}</span>
              <button type="button" data-qty="${i}" data-delta="1" aria-label="Increase ${esc(x.name)}" ${x.qty >= 20 ? 'disabled' : ''}>+</button>
            </div>
          </div>
        </div>`).join('') : `<div class="cart-empty">
          <div>🥢</div>
          <h3>${summary.rounds ? `Ready for Round ${nextRound}?` : 'A good meal starts here.'}</h3>
          <p>${summary.rounds ? 'Add extra rice, steamboat sides or drinks anytime during your meal.' : 'Add a favourite from the menu,<br>or let Ah Hua help you choose.'}</p>
        </div>`}
      </div>
      ${state.cart.length ? `<div class="cart-upsell">
        <span>Complete the table:</span>
        <div class="upsell-chips">
          ${!state.unavailable.includes('rice') ? `<button type="button" data-quick-add="rice">+1 Rice (${money(150)})</button>` : ''}
          ${!state.unavailable.includes('tea') ? `<button type="button" data-quick-add="tea">+Pu’er Tea (${money(400)})</button>` : ''}
          ${!state.unavailable.includes('yam') ? `<button type="button" data-quick-add="yam">+Crispy Yam (${money(800)})</button>` : ''}
        </div>
      </div>` : ''}
      <div class="cart-summary">
        <div><span>Round ${nextRound} subtotal</span><strong>${money(total(state.cart))}</strong></div>
        <p>Staff review every round before the kitchen starts.</p>
        <button type="button" id="submit-order" class="primary wide" ${state.cart.length ? '' : 'disabled'}>Send to staff <span>→</span></button>
        <small class="safe-note">◇ Demo only. No payment required.</small>
      </div>
    </section>

    <div class="how-it-works">
      <span>01 <b>Choose together</b></span>
      <span>02 <b>Staff approves</b></span>
      <span>03 <b>Kitchen prepares</b></span>
    </div>

    ${orders.length ? `<section class="tracking">
      <div class="tracking-head">
        <div>
          <div class="eyebrow">FROM YOUR TABLE · ${summary.rounds} ${summary.rounds === 1 ? 'ROUND' : 'ROUNDS'}</div>
          <h2>Your orders</h2>
        </div>
        <button type="button" class="secondary small" data-open-bill>🧾 Split bill</button>
      </div>
      <div class="table-tab-summary">
        <div>
          <span>Running table subtotal (${summary.itemCount} items)</span>
          <strong>${money(summary.subtotal)}</strong>
        </div>
        <div class="split-inline">
          <label for="inline-split-pax">${esc(T('splitBy'))}:</label>
          <select id="inline-split-pax" aria-label="Number of diners to split bill">
            ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${splitPax === i + 1 ? 'selected' : ''}>${i + 1} pax</option>`).join('')}
          </select>
          <strong>${money(summary.subtotalPerPax)} <small>${esc(T('perPerson'))}</small></strong>
        </div>
      </div>
      ${orders.map(o => `<article class="tracking-order">
        <div>
          <b>${o.id} ${o.round ? `<small class="round-pill">Round ${o.round}</small>` : ''}</b>
          ${badge(o.status)}
        </div>
        <p>${o.items.reduce((n, x) => n + x.qty, 0)} items · ${money(total(o.items))} · <small>${relativeTime(o.created)}</small></p>
        <ul class="tracking-items-mini">${orderLines(o, false)}</ul>
        ${o.status === 'rejected'
          ? `<p class="reason">${esc(o.reason)}</p>`
          : `<div class="progress-track">${['pending', 'approved', 'preparing', 'ready', 'served'].map((s, i) => `<span class="${['pending', 'approved', 'preparing', 'ready', 'served'].indexOf(o.status) >= i ? 'done' : ''}" title="${statusLabel[s]}"></span>`).join('')}</div>`}
        ${o.status === 'served'
          ? (o.paid
            ? '<p class="receipt">Demo receipt · Amount charged S$0.00</p>'
            : `<button type="button" class="secondary wide" data-receipt="${o.id}">Simulate receipt · No charge</button>`)
          : ''}
      </article>`).join('')}
    </section>` : ''}
  </aside>`;
}

function staff() {
  const pendingCount = state.orders.filter(x => x.status === 'pending').length;
  const filteredOrders = state.orders
    .filter(o => staffTableFilter === 'all' || o.table === staffTableFilter)
    .slice()
    .reverse();

  return `<section class="ops-header">
    <div>
      <div class="eyebrow">A LITTLE HUMAN TOUCH</div>
      <h1>The service desk.</h1>
      <p>Monitor all 20 tables, respond to soup/tea requests, and review each order before it enters the kitchen.</p>
    </div>
    <span class="ops-badge">STAFF SIMULATION · No sign-in needed</span>
  </section>

  <section class="floor-map-panel" aria-label="Restaurant floor map">
    <div class="section-top">
      <div>
        <div class="eyebrow">LIVE FLOOR OVERVIEW · 20 TABLES</div>
        <h2>Dining room floor map</h2>
      </div>
      <div class="floor-legend">
        <span><i class="legend-dot idle"></i> Idle</span>
        <span><i class="legend-dot pending"></i> Needs approval</span>
        <span><i class="legend-dot call"></i> Calling server</span>
        <span><i class="legend-dot dining"></i> Dining</span>
        ${staffTableFilter !== 'all' ? `<button type="button" class="secondary small" data-floor-table="all">Show all tables</button>` : ''}
      </div>
    </div>
    <div class="floor-grid">
      ${Array.from({ length: 20 }, (_, idx) => {
        const tNum = String(idx + 1).padStart(2, '0');
        const tOrders = state.orders.filter(o => o.table === tNum && o.status !== 'rejected');
        const hasPending = tOrders.some(o => o.status === 'pending');
        const openCalls = state.calls.filter(c => c.table === tNum && !c.done);
        const tabSubtotal = tOrders.reduce((s, o) => s + total(o.items), 0);
        const stateClass = openCalls.length ? 'call' : hasPending ? 'pending' : tOrders.length ? 'dining' : 'idle';
        const callIcon = openCalls.length ? (serviceTypes[openCalls[0].type || 'assistance']?.icon || '♧') : '';
        return `<div class="floor-table-card ${stateClass} ${staffTableFilter === tNum ? 'selected' : ''}">
          <button type="button" class="floor-table-select" data-floor-table="${tNum}">
            <div class="floor-table-top">
              <strong>T-${tNum}</strong>
              ${callIcon ? `<span class="floor-alert" title="Open service request">${callIcon}</span>` : hasPending ? '<span class="floor-alert">!</span>' : ''}
            </div>
            <small>${openCalls.length ? `${openCalls.length} request` : hasPending ? 'Approval waiting' : tOrders.length ? `${money(tabSubtotal)}` : 'Available'}</small>
          </button>
          <button type="button" class="floor-qr-btn" data-open-qr="${tNum}" aria-label="Table ${tNum} QR and switch">QR</button>
        </div>`;
      }).join('')}
    </div>
  </section>

  <div class="ops-grid">
    <section>
      <div class="section-top">
        <h2>Order approvals ${staffTableFilter !== 'all' ? `(Table ${staffTableFilter})` : ''}</h2>
        <span>${pendingCount} waiting</span>
      </div>
      ${filteredOrders.map(o => `<article class="order-card">
        <div class="order-top">
          <div>
            <small>TABLE ${o.table} ${o.round ? `· ROUND ${o.round}` : ''} · ${relativeTime(o.created)}</small>
            <h2>${o.id}</h2>
          </div>
          ${badge(o.status)}
        </div>
        <ul class="order-lines">${orderLines(o)}</ul>
        <div class="order-total">Sample subtotal <strong>${money(total(o.items))}</strong></div>
        ${o.status === 'pending' ? `
          <label class="staff-check"><input type="checkbox" data-reviewed="${o.id}"> I reviewed sample dishes, notes and prices</label>
          <label class="reason-label">Reason if declining<input data-reason="${o.id}" maxlength="160" placeholder="e.g. The kitchen has run out of grouper"></label>
          <div class="button-row">
            <button type="button" class="secondary" data-status="rejected" data-order="${o.id}">Decline order</button>
            <button type="button" class="primary" data-status="approved" data-order="${o.id}">Approve for kitchen →</button>
          </div>` : o.reason ? `<p>${esc(o.reason)}</p>` : ''}
      </article>`).join('') || '<div class="empty-card">No orders waiting.<p>Switch to Customer, add a dish and send it here.</p></div>'}
    </section>
    <aside>
      <section class="ops-panel">
        <h2>Server requests</h2>
        ${state.calls.filter(x => !x.done).map(c => {
          const st = serviceTypes[c.type || 'assistance'] || serviceTypes.assistance;
          return `<div class="request">
            <span>${st.icon} Table ${c.table}<small>${esc(c.label || 'Customer would like assistance')}</small></span>
            <button type="button" class="secondary" data-resolve="${c.id}">Acknowledge</button>
          </div>`;
        }).join('') || '<p>No open requests. All tables are happy.</p>'}
      </section>
      <section class="ops-panel">
        <h2>Menu availability</h2>
        <p>Try marking a dish sold out. The menu and approvals will reflect the change immediately.</p>
        ${menu.map(d => `<label class="availability"><span>${esc(d.name)} <small style="color:#859075">(${d.cn})</small></span><input type="checkbox" data-availability="${d.id}" ${state.unavailable.includes(d.id) ? '' : 'checked'} aria-label="${esc(d.name)} available"></label>`).join('')}
      </section>
      <p class="ops-note">These controls affect this demo restaurant only. There is no staff authentication, external POS connection or real payment processing.</p>
    </aside>
  </div>`;
}

function kitchen() {
  const active = state.orders.filter(x => ['approved', 'preparing', 'ready'].includes(x.status));
  const activeItems = active.flatMap(o => o.items);
  const steamboatCount = activeItems.filter(x => dish(x.id)?.category === 'Steamboat' && x.id !== 'yam').reduce((n, x) => n + x.qty, 0);
  const wokCount = activeItems.filter(x => ['Favourites', 'Greens & sides'].includes(dish(x.id)?.category) && x.id !== 'rice').reduce((n, x) => n + x.qty, 0);
  const riceCount = activeItems.filter(x => x.id === 'rice').reduce((n, x) => n + x.qty, 0);
  const drinkCount = activeItems.filter(x => dish(x.id)?.category === 'Drinks & Tea').reduce((n, x) => n + x.qty, 0);

  return `<section class="ops-header">
    <div>
      <div class="eyebrow">GOOD THINGS TAKE A LITTLE TIME</div>
      <h1>Behind the pass.</h1>
      <p>Approved orders, a warm charcoal wok, and dish-by-dish plating check-offs.</p>
    </div>
    <span class="ops-badge">KITCHEN SIMULATION</span>
  </section>

  <section class="kds-summary-bar" aria-label="Active kitchen production totals">
    <div class="kds-stat"><span>🍲 Steamboat pots</span><strong>${steamboatCount}</strong></div>
    <div class="kds-stat"><span>🔥 Wok & sides</span><strong>${wokCount}</strong></div>
    <div class="kds-stat"><span>🍚 Steamed rice</span><strong>${riceCount}</strong></div>
    <div class="kds-stat"><span>🍵 Tea & drinks</span><strong>${drinkCount}</strong></div>
  </section>

  <div class="kitchen-board">
    ${['approved', 'preparing', 'ready'].map(s => `<section class="kitchen-lane">
      <h2>
        <span class="lane-dot ${s}"></span>
        ${{ approved: 'On the board', preparing: 'In the kitchen', ready: 'Ready to serve' }[s]}
        <small>${active.filter(o => o.status === s).length}</small>
      </h2>
      ${active.filter(o => o.status === s).map(o => {
        const checkedCount = Array.isArray(o.checkedItems) ? o.checkedItems.length : 0;
        const pct = o.items.length ? Math.round((checkedCount / o.items.length) * 100) : 0;
        return `<article class="kitchen-ticket" style="--prep-progress: ${pct}%">
          <div class="order-top">
            <div>
              <small>TABLE ${o.table} ${o.round ? `· ROUND ${o.round}` : ''} · ${relativeTime(o.created)}</small>
              <h2>${o.id}</h2>
            </div>
            <span class="ticket-symbol" title="${checkedCount}/${o.items.length} dishes plated">${checkedCount === o.items.length && o.items.length ? '✓' : '✧'}</span>
          </div>
          <div class="ticket-progress-bar" title="${checkedCount} of ${o.items.length} plated"><span></span></div>
          <p class="kds-hint">Tap dishes below as they are plated at the pass:</p>
          <ul class="order-lines">${orderLines(o, true)}</ul>
          <button type="button" class="${s === 'ready' ? 'secondary' : 'primary'} wide" data-status="${{ approved: 'preparing', preparing: 'ready', ready: 'served' }[s]}" data-order="${o.id}">
            ${{ approved: 'Start cooking', preparing: 'Mark ready', ready: 'Mark served' }[s]} →
          </button>
        </article>`;
      }).join('') || '<div class="lane-empty">Nothing here just yet.</div>'}
    </section>`).join('')}
  </div>
  <p class="menu-footnote">Tickets move manually in this simulation. Pending and declined orders never enter the kitchen.</p>`;
}

function bindCustomer() {
  $('#chat-form').onsubmit = e => { e.preventDefault(); send($('#message').value); };
  $('#message').oninput = e => { draft = e.target.value; };
  $('#table').onchange = e => {
    table = e.target.value;
    const url = new URL(location.href);
    url.searchParams.set('table', table);
    history.replaceState(null, '', url);
    render();
  };
  $('#mic').onclick = startVoice;
  const switchLanguage = (newLang) => act(() => {
    draft = $('#message')?.value || '';
    stopVoice();
    state.replyLanguage = normaliseLanguage(newLang);
    const url = new URL(location.href);
    url.searchParams.set('lang', state.replyLanguage);
    history.replaceState(null, '', url);
    reply(localReply('switched'));
    state.messages = state.messages.slice(-80);
  });
  $('#top-language-select')?.addEventListener('change', e => switchLanguage(e.target.value));
  $('#speaker').onclick = () => {
    speaking = !speaking;
    updateSpeaker();
    if (speaking) speak(localReply('voiceEnabled')); else voicePlayer.stop();
  };
  $('#stop-playback').onclick = () => voicePlayer.stop();
  $('#ah-hua-avatar').onclick = () => {
    if (!speechSupported) { toast('Voice isn’t available in this browser. Chat with me below.'); return; }
    speaking = true;
    updateSpeaker();
    const message = state.messages.findLast(m => m.role === 'host');
    speak(message?.text || localReply('welcome'), message?.language || null);
  };
  document.querySelectorAll('[data-replay]').forEach(b => b.onclick = () => {
    const m = state.messages[+b.dataset.replay];
    speak(m.text, m.language || null);
  });
  document.querySelectorAll('[data-chat]').forEach(b => b.onclick = () => send(b.dataset.chat, b.textContent.trim()));
  bindPlanner();

  document.querySelectorAll('[data-service]').forEach(b => b.onclick = () => act(() => {
    const entry = requestService(state, table, b.dataset.service);
    toast(`${entry.label} requested for Table ${table}.`);
  }));
  document.querySelectorAll('[data-service-more]').forEach(b => b.onclick = () => openServiceModal());
  document.querySelectorAll('[data-open-bill]').forEach(b => b.onclick = () => openBillDialog());
  $('#open-steamboat-guide')?.addEventListener('click', () => openSteamboatGuide());
  $('#open-mobile-cart')?.addEventListener('click', () => openMobileCart());

  document.querySelectorAll('[data-category]').forEach(b => b.onclick = () => {
    draft = $('#message').value;
    category = b.dataset.category;
    render();
  });
  document.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => {
    draft = $('#message').value;
    menuFilter = b.dataset.filter;
    render();
  });
  $('#search').oninput = e => {
    const start = e.target.selectionStart ?? e.target.value.length;
    search = e.target.value;
    render();
    const input = $('#search');
    input?.focus();
    try { input?.setSelectionRange(start, start); } catch {}
  };
  $('#clear-search')?.addEventListener('click', () => {
    search = '';
    render();
    $('#search')?.focus();
  });
  document.querySelectorAll('[data-quick-add]').forEach(b => b.onclick = () => act(() => {
    const d = dish(b.dataset.quickAdd);
    const isDuplicate = state.cart.some(y => y.id === d.id) || state.orders.some(o => o.table === table && o.items.some(y => y.id === d.id));
    if (isDuplicate) {
      dockSpeechText = `Eh! Someone at Table ${table} already added ${d.name}! Another portion or sharing?`;
      toast(`⚠️ Duplicate notice: ${d.name} already in Table ${table}'s order.`);
    }
    const newLine = makeLine(d.id, 1, 'Regular', state.preference);
    newLine.addedBy = currentGuest.name;
    newLine.guestEmoji = currentGuest.emoji;
    addLines(state, [newLine]);
    updateDockSpeech();
    toast(`${currentGuest.emoji} ${currentGuest.name} added ${d.name} to shared cart.`);
  }));
  document.querySelectorAll('[data-card-qty]').forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    const id = b.dataset.cardQty;
    const delta = +b.dataset.delta;
    act(() => {
      if (delta > 0) {
        const newLine = makeLine(id, 1, 'Regular', state.preference);
        newLine.addedBy = currentGuest.name;
        newLine.guestEmoji = currentGuest.emoji;
        addLines(state, [newLine]);
        toast(`Added 1 ${dish(id).name} to cart.`);
      } else {
        const targetIdx = state.cart.map(x => x.id).lastIndexOf(id);
        if (targetIdx >= 0) {
          state.cart[targetIdx].qty--;
          if (state.cart[targetIdx].qty <= 0) state.cart.splice(targetIdx, 1);
          toast(`Removed 1 ${dish(id).name} from cart.`);
        }
      }
      updateDockSpeech();
    });
  });
  document.querySelectorAll('[data-dish]').forEach(b => b.onclick = () => openDish(b.dataset.dish));
  document.querySelectorAll('[data-qty]').forEach(b => b.onclick = () => act(() => {
    const line = state.cart[+b.dataset.qty];
    line.qty += +b.dataset.delta;
    if (line.qty <= 0) state.cart.splice(+b.dataset.qty, 1);
    updateDockSpeech();
  }));
  $('#accept-proposal')?.addEventListener('click', () => act(() => {
    addLines(state, state.proposal);
    state.proposal = [];
    reply(localReply('added'));
    updateDockSpeech();
    toast('Suggestion added to your shared cart.');
  }));
  document.querySelectorAll('[data-remove-proposal]').forEach(b => b.onclick = () => act(() => {
    state.proposal.splice(+b.dataset.removeProposal, 1);
  }));
  $('#cheaper-proposal')?.addEventListener('click', () => {
    const price = total(state.proposal);
    state.recommendationContext = {
      ...state.recommendationContext,
      budget: Math.max(0, Math.floor(Math.min(price, state.recommendationContext?.budget ?? price) * 0.85 / 100) * 100)
    };
    send('Another suggestion', T('cheaper'));
  });
  $('#edit-preferences')?.addEventListener('click', () => {
    plannerOpen = true;
    $('#meal-planner').open = true;
    $('#planner-pax').focus();
  });
  $('#dismiss-proposal')?.addEventListener('click', () => act(() => { state.proposal = []; }));
  if ($('#submit-order')) {
    $('#submit-order').onclick = handleOrderSubmit;
  }
  $('#switch-to-stage-btn')?.addEventListener('click', () => {
    customerGear = 'stage';
    render();
  });
  $('#stage-back-to-menu-btn')?.addEventListener('click', () => {
    customerGear = 'dock';
    render();
  });
  $('#stage-bottom-menu-btn')?.addEventListener('click', () => {
    customerGear = 'dock';
    render();
  });
  $('#dock-avatar-trigger')?.addEventListener('click', () => {
    openAhHuaDialog();
  });
  document.querySelectorAll('[data-stage-chip]').forEach(b => {
    b.onclick = () => handleLoreChip(b.dataset.stageChip);
  });
  document.querySelectorAll('[data-quick-service]').forEach(b => {
    b.onclick = () => act(() => {
      const entry = requestService(state, table, b.dataset.quickService);
      toast(`${entry.label} requested for Table ${table}. Floor staff notified!`);
    });
  });
  document.querySelectorAll('[data-story-tab]').forEach(b => {
    b.onclick = () => {
      activeStoryIndex = +b.dataset.storyTab;
      renderStoryCard();
    };
  });
  $('#story-prev-btn')?.addEventListener('click', () => {
    activeStoryIndex = (activeStoryIndex - 1 + STORY_CARDS.length) % STORY_CARDS.length;
    renderStoryCard();
  });
  $('#story-next-btn')?.addEventListener('click', () => {
    activeStoryIndex = (activeStoryIndex + 1) % STORY_CARDS.length;
    renderStoryCard();
  });
  $('#inline-split-pax')?.addEventListener('change', e => {
    splitPax = Number(e.target.value) || 4;
    render();
  });
  document.querySelectorAll('[data-receipt]').forEach(b => b.onclick = () => act(() => {
    const o = state.orders.find(x => x.id === b.dataset.receipt);
    if (o && o.status === 'served') o.paid = true;
    toast('Simulated receipt created. Amount charged: S$0.00.');
  }));
  const log = $('.chat-log');
  if (log) log.scrollTop = log.scrollHeight;
  updateVoice();
  updateSpeaker();
}

function openDish(id) {
  const d = dish(id);
  const dialog = $('#dish-dialog');
  const selectedMods = new Set();

  const allModifiers = [
    ...POPULAR_MODIFIERS.map(m => m.label),
    ...(d.modifiers || [])
  ];
  const uniqueMods = [...new Set(allModifiers)];

  dialog.innerHTML = `<form id="dish-form">
    <div class="dialog-top">
      <span class="eyebrow">FOR YOUR TABLE · ${esc(d.category.toUpperCase())}</span>
      <button type="button" class="close-dialog" aria-label="Close dish details">×</button>
    </div>
    <div class="dialog-art ${d.image ? 'has-photo' : ''}">
      ${d.image ? `<img class="dialog-photo" src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy">` : `<span>${d.icon}</span>`}
    </div>
    <small>${d.cn}</small>
    <h2 id="dish-dialog-title">${esc(d.name)}</h2>
    <p>${esc(d.desc)}</p>
    <div class="allergen-note"><b>Sample allergens:</b> ${esc(d.allergens)}. Recipe unverified. For allergies, call a server; no safety guarantee.</div>
    <div class="dish-options">
      <label>Portion
        <select name="size" id="dish-size-select">
          <option value="Regular" data-price="${d.price}">Regular · ${money(d.price)}</option>
          ${!d.singleSize ? `<option value="Large" data-price="${d.price + 800}">Large · ${money(d.price + 800)}</option>` : ''}
        </select>
        <small>${d.category === 'Steamboat' ? 'Sample sharing portion; ask staff to confirm.' : 'Sample portion; ask staff to confirm.'}</small>
      </label>
      <label>Quantity
        <div class="modal-stepper">
          <button type="button" id="modal-qty-minus" aria-label="Decrease quantity">−</button>
          <input name="qty" id="modal-qty-input" type="number" min="1" max="20" value="1" readonly required>
          <button type="button" id="modal-qty-plus" aria-label="Increase quantity">+</button>
        </div>
      </label>
    </div>
    <div class="modifier-group">
      <span class="modifier-label">1-Tap Modifiers (Zero typing required):</span>
      <div class="modifier-chips">
        ${uniqueMods.map(mod => `<button type="button" class="mod-chip" data-mod="${esc(mod)}" aria-pressed="false">${esc(mod)}</button>`).join('')}
      </div>
    </div>
    <details class="custom-note-details">
      <summary>Other special request for kitchen? (optional)</summary>
      <textarea name="notes" maxlength="160" placeholder="e.g. sauce on side, less salty">${esc(state.preference)}</textarea>
    </details>
    <p class="muted">Requests need staff confirmation.</p>
    <button class="primary wide" id="modal-add-btn" type="submit">Add to shared cart · <span id="modal-price-calc">${money(d.price)}</span> +</button>
  </form>`;

  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  const sizeSelect = dialog.querySelector('#dish-size-select');
  const qtyInput = dialog.querySelector('#modal-qty-input');
  const minusBtn = dialog.querySelector('#modal-qty-minus');
  const plusBtn = dialog.querySelector('#modal-qty-plus');
  const priceCalc = dialog.querySelector('#modal-price-calc');

  function updateCalc() {
    const basePrice = d.price + (sizeSelect?.value === 'Large' ? 800 : 0);
    const q = Number(qtyInput?.value) || 1;
    if (priceCalc) priceCalc.textContent = money(basePrice * q);
  }

  sizeSelect?.addEventListener('change', updateCalc);
  minusBtn?.addEventListener('click', () => {
    let val = Number(qtyInput.value) || 1;
    if (val > 1) { qtyInput.value = val - 1; updateCalc(); }
  });
  plusBtn?.addEventListener('click', () => {
    let val = Number(qtyInput.value) || 1;
    if (val < 20) { qtyInput.value = val + 1; updateCalc(); }
  });
  dialog.querySelectorAll('[data-mod]').forEach(chip => {
    chip.onclick = () => {
      const mod = chip.dataset.mod;
      if (selectedMods.has(mod)) selectedMods.delete(mod); else selectedMods.add(mod);
      chip.setAttribute('aria-pressed', String(selectedMods.has(mod)));
      chip.classList.toggle('active', selectedMods.has(mod));
    };
  });
  $('#dish-form').onsubmit = e => {
    e.preventDefault();
    const form = new FormData(e.target);
    const qty = Number(form.get('qty'));
    const size = form.get('size');
    const customNote = String(form.get('notes') || '').trim();
    const combinedNotes = [...selectedMods, ...(customNote ? [customNote] : [])].join(', ');
    if (!Number.isInteger(qty) || qty < 1) return;

    const isDuplicate = state.cart.some(y => y.id === id) || state.orders.some(o => o.table === table && o.items.some(y => y.id === id));
    if (isDuplicate) {
      dockSpeechText = `Eh! Someone at Table ${table} already added ${d.name}! Another portion or sharing?`;
      toast(`⚠️ Duplicate notice: ${d.name} already in Table ${table}'s order.`);
    }

    const existing = state.cart.find(y => y.id === id && y.size === size && y.notes === combinedNotes);
    try {
      if (existing) {
        if (qty > 20) throw Error('Maximum 20 of each dish.');
        existing.qty = qty;
      } else {
        const newLine = makeLine(id, qty, size, combinedNotes);
        newLine.addedBy = currentGuest.name;
        newLine.guestEmoji = currentGuest.emoji;
        addLines(state, [newLine]);
      }
      save();
      updateDockSpeech();
      closeTopLayer(dialog);
      render();
      toast(existing ? `Updated ${d.name} (${qty}) in cart.` : `${currentGuest.emoji} Added ${d.name} to shared cart.`);
    } catch (error) {
      toast(error.message);
    }
  };
}

function openBillDialog() {
  const dialog = $('#bill-dialog');
  const renderBillContent = () => {
    const summary = tableSummary(state, table, splitPax);
    dialog.innerHTML = `<div class="bill-modal-body">
      <div class="dialog-top">
        <span class="eyebrow">HERITAGE TABLE CHECK · 模拟账单</span>
        <button type="button" class="close-dialog" aria-label="Close bill summary">×</button>
      </div>
      <h2 id="bill-dialog-title">Table ${table} · Running Bill</h2>
      <p>All active rounds combined for your table. Amount charged in this demo is always <b>S$0.00</b>.</p>
      ${summary.activeOrders.length ? `
        <div class="bill-rounds-list">
          ${summary.activeOrders.map(o => `<div class="bill-round-block">
            <div class="bill-round-head">
              <strong>Round ${o.round || 1} (${o.id})</strong>
              ${badge(o.status)}
            </div>
            <ul>
              ${o.items.map(x => `<li><span>${x.qty} × ${esc(x.name)} <small>(${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''})</small></span><strong>${money(x.qty * x.unitPrice)}</strong></li>`).join('')}
            </ul>
          </div>`).join('')}
        </div>
        <div class="bill-totals-box">
          <div><span>Sample dishes subtotal (${summary.itemCount} items)</span><strong>${money(summary.subtotal)}</strong></div>
          <div class="muted-line"><span>Illustrative 10% service charge (not billed)</span><span>${money(summary.serviceCharge)}</span></div>
          <div class="muted-line"><span>Illustrative 9% GST (not billed)</span><span>${money(summary.gst)}</span></div>
          <div class="muted-line"><span>Illustrative grand total</span><span>${money(summary.grandTotal)}</span></div>
          <div class="charged-line"><span>Actual demo amount charged</span><strong>S$0.00</strong></div>
        </div>
        <div class="bill-split-box">
          <div class="split-controls">
            <span class="split-label">${esc(T('splitBy'))}</span>
            <div class="split-stepper">
              <button type="button" id="split-pax-minus" aria-label="Decrease diners">−</button>
              <span id="split-pax-count">${splitPax} diners</span>
              <button type="button" id="split-pax-plus" aria-label="Increase diners" ${splitPax >= 20 ? 'disabled' : ''}>+</button>
            </div>
            <label for="modal-split-pax" class="sr-only">${esc(T('splitBy'))}</label>
            <select id="modal-split-pax" class="sr-only">
              ${Array.from({ length: 20 }, (_, i) => `<option value="${i + 1}" ${splitPax === i + 1 ? 'selected' : ''}>${i + 1} diners</option>`).join('')}
            </select>
          </div>
          <div class="split-result">
            <span>Sample dish share: <b>${money(summary.subtotalPerPax)}</b> / pax</span>
            <small>With illustrative SC & GST: ${money(summary.grandTotalPerPax)} / pax</small>
          </div>
        </div>
        <div class="sgqr-standee-card">
          <div class="sgqr-header-strip">
            <span class="sgqr-brand-tag">SGQR · PAYNOW</span>
            <span class="sgqr-paynow-emblem">PayNow</span>
          </div>
          <div class="sgqr-body-view">
            <div class="sgqr-qr-wrap">
              <svg viewBox="0 0 140 140" class="qr-svg" width="130" height="130" aria-label="SGQR PayNow Code">
                <rect width="140" height="140" rx="6" fill="#fff" stroke="#982226" stroke-width="2"/>
                <rect x="14" y="14" width="32" height="32" fill="none" stroke="#202422" stroke-width="7"/>
                <rect x="23" y="23" width="14" height="14" fill="#202422"/>
                <rect x="94" y="14" width="32" height="32" fill="none" stroke="#202422" stroke-width="7"/>
                <rect x="103" y="23" width="14" height="14" fill="#202422"/>
                <rect x="14" y="94" width="32" height="32" fill="none" stroke="#202422" stroke-width="7"/>
                <rect x="23" y="103" width="14" height="14" fill="#202422"/>
                <rect x="52" y="52" width="36" height="36" rx="6" fill="#7b1828"/>
                <text x="70" y="75" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">SGQR</text>
                <path d="M54 18h6v6h-6zM66 18h8v6h-8zM54 30h12v6H54zM18 54h10v6H18zM34 58h8v8h-8zM94 54h12v6H94zM110 62h10v10h-10zM54 94h8v10h-8zM70 98h10v8H70zM94 94h14v14H94zM102 114h16v8h-16z" fill="#202422"/>
              </svg>
            </div>
            <div class="sgqr-details">
              <div class="sgqr-entity-name">NAN HWA CHONG STEAMBOAT PTE. LTD.</div>
              <div class="sgqr-uen">UEN: 201619270H</div>
              <div class="sgqr-ref">Ref: T${table}-R${summary.rounds || 1}</div>
              <div class="sgqr-amount-pill">Total: ${money(summary.subtotal)} · Demo: S$0.00</div>
            </div>
          </div>
          <div class="sgqr-action-row">
            <button type="button" class="sgqr-btn-pay" id="apple-pay-btn">
              <span>Pay / GPay</span>
              <small>(1-Tap)</small>
            </button>
            <button type="button" class="sgqr-btn-save" id="save-sgqr-btn">
              <span>📸 Save SGQR</span>
            </button>
          </div>
        </div>
        <div class="pay-share-row">
          <button type="button" class="pay-share-btn" id="pay-my-share-btn">
            <span>💳 ${esc(T('payShare'))} · ${money(summary.grandTotalPerPax)}</span>
            <small>Simulated 1-tap checkout (Apple Pay / Google Pay style)</small>
          </button>
          <button type="button" class="share-bill-btn" id="share-bill-btn">
            <span>${esc(T('shareBill'))}</span>
          </button>
        </div>
        <div class="dialog-actions">
          ${summary.activeOrders.some(o => o.status === 'served' && !o.paid)
            ? `<button type="button" id="settle-table-btn" class="primary wide">Simulate receipt for served rounds · S$0.00</button>`
            : summary.allPaid
              ? `<p class="receipt wide">Demo receipt complete · Amount charged S$0.00</p>`
              : `<p class="muted">Once kitchen marks your rounds as Served, you can generate a simulated S$0.00 receipt here.</p>`}
        </div>
      ` : `<div class="cart-empty"><div>🧾</div><h3>No submitted rounds for Table ${table} yet.</h3><p>Add dishes to your cart and send them to staff first.</p></div>`}
    </div>`;

    dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
    dialog.querySelector('#split-pax-minus')?.addEventListener('click', () => {
      if (splitPax > 1) {
        splitPax--;
        renderBillContent();
        render();
      }
    });
    dialog.querySelector('#split-pax-plus')?.addEventListener('click', () => {
      if (splitPax < 20) {
        splitPax++;
        renderBillContent();
        render();
      }
    });
    dialog.querySelector('#modal-split-pax')?.addEventListener('change', e => {
      splitPax = Number(e.target.value) || 4;
      renderBillContent();
      render();
    });
    dialog.querySelector('#apple-pay-btn')?.addEventListener('click', () => {
      triggerOrderAnimation();
      hapticPulse();
      toast('Simulated Apple Pay / Google Pay successful! Amount charged: S$0.00.');
    });
    dialog.querySelector('#save-sgqr-btn')?.addEventListener('click', () => {
      hapticPulse();
      toast('SGQR saved to photos. Scan with DBS PayLah!, OCBC Pay Anyone or UOB TMRW.');
    });
    dialog.querySelector('#pay-my-share-btn')?.addEventListener('click', () => {
      triggerOrderAnimation();
      hapticPulse();
      toast(`Simulated payment of ${money(summary.grandTotalPerPax)} received for your share. Thank you!`);
    });
    dialog.querySelector('#share-bill-btn')?.addEventListener('click', () => {
      hapticPulse();
      const text = formatBillShareText(summary, table, splitPax);
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        navigator.share({ title: `Nan Hwa Chong Table ${table} Bill`, text }).catch(() => copyBillText(text));
      } else {
        copyBillText(text);
      }
    });
    dialog.querySelector('#settle-table-btn')?.addEventListener('click', () => {
      act(() => { settleTable(state, table); });
      renderBillContent();
      toast('Simulated table receipt created. Amount charged: S$0.00.');
    });
  };
  renderBillContent();
  dialog.showModal();
}

function triggerOrderAnimation() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  container.setAttribute('aria-hidden', 'true');
  const symbols = ['🍲', '🥢', '✨', '🥟', '🦐', '🍵', '⭐️', '🔥'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('span');
    p.className = 'confetti-item';
    p.textContent = symbols[i % symbols.length];
    p.style.setProperty('--x', `${(Math.random() * 100 - 50).toFixed(1)}vw`);
    p.style.setProperty('--y', `${(Math.random() * -60 - 20).toFixed(1)}vh`);
    p.style.setProperty('--rot', `${Math.floor(Math.random() * 360)}deg`);
    p.style.setProperty('--delay', `${(Math.random() * 0.25).toFixed(2)}s`);
    container.appendChild(p);
  }
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 2600);
}

function copyBillText(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toast(T('copiedBill'));
    }).catch(() => {
      prompt('Copy table bill summary:', text);
    });
  } else {
    prompt('Copy table bill summary:', text);
  }
}

function formatBillShareText(summary, tableNum, pax) {
  const roundsText = summary.activeOrders.map(o => {
    const items = o.items.map(x => `  • ${x.qty}× ${x.name} (${money(x.qty * x.unitPrice)})`).join('\n');
    return `Round ${o.round || 1} (${o.id}):\n${items}`;
  }).join('\n\n');
  return `🍲 Nan Hwa Chong (南华昌) · Table ${tableNum} Bill
──────────────────────────
${roundsText}
──────────────────────────
Dishes Subtotal: ${money(summary.subtotal)}
Illustrative Grand Total: ${money(summary.grandTotal)}
Split for ${pax} diners: ${money(summary.grandTotalPerPax)} / pax
(PayNow / PayLah to table host!)
* Demo Experience: S$0.00 charged`;
}

function openServiceModal() {
  const dialog = $('#service-dialog');
  if (!dialog) return;
  const activeTableCalls = state.calls.filter(c => c.table === table && !c.done);
  dialog.innerHTML = `<div class="service-modal-body">
    <div class="dialog-top">
      <span class="eyebrow">TABLE ${table} · ${esc(T('callService'))}</span>
      <button type="button" class="close-dialog" aria-label="Close table service dialog">×</button>
    </div>
    <h2 id="service-dialog-title">${esc(T('callService'))}</h2>
    <p>${esc(T('callServiceDesc'))}</p>
    <div class="service-modal-grid">
      <button type="button" class="service-modal-card" data-service-select="soup">
        <span class="service-icon">🍲</span>
        <strong>${esc(T('soupRefill'))}</strong>
        <small>Milky fish or ginger broth</small>
      </button>
      <button type="button" class="service-modal-card" data-service-select="tea">
        <span class="service-icon">🍵</span>
        <strong>${esc(T('teaRefill'))}</strong>
        <small>Hot Chinese tea / warm water</small>
      </button>
      <button type="button" class="service-modal-card" data-service-select="bowls">
        <span class="service-icon">🥢</span>
        <strong>${esc(T('extraBowls'))}</strong>
        <small>Clean bowls, spoons & chopsticks</small>
      </button>
      <button type="button" class="service-modal-card" data-service-select="chilli">
        <span class="service-icon">🌶️</span>
        <strong>${esc(T('cutChilli'))}</strong>
        <small>Fresh cut chilli & garlic soy</small>
      </button>
      <button type="button" class="service-modal-card" data-service-select="wipe">
        <span class="service-icon">🧻</span>
        <strong>${esc(T('extraWipes'))}</strong>
        <small>Hot wet towels & paper napkins</small>
      </button>
      <button type="button" class="service-modal-card" data-service-select="assistance">
        <span class="service-icon">♧</span>
        <strong>General Assistance</strong>
        <small>Floor captain will visit table</small>
      </button>
    </div>
    ${activeTableCalls.length ? `<div class="active-calls-panel">
      <span>Currently requested for Table ${table}:</span>
      <div class="active-calls-tags">${activeTableCalls.map(c => `<span class="call-pill">${serviceTypes[c.type || 'assistance']?.icon || '♧'} ${esc(c.label || 'Assistance')}</span>`).join('')}</div>
    </div>` : ''}
  </div>`;
  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelectorAll('[data-service-select]').forEach(btn => {
    btn.onclick = () => {
      act(() => {
        const entry = requestService(state, table, btn.dataset.serviceSelect);
        toast(`${entry.label} requested for Table ${table}.`);
      });
      closeTopLayer(dialog);
    };
  });
}

function openOrderSuccessDialog(order) {
  const dialog = $('#order-success-dialog');
  if (!dialog) return;
  triggerOrderAnimation();
  dialog.innerHTML = `<div class="order-success-body">
    <div class="dialog-top">
      <span class="eyebrow">ORDER CONFIRMATION · 下单成功</span>
      <button type="button" class="close-dialog" aria-label="Close confirmation">×</button>
    </div>
    <div class="success-icon-banner">
      <span class="celebrate-badge">🎉</span>
      <h2 id="order-success-dialog-title">${esc(T('orderPlaced'))}</h2>
      <p>${esc(T('orderPlacedDesc'))}</p>
    </div>
    <div class="order-success-card">
      <div class="order-success-header">
        <div>
          <small>TABLE ${order.table}</small>
          <h3>Order ${order.id}</h3>
        </div>
        <span class="badge pending">Awaiting staff</span>
      </div>
      <ul class="order-lines">${orderLines(order, false)}</ul>
      <div class="order-total">Round ${order.round || 1} Subtotal <strong>${money(total(order.items))}</strong></div>
    </div>
    <div class="dialog-actions">
      <button type="button" class="secondary" id="track-orders-btn">View table tab & tracker</button>
      <button type="button" class="primary" id="continue-dining-btn">Continue exploring menu</button>
    </div>
  </div>`;
  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#continue-dining-btn').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#track-orders-btn').onclick = () => {
    closeTopLayer(dialog);
    const cartEl = document.getElementById('table-cart');
    cartEl?.scrollIntoView({ behavior: 'smooth' });
  };
}

function openQrDialog(targetTable) {
  const dialog = $('#qr-dialog');
  const tableUrl = `${location.origin}/?table=${targetTable}${state.replyLanguage && state.replyLanguage !== 'en' ? `&lang=${state.replyLanguage}` : ''}`;
  dialog.innerHTML = `<div class="qr-modal-body">
    <div class="dialog-top">
      <span class="eyebrow">TABLE QR & LINK · 桌号二维码</span>
      <button type="button" class="close-dialog" aria-label="Close QR dialog">×</button>
    </div>
    <h2 id="qr-dialog-title">Table ${targetTable} Ordering Link</h2>
    <p>In a traditional dining room, each table has a printed standee linking directly to its table number.</p>
    <div class="qr-standee">
      <svg viewBox="0 0 120 120" class="qr-svg" aria-hidden="true">
        <rect width="120" height="120" rx="10" fill="#fff" stroke="#173f35" stroke-width="3"/>
        <rect x="12" y="12" width="28" height="28" fill="none" stroke="#173f35" stroke-width="6"/>
        <rect x="20" y="20" width="12" height="12" fill="#173f35"/>
        <rect x="80" y="12" width="28" height="28" fill="none" stroke="#173f35" stroke-width="6"/>
        <rect x="88" y="20" width="12" height="12" fill="#173f35"/>
        <rect x="12" y="80" width="28" height="28" fill="none" stroke="#173f35" stroke-width="6"/>
        <rect x="20" y="88" width="12" height="12" fill="#173f35"/>
        <rect x="48" y="48" width="24" height="24" rx="4" fill="#a74838"/>
        <text x="60" y="65" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">${targetTable}</text>
        <path d="M50 16h6v6h-6zM62 16h8v6h-8zM50 28h12v6H50zM16 50h10v6H16zM32 54h8v8h-8zM80 50h12v6H80zM96 58h10v10H96zM50 82h8v10h-8zM66 86h10v8H66zM82 82h14v14H82zM90 100h16v8H90z" fill="#173f35"/>
      </svg>
      <strong>Nan Hwa Chong 南华昌 · Table ${targetTable}</strong>
      <code>${esc(tableUrl)}</code>
    </div>
    <div class="dialog-actions">
      <button type="button" class="secondary" id="switch-to-table">Switch Customer view to Table ${targetTable}</button>
    </div>
  </div>`;
  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#switch-to-table').onclick = () => {
    table = targetTable;
    role = 'customer';
    const url = new URL(location.href);
    url.searchParams.set('table', table);
    history.replaceState(null, '', url);
    closeTopLayer(dialog);
    render();
    toast(`Switched to Table ${table}.`);
  };
}

function openMobileCart() {
  const dialog = $('#mobile-cart-dialog');
  if (!dialog) return;
  const summary = tableSummary(state, table, splitPax);
  const nextRound = summary.rounds + 1;
  const renderContent = () => {
    dialog.innerHTML = `<div class="mobile-cart-body">
      <div class="dialog-top">
        <span class="eyebrow">TABLE ${table} · ROUND ${nextRound}</span>
        <button type="button" class="close-dialog" aria-label="Close cart">×</button>
      </div>
      <h2 id="mobile-cart-dialog-title">Your Table Order (${count()} items)</h2>
      <div class="cart-body">
        ${state.cart.length ? state.cart.map((x, i) => `<div class="cart-line">
          <div>
            <h3>${esc(x.name)}</h3>
            <p>${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''}</p>
            <small>${money(x.unitPrice)} each</small>
            <div><span class="cart-guest-tag">${x.guestEmoji || currentGuest.emoji || '👤'} ${esc(x.addedBy || currentGuest.name)}</span></div>
          </div>
          <div class="cart-line-end">
            <strong>${money(x.qty * x.unitPrice)}</strong>
            <div class="quantity">
              <button type="button" data-modal-qty="${i}" data-delta="-1" aria-label="Decrease ${esc(x.name)}">−</button>
              <span>${x.qty}</span>
              <button type="button" data-modal-qty="${i}" data-delta="1" aria-label="Increase ${esc(x.name)}" ${x.qty >= 20 ? 'disabled' : ''}>+</button>
            </div>
          </div>
        </div>`).join('') : `<div class="cart-empty"><div>🥢</div><h3>Your cart is empty</h3><p>Choose your favourite dishes from the menu.</p></div>`}
      </div>
      ${state.cart.length ? `
        <div class="cart-upsell">
          <span>Complete the table:</span>
          <div class="upsell-chips">
            ${!state.unavailable.includes('rice') ? `<button type="button" data-modal-quick-add="rice">+1 Rice (${money(150)})</button>` : ''}
            ${!state.unavailable.includes('tea') ? `<button type="button" data-modal-quick-add="tea">+Pu’er Tea (${money(400)})</button>` : ''}
            ${!state.unavailable.includes('yam') ? `<button type="button" data-modal-quick-add="yam">+Crispy Yam (${money(800)})</button>` : ''}
          </div>
        </div>
        <div class="cart-summary">
          <div><span>Round ${nextRound} subtotal</span><strong>${money(total(state.cart))}</strong></div>
          <p>Staff review every round before the kitchen starts cooking.</p>
        </div>
        <div class="cart-actions">
          <button class="primary wide" id="modal-submit-order" type="button">Send Round ${nextRound} to staff · ${money(total(state.cart))} →</button>
        </div>
      ` : ''}
    </div>`;

    dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
    dialog.querySelectorAll('[data-modal-qty]').forEach(b => b.onclick = () => {
      const idx = +b.dataset.modalQty;
      const delta = +b.dataset.delta;
      act(() => {
        state.cart[idx].qty += delta;
        if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
        updateDockSpeech();
        renderContent();
        render();
      });
    });
    dialog.querySelectorAll('[data-modal-quick-add]').forEach(b => b.onclick = () => {
      const d = dish(b.dataset.modalQuickAdd);
      act(() => {
        const newLine = makeLine(d.id, 1, 'Regular', state.preference);
        newLine.addedBy = currentGuest.name;
        newLine.guestEmoji = currentGuest.emoji;
        addLines(state, [newLine]);
        updateDockSpeech();
        renderContent();
        render();
      });
    });
    dialog.querySelector('#modal-submit-order')?.addEventListener('click', () => {
      closeTopLayer(dialog);
      handleOrderSubmit();
    });
  };

  renderContent();
  dialog.showModal();
}

const steamboatTimers = {};

function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

const guideItems = [
  { id: 'fish', name: 'Pomfret & Grouper (鲳鱼 / 石斑)', cn: '嫩滑鲜鱼肉', targetSec: 180, timeLabel: '3 mins', icon: '🥘', desc: 'Simmer gently over charcoal until fish turns opaque and flaky. Do not overboil to preserve delicate natural sweetness.' },
  { id: 'tango', name: 'Tang-O Greens (茼蒿)', cn: '菊花菜 / 茼蒿', targetSec: 30, timeLabel: '30 secs', icon: '🥬', desc: 'Swirl in bubbling broth for 30 seconds only. Lifting early keeps the tender leaves aromatic, crisp and sweet.' },
  { id: 'sole', name: 'Crispy Sole Fish (扁鱼)', cn: '大地鱼 / 扁鱼干', targetSec: 60, timeLabel: '1 min', icon: '🐟', desc: 'Deep fried sole fish releases traditional Teochew umami into the broth. Simmer for 1 minute before scooping.' },
  { id: 'prawn', name: 'Fresh Prawn Paste (虾滑)', cn: '手打虾滑', targetSec: 150, timeLabel: '2.5 mins', icon: '🦐', desc: 'Scoop bite-sized quenelles into simmering soup. Once they float to the surface, give them 30 seconds more for bouncy snap.' },
  { id: 'roe', name: 'Fish Roe (鱼卵)', cn: '新鲜鱼卵', targetSec: 120, timeLabel: '2 mins', icon: '🐟', desc: 'Gently poach in broth. Rich and plump when cooked through.' },
  { id: 'yam', name: 'Golden Taro Yam (炸芋头)', cn: '炸芋头条', targetSec: 300, timeLabel: '5 mins', icon: '🍠', desc: 'Simmer thoroughly in the charcoal pot until velvety and soft. Imparts thick fragrance into the broth.' }
];

function openSteamboatGuide() {
  const dialog = $('#steamboat-guide-dialog');
  if (!dialog) return;

  const renderGuide = () => {
    dialog.innerHTML = `<div class="steamboat-guide-body">
      <div class="dialog-top">
        <span class="eyebrow">TEOCHEW STEAMBOAT SECRETS · 鱼头炉涮煮时间指南</span>
        <button type="button" class="close-dialog" aria-label="Close guide">×</button>
      </div>
      <h2 id="steamboat-guide-title">Optimal Simmer & Cooking Times</h2>
      <p>Traditional Teochew charcoal steamboat relies on precise timing so fish stays tender, greens stay crisp, and broth deepens in flavour.</p>
      <div class="steamboat-timer-grid">
        ${guideItems.map(item => {
          const timer = steamboatTimers[item.id];
          const isRunning = timer && timer.remaining > 0 && !timer.done;
          const isDone = timer && timer.done;
          const remaining = timer ? timer.remaining : item.targetSec;
          const mins = Math.floor(remaining / 60);
          const secs = remaining % 60;
          const formatted = `${mins}:${String(secs).padStart(2, '0')}`;
          return `<div class="timer-card ${isRunning ? 'running' : ''} ${isDone ? 'done' : ''}">
            <div class="timer-card-top">
              <span class="timer-card-icon">${item.icon}</span>
              <div>
                <strong>${esc(item.name)}</strong>
                <small>${esc(item.cn)}</small>
              </div>
              <span class="timer-target-badge">${item.timeLabel}</span>
            </div>
            <p>${esc(item.desc)}</p>
            <div class="timer-action-row">
              <span class="timer-clock ${isDone ? 'done-pulse' : ''}">${isDone ? '✅ Cooked! 盛出趁热享用' : `⏱️ ${formatted}`}</span>
              ${isRunning ? `<button type="button" class="timer-btn stop" data-stop-timer="${item.id}">Stop</button>` : isDone ? `<button type="button" class="timer-btn reset" data-start-timer="${item.id}">Restart</button>` : `<button type="button" class="timer-btn start" data-start-timer="${item.id}">Start Timer</button>`}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

    dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
    dialog.querySelectorAll('[data-start-timer]').forEach(b => b.onclick = () => {
      const id = b.dataset.startTimer;
      const item = guideItems.find(x => x.id === id);
      if (!item) return;
      if (steamboatTimers[id]?.interval) clearInterval(steamboatTimers[id].interval);
      steamboatTimers[id] = {
        remaining: item.targetSec,
        done: false,
        interval: setInterval(() => {
          if (steamboatTimers[id] && steamboatTimers[id].remaining > 1) {
            steamboatTimers[id].remaining--;
            renderGuide();
          } else if (steamboatTimers[id]) {
            clearInterval(steamboatTimers[id].interval);
            steamboatTimers[id].remaining = 0;
            steamboatTimers[id].done = true;
            playChime();
            toast(`🍲 ${item.name} is ready to eat!`);
            renderGuide();
          }
        }, 1000)
      };
      renderGuide();
    });
    dialog.querySelectorAll('[data-stop-timer]').forEach(b => b.onclick = () => {
      const id = b.dataset.stopTimer;
      if (steamboatTimers[id]?.interval) clearInterval(steamboatTimers[id].interval);
      delete steamboatTimers[id];
      renderGuide();
    });
  };

  renderGuide();
  dialog.showModal();
}

function bindOperations() {
  document.querySelectorAll('[data-floor-table]').forEach(b => b.onclick = () => {
    staffTableFilter = b.dataset.floorTable === staffTableFilter ? 'all' : b.dataset.floorTable;
    render();
  });
  document.querySelectorAll('[data-status]').forEach(b => b.onclick = () => act(() => {
    const id = b.dataset.order;
    if (b.dataset.status === 'approved' && !$(`[data-reviewed="${id}"]`).checked) {
      throw Error('Review the dishes, notes and prices, then tick the review box.');
    }
    transition(state, id, b.dataset.status, $(`[data-reason="${id}"]`)?.value || '');
    toast(`${id}: ${statusLabel[b.dataset.status]}`);
  }));
  document.querySelectorAll('[data-check-order]').forEach(b => b.onclick = () => act(() => {
    toggleOrderItem(state, b.dataset.checkOrder, Number(b.dataset.checkItem));
  }));
  document.querySelectorAll('[data-availability]').forEach(b => b.onchange = () => act(() => {
    state.unavailable = b.checked
      ? state.unavailable.filter(id => id !== b.dataset.availability)
      : [...new Set([...state.unavailable, b.dataset.availability])];
  }));
  document.querySelectorAll('[data-resolve]').forEach(b => b.onclick = () => act(() => {
    const call = state.calls.find(c => c.id === b.dataset.resolve);
    if (call) call.done = true;
    toast('Simulated server request acknowledged.');
  }));
}

window.addEventListener('storage', event => {
  if (event.key === key && event.newValue) {
    try {
      const incoming = JSON.parse(event.newValue);
      if (incoming.version === 1) {
        draft = $('#message')?.value || draft;
        state = incoming;
        render();
      }
    } catch {}
  }
});
window.addEventListener('pagehide', stopVoice);
render();
connectLiveSync();
