import { normaliseLanguage, replyText } from './languages.js';

// Illustrative menu retained from the earlier Ah Hua prototype. Not verified restaurant data.
export const menu = [
  { id: 'grouper', name: 'Grouper Fish Head Steamboat', cn: '石斑鱼头炉', price: 4800, category: 'Steamboat', icon: '🍲', desc: 'A bubbling pot of rich fish broth, tender grouper and vegetables.', tag: 'Ah Hua’s favourite', allergens: 'Fish', aliases: ['grouper', '石斑', 'fish head', '鱼头炉', 'steamboat'] },
  { id: 'pomfret', name: 'Pomfret Steamboat', cn: '鲳鱼鱼头炉', price: 5800, category: 'Steamboat', icon: '🥘', desc: 'Delicate pomfret in a comforting, savoury broth.', tag: 'For sharing', allergens: 'Fish', aliases: ['pomfret', '鲳鱼'] },
  { id: 'snapper', name: 'Snapper Steamboat', cn: '红哥里鱼头炉', price: 4200, category: 'Steamboat', icon: '🍲', desc: 'The familiar warmth of a traditional fish head broth.', tag: 'Classic', allergens: 'Fish', aliases: ['snapper', '红哥里'] },
  { id: 'chicken', name: 'Prawn Paste Chicken', cn: '虾酱鸡', price: 1500, category: 'Favourites', icon: '🍗', desc: 'Golden, crisp and savoury. Best enjoyed together.', tag: 'Crowd pleaser', allergens: 'Shellfish, wheat', aliases: ['prawn paste chicken', 'prawn paste', 'chicken', 'har cheong', '虾酱鸡'] },
  { id: 'pork', name: 'Signature Pork Belly', cn: '南乳花肉', price: 1800, category: 'Favourites', icon: '🥓', desc: 'Crisp pork belly with fermented beancurd seasoning.', tag: 'Signature', allergens: 'Soy, wheat', aliases: ['pork belly', '南乳花肉'] },
  { id: 'ribs', name: 'Sweet & Sour Pork Ribs', cn: '排骨大王', price: 1700, category: 'Favourites', icon: '🍖', desc: 'Sticky, tangy pork ribs with a sweet finish.', allergens: 'Soy, wheat', aliases: ['pork ribs', 'ribs', '排骨'] },
  { id: 'tofu', name: 'Homemade Beancurd', cn: '自制豆腐', price: 1400, category: 'Greens & sides', icon: '🥢', desc: 'Soft beancurd in a savoury sauce. A family favourite.', allergens: 'Soy, egg; sauce unverified', aliases: ['beancurd', 'tofu', '豆腐'] },
  { id: 'kang', name: 'Sambal Kang Kong', cn: '马来风光', price: 1300, category: 'Greens & sides', icon: '🥬', desc: 'Wok-tossed water spinach with a lively sambal kick.', tag: 'Spicy', allergens: 'Shellfish', aliases: ['kang kong', 'kangkong', 'sambal', '马来风光', '空心菜'] },
  { id: 'egg', name: 'Oyster Omelette', cn: '蚝煎', price: 1500, category: 'Greens & sides', icon: '🍳', desc: 'Golden edges, tender oysters and a soft egg centre.', allergens: 'Shellfish, egg', aliases: ['oyster', 'omelette', '蚝煎'] },
  { id: 'rice', name: 'Steamed Rice', cn: '白饭', price: 150, category: 'Greens & sides', icon: '🍚', desc: 'One fluffy bowl, ready for a little of everything.', allergens: 'Recipe unverified', aliases: ['rice', '白饭', '米饭'] }
];
export const money = cents => `S$${(cents / 100).toFixed(2)}`;
export const dish = id => menu.find(x => x.id === id);
export function initialState() { return { version: 1, replyLanguage: 'en', cart: [], orders: [], calls: [], unavailable: [], messages: [{ role: 'host', text: replyText('en', 'welcome'), language: 'en' }], proposal: [], preference: '' }; }
export function total(items) { return items.reduce((sum, x) => sum + x.qty * x.unitPrice, 0); }
export function makeLine(id, qty = 1, size = 'Regular', notes = '') {
  const d = dish(id);
  if (!d || !Number.isInteger(qty) || qty < 1 || qty > 20 || !['Regular', 'Large'].includes(size) || (id === 'rice' && size !== 'Regular')) throw Error('Please choose a valid dish, size and quantity (1–20).');
  return { id, name: d.name, size, notes: String(notes).trim().slice(0, 160), qty, unitPrice: d.price + (size === 'Large' ? 800 : 0) };
}
export function addLines(state, lines) {
  const next = structuredClone(state.cart);
  for (const raw of lines) {
    if (state.unavailable.includes(raw.id)) throw Error(`${dish(raw.id)?.name || 'Dish'} is unavailable. Please choose another dish.`);
    const x = makeLine(raw.id, raw.qty, raw.size, raw.notes);
    const existing = next.find(y => y.id === x.id && y.size === x.size && y.notes === x.notes);
    if (existing) { if (existing.qty + x.qty > 20) throw Error('Maximum 20 of each dish.'); existing.qty += x.qty; } else next.push(x);
  }
  state.cart = next;
}
export function submit(state, table) {
  if (!state.cart.length) throw Error('Add a dish before sending your order.');
  if (state.orders.filter(x => x.status === 'pending').length >= 20) throw Error('Please review pending orders in Staff first.');
  for (const x of state.cart) if (state.unavailable.includes(x.id)) throw Error(`${x.name} is now unavailable. Please remove it from your cart.`);
  const order = { id: `AH-${String(state.orders.length + 1001)}`, table, items: structuredClone(state.cart), status: 'pending', created: new Date().toISOString(), paid: false, reason: '' };
  state.orders.push(order); state.cart = []; state.proposal = []; return order;
}
const transitions = { pending: ['approved', 'rejected'], approved: ['preparing'], preparing: ['ready'], ready: ['served'] };
export function transition(state, id, status, reason = '') {
  const order = state.orders.find(x => x.id === id);
  if (!order || !transitions[order.status]?.includes(status)) throw Error('That order cannot move to this stage.');
  if (status === 'approved' && order.items.some(x => state.unavailable.includes(x.id))) throw Error('An item is unavailable. Restore availability or reject the order.');
  if (status === 'rejected' && !reason.trim()) throw Error('Add a short reason for the customer.');
  order.status = status; order.reason = reason.trim().slice(0, 160);
}
const numberWords = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };
function aliasIndex(text, alias) {
  if (/[\u3400-\u9fff]/.test(alias)) return text.indexOf(alias);
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.search(new RegExp(`\\b${escaped}\\b`, 'i'));
}
export function chat(text, state, selectedLanguage = state.replyLanguage) {
  const t = text.toLowerCase().trim();
  const language = normaliseLanguage(selectedLanguage);
  const answer = (key, data = {}, lines = []) => ({ text: replyText(language, key, data), lines, language });
  if (/allerg|allergic|过敏|nut.free|gluten.free|celiac/.test(t)) return answer('allergy');
  if (/call.*(staff|server)|human|服务员/.test(t)) return answer('call');
  if (/checkout|submit|pay|place.*order|下单|付款/.test(t)) return answer('checkout');
  if (/review|cart|订单|购物车/.test(t)) return answer(state.cart.length ? 'cart' : 'emptyCart', { count: state.cart.reduce((n,x)=>n+x.qty,0), amount: money(total(state.cart)) });
  if (/no spicy|not spicy|non.spicy|mild|不辣|kids|children/.test(t)) state.preference = 'No chilli requested; staff must confirm';
  if (/vegetarian|vegan|素食|清真|halal/.test(t)) return answer('dietary');
  if (/recommend|suggest|pax|people|推荐|几个人|人吃|人餐|what.*good/.test(t)) {
    const paxMatch = t.match(/(\d+)\s*(?:pax|people|人)/); const pax = Math.min(12, Math.max(1, Number(paxMatch?.[1] || 4)));
    const ids = ['grouper', 'chicken', 'tofu', 'rice'].filter(id => !state.unavailable.includes(id));
    const lines = ids.map(id => makeLine(id, id === 'rice' ? pax : 1, id === 'grouper' && pax > 4 ? 'Large' : 'Regular', state.preference));
    return answer('recommendation', {pax, amount: money(total(lines))}, lines);
  }
  const found = menu.map(d => ({ d, at: Math.min(...d.aliases.map(a=>aliasIndex(t,a)).filter(i=>i>=0), Infinity) })).filter(x=>Number.isFinite(x.at));
  // Specific steamboat names take precedence over the generic word “steamboat”.
  const matches = found.filter(x=>x.d.id !== 'grouper' || !found.some(y=>['pomfret','snapper'].includes(y.d.id)) || /grouper|石斑/.test(t)).sort((a,b)=>a.at-b.at);
  if (matches.length) {
    if (/\b(no|without|don.t|remove|cancel)\b|不要|取消|去掉/.test(t) && !/no chilli|no spicy|without chilli/.test(t)) return answer('excluded');
    if (/price|how much|多少钱|价格|what is|what.s in/.test(t)) {
      const text = language === 'zh'
        ? matches.map(({d})=>`${d.cn}：示例起价 ${money(d.price)}。`).join('\n') + '食谱、过敏原和价格均需员工确认。'
        : matches.map(({d})=>`${d.name}: ${language === 'singlish' ? 'sample price starts from' : 'from'} ${money(d.price)}. ${d.desc} Sample allergens: ${d.allergens}.`).join('\n') + (language === 'singlish' ? ' These details must check with staff first, okay?' : ' All details need restaurant confirmation.');
      return {text, lines: [], language};
    }
    const lines = matches.filter(({d})=>!state.unavailable.includes(d.id)).map(({d,at},i)=>{
      const start = i ? matches[i-1].at + matches[i-1].d.aliases.find(a=>aliasIndex(t,a)===matches[i-1].at)?.length || 0 : 0;
      const prefix = t.slice(start, at); const match = prefix.match(/(\d+|one|two|three|four|five|six|a|一|两|二|三|四|五|六)\s*(?:份|碗|个|x)?\s*(?:large|regular|small)?\s*$/);
      const qty = match ? Number(match[1]) || numberWords[match[1]] : 1;
      return makeLine(d.id, qty, d.id !== 'rice' && /large|大份/.test(prefix.slice(-16)) ? 'Large' : 'Regular', state.preference);
    });
    if (!lines.length) return answer('unavailable');
    return answer('selected', {}, lines);
  }
  if (/menu|菜单/.test(t)) return answer('menu');
  return answer('fallback');
}
