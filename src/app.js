import {
  menu, money, dish, initialState, total, makeLine, addLines, submit, transition,
  chat, configureRecommendation, serviceTypes, requestService, tableSummary, settleTable, toggleOrderItem,
  getTableSession, applyOp, STATIONS, getDishStation, SET_MENUS, fireHeldItem, hurryItem, voidItem,
  guestBreakdown, closeTableSession, getEReceipt, STORED_VALUE_TIERS, COUPON_TEMPLATES,
  getMember, registerMember, topUpMemberBalance, applyCoupon, removeCoupon, payWithMemberBalance,
  submitReview, createBanquetBooking, createQueueTicket, transferQueueToTable,
  DEFAULT_CART_RULES, evaluateCartRules, recordAhHuaEvent, getAhHuaSalesMetrics,
  confirmTableSeating, MID_MEAL_REORDER_ITEMS,
  generateAABillMessage, STEAMBOAT_PORTIONS, STEAMBOAT_BROTHS
} from './domain.js';
import { avatarMarkup } from './avatar.js';
import { createVoicePlayer } from './voice.js';
import { languages, normaliseLanguage, replyText, uiText, plannerMessage, dishName, categoryName } from './languages.js';
import {
  QUICK_CHIPS, LORE_ANSWERS, STORY_CARDS, computeDishBadge, GUEST_PERSONAS, POPULAR_MODIFIERS
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
let kitchenStation = 'all';
let billTab = 'split'; // 'split' | 'items'
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
let currentMemberPhone = null;
try { currentMemberPhone = localStorage.getItem('ahhua-member-phone'); } catch {}
let activeQueueTicket = null;
try {
  const urlParams = new URLSearchParams(location.search);
  const qParam = urlParams.get('queue');
  if (qParam) activeQueueTicket = qParam;
} catch {}
let seatingPromptShownForTable = null;


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
const count = () => getTableSession(state, table).cart.reduce((n, x) => n + x.qty, 0);

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
}

// Global click handler to close dialog ONLY when clicking the x icon (.close-dialog)
document.addEventListener('click', event => {
  const closeBtn = event.target.closest('.close-dialog');
  if (closeBtn) {
    const dialog = closeBtn.closest('dialog');
    if (dialog) closeTopLayer(dialog);
  }
});

function ensureDialogRoot() {
  let root = document.getElementById('dialog-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'dialog-root';
    root.innerHTML = `
      <dialog id="dish-dialog" aria-labelledby="dish-dialog-title"></dialog>
      <dialog id="bill-dialog" aria-labelledby="bill-dialog-title"></dialog>
      <dialog id="service-dialog" aria-labelledby="service-dialog-title"></dialog>
      <dialog id="order-success-dialog" aria-labelledby="order-success-dialog-title"></dialog>
      <dialog id="qr-dialog" aria-labelledby="qr-dialog-title"></dialog>
      <dialog id="steamboat-guide-dialog" aria-labelledby="steamboat-guide-title"></dialog>
      <dialog id="mobile-cart-dialog" class="bottom-sheet-dialog" aria-labelledby="mobile-cart-dialog-title"></dialog>
      <dialog id="ah-hua-dialog" class="bottom-sheet-dialog" aria-labelledby="ah-hua-dialog-title"></dialog>
      <dialog id="cart-check-dialog" aria-labelledby="cart-check-dialog-title"></dialog>
      <dialog id="staff-pin-dialog" aria-labelledby="staff-pin-title"></dialog>
      <dialog id="set-menu-dialog" class="bottom-sheet-dialog" aria-labelledby="set-menu-title"></dialog>
      <dialog id="void-dialog" aria-labelledby="void-dialog-title"></dialog>
      <dialog id="e-receipt-dialog" aria-labelledby="e-receipt-title"></dialog>
      <dialog id="member-dialog" class="bottom-sheet-dialog" aria-labelledby="member-dialog-title"></dialog>
      <dialog id="review-dialog" class="bottom-sheet-dialog" aria-labelledby="review-dialog-title"></dialog>
      <dialog id="banquet-dialog" class="bottom-sheet-dialog" aria-labelledby="banquet-dialog-title"></dialog>
      <dialog id="queue-dialog" class="bottom-sheet-dialog" aria-labelledby="queue-dialog-title"></dialog>
      <dialog id="seating-dialog" class="bottom-sheet-dialog" aria-labelledby="seating-dialog-title"></dialog>
      <dialog id="share-bill-dialog" class="bottom-sheet-dialog" aria-labelledby="share-bill-title"></dialog>
      <dialog id="reset-dialog" aria-labelledby="reset-dialog-title">
        <form method="dialog">
          <h2 id="reset-dialog-title">Start fresh?</h2>
          <p>This clears this demo’s cart, conversations, table requests and kitchen tickets.</p>
          <div class="dialog-actions">
            <button value="cancel" class="secondary">Keep exploring</button>
            <button value="reset" class="primary">Reset demo</button>
          </div>
        </form>
      </dialog>
    `;
    document.body.appendChild(root);
    [
      '#dish-dialog', '#bill-dialog', '#service-dialog', '#order-success-dialog',
      '#qr-dialog', '#steamboat-guide-dialog', '#mobile-cart-dialog', '#ah-hua-dialog',
      '#cart-check-dialog', '#staff-pin-dialog', '#set-menu-dialog', '#void-dialog',
      '#e-receipt-dialog', '#member-dialog', '#review-dialog', '#banquet-dialog',
      '#queue-dialog', '#seating-dialog', '#share-bill-dialog', '#reset-dialog'
    ].forEach(sel => wireDialog(document.querySelector(sel)));
  }
}

// Hybrid live sync: BroadcastChannel + localStorage + Server-Sent Events (/api/events)
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('ah-hua-demo-sync') : null;
channel?.addEventListener('message', event => {
  if (event.data?.senderId !== clientId) {
    if (event.data?.op) {
      applyOp(state, event.data.op);
      try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
      render();
    } else if (event.data?.state?.version === 1) {
      draft = $('#message')?.value || draft;
      state = event.data.state;
      render();
    }
  }
});

function pushServerState() {
  if (syncMode !== 'live') return;
  const headers = { 'Content-Type': 'application/json' };
  if (typeof isStaffAuthenticated === 'function' && isStaffAuthenticated()) {
    headers['X-Staff-Auth'] = '1927';
  }
  fetch('/api/state', {
    method: 'POST',
    headers,
    body: JSON.stringify({ state, senderId: clientId })
  }).catch(() => {});
}

function dispatchOp(op) {
  try {
    applyOp(state, op);
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
    channel?.postMessage({ senderId: clientId, op, state });
    if (syncMode === 'live') {
      const headers = { 'Content-Type': 'application/json' };
      if (typeof isStaffAuthenticated === 'function' && isStaffAuthenticated()) {
        headers['X-Staff-Auth'] = '1927';
      }
      fetch('/api/op', {
        method: 'POST',
        headers,
        body: JSON.stringify({ op, senderId: clientId })
      }).then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Server rejected operation');
        }
      }).catch(err => {
        toast(err.message || 'Operation failed');
      });
    }
    render();
  } catch (e) {
    toast(e.message);
  }
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
          const localHasActivity = state.orders.length || state.cart.length || Object.values(state.sessions || {}).some(s => s.cart?.length) || state.calls.length || state.messages.length > 1;
          const serverHasActivity = packet.state?.orders?.length || packet.state?.cart?.length || Object.values(packet.state?.sessions || {}).some(s => s.cart?.length) || packet.state?.calls?.length;
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
        if (packet.senderId !== clientId) {
          if (packet.op) {
            applyOp(state, packet.op);
            try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
            render();
          } else if (packet.state?.version === 1) {
            draft = $('#message')?.value || draft;
            state = packet.state;
            try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
            render();
          }
        }
      } catch {}
    };
    es.onerror = () => {
      syncMode = 'local';
      es.close();
      clearTimeout(connectLiveSync.retryTimer);
      connectLiveSync.retryTimer = setTimeout(() => {
        connectLiveSync();
      }, 4000);
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
    getTableSession(state, table).proposal = response.lines;
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

function orderLines(order, interactiveKitchen = false, allowCustomerActions = false) {
  const checked = new Set(Array.isArray(order.checkedItems) ? order.checkedItems : []);
  return order.items.map((x, i) => {
    const isChecked = checked.has(i);
    const isVoided = Boolean(x.voided);
    const isHeld = x.timing === 'hold';
    const isHurried = Boolean(x.hurried);

    const timingBadge = isVoided
      ? `<span class="timing-badge voided">❌ 退菜 (${esc(x.voidReason || '')})</span>`
      : isHurried
        ? `<span class="timing-badge hurried">⚡ 催菜 Hurried</span>`
        : isHeld
          ? `<span class="timing-badge hold">⏸️ 叫起 Held</span>`
          : '';

    if (interactiveKitchen) {
      if (kitchenStation !== 'all' && x.station && x.station !== kitchenStation) {
        return '';
      }
      return `<li class="checkable-line ${isChecked ? 'checked' : ''} ${isVoided ? 'voided-item' : ''}">
        <button type="button" class="line-check-btn" data-check-order="${order.id}" data-check-item="${i}" aria-pressed="${isChecked}" ${isVoided ? 'disabled' : ''}>
          <span class="check-box">${isChecked ? '✓' : ''}</span>
          <div>
            <b>${x.qty} × ${esc(x.name)} ${timingBadge}</b>
            <span>${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''} · <small>${esc(x.station || 'wok')}</small></span>
          </div>
        </button>
        <div class="line-end-actions">
          <strong>${money(x.qty * x.unitPrice)}</strong>
          ${isHeld ? `<button type="button" class="mini-btn fire" data-fire-held="${order.id}" data-item-idx="${i}">🔥 起菜</button>` : ''}
        </div>
      </li>`;
    }

    return `<li class="${isChecked ? 'plated-line' : ''} ${isVoided ? 'voided-item' : ''}">
      <div>
        <b>${x.qty} × ${esc(x.name)} ${isChecked ? '<em class="plated-tag">✓ Plated</em>' : ''} ${timingBadge}</b>
        <span>${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''}</span>
        ${allowCustomerActions && !isChecked && !isVoided && order.status !== 'served' ? `
          <div class="item-action-btns">
            ${isHeld ? `<button type="button" class="mini-btn fire" data-fire-held="${order.id}" data-item-idx="${i}">🔥 起菜 (Fire Now)</button>` : ''}
            <button type="button" class="mini-btn hurry" data-hurry-dish="${order.id}" data-item-idx="${i}" data-dish-name="${esc(x.name)}" ${isHurried ? 'disabled' : ''}>${isHurried ? '⚡ 已催 (Hurried)' : '⚡ 催菜 (Hurry)'}</button>
            <button type="button" class="mini-btn void" data-void-dish="${order.id}" data-item-idx="${i}" data-dish-name="${esc(x.name)}">✕ 退菜</button>
          </div>
        ` : ''}
      </div>
      <strong>${isVoided ? `<del>${money(x.qty * x.unitPrice)}</del>` : money(x.qty * x.unitPrice)}</strong>
    </li>`;
  }).join('');
}

let pendingRole = null;

function isStaffAuthenticated() {
  try {
    return sessionStorage.getItem('ahhua-staff-auth') === 'true';
  } catch {
    return false;
  }
}

function openStaffPinDialog(targetRole) {
  pendingRole = targetRole;
  const dialog = $('#staff-pin-dialog');
  if (!dialog) return;

  dialog.innerHTML = `
    <div class="pin-modal-body">
      <div class="dialog-top">
        <span class="eyebrow">SECURITY ACCESS · 权限验证</span>
        <button type="button" class="close-dialog" aria-label="Close PIN modal">×</button>
      </div>
      <div class="pin-header">
        <div class="pin-icon">🔒</div>
        <h2 id="staff-pin-title">Floor Staff &amp; Kitchen PIN</h2>
        <p>Enter the 4-digit Floor Staff PIN to access order approvals, kitchen tickets, and table management.</p>
        <div class="pin-hint-tag">Floor PIN: <strong>1927</strong> (Heritage Est. 1927)</div>
      </div>
      <form id="staff-pin-form" class="pin-form">
        <div class="pin-input-wrap">
          <input type="password" id="staff-pin-input" pattern="[0-9]*" inputmode="numeric" maxlength="4" placeholder="••••" autocomplete="off" autofocus required aria-label="Staff 4-digit PIN">
        </div>
        <div id="pin-error" class="pin-error-msg" hidden>Incorrect PIN. Please use 1927.</div>
        <div class="dialog-actions">
          <button type="button" class="secondary" id="cancel-pin-btn">Cancel</button>
          <button type="submit" class="primary" id="submit-pin-btn">Verify PIN →</button>
        </div>
      </form>
    </div>
  `;

  dialog.showModal();
  const input = dialog.querySelector('#staff-pin-input');
  setTimeout(() => input?.focus(), 50);

  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#cancel-pin-btn').onclick = () => closeTopLayer(dialog);

  dialog.querySelector('#staff-pin-form').onsubmit = e => {
    e.preventDefault();
    const entered = input.value.trim();
    if (entered === '1927') {
      try { sessionStorage.setItem('ahhua-staff-auth', 'true'); } catch {}
      closeTopLayer(dialog);
      role = pendingRole || 'staff';
      render();
      toast('Staff credentials verified. Welcome, floor team.');
    } else {
      const err = dialog.querySelector('#pin-error');
      if (err) err.hidden = false;
      input.value = '';
      input.focus();
      input.classList.add('pin-shake');
      setTimeout(() => input.classList.remove('pin-shake'), 500);
      toast('Incorrect staff PIN. Please try 1927.');
    }
  };
}

function render() {
  ensureDialogRoot();
  const prevScrollY = window.scrollY;
  state.replyLanguage = normaliseLanguage(state.replyLanguage);
  const pending = state.orders.filter(x => x.status === 'pending').length;
  const openCalls = state.calls.filter(x => !x.done).length;
  const activeKitchen = state.orders.filter(x => ['approved', 'preparing', 'ready'].includes(x.status)).length;
  const staffBadgeCount = pending + openCalls;
  const currentMember = currentMemberPhone ? getMember(state, currentMemberPhone) : null;

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
      <button type="button" class="member-top-pill" id="open-member-btn" title="VIP Member Privileges · 会员权益">
        ${currentMember ? `⭐️ ${esc(currentMember.name.split(' ')[0])} (${money(currentMember.balance)})` : `🎁 VIP Member (免茶位)`}
      </button>
      <button type="button" class="banquet-top-pill" id="open-banquet-btn" title="Banquet & CNY Pre-order · 年菜宴席">
        🏮 Banquet
      </button>
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
  ${role === 'customer' && getTableSession(state, table).cart.length ? `
    <aside class="floating-order-bar" aria-label="Table order summary">
      <button type="button" class="floating-cart-btn" id="open-mobile-cart" aria-label="Review cart with ${count()} items">
        <span class="floating-cart-badge">🛒 ${count()} items</span>
        <span class="floating-cart-total">${money(total(getTableSession(state, table).cart))}</span>
        <span class="floating-cart-label">${esc(T('reviewOrder'))} →</span>
      </button>
    </aside>
    <a class="mobile-cart-link sr-only" href="#table-cart"><span>View cart · ${count()} items</span><strong>${money(total(getTableSession(state, table).cart))} →</strong></a>
  ` : ''}
  <footer><span class="footer-mark">南</span> Nan Hwa Chong (南华昌) Fish Head Steamboat Corner · Traditional Teochew Taste Since 1927 <span>North Bridge Road &amp; Jalan Sultan · Singapore</span></footer>`;

  document.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => {
    const targetRole = b.dataset.role;
    if (targetRole === 'staff' || targetRole === 'kitchen') {
      if (!isStaffAuthenticated()) {
        openStaffPinDialog(targetRole);
        return;
      }
    }
    draft = $('#message')?.value || draft;
    stopVoice();
    role = targetRole;
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
  } else if (getTableSession(state, table).cart.length) {
    dockSpeechText = `Table ${table} · ${count()} items in cart! Looking delicious!`;
  } else {
    dockSpeechText = `Table ${table}? Our charcoal steamboat is simmering fresh—1 pot is great to share!`;
  }
  const dockTextEl = document.getElementById('dock-speech-text');
  if (dockTextEl) dockTextEl.innerHTML = `<span>${esc(dockSpeechText)}</span>`;
}

function handleLoreChip(chipId) {
  dispatchOp({ type: 'RECORD_AH_HUA_EVENT', eventType: 'CHIP_CLICK' });
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
  const session = getTableSession(state, table);
  return evaluateCartRules(cartItems, {
    pax: session?.pax || 4,
    unavailable: state.unavailable,
    language: state.replyLanguage,
    rulesConfig: state.cartRules
  });
}

function executeOrderSubmission() {
  const tableCart = getTableSession(state, table).cart;
  if (!tableCart.length) {
    toast('Your cart is empty. Please select dishes first.');
    return;
  }
  let order;
  try {
    order = submit(state, table, { autoFire: true });
    reply(localReply('submitted', { id: order.id }));
    dispatchOp({ type: 'SUBMIT_ORDER', table, autoFire: true });
  } catch (err) {
    toast(err.message);
    return;
  }
  if (order) {
    customerGear = 'stage';
    dispatchOp({ type: 'SET_TABLE_GEAR', table, gear: 'stage' });
    updateDockSpeech();
    triggerOrderAnimation();
    hapticPulse();
    render();
    toast(order.status === 'approved'
      ? `🔥 Order ${order.id} auto-fired directly to kitchen tickets!`
      : `🎉 Order ${order.id} submitted! Pending staff review (${order.flaggedReason || 'Flagged'}).`);
  }
}

function handleOrderSubmit() {
  const tableCart = getTableSession(state, table).cart;
  const check = checkCartRules(tableCart);
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

  if (!check.isOverOrder) {
    dispatchOp({ type: 'RECORD_AH_HUA_EVENT', eventType: 'CART_CHECK_IMPRESSION' });
  }

  dialog.innerHTML = `<div class="cart-check-body ${check.isOverOrder ? 'portion-guard-body' : ''}">
    <div class="dialog-top">
      <span class="eyebrow">${check.isOverOrder ? 'AH HUA PORTION CHECK · 份量温馨把关' : 'AH HUA CART CHECK · 点单贴心提示'}</span>
      <button type="button" class="close-dialog" aria-label="Close cart check">×</button>
    </div>
    <div class="cart-check-hero ${check.isOverOrder ? 'portion-guard-hero' : ''}">
      ${avatarMarkup()}
      <div class="cart-check-speech ${check.isOverOrder ? 'portion-guard-speech' : ''}">
        <strong id="cart-check-dialog-title">${esc(check.title)}</strong>
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
    closeTopLayer(dialog);
    if (check.isOverOrder) {
      executeOrderSubmission();
    } else {
      const dishObj = dish(check.dishId);
      const extraCents = (dishObj?.price || 0) * (check.suggestQty || 1);
      dispatchOp({
        type: 'RECORD_AH_HUA_EVENT',
        eventType: 'CART_CHECK_ACCEPTED',
        data: { cents: extraCents }
      });
      dispatchOp({
        type: 'ADD_LINES',
        table,
        lines: [{
          id: check.dishId,
          qty: check.suggestQty,
          size: 'Regular',
          notes: 'Added via Ah Hua recommendation',
          addedBy: currentGuest?.name || 'Ah Hua Recommendation',
          guestEmoji: currentGuest?.emoji || '✨'
        }]
      });
      executeOrderSubmission();
    }
  };
  dialog.querySelector('#cart-check-skip-btn').onclick = () => {
    closeTopLayer(dialog);
    if (check.isOverOrder) {
      toast('Taking you back to review cart portions.');
    } else {
      executeOrderSubmission();
    }
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
  const session = getTableSession(state, table);
  const tableCart = session.cart;
  const activeOrders = state.orders.filter(o => o.table === table && ['pending', 'approved', 'preparing', 'ready'].includes(o.status));
  const latestOrder = activeOrders[activeOrders.length - 1] || state.orders.filter(o => o.table === table).slice(-1)[0];
  const nextRound = summary.rounds + 1;
  const story = STORY_CARDS[activeStoryIndex] || STORY_CARDS[0];

  return `<section class="welcome">
    <div>
      <div class="eyebrow-row">
        <span class="eyebrow">NAN HWA CHONG · EST. 1927 · 百年老字号传统炭火鱼头炉</span>
        <span class="table-peer-chip" title="Live table sync"><span class="live-dot"></span> Table ${table} · Live table sync ${connectedPeers > 1 ? `(${connectedPeers} diners in sync)` : ''} · You: <strong class="guest-name-pill">${currentGuest.emoji} ${esc(currentGuest.name)}</strong></span>
      </div>
      <h1>${esc(T('welcomeTitle'))}${table}${state.replyLanguage === 'zh' ? esc(T('welcomeTitleSuffix') || ' 桌') : ''}</h1>
      <p>Concierge Stage · Table companionship while kitchen prepares your meal</p>
      <div class="seating-status-row">
        <button type="button" class="seating-status-badge compact ${session.seatingConfirmed ? 'confirmed' : 'needs-setup'}" id="stage-open-seating-btn" title="View or edit table seating">
          <span class="seating-status-icon">👥</span>
          <span class="seating-status-text">
            <strong>${session.pax || 4} Pax</strong>
            <span class="seating-sep">·</span>
            <span>${session.teaChoice === 'water' ? 'Water (白开水)' : (session.teaChoice === 'chrysanthemum' ? 'Chrysanthemum (胎菊王)' : 'Pu’er Tea (陈年普洱)')}</span>
            ${session.babyChair ? '<span class="seating-sep">·</span><span>👶 High chair</span>' : ''}
            ${session.kidsCutlery ? '<span class="seating-sep">·</span><span>🥢 Kids cutlery</span>' : ''}
          </span>
          <span class="seating-status-action">${session.seatingConfirmed ? 'Edit ✎' : 'Setup Seating →'}</span>
        </button>
      </div>
    </div>
    <div class="welcome-controls">
      <label class="table-select">TABLE NUMBER
        <select id="table" aria-label="Table number">${Array.from({ length: 20 }, (_, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${String(i + 1).padStart(2, '0') === table ? 'selected' : ''}>Table ${String(i + 1).padStart(2, '0')}</option>`).join('')}</select>
      </label>
    </div>
  </section>

  <div class="stage-container">
    ${tableCart.length ? `
      <div class="stage-pending-cart-banner">
        <div class="stage-pending-cart-info">
          <div class="stage-cart-eyebrow">
            <span class="round-badge">Round ${nextRound} In-Progress Cart</span>
            <span class="stage-cart-time">Shared table tab</span>
          </div>
          <div class="stage-cart-headline">
            <strong>${tableCart.length} item${tableCart.length > 1 ? 's' : ''} in cart (${money(total(tableCart))})</strong>
            <small>Added by: ${tableCart.map(l => `${l.guestEmoji || '👥'} ${esc(l.addedBy || 'Table')}`).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</small>
          </div>
        </div>
        <div class="stage-pending-cart-actions">
          <button type="button" class="secondary small" id="stage-view-cart-btn">View Cart (${tableCart.length})</button>
          <button type="button" class="primary small fire-round-btn" id="stage-fire-round-btn">🔥 Fire Round ${nextRound} Now →</button>
        </div>
      </div>
    ` : ''}

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
          <button type="button" class="secondary small share-aa-chip" id="stage-share-bill-btn">📲 Share AA Bill (好友分账)</button>
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

    <section class="stage-reorder-section">
      <div class="stage-reorder-header">
        <div>
          <span class="eyebrow">MID-MEAL QUICK RE-ORDER · 加菜加饭加饮品</span>
          <h3>1-Tap Mid-Meal Essentials (加单必点)</h3>
        </div>
        <span class="stage-reorder-hint">⚡ Top 5 communal essentials · Instant 1-tap re-order</span>
      </div>
      <div class="stage-reorder-grid">
        ${MID_MEAL_REORDER_ITEMS.map(item => {
          const soldOut = state.unavailable.includes(item.id);
          const inCartQty = tableCart.filter(x => x.id === item.id).reduce((sum, x) => sum + x.qty, 0);
          return `
            <div class="stage-reorder-card ${inCartQty ? 'has-in-cart' : ''}">
              <div class="reorder-card-icon">${item.icon}</div>
              <div class="reorder-card-details">
                <span class="reorder-card-tag">${item.tag}</span>
                <strong class="reorder-card-name">${esc(item.name)}</strong>
                <small class="reorder-card-cn">${item.cn}</small>
                <span class="reorder-card-price">${money(item.price)}</span>
              </div>
              <button type="button" class="stage-reorder-add-btn" data-stage-reorder="${item.id}" ${soldOut ? 'disabled' : ''} aria-label="Add ${esc(item.name)}">
                ${inCartQty ? `+ Add (${inCartQty})` : '+ Add'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </section>

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
          <h3 id="ah-hua-dialog-title">Chat with Ah Hua <span class="online-dot"></span></h3>
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
      const rawProp = getTableSession(state, table).proposal.length ? getTableSession(state, table).proposal : state.proposal;
      const prop = rawProp.map(p => ({
        ...p,
        addedBy: currentGuest?.name || 'Ah Hua Recommendation',
        guestEmoji: currentGuest?.emoji || '✨'
      }));
      const propCents = total(prop);
      dispatchOp({
        type: 'RECORD_AH_HUA_EVENT',
        eventType: 'PROPOSAL_ACCEPTED',
        data: { cents: propCents }
      });
      dispatchOp({
        type: 'RECORD_AH_HUA_EVENT',
        eventType: 'CHIP_CONVERSION'
      });
      addLines(state, prop, table);
      getTableSession(state, table).proposal = [];
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
  const session = getTableSession(state, table);
  if (session && session.gear) {
    customerGear = session.gear;
  }
  const summary = tableSummary(state, table, splitPax);
  const tableCart = session.cart;

  if (role === 'customer' && !session.seatingConfirmed && !activeQueueTicket && seatingPromptShownForTable !== table) {
    seatingPromptShownForTable = table;
    setTimeout(() => {
      if (role === 'customer') openSeatingModal(false);
    }, 250);
  }

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
        <span class="table-peer-chip" title="Live table sync"><span class="live-dot"></span> Table ${table} · Live table sync ${connectedPeers > 1 ? `(${connectedPeers} diners in sync)` : ''} · You: <strong class="guest-name-pill">${currentGuest.emoji} ${esc(currentGuest.name)}</strong></span>
      </div>
      <h1>${esc(T('welcomeTitle'))}${table}${state.replyLanguage === 'zh' ? esc(T('welcomeTitleSuffix') || ' 桌') : ''}</h1>
      <p>${esc(T('tableSubtitle'))}</p>
      <div class="seating-status-row">
        <button type="button" class="seating-status-badge ${session.seatingConfirmed ? 'confirmed' : 'needs-setup'}" id="open-seating-btn" title="Click to view or edit seating pax and tea">
          <span class="seating-status-icon">👥</span>
          <span class="seating-status-text">
            <strong>${session.pax || 4} Pax</strong>
            <span class="seating-sep">·</span>
            <span>${session.teaChoice === 'water' ? 'Water (白开水)' : (session.teaChoice === 'chrysanthemum' ? 'Chrysanthemum (胎菊王)' : 'Pu’er Tea (陈年普洱)')}</span>
            ${session.babyChair ? '<span class="seating-sep">·</span><span>👶 High chair</span>' : ''}
            ${session.kidsCutlery ? '<span class="seating-sep">·</span><span>🥢 Kids cutlery</span>' : ''}
          </span>
          <span class="seating-status-action">${session.seatingConfirmed ? 'Edit ✎' : 'Setup Seating →'}</span>
        </button>
      </div>
    </div>
    <div class="welcome-controls">
      <label class="table-select">TABLE NUMBER
        <select id="table" aria-label="Table number">${Array.from({ length: 20 }, (_, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${String(i + 1).padStart(2, '0') === table ? 'selected' : ''}>Table ${String(i + 1).padStart(2, '0')}</option>`).join('')}</select>
      </label>
    </div>
  </section>

  ${activeQueueTicket ? `
    <div class="queue-banner">
      <span>🚶 <strong>In Line: Ticket ${esc(activeQueueTicket)}</strong> · Pre-order food for instant fire upon seating!</span>
      <button type="button" id="queue-seated-btn">I’m Seated at Table ${table} →</button>
    </div>
  ` : ''}

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
        const inCartQty = tableCart.filter(x => x.id === d.id).reduce((n, x) => n + x.qty, 0);
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
              'Set Menus',
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
        ${category === 'Set Menus' ? `
          <div class="set-menu-grid">
            ${SET_MENUS.map(sm => `
              <article class="set-menu-card">
                <img class="set-menu-photo" src="${esc(sm.image)}" alt="${esc(sm.name)}" loading="lazy">
                <div class="set-menu-content">
                  <span class="set-menu-pax">👥 ${sm.pax} PAX · ${esc(sm.cn)}</span>
                  <h3 class="set-menu-title">${esc(sm.name)}</h3>
                  <p class="set-menu-desc">${esc(sm.desc)}</p>
                  <div class="set-menu-footer">
                    <span class="set-menu-price">${money(sm.price)}</span>
                    <button type="button" class="primary small" data-open-set="${sm.id}">Customise Set →</button>
                  </div>
                </div>
              </article>
            `).join('')}
          </div>
        ` : `
        <div class="menu-grid">
          ${shown.map(d => {
            const soldOut = state.unavailable.includes(d.id);
            const inCartQty = tableCart.filter(x => x.id === d.id).reduce((n, x) => n + x.qty, 0);
            const tableOrders = state.orders.filter(o => o.table === table);
            const tableOrderedQty = tableOrders.flatMap(o => o.items.filter(x => x.id === d.id)).reduce((n, x) => n + x.qty, 0);
            const scarcityBadge = computeDishBadge(d.id, state);
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
        `}
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
  const tableCart = getTableSession(state, table).cart;
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
        ${tableCart.length ? tableCart.map((x, i) => `<div class="cart-line">
          <div>
            <h3>${esc(x.name)}</h3>
            <p>${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''}</p>
            <small>${money(x.unitPrice)} each</small>
            <div><span class="cart-guest-tag">${esc(x.guestEmoji || '👥')} ${esc(x.addedBy || 'Table')}</span></div>
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
      ${tableCart.length ? `<div class="cart-upsell">
        <span>Complete the table:</span>
        <div class="upsell-chips">
          ${!state.unavailable.includes('rice') ? `<button type="button" data-quick-add="rice">+1 Rice (${money(150)})</button>` : ''}
          ${!state.unavailable.includes('tea') ? `<button type="button" data-quick-add="tea">+Pu’er Tea (${money(400)})</button>` : ''}
          ${!state.unavailable.includes('yam') ? `<button type="button" data-quick-add="yam">+Crispy Yam (${money(800)})</button>` : ''}
        </div>
      </div>` : ''}
      <div class="cart-summary">
        <div><span>Round ${nextRound} subtotal</span><strong>${money(total(tableCart))}</strong></div>
        <p>Staff review every round before the kitchen starts.</p>
        <button type="button" id="submit-order" class="primary wide" ${tableCart.length ? '' : 'disabled'}>Send to staff <span>→</span></button>
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
        <ul class="tracking-items-mini">${orderLines(o, false, true)}</ul>
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
  const salesMetrics = getAhHuaSalesMetrics(state);
  const cartRules = state.cartRules || DEFAULT_CART_RULES;

  return `<section class="ops-header">
    <div>
      <div class="eyebrow">A LITTLE HUMAN TOUCH</div>
      <h1>The service desk.</h1>
      <p>Monitor all 20 tables, respond to soup/tea requests, and review each order before it enters the kitchen.</p>
    </div>
    <div class="ops-actions-top">
      <span class="ops-badge">STAFF MODE · Authenticated</span>
      <button type="button" class="secondary small" id="lock-staff-btn" title="Exit and lock staff access">🔒 Lock & Exit</button>
    </div>
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
        ${staffTableFilter !== 'all' ? `
          <button type="button" class="secondary small" data-floor-table="all">Show all tables</button>
          <button type="button" class="secondary small" data-close-table="${staffTableFilter}" style="color:var(--brand-red);border-color:var(--brand-red)">🧹 Close Table ${staffTableFilter} (清台)</button>
        ` : ''}
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
      <section class="ops-panel ah-hua-sales-panel">
        <div class="host-caption-row">
          <div>
            <div class="eyebrow" style="color:#8b754f">AH HUA SALESPERSON METRICS</div>
            <h2>AI Host Revenue Engine</h2>
          </div>
          <span class="sales-live-pill">LIVE METRICS</span>
        </div>
        <p style="font-size:11px;color:#78836f;margin-bottom:12px">Track Ah Hua's upsell performance, extra revenue and conversion rates.</p>
        <div class="sales-metric-grid">
          <div class="sales-stat-card">
            <small>Extra Revenue</small>
            <strong>${money(salesMetrics.totalExtraRevenue)}</strong>
            <span>from upsell & proposals</span>
          </div>
          <div class="sales-stat-card">
            <small>Cart Check Rate</small>
            <strong>${salesMetrics.cartCheckRate}%</strong>
            <span>${salesMetrics.cartCheckAccepted}/${salesMetrics.cartCheckImpressions} accepted</span>
          </div>
          <div class="sales-stat-card">
            <small>Chip Conversions</small>
            <strong>${salesMetrics.chipConversionRate}%</strong>
            <span>${salesMetrics.chipConversions}/${salesMetrics.chipClicks} chips clicked</span>
          </div>
          <div class="sales-stat-card">
            <small>Proposal Rate</small>
            <strong>${salesMetrics.proposalRate}%</strong>
            <span>${salesMetrics.proposalsAccepted} added to cart</span>
          </div>
        </div>

        <div class="cart-rules-admin">
          <h3 style="font-size:11px;letter-spacing:.5px;text-transform:uppercase;margin:14px 0 8px;color:var(--green)">Dynamic Cart Check Rules</h3>
          ${cartRules.map(r => `
            <label class="rule-toggle-row">
              <div>
                <strong>${esc(r.name)}</strong>
                <small>${esc(r.desc)}</small>
              </div>
              <input type="checkbox" data-rule-toggle="${r.id}" ${r.enabled !== false ? 'checked' : ''} aria-label="${esc(r.name)} enabled">
            </label>
          `).join('')}
        </div>
      </section>
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
    <div class="ops-actions-top">
      <span class="ops-badge">KITCHEN KDS · Authenticated</span>
      <button type="button" class="secondary small" id="lock-kitchen-btn" title="Exit and lock kitchen access">🔒 Lock & Exit</button>
    </div>
  </section>

  <section class="kds-summary-bar" aria-label="Active kitchen production totals">
    <div class="kds-stat"><span>🍲 Steamboat pots</span><strong>${steamboatCount}</strong></div>
    <div class="kds-stat"><span>🔥 Wok & sides</span><strong>${wokCount}</strong></div>
    <div class="kds-stat"><span>🍚 Steamed rice</span><strong>${riceCount}</strong></div>
    <div class="kds-stat"><span>🍵 Tea & drinks</span><strong>${drinkCount}</strong></div>
  </section>

  <div class="kds-station-tabs" role="tablist" aria-label="Kitchen station filtering">
    ${[
      { id: 'all', label: 'All Stations (全部)' },
      { id: 'steamboat', label: '🍲 Steamboat (炭火炉档)' },
      { id: 'wok', label: '🔥 Wok (镬气热炒)' },
      { id: 'bar', label: '🍵 Bar & Drinks (水吧)' },
      { id: 'dessert', label: '🍨 Dessert & Cold (甜品凉菜)' }
    ].map(st => `
      <button type="button" class="station-tab-btn ${kitchenStation === st.id ? 'active' : ''}" data-station="${st.id}">
        ${st.label}
      </button>
    `).join('')}
  </div>

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
  document.querySelectorAll('[data-chat]').forEach(b => b.onclick = () => {
    dispatchOp({ type: 'RECORD_AH_HUA_EVENT', eventType: 'CHIP_CLICK' });
    send(b.dataset.chat, b.textContent.trim());
  });
  bindPlanner();

  document.querySelectorAll('[data-service]').forEach(b => b.onclick = () => act(() => {
    const entry = requestService(state, table, b.dataset.service);
    toast(`${entry.label} requested for Table ${table}.`);
  }));
  document.querySelectorAll('[data-service-more]').forEach(b => b.onclick = () => openServiceModal());
  document.querySelectorAll('[data-open-bill]').forEach(b => b.onclick = () => openBillDialog());
  $('#open-steamboat-guide')?.addEventListener('click', () => openSteamboatGuide());
  $('#open-mobile-cart')?.addEventListener('click', () => openMobileCart());
  $('#open-member-btn')?.addEventListener('click', () => openMemberDialog());
  $('#open-banquet-btn')?.addEventListener('click', () => openBanquetDialog());
  $('#queue-seated-btn')?.addEventListener('click', () => {
    if (activeQueueTicket) {
      transferQueueToTable(state, activeQueueTicket, table);
      dispatchOp({ type: 'TRANSFER_QUEUE_TO_TABLE', queueId: activeQueueTicket, table });
      activeQueueTicket = null;
      toast(`Welcome to Table ${table}! Pre-ordered items transferred to active cart.`);
      render();
    }
  });

  document.querySelectorAll('[data-open-set]').forEach(b => {
    b.onclick = () => openSetMenuDialog(b.dataset.openSet);
  });
  document.querySelectorAll('[data-hurry-dish]').forEach(b => {
    b.onclick = () => act(() => {
      const orderId = b.dataset.hurryDish;
      const itemIdx = +b.dataset.itemIdx;
      const dishName = b.dataset.dishName;
      hurryItem(state, table, orderId, itemIdx, dishName);
      dispatchOp({ type: 'HURRY_ITEM', table, orderId, itemIndex: itemIdx, dishName });
      toast(`⚡ 催菜提醒已发送厨房：Table ${table} 催促「${dishName}」！`);
    });
  });
  document.querySelectorAll('[data-void-dish]').forEach(b => {
    b.onclick = () => {
      openVoidDialog(b.dataset.voidDish, +b.dataset.itemIdx, b.dataset.dishName);
    };
  });
  document.querySelectorAll('[data-fire-held]').forEach(b => {
    b.onclick = () => act(() => {
      const orderId = b.dataset.fireHeld;
      const itemIdx = +b.dataset.itemIdx;
      fireHeldItem(state, orderId, itemIdx);
      dispatchOp({ type: 'FIRE_HELD_ITEM', orderId, itemIndex: itemIdx });
      toast(`🔥 起菜指令已发送！厨房档口立即制作。`);
    });
  });

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
  document.querySelectorAll('[data-quick-add]').forEach(b => b.onclick = () => {
    const d = dish(b.dataset.quickAdd);
    const tableCart = getTableSession(state, table).cart;
    const otherGuestItem = tableCart.find(y => y.id === d.id && y.addedBy && y.addedBy !== (currentGuest?.name || 'Guest'));
    const isDuplicate = Boolean(otherGuestItem);
    if (isDuplicate) {
      dockSpeechText = `Eh! ${otherGuestItem.addedBy} already added ${d.name}! Another portion or sharing?`;
      toast(`⚠️ Duplicate notice: ${otherGuestItem.addedBy} already added ${d.name} in this round.`);
    }
    const newLine = makeLine(d.id, 1, 'Regular', state.preference);
    newLine.addedBy = currentGuest?.name || 'Table';
    newLine.guestEmoji = currentGuest?.emoji || '👤';
    dispatchOp({ type: 'ADD_LINES', table, lines: [newLine] });
    updateDockSpeech();
    toast(`${newLine.guestEmoji} ${newLine.addedBy} added ${d.name} to shared cart.`);
  });
  document.querySelectorAll('[data-card-qty]').forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    const id = b.dataset.cardQty;
    const delta = +b.dataset.delta;
    const tableCart = getTableSession(state, table).cart;
    if (delta > 0) {
      const newLine = makeLine(id, 1, 'Regular', state.preference);
      newLine.addedBy = currentGuest?.name || 'Table';
      newLine.guestEmoji = currentGuest?.emoji || '👤';
      dispatchOp({ type: 'ADD_LINES', table, lines: [newLine] });
      toast(`Added 1 ${dish(id).name} to cart.`);
    } else {
      const targetIdx = tableCart.map(x => x.id).lastIndexOf(id);
      if (targetIdx >= 0) {
        dispatchOp({ type: 'UPDATE_QTY', table, lineIndex: targetIdx, delta: -1 });
        toast(`Removed 1 ${dish(id).name} from cart.`);
      }
    }
    updateDockSpeech();
  });
  document.querySelectorAll('[data-dish]').forEach(b => b.onclick = () => openDish(b.dataset.dish));
  document.querySelectorAll('[data-qty]').forEach(b => b.onclick = () => {
    dispatchOp({ type: 'UPDATE_QTY', table, lineIndex: +b.dataset.qty, delta: +b.dataset.delta });
    updateDockSpeech();
  });
  $('#accept-proposal')?.addEventListener('click', () => act(() => {
    const rawProp = getTableSession(state, table).proposal.length ? getTableSession(state, table).proposal : state.proposal;
    const prop = rawProp.map(p => ({
      ...p,
      addedBy: currentGuest?.name || 'Ah Hua Recommendation',
      guestEmoji: currentGuest?.emoji || '✨'
    }));
    const propCents = total(prop);
    dispatchOp({
      type: 'RECORD_AH_HUA_EVENT',
      eventType: 'PROPOSAL_ACCEPTED',
      data: { cents: propCents }
    });
    dispatchOp({
      type: 'RECORD_AH_HUA_EVENT',
      eventType: 'CHIP_CONVERSION'
    });
    addLines(state, prop, table);
    getTableSession(state, table).proposal = [];
    state.proposal = [];
    reply(localReply('added'));
    updateDockSpeech();
    toast('Suggestion added to your shared cart.');
  }));
  document.querySelectorAll('[data-remove-proposal]').forEach(b => b.onclick = () => act(() => {
    const prop = getTableSession(state, table).proposal.length ? getTableSession(state, table).proposal : state.proposal;
    prop.splice(+b.dataset.removeProposal, 1);
    state.proposal = prop;
  }));
  $('#cheaper-proposal')?.addEventListener('click', () => {
    const prop = getTableSession(state, table).proposal.length ? getTableSession(state, table).proposal : state.proposal;
    const price = total(prop);
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
  $('#dismiss-proposal')?.addEventListener('click', () => act(() => {
    getTableSession(state, table).proposal = [];
    state.proposal = [];
  }));
  if ($('#submit-order')) {
    $('#submit-order').onclick = handleOrderSubmit;
  }
  $('#switch-to-stage-btn')?.addEventListener('click', () => {
    customerGear = 'stage';
    dispatchOp({ type: 'SET_TABLE_GEAR', table, gear: 'stage' });
    render();
  });
  $('#stage-back-to-menu-btn')?.addEventListener('click', () => {
    customerGear = 'dock';
    dispatchOp({ type: 'SET_TABLE_GEAR', table, gear: 'dock' });
    render();
  });
  $('#stage-bottom-menu-btn')?.addEventListener('click', () => {
    customerGear = 'dock';
    dispatchOp({ type: 'SET_TABLE_GEAR', table, gear: 'dock' });
    render();
  });
  $('#open-seating-btn')?.addEventListener('click', () => openSeatingModal(true));
  $('#stage-open-seating-btn')?.addEventListener('click', () => openSeatingModal(true));

  document.querySelectorAll('[data-stage-reorder]').forEach(b => {
    b.onclick = () => {
      const dishId = b.dataset.stageReorder;
      const d = dish(dishId);
      if (!d) return;
      const newLine = makeLine(dishId, 1, 'Regular', state.preference);
      newLine.addedBy = currentGuest?.name || 'Table';
      newLine.guestEmoji = currentGuest?.emoji || '👥';
      dispatchOp({ type: 'ADD_LINES', table, lines: [newLine] });
      hapticPulse();
      const summary = tableSummary(state, table, splitPax);
      render();
      toast(`+1 ${d.name} added to Round ${summary.rounds + 1} cart!`);
    };
  });

  $('#stage-fire-round-btn')?.addEventListener('click', () => {
    handleOrderSubmit();
  });

  $('#stage-view-cart-btn')?.addEventListener('click', () => {
    openMobileCart();
  });

  $('#stage-share-bill-btn')?.addEventListener('click', () => {
    openShareBillDialog();
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
      dispatchOp({ type: 'REQUEST_SERVICE', table, serviceType: b.dataset.quickService });
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
  const isSteamboat = d.category === 'Steamboat';

  const allModifiers = [
    ...POPULAR_MODIFIERS.map(m => m.label),
    ...(d.modifiers || [])
  ];
  const uniqueMods = [...new Set(allModifiers)];

  let currentSize = 'Regular';
  let selectedBroth = isSteamboat ? 'Charcoal Milky Broth' : '';

  function renderDishModal() {
    const basePrice = d.price + (currentSize === 'Large' ? 800 : 0);
    const existingQty = Number(dialog.querySelector('#modal-qty-input')?.value) || 1;

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

      <div class="dish-options-section">
        <span class="modifier-label">${isSteamboat ? 'Steamboat Portion & Fish Weight (分量与克重):' : 'Portion Sizing (分量选择):'}</span>
        ${isSteamboat ? `
          <div class="visual-size-grid" role="radiogroup" aria-label="Steamboat portion size">
            <label class="size-card ${currentSize === 'Regular' ? 'active' : ''}">
              <input type="radio" name="size" value="Regular" ${currentSize === 'Regular' ? 'checked' : ''}>
              <div class="size-card-inner">
                <div class="size-card-top">
                  <strong>${STEAMBOAT_PORTIONS.Regular.label}</strong>
                  <span class="size-price">${money(d.price)}</span>
                </div>
                <div class="size-pax-badge">👥 ${STEAMBOAT_PORTIONS.Regular.paxLabel}</div>
                <div class="size-weight-badge">⚖️ ${STEAMBOAT_PORTIONS.Regular.fishWeight} · ${STEAMBOAT_PORTIONS.Regular.brothVolume}</div>
                <p class="size-card-desc">${STEAMBOAT_PORTIONS.Regular.desc}</p>
              </div>
            </label>
            <label class="size-card ${currentSize === 'Large' ? 'active' : ''}">
              <input type="radio" name="size" value="Large" ${currentSize === 'Large' ? 'checked' : ''}>
              <div class="size-card-inner">
                <div class="size-card-top">
                  <strong>${STEAMBOAT_PORTIONS.Large.label}</strong>
                  <span class="size-price">${money(d.price + 800)}</span>
                </div>
                <div class="size-pax-badge banquet">🎉 ${STEAMBOAT_PORTIONS.Large.paxLabel}</div>
                <div class="size-weight-badge">⚖️ ${STEAMBOAT_PORTIONS.Large.fishWeight} · ${STEAMBOAT_PORTIONS.Large.brothVolume}</div>
                <p class="size-card-desc">${STEAMBOAT_PORTIONS.Large.desc}</p>
              </div>
            </label>
          </div>
        ` : `
          <div class="visual-size-grid zi-char-size-grid" role="radiogroup" aria-label="Portion size">
            <label class="size-card ${currentSize === 'Regular' ? 'active' : ''}">
              <input type="radio" name="size" value="Regular" ${currentSize === 'Regular' ? 'checked' : ''}>
              <div class="size-card-inner">
                <div class="size-card-top">
                  <strong>Regular · 标准例牌</strong>
                  <span class="size-price">${money(d.price)}</span>
                </div>
                <div class="size-pax-badge">👥 2–3 Pax sharing</div>
              </div>
            </label>
            ${!d.singleSize ? `
              <label class="size-card ${currentSize === 'Large' ? 'active' : ''}">
                <input type="radio" name="size" value="Large" ${currentSize === 'Large' ? 'checked' : ''}>
                <div class="size-card-inner">
                  <div class="size-card-top">
                    <strong>Large · 大份宴席</strong>
                    <span class="size-price">${money(d.price + 800)}</span>
                  </div>
                  <div class="size-pax-badge banquet">🎉 4–6 Pax sharing</div>
                </div>
              </label>
            ` : ''}
          </div>
        `}
      </div>

      ${isSteamboat ? `
        <div class="broth-selector-section">
          <span class="modifier-label">Select Heritage Charcoal Broth · 百年炭火汤底:</span>
          <div class="broth-cards-grid" role="radiogroup" aria-label="Broth choice">
            ${STEAMBOAT_BROTHS.map(b => `
              <label class="broth-card ${selectedBroth === b.name ? 'active' : ''}">
                <input type="radio" name="brothChoice" value="${b.name}" ${selectedBroth === b.name ? 'checked' : ''}>
                <div class="broth-card-inner">
                  <div class="broth-card-header">
                    <span class="broth-icon">${b.icon}</span>
                    <div>
                      <strong>${b.name}</strong>
                      <small>${b.cn}</small>
                    </div>
                  </div>
                  <p>${b.desc}</p>
                </div>
              </label>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="qty-and-timing-row">
        <label class="qty-control-label">Quantity
          <div class="modal-stepper">
            <button type="button" id="modal-qty-minus" aria-label="Decrease quantity">−</button>
            <input name="qty" id="modal-qty-input" type="number" min="1" max="20" value="${existingQty}" readonly required>
            <button type="button" id="modal-qty-plus" aria-label="Increase quantity">+</button>
          </div>
        </label>

        <div class="timing-selector-col">
          <span class="modifier-label">Serving Timing · 上菜时机:</span>
          <div class="timing-chips">
            <label class="timing-option-label">
              <input type="radio" name="timing" value="fire" checked> 🔥 Cook &amp; Serve (即起)
            </label>
            <label class="timing-option-label">
              <input type="radio" name="timing" value="hold"> ⏸️ Hold (叫起)
            </label>
          </div>
        </div>
      </div>

      <div class="modifier-group">
        <span class="modifier-label">1-Tap Modifiers (Zero typing required):</span>
        <div class="modifier-chips">
          ${uniqueMods.map(mod => `<button type="button" class="mod-chip ${selectedMods.has(mod) ? 'active' : ''}" data-mod="${esc(mod)}" aria-pressed="${selectedMods.has(mod)}">${esc(mod)}</button>`).join('')}
        </div>
      </div>

      <details class="custom-note-details">
        <summary>Other special request for kitchen? (optional)</summary>
        <textarea name="notes" maxlength="160" placeholder="e.g. sauce on side, less salty">${esc(state.preference)}</textarea>
      </details>
      <p class="muted">Requests need staff confirmation.</p>
      <button class="primary wide" id="modal-add-btn" type="submit">Add to shared cart · <span id="modal-price-calc">${money(basePrice * existingQty)}</span> +</button>
    </form>`;

    // Wire size radio cards
    dialog.querySelectorAll('input[name="size"]').forEach(r => {
      r.onchange = () => {
        currentSize = r.value;
        renderDishModal();
      };
    });

    // Wire broth radio cards
    dialog.querySelectorAll('input[name="brothChoice"]').forEach(r => {
      r.onchange = () => {
        selectedBroth = r.value;
        renderDishModal();
      };
    });

    // Wire stepper
    const qtyInput = dialog.querySelector('#modal-qty-input');
    const priceCalc = dialog.querySelector('#modal-price-calc');

    function updateCalc() {
      const p = d.price + (currentSize === 'Large' ? 800 : 0);
      const q = Number(qtyInput?.value) || 1;
      if (priceCalc) priceCalc.textContent = money(p * q);
    }

    dialog.querySelector('#modal-qty-minus')?.addEventListener('click', () => {
      let val = Number(qtyInput.value) || 1;
      if (val > 1) { qtyInput.value = val - 1; updateCalc(); }
    });
    dialog.querySelector('#modal-qty-plus')?.addEventListener('click', () => {
      let val = Number(qtyInput.value) || 1;
      if (val < 20) { qtyInput.value = val + 1; updateCalc(); }
    });

    // Wire modifier chips
    dialog.querySelectorAll('[data-mod]').forEach(chip => {
      chip.onclick = () => {
        const mod = chip.dataset.mod;
        if (selectedMods.has(mod)) selectedMods.delete(mod); else selectedMods.add(mod);
        chip.setAttribute('aria-pressed', String(selectedMods.has(mod)));
        chip.classList.toggle('active', selectedMods.has(mod));
      };
    });

    // Form submit
    dialog.querySelector('#dish-form').onsubmit = e => {
      e.preventDefault();
      const form = new FormData(e.target);
      const qty = Number(form.get('qty'));
      const timing = form.get('timing') || 'fire';
      const customNote = String(form.get('notes') || '').trim();

      const notesParts = [];
      if (isSteamboat && selectedBroth) {
        notesParts.push(selectedBroth);
      }
      notesParts.push(...selectedMods);
      if (customNote) notesParts.push(customNote);

      const combinedNotes = notesParts.join(', ');
      if (!Number.isInteger(qty) || qty < 1) return;

      const tableCart = getTableSession(state, table).cart;
      const otherGuestItem = tableCart.find(y => y.id === id && y.addedBy && y.addedBy !== (currentGuest?.name || 'Guest'));
      const isDuplicate = Boolean(otherGuestItem);
      if (isDuplicate) {
        dockSpeechText = `Eh! ${otherGuestItem.addedBy} already added ${d.name}! Another portion or sharing?`;
        toast(`⚠️ Duplicate notice: ${otherGuestItem.addedBy} already added ${d.name} in this round.`);
      }

      const existingIndex = tableCart.findIndex(y => y.id === id && y.size === currentSize && y.notes === combinedNotes && (y.timing || 'fire') === timing);
      try {
        if (existingIndex >= 0) {
          if (qty > 20) throw Error('Maximum 20 of each dish.');
          const delta = qty - tableCart[existingIndex].qty;
          if (delta !== 0) {
            dispatchOp({ type: 'UPDATE_QTY', table, lineIndex: existingIndex, delta });
          }
        } else {
          const newLine = makeLine(id, qty, currentSize, combinedNotes);
          newLine.addedBy = currentGuest?.name || 'Table';
          newLine.guestEmoji = currentGuest?.emoji || '👤';
          newLine.timing = timing;
          dispatchOp({ type: 'ADD_LINES', table, lines: [newLine] });
        }
        updateDockSpeech();
        closeTopLayer(dialog);
        toast(existingIndex >= 0 ? `Updated ${d.name} (${qty}) in cart.` : `${currentGuest.emoji} Added ${d.name} (${currentSize}) to shared cart.`);
      } catch (error) {
        toast(error.message);
      }
    };
  }

  renderDishModal();
  dialog.showModal();
}
      toast(existingIndex >= 0 ? `Updated ${d.name} (${qty}) in cart.` : `${currentGuest.emoji} Added ${d.name} to shared cart.`);
    } catch (error) {
      toast(error.message);
    }
  };
}

function openBillDialog() {
  const dialog = $('#bill-dialog');
  const renderBillContent = () => {
    const summary = tableSummary(state, table, splitPax);
    const guests = guestBreakdown(state, table);

    dialog.innerHTML = `<div class="bill-modal-body">
      <div class="dialog-top">
        <span class="eyebrow">HERITAGE TABLE CHECK · 账单与结算</span>
        <button type="button" class="close-dialog" aria-label="Close bill summary">×</button>
      </div>
      <h2 id="bill-dialog-title">Table ${table} · Running Tab</h2>
      <p>All active rounds combined for your table. Amount charged in this demo is always <b>S$0.00</b>.</p>

      <div class="bill-tabs-nav" role="tablist">
        <button type="button" class="bill-tab-btn ${billTab === 'split' ? 'active' : ''}" id="tab-split-btn">Split Evenly · 均分 (AA制)</button>
        <button type="button" class="bill-tab-btn ${billTab === 'items' ? 'active' : ''}" id="tab-items-btn">Pay For My Items · 按人付 (${guests.length} diners)</button>
      </div>

      ${summary.activeOrders.length ? (
        billTab === 'split' ? `
          <div class="bill-rounds-list">
            ${summary.activeOrders.map(o => `<div class="bill-round-block">
              <div class="bill-round-head">
                <strong>Round ${o.round || 1} (${o.id})</strong>
                ${badge(o.status)}
              </div>
              <ul>
                ${o.items.map(x => `<li class="${x.voided ? 'voided-item' : ''}"><span>${x.qty} × ${esc(x.name)} <small>(${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''})</small></span><strong>${x.voided ? `<del>${money(x.qty * x.unitPrice)}</del>` : money(x.qty * x.unitPrice)}</strong></li>`).join('')}
              </ul>
            </div>`).join('')}
          </div>
          <div class="bill-coupon-bar">
            <label for="bill-coupon-picker">🎟️ Member Voucher / 优惠券:</label>
            <select id="bill-coupon-picker">
              <option value="">-- No Voucher Applied --</option>
              ${COUPON_TEMPLATES.map(c => `
                <option value="${c.code}" ${summary.coupon?.code === c.code ? 'selected' : ''}>
                  ${c.title} (-${money(c.discount)})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="bill-totals-box">
            <div><span>Dishes subtotal (${summary.itemCount} items)</span><strong>${money(summary.rawSubtotal ?? summary.subtotal)}</strong></div>
            ${summary.discount > 0 ? `
              <div class="discount-line" style="color:var(--brand-red);display:flex;justify-content:space-between">
                <span>Voucher discount (${esc(summary.coupon?.code || 'PROMO')})</span>
                <strong>- ${money(summary.discount)}</strong>
              </div>
            ` : ''}
            <div class="muted-line"><span>10% Service Charge</span><span>${money(summary.serviceCharge)}</span></div>
            <div class="muted-line"><span>9% GST (Inclusive)</span><span>${money(summary.gst)}</span></div>
            <div class="muted-line"><span>Total amount</span><span>${money(summary.grandTotal)}</span></div>
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
              <span>Dish share: <b>${money(summary.subtotalPerPax)}</b> / pax</span>
              <small>With SC &amp; GST: ${money(summary.grandTotalPerPax)} / pax</small>
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
                <div class="sgqr-ref">Ref: T${table}-SPLIT-${splitPax}PAX</div>
                <div class="sgqr-amount-pill">Exact PayNow: ${money(summary.grandTotalPerPax)} / pax</div>
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
            ${currentMember && currentMember.balance >= summary.grandTotalPerPax ? `
              <button type="button" class="pay-share-btn" id="pay-member-balance-btn" style="background:#1f2937">
                <span>💰 VIP Balance · ${money(summary.grandTotalPerPax)}</span>
                <small>Bal: ${money(currentMember.balance)}</small>
              </button>
            ` : ''}
            <button type="button" class="pay-share-btn" id="pay-my-share-btn">
              <span>💳 ${esc(T('payShare'))} · ${money(summary.grandTotalPerPax)}</span>
              <small>Simulated 1-tap checkout</small>
            </button>
            <button type="button" class="share-bill-btn" id="share-bill-btn">
              <span>${esc(T('shareBill'))}</span>
            </button>
          </div>
        ` : `
          <div class="guest-bill-list">
            ${guests.map(g => `
              <div class="guest-bill-card">
                <div class="guest-bill-head">
                  <strong>${g.emoji} ${esc(g.guestName)}</strong>
                  <span style="font-weight:700;color:var(--brand-red)">${money(g.grandTotal)}</span>
                </div>
                <div class="guest-bill-items">
                  ${g.items.map(it => `<div>${it.qty} × ${esc(it.name)} (${money(it.qty * it.unitPrice)})</div>`).join('')}
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:10px;border-top:1px dashed #e1e7db;padding-top:6px;">
                  <span>Incl. 10% SC &amp; 9% GST</span>
                  <button type="button" class="mini-btn fire" data-pay-guest="${esc(g.guestName)}" data-amount="${g.grandTotal}">PayNow ${money(g.grandTotal)} →</button>
                </div>
              </div>
            `).join('')}
          </div>
        `
      ) : `<div class="cart-empty"><div>🧾</div><h3>No submitted rounds for Table ${table} yet.</h3><p>Add dishes to your cart and send them to staff first.</p></div>`}

      <div class="bill-modal-actions" style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
        ${summary.activeOrders.length ? `
          <button type="button" class="secondary wide" id="open-e-receipt-btn">🧾 View Official GST E-Receipt (查看电子发票) →</button>
          <button type="button" class="secondary wide" id="open-review-btn">🌟 Rate Meal &amp; Earn 50 VIP Points (好评有礼) →</button>
        ` : ''}
      </div>
    </div>`;

    dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
    dialog.querySelector('#tab-split-btn')?.addEventListener('click', () => { billTab = 'split'; renderBillContent(); });
    dialog.querySelector('#tab-items-btn')?.addEventListener('click', () => { billTab = 'items'; renderBillContent(); });
    dialog.querySelector('#open-e-receipt-btn')?.addEventListener('click', () => {
      closeTopLayer(dialog);
      openEReceiptDialog();
    });
    dialog.querySelector('#open-review-btn')?.addEventListener('click', () => {
      closeTopLayer(dialog);
      openReviewDialog();
    });
    dialog.querySelector('#bill-coupon-picker')?.addEventListener('change', e => {
      const code = e.target.value;
      if (code) {
        applyCoupon(state, table, code);
        dispatchOp({ type: 'APPLY_COUPON', table, couponCode: code });
        toast(`🎟️ Voucher ${code} applied!`);
      } else {
        removeCoupon(state, table);
        dispatchOp({ type: 'REMOVE_COUPON', table });
        toast('Voucher removed.');
      }
      renderBillContent();
      render();
    });
    dialog.querySelector('#pay-member-balance-btn')?.addEventListener('click', () => {
      try {
        payWithMemberBalance(state, table, currentMemberPhone);
        dispatchOp({ type: 'PAY_WITH_BALANCE', table, phone: currentMemberPhone });
        triggerOrderAnimation();
        hapticPulse();
        toast('💰 Bill paid via VIP Stored Balance! Thank you.');
        renderBillContent();
        render();
        setTimeout(() => openReviewDialog(), 600);
      } catch (err) {
        toast(err.message);
      }
    });
    dialog.querySelectorAll('[data-pay-guest]').forEach(b => b.onclick = () => {
      triggerOrderAnimation();
      hapticPulse();
      toast(`Simulated PayNow payment of ${money(+b.dataset.amount)} received for ${b.dataset.payGuest}. Thank you!`);
    });
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
      setTimeout(() => openReviewDialog(), 800);
    });
    dialog.querySelector('#save-sgqr-btn')?.addEventListener('click', () => {
      hapticPulse();
      toast('SGQR saved to photos. Scan with DBS PayLah!, OCBC Pay Anyone or UOB TMRW.');
    });
    dialog.querySelector('#pay-my-share-btn')?.addEventListener('click', () => {
      triggerOrderAnimation();
      hapticPulse();
      toast(`Simulated payment of ${money(summary.grandTotalPerPax)} received for your share. Thank you!`);
      setTimeout(() => openReviewDialog(), 800);
    });
    dialog.querySelector('#share-bill-btn')?.addEventListener('click', () => {
      hapticPulse();
      openShareBillDialog();
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

function openShareBillDialog() {
  const dialog = $('#share-bill-dialog');
  if (!dialog) return;

  const summary = tableSummary(state, table, splitPax);
  const guests = guestBreakdown(state, table);
  let shareMode = 'even';
  let hostName = currentMemberPhone ? (getMember(state, currentMemberPhone)?.name || currentGuest?.name || 'Marcus') : (currentGuest?.name || 'Marcus');
  let hostPhone = currentMemberPhone || '9123 4567';

  const renderContent = () => {
    const shareText = generateAABillMessage(state, table, {
      hostName,
      hostPhone,
      mode: shareMode,
      pax: splitPax
    });

    dialog.innerHTML = `
      <div class="share-aa-body">
        <div class="dialog-top">
          <span class="eyebrow">FRIENDS AA BILL GENERATOR · 好友分账神器</span>
          <button type="button" class="close-dialog" aria-label="Close share AA modal">×</button>
        </div>

        <div class="share-aa-header">
          <div class="aa-header-icon">💸</div>
          <div>
            <h2 id="share-bill-title">1-Tap WhatsApp &amp; PayNow AA Split</h2>
            <p>Generate an instant bill breakdown card to paste into your WhatsApp or Telegram chat group.</p>
          </div>
        </div>

        <div class="aa-config-grid">
          <label class="aa-field">
            <span>Table Host Name (付款人姓名):</span>
            <input type="text" id="aa-host-name" value="${esc(hostName)}" placeholder="e.g. Marcus">
          </label>
          <label class="aa-field">
            <span>PayNow Mobile / UEN (收款电话):</span>
            <input type="tel" id="aa-host-phone" value="${esc(hostPhone)}" placeholder="e.g. 9123 4567">
          </label>
        </div>

        <div class="aa-mode-tabs" role="tablist">
          <button type="button" class="aa-tab-btn ${shareMode === 'even' ? 'active' : ''}" id="aa-mode-even">
            👥 Even Split · AA均分 (${splitPax} Pax · ${money(summary.grandTotalPerPax)} / pax)
          </button>
          <button type="button" class="aa-tab-btn ${shareMode === 'itemized' ? 'active' : ''}" id="aa-mode-itemized">
            🧾 Itemized · 按人分账 (${guests.length} diners)
          </button>
        </div>

        <div class="aa-preview-card">
          <div class="aa-preview-label">
            <span>WhatsApp / Chat Card Live Preview:</span>
            <button type="button" class="copy-preview-btn" id="aa-copy-btn">📋 Copy Text</button>
          </div>
          <pre class="aa-preview-text" id="aa-preview-pre">${esc(shareText)}</pre>
        </div>

        <div class="aa-actions-grid">
          <button type="button" class="whatsapp-share-btn" id="aa-whatsapp-btn">
            <span>💬 Send to WhatsApp Group (发送至微信/WhatsApp)</span>
          </button>
          <button type="button" class="telegram-share-btn" id="aa-telegram-btn">
            <span>✈️ Share to Telegram</span>
          </button>
        </div>
      </div>
    `;

    dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);

    const nameInput = dialog.querySelector('#aa-host-name');
    nameInput?.addEventListener('input', e => {
      hostName = e.target.value.trim() || 'Host';
      updatePreview();
    });

    const phoneInput = dialog.querySelector('#aa-host-phone');
    phoneInput?.addEventListener('input', e => {
      hostPhone = e.target.value.trim();
      updatePreview();
    });

    dialog.querySelector('#aa-mode-even')?.addEventListener('click', () => {
      shareMode = 'even';
      renderContent();
    });

    dialog.querySelector('#aa-mode-itemized')?.addEventListener('click', () => {
      shareMode = 'itemized';
      renderContent();
    });

    function updatePreview() {
      const curText = generateAABillMessage(state, table, {
        hostName,
        hostPhone,
        mode: shareMode,
        pax: splitPax
      });
      const pre = dialog.querySelector('#aa-preview-pre');
      if (pre) pre.textContent = curText;
    }

    dialog.querySelector('#aa-copy-btn')?.addEventListener('click', () => {
      const textToCopy = generateAABillMessage(state, table, {
        hostName,
        hostPhone,
        mode: shareMode,
        pax: splitPax
      });
      copyBillText(textToCopy);
      hapticPulse();
      toast('📋 AA Bill split copied to clipboard! Ready to paste into WhatsApp.');
    });

    dialog.querySelector('#aa-whatsapp-btn')?.addEventListener('click', () => {
      const textToSend = generateAABillMessage(state, table, {
        hostName,
        hostPhone,
        mode: shareMode,
        pax: splitPax
      });
      hapticPulse();
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToSend)}`;
      window.open(waUrl, '_blank');
    });

    dialog.querySelector('#aa-telegram-btn')?.addEventListener('click', () => {
      const textToSend = generateAABillMessage(state, table, {
        hostName,
        hostPhone,
        mode: shareMode,
        pax: splitPax
      });
      hapticPulse();
      const tgUrl = `https://t.me/share/url?text=${encodeURIComponent(textToSend)}&url=${encodeURIComponent('https://ahhua.vercel.app/?table=' + table)}`;
      window.open(tgUrl, '_blank');
    });
  };

  renderContent();
  dialog.showModal();
}

function openEReceiptDialog() {
  const dialog = $('#e-receipt-dialog');
  if (!dialog) return;
  const rc = getEReceipt(state, table, splitPax);

  dialog.innerHTML = `
    <div class="e-receipt-wrap">
      <div class="dialog-top">
        <span class="eyebrow">OFFICIAL TAX INVOICE · 正式结账单</span>
        <button type="button" class="close-dialog" aria-label="Close receipt">×</button>
      </div>
      <div class="e-receipt-header">
        <h3 id="e-receipt-title">${esc(rc.merchant.name)}</h3>
        <p>${rc.merchant.cn}</p>
        <p>${rc.merchant.address} · Tel: ${rc.merchant.phone}</p>
        <p>GST Reg No: ${rc.merchant.gstReg} · Co Reg: ${rc.merchant.regNo}</p>
      </div>
      <div class="e-receipt-meta">
        <div>
          <div><strong>Receipt:</strong> ${rc.receiptNo}</div>
          <div><strong>Table:</strong> Table ${rc.table} (${rc.pax} Diners)</div>
        </div>
        <div style="text-align:right">
          <div><strong>Date:</strong> ${rc.dateTime}</div>
          <div><strong>POS / Station:</strong> POS-01 (KDS Auto)</div>
        </div>
      </div>
      <table class="e-receipt-lines">
        <thead>
          <tr>
            <th>Item &amp; Specifications</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Price</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rc.items.map(it => `
            <tr>
              <td><b>${esc(it.name)}</b><br><small>${esc(it.size)}${it.notes ? ' · ' + esc(it.notes) : ''}</small></td>
              <td style="text-align:center">${it.qty}</td>
              <td style="text-align:right">${money(it.unitPrice)}</td>
              <td style="text-align:right">${money(it.qty * it.unitPrice)}</td>
            </tr>
          `).join('')}
          ${rc.voidedItems.length ? rc.voidedItems.map(it => `
            <tr style="color:#888;text-decoration:line-through">
              <td>${esc(it.name)} (${esc(it.voidReason || 'Voided')})</td>
              <td style="text-align:center">${it.qty}</td>
              <td style="text-align:right">${money(it.unitPrice)}</td>
              <td style="text-align:right">S$0.00</td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>
      <div class="e-receipt-totals">
        <div><span>Subtotal:</span><span>${money(rc.subtotal)}</span></div>
        <div><span>10% Service Charge:</span><span>${money(rc.serviceCharge)}</span></div>
        <div><span>9% GST (Inclusive):</span><span>${money(rc.gst)}</span></div>
        <div class="grand-total"><span>Total Amount Paid:</span><span>${money(rc.grandTotal)}</span></div>
      </div>
      <div class="e-receipt-stamp">PAID · 结账完成</div>
      <div class="dialog-actions" style="margin-top:16px">
        <button type="button" class="secondary" id="print-receipt-btn">🖨️ Save PDF / Print</button>
        <button type="button" class="secondary" id="rate-experience-btn">🌟 Rate Meal &amp; Earn 50 Pts</button>
        <button type="button" class="primary" id="settle-and-close-btn">🔒 Close &amp; Free Table</button>
      </div>
    </div>
  `;

  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#print-receipt-btn')?.addEventListener('click', () => {
    toast('PDF e-receipt generated and saved to device photos.');
  });
  dialog.querySelector('#rate-experience-btn')?.addEventListener('click', () => {
    closeTopLayer(dialog);
    openReviewDialog();
  });
  dialog.querySelector('#settle-and-close-btn')?.addEventListener('click', () => {
    dispatchOp({ type: 'CLOSE_TABLE', table });
    closeTopLayer(dialog);
    toast(`Table ${table} session closed and table released.`);
  });
}

function openVoidDialog(orderId, itemIndex, dishName) {
  const dialog = $('#void-dialog');
  if (!dialog) return;

  dialog.innerHTML = `
    <div class="void-modal-body" style="padding:10px 4px">
      <div class="dialog-top">
        <span class="eyebrow">VOID REQUEST · 退菜申请</span>
        <button type="button" class="close-dialog" aria-label="Close void modal">×</button>
      </div>
      <div style="text-align:center;margin:10px 0 16px;">
        <div style="font-size:36px;margin-bottom:8px">❌</div>
        <h2 id="void-dialog-title">Cancel ${esc(dishName)}?</h2>
        <p style="font-size:12px;color:var(--muted)">Select reason for voiding this unserved dish. The kitchen ticket will be updated immediately.</p>
      </div>
      <form id="void-reason-form">
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;padding:8px 10px;background:#f7f9f4;border-radius:6px;border:1px solid #dce2d4;cursor:pointer;">
            <input type="radio" name="void_reason" value="Wait too long (等候时间过长)" checked> 等候时间过长 (Wait too long)
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;padding:8px 10px;background:#f7f9f4;border-radius:6px;border:1px solid #dce2d4;cursor:pointer;">
            <input type="radio" name="void_reason" value="Ordered by mistake (顾客点错菜品)"> 顾客点错菜品 (Ordered by mistake)
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;padding:8px 10px;background:#f7f9f4;border-radius:6px;border:1px solid #dce2d4;cursor:pointer;">
            <input type="radio" name="void_reason" value="Guest leaving in hurry (赶时间需离开)"> 赶时间需离开 (Guest leaving in hurry)
          </label>
        </div>
        <div class="dialog-actions">
          <button type="button" class="secondary" id="cancel-void-btn">Keep Dish</button>
          <button type="submit" class="primary" style="background:#8f342c;border-color:#8f342c">Confirm Void (确认退菜)</button>
        </div>
      </form>
    </div>
  `;

  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#cancel-void-btn').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#void-reason-form').onsubmit = e => {
    e.preventDefault();
    const reason = new FormData(e.target).get('void_reason');
    dispatchOp({ type: 'VOID_ITEM', table, id: orderId, lineIndex: itemIndex, reason });
    closeTopLayer(dialog);
    toast(`Dish ${dishName} voided and removed from bill.`);
  };
}

function openSetMenuDialog(setId) {
  const dialog = $('#set-menu-dialog');
  if (!dialog) return;
  const sm = SET_MENUS.find(s => s.id === setId);
  if (!sm) return;

  dialog.innerHTML = `
    <div class="set-modal-body" style="padding:14px">
      <div class="dialog-top">
        <span class="eyebrow">TEOCHEW SET BANQUET · 精选套餐</span>
        <button type="button" class="close-dialog" aria-label="Close set modal">×</button>
      </div>
      <div style="margin:10px 0 14px">
        <span class="set-menu-pax">👥 ${sm.pax} PAX · ${esc(sm.cn)}</span>
        <h2 id="set-menu-title" style="font-size:18px;margin:4px 0">${esc(sm.name)}</h2>
        <p style="font-size:11px;color:var(--muted);line-height:1.5">${esc(sm.desc)}</p>
      </div>
      <form id="set-menu-form">
        <div class="set-slots-container">
          ${sm.slots.map((slot, sIdx) => `
            <div class="set-slot-group">
              <span class="set-slot-title">SLOT 0${sIdx + 1} · ${esc(slot.name)}</span>
              <div class="set-slot-options">
                ${slot.options.map((opt, oIdx) => `
                  <label class="set-option-label">
                    <input type="radio" name="slot_${sIdx}" value="${opt.id}" ${oIdx === 0 ? 'checked' : ''} data-price-diff="${opt.priceDiff}">
                    <span>${esc(opt.name)}</span>
                    ${opt.priceDiff ? `<small style="margin-left:auto;color:var(--brand-red)">+${money(opt.priceDiff)}</small>` : ''}
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div style="background:#f8faf5;border:1px dashed #dce2d4;border-radius:8px;padding:10px;margin-bottom:14px;font-size:11px">
          <strong>Included Fixed Items (包含主食与茶水):</strong>
          <ul style="margin:6px 0 0 16px;padding:0;color:var(--muted)">
            ${sm.fixedItems.map(f => `<li>${f.qty} × ${esc(f.name)} (${esc(f.size)})</li>`).join('')}
          </ul>
        </div>
        <button type="submit" class="primary wide" id="confirm-add-set-btn">
          Add Entire Set to Table Cart · ${money(sm.price)} →
        </button>
      </form>
    </div>
  `;

  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#set-menu-form').onsubmit = e => {
    e.preventDefault();
    const form = new FormData(e.target);
    const chosenLines = [];

    sm.slots.forEach((slot, sIdx) => {
      const chosenId = form.get(`slot_${sIdx}`);
      const opt = slot.options.find(o => o.id === chosenId);
      if (opt) {
        const line = makeLine(opt.id, 1, 'Regular', `Set Menu: ${sm.name}`);
        line.addedBy = currentGuest?.name || 'Table';
        line.guestEmoji = currentGuest?.emoji || '👥';
        chosenLines.push(line);
      }
    });

    sm.fixedItems.forEach(f => {
      const line = makeLine(f.id, f.qty, f.size || 'Regular', `Set Menu: ${sm.name}`);
      line.addedBy = currentGuest?.name || 'Table';
      line.guestEmoji = currentGuest?.emoji || '👥';
      chosenLines.push(line);
    });

    dispatchOp({ type: 'ADD_LINES', table, lines: chosenLines });
    closeTopLayer(dialog);
    toast(`🍱 ${sm.name} added to Table ${table} shared cart!`);
  };
}

function openMemberDialog() {
  const dialog = $('#member-dialog');
  if (!dialog) return;

  const renderMemberModal = () => {
    const member = currentMemberPhone ? getMember(state, currentMemberPhone) : null;
    if (!member) {
      dialog.innerHTML = `
        <div class="member-modal-body" style="padding:14px">
          <div class="dialog-top">
            <span class="eyebrow">NAN HWA CHONG VIP · 贵宾会员礼遇</span>
            <button type="button" class="close-dialog" aria-label="Close member modal">×</button>
          </div>
          <div style="text-align:center;margin:12px 0 16px">
            <div style="font-size:36px;margin-bottom:6px">🎁</div>
            <h2 id="member-dialog-title" style="margin:0 0 4px">Join VIP &amp; Waive Table Tea</h2>
            <p style="font-size:11px;color:var(--muted)">Instant privileges for Table ${table} with zero card fees:</p>
          </div>
          <div style="background:#fef7f5;border:1px dashed #f0c3b8;border-radius:10px;padding:12px;margin-bottom:16px;font-size:11px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span>🍵</span><strong>Free Table Tea Cover (免茶位费 · S$3.00/pot saved)</strong></div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span>🎟️</span><strong>S$15 Return Steamboat Voucher (30天复购券)</strong></div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span>💰</span><strong>Stored Value Bonuses: Top up S$200 get S$230</strong></div>
            <div style="display:flex;align-items:center;gap:8px"><span>⭐️</span><strong>1 VIP Loyalty Point per S$1 spent</strong></div>
          </div>
          <form id="member-signup-form">
            <label style="display:block;margin-bottom:10px;font-size:11px">Singapore Mobile (8 digits)
              <input type="tel" id="member-phone-input" placeholder="e.g. 91234567" required pattern="[89][0-9]{7}" maxlength="8" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;margin-top:4px;font-size:14px;box-sizing:border-box" />
            </label>
            <label style="display:block;margin-bottom:14px;font-size:11px">Full Name / Preferred Salutation
              <input type="text" id="member-name-input" placeholder="e.g. Marcus Wong" required style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;margin-top:4px;font-size:14px;box-sizing:border-box" />
            </label>
            <button type="submit" class="primary wide" style="background:#8f342c;border-color:#8f342c">Join VIP &amp; Claim Perks (立即入会) →</button>
          </form>
        </div>
      `;
      dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
      dialog.querySelector('#member-signup-form').onsubmit = e => {
        e.preventDefault();
        const phone = $('#member-phone-input').value.trim();
        const name = $('#member-name-input').value.trim();
        try {
          const m = registerMember(state, { phone, name });
          dispatchOp({ type: 'REGISTER_MEMBER', phone, name });
          currentMemberPhone = phone;
          try { localStorage.setItem('ahhua-member-phone', phone); } catch {}
          toast(`🎉 Welcome ${m.name}! Free tea perk applied to Table ${table}.`);
          renderMemberModal();
          render();
        } catch (err) {
          toast(err.message);
        }
      };
    } else {
      dialog.innerHTML = `
        <div class="member-modal-body" style="padding:14px">
          <div class="dialog-top">
            <span class="eyebrow">VIP PASSBOOK · 贵宾会员中心</span>
            <button type="button" class="close-dialog" aria-label="Close member modal">×</button>
          </div>
          <div class="member-card">
            <div class="member-card-header">
              <div>
                <strong id="member-dialog-title" style="font-size:16px;display:block">${esc(member.name)}</strong>
                <small style="color:#d1d5db">+65 ${esc(member.phone)} · Member #${member.phone.slice(-4)}</small>
              </div>
              <span class="member-tier-pill ${member.tier}">${member.tier} VIP</span>
            </div>
            <div class="member-stats-row">
              <div>
                <div class="member-stat-val">${money(member.balance || 0)}</div>
                <div class="member-stat-lbl">Stored Value (储值)</div>
              </div>
              <div>
                <div class="member-stat-val">${member.points || 0}</div>
                <div class="member-stat-lbl">Points (积分)</div>
              </div>
              <div>
                <div class="member-stat-val">${member.visits || 1}</div>
                <div class="member-stat-lbl">Visits (到店)</div>
              </div>
            </div>
          </div>

          <h3 style="font-size:13px;margin:12px 0 6px">Stored Value Perks (充值返赠 · 即充即用)</h3>
          <div class="stored-value-grid">
            ${STORED_VALUE_TIERS.map(t => `
              <div class="stored-value-card" data-topup-id="${t.id}" data-pay="${t.pay}" data-credit="${t.credit}">
                <strong style="font-size:14px;color:var(--brand-red)">${money(t.credit)}</strong>
                <div style="font-size:11px;color:#555">Pay ${money(t.pay)}</div>
                <span class="stored-bonus-tag">${t.tag}</span>
              </div>
            `).join('')}
          </div>

          <h3 style="font-size:13px;margin:14px 0 6px">Available Vouchers (我的优惠券)</h3>
          <div class="vouchers-list">
            ${(member.coupons || []).map(code => {
              const tmpl = COUPON_TEMPLATES.find(c => c.code === code) || { code, title: code, discount: 500, desc: 'Special perk' };
              return `
                <div class="voucher-item">
                  <div>
                    <strong>${esc(tmpl.title)}</strong>
                    <small>${esc(tmpl.desc)}</small>
                  </div>
                  <div style="text-align:right">
                    <span class="voucher-discount">-${money(tmpl.discount)}</span>
                    <button type="button" class="mini-btn fire" style="margin-top:4px" data-apply-voucher="${tmpl.code}">Apply to Table</button>
                  </div>
                </div>
              `;
            }).join('') || '<div style="font-size:11px;color:var(--muted)">No active vouchers.</div>'}
          </div>

          <div class="dialog-actions" style="margin-top:14px">
            <button type="button" class="secondary small" id="member-logout-btn">Log out / Switch account</button>
            <button type="button" class="primary small" id="done-member-btn">Done</button>
          </div>
        </div>
      `;

      dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
      dialog.querySelector('#done-member-btn').onclick = () => closeTopLayer(dialog);
      dialog.querySelector('#member-logout-btn').onclick = () => {
        currentMemberPhone = null;
        try { localStorage.removeItem('ahhua-member-phone'); } catch {}
        toast('Logged out of member account.');
        renderMemberModal();
        render();
      };
      dialog.querySelectorAll('[data-topup-id]').forEach(b => {
        b.onclick = () => {
          const pay = +b.dataset.pay;
          const credit = +b.dataset.credit;
          topUpMemberBalance(state, member.phone, pay, credit);
          dispatchOp({ type: 'TOP_UP_STORED_VALUE', phone: member.phone, payCents: pay, creditCents: credit });
          triggerOrderAnimation();
          hapticPulse();
          toast(`💳 Stored value topped up! Added ${money(credit)} to your card.`);
          renderMemberModal();
          render();
        };
      });
      dialog.querySelectorAll('[data-apply-voucher]').forEach(b => {
        b.onclick = () => {
          applyCoupon(state, table, b.dataset.applyVoucher);
          dispatchOp({ type: 'APPLY_COUPON', table, couponCode: b.dataset.applyVoucher });
          toast(`🎟️ Voucher applied to Table ${table} tab!`);
          closeTopLayer(dialog);
          render();
        };
      });
    }
  };

  renderMemberModal();
  dialog.showModal();
}

let selectedRating = 5;
let selectedReviewTags = new Set(['Charcoal Broth (百年炭火浓汤)', 'Fresh Sliced Fish (鱼肉鲜甜嫩滑)']);

function openReviewDialog() {
  const dialog = $('#review-dialog');
  if (!dialog) return;

  const reviewTags = [
    'Charcoal Broth (百年炭火浓汤)',
    'Fresh Sliced Fish (鱼肉鲜甜嫩滑)',
    'Fast Service (上菜迅速周到)',
    'Ah Hua AI (阿华点单贴心)',
    'Crispy Tofu & Chicken (小吃酥脆)',
    'Rich Broth Refill (免费续汤极赞)'
  ];

  const renderReviewContent = () => {
    dialog.innerHTML = `
      <div class="review-modal-body" style="padding:14px;text-align:center">
        <div class="dialog-top">
          <span class="eyebrow">DINING FEEDBACK · 好评有礼</span>
          <button type="button" class="close-dialog" aria-label="Close review modal">×</button>
        </div>
        <div style="margin:10px 0 14px">
          <div style="font-size:32px;margin-bottom:4px">⭐️</div>
          <h2 id="review-dialog-title" style="margin:0 0 4px">Rate Your Experience</h2>
          <p style="font-size:11px;color:var(--muted)">Your feedback helps our charcoal masters maintain 1927 standards.</p>
        </div>

        <div class="star-rating-box">
          ${[1, 2, 3, 4, 5].map(st => `
            <button type="button" class="star-btn ${selectedRating >= st ? 'active' : ''}" data-star="${st}">★</button>
          `).join('')}
        </div>

        <p style="font-size:12px;font-weight:700;color:var(--brand-red);margin-bottom:8px">
          ${selectedRating === 5 ? '🏆 Outstanding Heritage Taste!' : selectedRating === 4 ? '😊 Great Meal!' : selectedRating === 3 ? '😐 Satisfactory' : '⚠️ We Want to Improve'}
        </p>

        <div class="review-tags-cloud">
          ${reviewTags.map(tag => `
            <button type="button" class="review-tag-chip ${selectedReviewTags.has(tag) ? 'active' : ''}" data-tag="${esc(tag)}">
              ${esc(tag)}
            </button>
          `).join('')}
        </div>

        <textarea id="review-comment-input" placeholder="Any compliments for the kitchen or suggestions? (Optional)" style="width:100%;height:60px;padding:8px;border:1px solid #ccc;border-radius:8px;font-size:12px;box-sizing:border-box;margin-bottom:12px"></textarea>

        ${selectedRating === 5 ? `
          <div style="background:#fef9ee;border:1px solid #fde68a;border-radius:8px;padding:10px;margin-bottom:12px;font-size:11px;color:#92400e">
            🌟 <strong>5-Star Bonus:</strong> Post your review on Google Maps to earn <strong>+50 VIP Points</strong>!
          </div>
        ` : ''}

        <div class="dialog-actions">
          <button type="button" class="secondary" id="cancel-review-btn">Skip</button>
          <button type="button" class="primary" id="submit-review-btn">
            ${selectedRating === 5 ? 'Share on Google & Claim 50 Pts →' : 'Submit Feedback →'}
          </button>
        </div>
      </div>
    `;

    dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
    dialog.querySelector('#cancel-review-btn').onclick = () => closeTopLayer(dialog);

    dialog.querySelectorAll('[data-star]').forEach(b => {
      b.onclick = () => {
        selectedRating = +b.dataset.star;
        renderReviewContent();
      };
    });

    dialog.querySelectorAll('[data-tag]').forEach(b => {
      b.onclick = () => {
        const t = b.dataset.tag;
        if (selectedReviewTags.has(t)) selectedReviewTags.delete(t);
        else selectedReviewTags.add(t);
        renderReviewContent();
      };
    });

    dialog.querySelector('#submit-review-btn').onclick = () => {
      const comment = $('#review-comment-input')?.value || '';
      submitReview(state, {
        table,
        phone: currentMemberPhone,
        rating: selectedRating,
        tags: [...selectedReviewTags],
        comment
      });
      dispatchOp({
        type: 'SUBMIT_REVIEW',
        table,
        phone: currentMemberPhone,
        rating: selectedRating,
        tags: [...selectedReviewTags],
        comment
      });
      closeTopLayer(dialog);
      triggerOrderAnimation();
      hapticPulse();
      if (selectedRating === 5) {
        toast('🎉 Thank you! +50 VIP points added to your member account.');
      } else {
        toast('Thank you for your valuable feedback. Our floor manager has been alerted.');
      }
    };
  };

  renderReviewContent();
  dialog.showModal();
}

function openBanquetDialog() {
  const dialog = $('#banquet-dialog');
  if (!dialog) return;

  dialog.innerHTML = `
    <div class="banquet-modal-body" style="padding:14px">
      <div class="dialog-top">
        <span class="eyebrow">CELEBRATION &amp; CNY BANQUETS · 宴席与年菜预订</span>
        <button type="button" class="close-dialog" aria-label="Close banquet modal">×</button>
      </div>
      <div style="margin:8px 0 12px">
        <h2 id="banquet-dialog-title" style="margin:0 0 4px">Reserve a Heritage Steamboat Feast</h2>
        <p style="font-size:11px;color:var(--muted)">Book ahead for family gatherings and festive celebrations. S$50 deposit secures your private table and brazier.</p>
      </div>

      <form id="banquet-booking-form">
        <label style="display:block;margin-bottom:10px;font-size:11px">Select Banquet Set Menu
          <select id="banquet-set-select" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;margin-top:4px;font-size:12px">
            ${SET_MENUS.map(sm => `
              <option value="${sm.id}">${esc(sm.name)} · ${sm.pax} Pax (${money(sm.price)})</option>
            `).join('')}
          </select>
        </label>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <label style="font-size:11px">Reservation Date
            <input type="date" id="banquet-date-input" value="${new Date().toISOString().slice(0, 10)}" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;margin-top:4px;font-size:12px;box-sizing:border-box" required />
          </label>
          <label style="font-size:11px">Seating Time
            <select id="banquet-time-select" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;margin-top:4px;font-size:12px;box-sizing:border-box">
              <option value="17:30">17:30 (Early Dinner)</option>
              <option value="19:00" selected>19:00 (Peak Dinner)</option>
              <option value="20:30">20:30 (Late Feast)</option>
            </select>
          </label>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <label style="font-size:11px">Contact Name
            <input type="text" id="banquet-name-input" placeholder="e.g. Tan Ah Seng" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;margin-top:4px;font-size:12px;box-sizing:border-box" required />
          </label>
          <label style="font-size:11px">Contact Phone
            <input type="tel" id="banquet-phone-input" placeholder="e.g. 91234567" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;margin-top:4px;font-size:12px;box-sizing:border-box" required />
          </label>
        </div>

        <label style="display:block;margin-bottom:12px;font-size:11px">Special Celebration Requests / Dietary Notes
          <input type="text" id="banquet-notes-input" placeholder="e.g. Birthday celebration, please prepare longevity buns" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;margin-top:4px;font-size:12px;box-sizing:border-box" />
        </label>

        <div style="background:#f8faf5;border:1px dashed #c9d2c2;border-radius:8px;padding:10px;margin-bottom:14px;font-size:11px">
          <strong>Deposit Requirement:</strong> S$50.00 will be held to secure charcoal allocation and fresh morning fish catch. Deducted from final banquet bill.
        </div>

        <button type="submit" class="primary wide" style="background:#8f342c;border-color:#8f342c">
          Confirm Reservation &amp; Pay S$50 Deposit →
        </button>
      </form>
    </div>
  `;

  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#banquet-booking-form').onsubmit = e => {
    e.preventDefault();
    const setId = $('#banquet-set-select').value;
    const date = $('#banquet-date-input').value;
    const time = $('#banquet-time-select').value;
    const name = $('#banquet-name-input').value.trim();
    const phone = $('#banquet-phone-input').value.trim();
    const notes = $('#banquet-notes-input').value.trim();

    const booking = createBanquetBooking(state, { name, phone, date, time, setId, notes });
    dispatchOp({ type: 'CREATE_BANQUET_BOOKING', booking });
    closeTopLayer(dialog);
    triggerOrderAnimation();
    hapticPulse();
    toast(`🎉 Banquet booking confirmed (${booking.id}) for ${booking.name} on ${booking.date} at ${booking.time}!`);
  };
}

function openQueueDialog() {
  const dialog = $('#queue-dialog');
  if (!dialog) return;

  const count = Object.keys(state.queues || {}).length + 1;
  const sampleTicket = activeQueueTicket || `Q-${String(count).padStart(2, '0')}`;

  dialog.innerHTML = `
    <div class="queue-modal-body" style="padding:14px;text-align:center">
      <div class="dialog-top">
        <span class="eyebrow">LINE PRE-ORDER · 排队预点单</span>
        <button type="button" class="close-dialog" aria-label="Close queue modal">×</button>
      </div>
      <div style="margin:10px 0 14px">
        <span class="queue-pill" style="font-size:24px;font-weight:900;color:var(--brand-red);display:inline-block;padding:4px 16px;border:2px solid var(--brand-red);border-radius:8px;margin-bottom:6px">${sampleTicket}</span>
        <h2 id="queue-dialog-title" style="margin:4px 0">Waiting in Line?</h2>
        <p style="font-size:11px;color:var(--muted)">Pre-build your table cart while waiting. Once your table is ready, dishes auto-fire to the kitchen to cut wait time by 10 minutes!</p>
      </div>

      <div class="dialog-actions">
        <button type="button" class="secondary" id="browse-in-line-btn">Start Pre-Ordering Menu</button>
        <button type="button" class="primary" id="seated-now-btn">I am Seated at Table ${table} →</button>
      </div>
    </div>
  `;

  dialog.showModal();
  dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
  dialog.querySelector('#browse-in-line-btn').onclick = () => {
    activeQueueTicket = sampleTicket;
    closeTopLayer(dialog);
    toast(`Queue Mode Active: Building cart for Ticket ${sampleTicket}.`);
    render();
  };
  dialog.querySelector('#seated-now-btn').onclick = () => {
    if (activeQueueTicket) {
      transferQueueToTable(state, activeQueueTicket, table);
      dispatchOp({ type: 'TRANSFER_QUEUE_TO_TABLE', queueId: activeQueueTicket, table });
      activeQueueTicket = null;
      toast(`Welcome to Table ${table}! Pre-ordered items transferred to active cart.`);
    }
    closeTopLayer(dialog);
    render();
  };
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
    const tableCart = getTableSession(state, table).cart;
    dialog.innerHTML = `<div class="mobile-cart-body">
      <div class="dialog-top">
        <span class="eyebrow">TABLE ${table} · ROUND ${nextRound}</span>
        <button type="button" class="close-dialog" aria-label="Close cart">×</button>
      </div>
      <h2 id="mobile-cart-dialog-title">Your Table Order (${count()} items)</h2>
      <div class="cart-body">
        ${tableCart.length ? tableCart.map((x, i) => `<div class="cart-line">
          <div>
            <h3>${esc(x.name)}</h3>
            <p>${esc(x.size)}${x.notes ? ' · ' + esc(x.notes) : ''}</p>
            <small>${money(x.unitPrice)} each</small>
            <div><span class="cart-guest-tag">${esc(x.guestEmoji || '👥')} ${esc(x.addedBy || 'Table')}</span></div>
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
      ${tableCart.length ? `
        <div class="cart-upsell">
          <span>Complete the table:</span>
          <div class="upsell-chips">
            ${!state.unavailable.includes('rice') ? `<button type="button" data-modal-quick-add="rice">+1 Rice (${money(150)})</button>` : ''}
            ${!state.unavailable.includes('tea') ? `<button type="button" data-modal-quick-add="tea">+Pu’er Tea (${money(400)})</button>` : ''}
            ${!state.unavailable.includes('yam') ? `<button type="button" data-modal-quick-add="yam">+Crispy Yam (${money(800)})</button>` : ''}
          </div>
        </div>
        <div class="cart-summary">
          <div><span>Round ${nextRound} subtotal</span><strong>${money(total(tableCart))}</strong></div>
          <p>Staff review every round before the kitchen starts cooking.</p>
        </div>
        <div class="cart-actions">
          <button class="primary wide" id="modal-submit-order" type="button">Send Round ${nextRound} to staff · ${money(total(tableCart))} →</button>
        </div>
      ` : ''}
    </div>`;

    dialog.querySelector('.close-dialog').onclick = () => closeTopLayer(dialog);
    dialog.querySelectorAll('[data-modal-qty]').forEach(b => b.onclick = () => {
      const idx = +b.dataset.modalQty;
      const delta = +b.dataset.delta;
      dispatchOp({ type: 'UPDATE_QTY', table, lineIndex: idx, delta });
      updateDockSpeech();
      renderContent();
    });
    dialog.querySelectorAll('[data-modal-quick-add]').forEach(b => b.onclick = () => {
      const d = dish(b.dataset.modalQuickAdd);
      const newLine = makeLine(d.id, 1, 'Regular', state.preference);
      newLine.addedBy = currentGuest?.name || 'Table';
      newLine.guestEmoji = currentGuest?.emoji || '👤';
      dispatchOp({ type: 'ADD_LINES', table, lines: [newLine] });
      updateDockSpeech();
      renderContent();
    });
    dialog.querySelector('#modal-submit-order')?.addEventListener('click', () => {
      closeTopLayer(dialog);
      handleOrderSubmit();
    });
  };

  renderContent();
  dialog.showModal();
}

function openSeatingModal(force = false) {
  const dialog = $('#seating-dialog');
  if (!dialog) return;
  const session = getTableSession(state, table);
  if (!force && session.seatingConfirmed) return;

  let localPax = session.pax || 4;
  let localTea = session.teaChoice || 'puer';
  let localBabyChair = Boolean(session.babyChair);
  let localKidsCutlery = Boolean(session.kidsCutlery);

  const member = currentMemberPhone ? getMember(state, currentMemberPhone) : null;
  const isMember = Boolean(member);

  const renderModal = () => {
    dialog.innerHTML = `
      <div class="seating-modal-body">
        <div class="dialog-top">
          <span class="eyebrow">TABLE ${table} · 用餐开台确认</span>
          <button type="button" class="close-dialog" aria-label="Close seating modal">×</button>
        </div>

        <div class="seating-modal-header">
          <div class="header-icon">🪑</div>
          <div>
            <h2 id="seating-dialog-title">Welcome to Table ${table} · 欢迎光临</h2>
            <p>Please confirm diner count and tea preference so our floor staff can set up your tableware & hot charcoal broth.</p>
          </div>
        </div>

        <div class="seating-section">
          <div class="section-label-row">
            <span class="section-title">用餐人数 · Number of Diners (Pax)</span>
            <span class="pax-indicator"><strong>${localPax}</strong> Guests</span>
          </div>
          <div class="pax-pill-grid" role="radiogroup" aria-label="Number of diners">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => `
              <button type="button" class="pax-pill ${localPax === n ? 'active' : ''}" data-pax-val="${n}">
                ${n === 12 ? '12+ 人' : `${n} 人`}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="seating-section">
          <div class="section-label-row">
            <span class="section-title">功夫茶水 · Table Tea Selection (Refillable Pot)</span>
            <span class="tea-fee-tag">${isMember ? 'VIP: Fee Waived' : 'S$4.00 / pot'}</span>
          </div>
          <div class="tea-option-grid" role="radiogroup" aria-label="Tea selection">
            <label class="tea-card ${localTea === 'puer' ? 'active' : ''}">
              <input type="radio" name="seating-tea" value="puer" ${localTea === 'puer' ? 'checked' : ''}>
              <div class="tea-card-content">
                <div class="tea-card-top">
                  <span class="tea-icon">🍵</span>
                  <strong>Aged Pu’er Tea (陈年熟普洱)</strong>
                </div>
                <p>Rich, earthy heritage black tea. Promotes digestion and pairs traditionally with rich fish head broth.</p>
                <div class="tea-card-footer">
                  <span class="tea-price">${isMember ? '<s class="waived-orig">S$4.00</s> <span class="free-text">FREE</span>' : 'S$4.00 / table pot'}</span>
                  <span class="tea-badge">Most Popular</span>
                </div>
              </div>
            </label>

            <label class="tea-card ${localTea === 'chrysanthemum' ? 'active' : ''}">
              <input type="radio" name="seating-tea" value="chrysanthemum" ${localTea === 'chrysanthemum' ? 'checked' : ''}>
              <div class="tea-card-content">
                <div class="tea-card-top">
                  <span class="tea-icon">🌼</span>
                  <strong>Chrysanthemum Tea (特级胎菊王)</strong>
                </div>
                <p>Fragrant yellow flower tea. Naturally cooling, floral aroma and caffeine-free for late dinners.</p>
                <div class="tea-card-footer">
                  <span class="tea-price">${isMember ? '<s class="waived-orig">S$4.00</s> <span class="free-text">FREE</span>' : 'S$4.00 / table pot'}</span>
                  <span class="tea-badge cooling">Cooling</span>
                </div>
              </div>
            </label>

            <label class="tea-card ${localTea === 'water' ? 'active' : ''}">
              <input type="radio" name="seating-tea" value="water" ${localTea === 'water' ? 'checked' : ''}>
              <div class="tea-card-content">
                <div class="tea-card-top">
                  <span class="tea-icon">💧</span>
                  <strong>Warm / Ice Water (免费白开水)</strong>
                </div>
                <p>Fresh filtered drinking water served warm or iced upon request.</p>
                <div class="tea-card-footer">
                  <span class="tea-price free-text">Complimentary S$0.00</span>
                </div>
              </div>
            </label>
          </div>

          ${isMember ? `
            <div class="member-seating-callout">
              <span>✨ <strong>Ah Hua VIP Member:</strong> Table tea & tableware fee waived! (已为您免除茶位费)</span>
            </div>
          ` : `
            <div class="member-seating-callout not-member">
              <span>💡 <button type="button" class="inline-link" id="seating-member-btn">Sign in or register as Ah Hua Member</button> to enjoy waived tea fee & earn 1 point per S$1!</span>
            </div>
          `}
        </div>

        <div class="seating-section">
          <div class="section-label-row">
            <span class="section-title">贴心关怀 · Family & Special Care</span>
            <small>Floor staff will bring to table</small>
          </div>
          <div class="family-care-grid">
            <label class="care-checkbox-card ${localBabyChair ? 'active' : ''}">
              <input type="checkbox" id="seating-baby-chair" ${localBabyChair ? 'checked' : ''}>
              <span class="care-icon">👶</span>
              <div class="care-info">
                <strong>Baby High Chair (需要宝宝椅)</strong>
                <p>Disinfected child high chair with safety harness</p>
              </div>
            </label>

            <label class="care-checkbox-card ${localKidsCutlery ? 'active' : ''}">
              <input type="checkbox" id="seating-kids-cutlery" ${localKidsCutlery ? 'checked' : ''}>
              <span class="care-icon">🥢</span>
              <div class="care-info">
                <strong>Children Cutlery (儿童餐具)</strong>
                <p>Plastic bowls, spoons & cups for kids</p>
              </div>
            </label>
          </div>
        </div>

        <div class="seating-actions">
          <button type="button" class="primary big-submit-btn" id="confirm-seating-btn">
            Confirm Seating & Start Ordering (确认开台) →
          </button>
        </div>
      </div>
    `;

    dialog.querySelectorAll('.pax-pill').forEach(btn => {
      btn.onclick = () => {
        localPax = Number(btn.dataset.paxVal) || 4;
        renderModal();
      };
    });

    dialog.querySelectorAll('input[name="seating-tea"]').forEach(radio => {
      radio.onchange = () => {
        localTea = radio.value;
        renderModal();
      };
    });

    const babyBox = dialog.querySelector('#seating-baby-chair');
    if (babyBox) {
      babyBox.onchange = () => {
        localBabyChair = babyBox.checked;
        renderModal();
      };
    }
    const cutleryBox = dialog.querySelector('#seating-kids-cutlery');
    if (cutleryBox) {
      cutleryBox.onchange = () => {
        localKidsCutlery = cutleryBox.checked;
        renderModal();
      };
    }

    dialog.querySelector('#seating-member-btn')?.addEventListener('click', () => {
      closeTopLayer(dialog);
      openMemberDialog();
    });

    dialog.querySelector('#confirm-seating-btn')?.addEventListener('click', () => {
      splitPax = localPax;
      dispatchOp({
        type: 'CONFIRM_SEATING',
        table,
        pax: localPax,
        babyChair: localBabyChair,
        kidsCutlery: localKidsCutlery,
        teaChoice: localTea,
        isMember
      });
      closeTopLayer(dialog);
      hapticPulse();
      toast(`✅ Table ${table} ready! ${localPax} Pax · ${localTea === 'water' ? 'Water' : (localTea === 'chrysanthemum' ? 'Chrysanthemum' : 'Pu’er Tea')}`);
      render();
    });
  };

  renderModal();
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
  $('#lock-staff-btn')?.addEventListener('click', () => {
    try { sessionStorage.removeItem('ahhua-staff-auth'); } catch {}
    role = 'customer';
    render();
    toast('Staff mode locked. Switched to customer view.');
  });
  $('#lock-kitchen-btn')?.addEventListener('click', () => {
    try { sessionStorage.removeItem('ahhua-staff-auth'); } catch {}
    role = 'customer';
    render();
    toast('Kitchen mode locked. Switched to customer view.');
  });
  document.querySelectorAll('[data-floor-table]').forEach(b => b.onclick = () => {
    staffTableFilter = b.dataset.floorTable === staffTableFilter ? 'all' : b.dataset.floorTable;
    render();
  });
  document.querySelectorAll('[data-status]').forEach(b => b.onclick = () => {
    const id = b.dataset.order;
    const status = b.dataset.status;
    const reason = $(`[data-reason="${id}"]`)?.value || '';
    if (status === 'approved' && !$(`[data-reviewed="${id}"]`)?.checked) {
      toast('Review the dishes, notes and prices, then tick the review box.');
      return;
    }
    dispatchOp({ type: 'TRANSITION_ORDER', id, status, reason });
    toast(`${id}: ${statusLabel[status]}`);
  });
  document.querySelectorAll('[data-check-order]').forEach(b => b.onclick = () => act(() => {
    toggleOrderItem(state, b.dataset.checkOrder, Number(b.dataset.checkItem));
  }));
  document.querySelectorAll('[data-availability]').forEach(b => b.onchange = () => {
    const next = b.checked
      ? state.unavailable.filter(id => id !== b.dataset.availability)
      : [...new Set([...state.unavailable, b.dataset.availability])];
    dispatchOp({ type: 'SET_UNAVAILABLE', unavailable: next });
  });
  document.querySelectorAll('[data-rule-toggle]').forEach(box => {
    box.onchange = e => {
      dispatchOp({
        type: 'TOGGLE_CART_RULE',
        ruleId: e.target.dataset.ruleToggle,
        enabled: e.target.checked
      });
      toast(`Rule ${e.target.dataset.ruleToggle} ${e.target.checked ? 'enabled' : 'disabled'}.`);
    };
  });
  document.querySelectorAll('[data-resolve]').forEach(b => b.onclick = () => act(() => {
    const call = state.calls.find(c => c.id === b.dataset.resolve);
    if (call) call.done = true;
    toast('Simulated server request acknowledged.');
  }));
  document.querySelectorAll('[data-station]').forEach(b => {
    b.onclick = () => {
      kitchenStation = b.dataset.station;
      render();
    };
  });
  document.querySelectorAll('[data-fire-held]').forEach(b => {
    b.onclick = () => act(() => {
      const orderId = b.dataset.fireHeld;
      const itemIdx = +b.dataset.itemIdx;
      fireHeldItem(state, orderId, itemIdx);
      dispatchOp({ type: 'FIRE_HELD_ITEM', orderId, itemIndex: itemIdx });
      toast('🔥 起菜指令已更新！档口开始制作。');
    });
  });
  document.querySelectorAll('[data-close-table]').forEach(b => {
    b.onclick = () => {
      const tbl = b.dataset.closeTable;
      if (confirm(`Reset and close Table ${tbl}? This clears active table session and marks orders finished.`)) {
        closeTableSession(state, tbl);
        dispatchOp({ type: 'CLOSE_TABLE', table: tbl });
        toast(`Table ${tbl} session closed and cleared.`);
      }
    };
  });
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
