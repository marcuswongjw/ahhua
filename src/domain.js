import { normaliseLanguage, replyText, dishName, uiText } from './languages.js';

// Illustrative menu retained from the earlier Ah Hua prototype, expanded with traditional accompaniments & house drinks. Not verified restaurant data.
export const menu = [
  { id: 'grouper', name: 'Grouper Fish Head Steamboat', cn: '石斑鱼头炉', price: 4800, category: 'Steamboat', icon: '🍲', desc: 'A bubbling charcoal pot of rich milky fish broth, tender grouper, yam and greens.', tag: 'Ah Hua’s favourite', allergens: 'Fish', modifiers: ['Charcoal milky broth', 'Clear ginger broth', 'Extra sour plum', 'Less salt'], aliases: ['grouper', '石斑', 'fish head', '鱼头炉', 'steamboat'] },
  { id: 'pomfret', name: 'Pomfret Steamboat', cn: '鲳鱼鱼头炉', price: 5800, category: 'Steamboat', icon: '🥘', desc: 'Delicate wild-style pomfret simmered in a comforting, savoury teochew broth.', tag: 'For sharing', allergens: 'Fish', modifiers: ['Charcoal milky broth', 'Clear teochew broth', 'Extra tang o greens', 'Soup on side'], aliases: ['pomfret', '鲳鱼'] },
  { id: 'snapper', name: 'Snapper Steamboat', cn: '红哥里鱼头炉', price: 4200, category: 'Steamboat', icon: '🍲', desc: 'The familiar warmth of a traditional red snapper fish head broth.', tag: 'Classic', allergens: 'Fish', modifiers: ['Charcoal milky broth', 'Clear ginger broth', 'Extra yam cubes', 'Mild'], aliases: ['snapper', '红哥里'] },
  { id: 'yam', name: 'Crispy Yam & Fish Maw Add-on', cn: '炸芋头鱼鳔', price: 800, category: 'Steamboat', icon: '🍠', desc: 'Golden fried taro pieces and spongy fish maw to soak up the steamboat broth.', tag: 'Steamboat add-on', allergens: 'Fish, soy; oil unverified', modifiers: ['Serve on side', 'Add directly to pot', 'Extra crispy'], aliases: ['crispy yam', 'fish maw', 'taro', '芋头', '鱼鳔'] },
  { id: 'chicken', name: 'Prawn Paste Chicken', cn: '虾酱鸡', price: 1500, category: 'Favourites', icon: '🍗', desc: 'Golden, crisp and aromatic har cheong gai wings. Best enjoyed together.', tag: 'Crowd pleaser', allergens: 'Shellfish, wheat', modifiers: ['Extra crispy', 'Sauce on side', 'Less oil'], aliases: ['prawn paste chicken', 'prawn paste', 'chicken', 'har cheong', '虾酱鸡'] },
  { id: 'pork', name: 'Signature Pork Belly', cn: '南乳花肉', price: 1800, category: 'Favourites', icon: '🥓', desc: 'Crisp pork belly marinated with fragrant fermented red beancurd.', tag: 'Signature', allergens: 'Soy, wheat', modifiers: ['Extra crispy', 'Leaner cut if available', 'Chilli dip on side'], aliases: ['pork belly', '南乳花肉'] },
  { id: 'ribs', name: 'Sweet & Sour Pork Ribs', cn: '排骨大王', price: 1700, category: 'Favourites', icon: '🍖', desc: 'Wok-glazed pork ribs with a sticky, tangy-sweet heritage sauce.', allergens: 'Soy, wheat', modifiers: ['Less sweet', 'Sauce on side', 'No onion'], aliases: ['pork ribs', 'ribs', '排骨'] },
  { id: 'tofu', name: 'Homemade Beancurd', cn: '自制豆腐', price: 1400, category: 'Greens & sides', icon: '🥢', desc: 'Silky house-steamed egg beancurd topped with savoury minced sauce.', allergens: 'Soy, egg; sauce unverified', modifiers: ['Mild / kid-friendly', 'Less gravy', 'No garnish'], aliases: ['beancurd', 'tofu', '豆腐'] },
  { id: 'kang', name: 'Sambal Kang Kong', cn: '马来风光', price: 1300, category: 'Greens & sides', icon: '🥬', desc: 'Wok-tossed water spinach with dried shrimp and a lively house sambal kick.', tag: 'Spicy', allergens: 'Shellfish', modifiers: ['Less spicy', 'Extra spicy', 'Stir-fry with garlic instead'], aliases: ['kang kong', 'kangkong', 'sambal', '马来风光', '空心菜'] },
  { id: 'egg', name: 'Oyster Omelette', cn: '蚝煎', price: 1500, category: 'Greens & sides', icon: '🍳', desc: 'Crisp golden edges, plump oysters, starch batter and a soft egg centre.', allergens: 'Shellfish, egg', modifiers: ['Extra crispy edges', 'Chilli on side', 'No coriander'], aliases: ['oyster', 'omelette', '蚝煎'] },
  { id: 'mushroom', name: 'Golden Enoki & Tofu Puff Set', cn: '金针菇豆卜拼盘', price: 600, category: 'Greens & sides', icon: '🍄', desc: 'Fresh enoki mushrooms and golden tofu puffs for the steamboat or table.', tag: 'Sharing side', allergens: 'Soy', modifiers: ['For steamboat pot', 'Serve on side'], aliases: ['enoki', 'mushroom', 'tofu puff', '金针菇', '豆卜'] },
  { id: 'rice', name: 'Steamed Rice', cn: '白饭', price: 150, category: 'Greens & sides', icon: '🍚', desc: 'One fluffy bowl of fragrant jasmine rice, ready for a little of everything.', allergens: 'Recipe unverified', singleSize: true, modifiers: ['Serve first', 'Serve with dishes'], aliases: ['rice', '白饭', '米饭'] },
  { id: 'tea', name: 'Aged Pu’er Tea (Pot)', cn: '陈年普洱茶（壶）', price: 400, category: 'Drinks & Tea', icon: '🍵', desc: 'A warm, earthy pot of traditional Chinese tea for the table, with hot water refills.', tag: 'Refillable', allergens: 'None listed; unverified', singleSize: true, modifiers: ['Hot pot for sharing', 'Extra teacups', 'Warm'], aliases: ['pu er', 'puer', 'chinese tea', 'tea pot', '普洱', '茶'] },
  { id: 'calamansi', name: 'Sour Plum Calamansi Juice', cn: '冰镇酸梅金桔', price: 350, category: 'Drinks & Tea', icon: '🍊', desc: 'Zesty freshly squeezed calamansi lime with a savoury-sweet sour plum.', tag: 'Refreshing', allergens: 'None listed; unverified', singleSize: true, modifiers: ['Less ice', 'No ice', 'Warm', 'Less sweet'], aliases: ['calamansi', 'sour plum', 'lime juice', '金桔', '酸梅'] },
  { id: 'barley', name: 'Home-boiled Pandan Barley', cn: '自煲香兰薏米水', price: 300, category: 'Drinks & Tea', icon: '🌾', desc: 'Slow-boiled pearl barley infused with fragrant pandan leaves.', tag: 'Homemade', allergens: 'Barley (gluten)', singleSize: true, modifiers: ['Warm', 'Chilled with less ice', 'No ice', 'Less sweet'], aliases: ['barley', 'pandan barley', '薏米', '薏米水'] }
];
export const serviceTypes = {
  soup: { id: 'soup', icon: '🍲', label: 'Refill steamboat broth' },
  tea: { id: 'tea', icon: '🍵', label: 'Refill hot Chinese tea / water' },
  bowls: { id: 'bowls', icon: '🥢', label: 'Extra bowls, spoons & chilli' },
  bill: { id: 'bill', icon: '🧾', label: 'Table bill & split check' },
  assistance: { id: 'assistance', icon: '♧', label: 'Customer would like assistance' }
};
export const money = cents => `S$${(cents / 100).toFixed(2)}`;
export const dish = id => menu.find(x => x.id === id);
export function initialState() { return { version: 1, replyLanguage: 'en', cart: [], orders: [], calls: [], unavailable: [], messages: [{ role: 'host', text: replyText('en', 'welcome'), language: 'en' }], proposal: [], preference: '' }; }
export function total(items) { return items.reduce((sum, x) => sum + x.qty * x.unitPrice, 0); }
export function makeLine(id, qty = 1, size = 'Regular', notes = '') {
  const d = dish(id);
  if (!d || !Number.isInteger(qty) || qty < 1 || qty > 20 || !['Regular', 'Large'].includes(size) || (d.singleSize && size !== 'Regular')) throw Error('Please choose a valid dish, size and quantity (1–20).');
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
  const tableRound = state.orders.filter(x => x.table === table && x.status !== 'rejected').length + 1;
  const order = { id: `AH-${String(state.orders.length + 1001)}`, table, round: tableRound, items: structuredClone(state.cart), checkedItems: [], status: 'pending', created: new Date().toISOString(), paid: false, reason: '' };
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
export function toggleOrderItem(state, orderId, itemIndex) {
  const order = state.orders.find(x => x.id === orderId);
  if (!order || !order.items[itemIndex]) throw Error('Order item not found.');
  const checked = new Set(Array.isArray(order.checkedItems) ? order.checkedItems : []);
  if (checked.has(itemIndex)) checked.delete(itemIndex); else checked.add(itemIndex);
  order.checkedItems = [...checked].sort((a, b) => a - b);
  return order.checkedItems;
}
export function requestService(state, table, type = 'assistance', note = '') {
  const kind = serviceTypes[type] ? type : 'assistance';
  if (state.calls.some(x => x.table === table && !x.done && (x.type || 'assistance') === kind)) {
    throw Error('A simulated request for this service is already waiting in Staff.');
  }
  const entry = {
    id: crypto.randomUUID(),
    table,
    type: kind,
    label: note ? `${serviceTypes[kind].label} · ${String(note).trim().slice(0, 80)}` : serviceTypes[kind].label,
    created: new Date().toISOString(),
    done: false
  };
  state.calls.push(entry);
  return entry;
}
export function tableSummary(state, table, pax = 4) {
  const safePax = Math.min(20, Math.max(1, Number.isInteger(pax) ? pax : 4));
  const tableOrders = state.orders.filter(x => x.table === table);
  const activeOrders = tableOrders.filter(x => x.status !== 'rejected');
  const subtotal = activeOrders.reduce((sum, o) => sum + total(o.items), 0);
  const serviceCharge = Math.round(subtotal * 0.10);
  const gst = Math.round((subtotal + serviceCharge) * 0.09);
  const grandTotal = subtotal + serviceCharge + gst;
  const itemCount = activeOrders.reduce((sum, o) => sum + o.items.reduce((n, x) => n + x.qty, 0), 0);
  const allServed = activeOrders.length > 0 && activeOrders.every(o => o.status === 'served');
  const allPaid = activeOrders.length > 0 && activeOrders.every(o => o.paid);
  return {
    table,
    pax: safePax,
    rounds: activeOrders.length,
    itemCount,
    orders: tableOrders,
    activeOrders,
    subtotal,
    serviceCharge,
    gst,
    grandTotal,
    subtotalPerPax: safePax ? Math.ceil(subtotal / safePax) : subtotal,
    grandTotalPerPax: safePax ? Math.ceil(grandTotal / safePax) : grandTotal,
    amountCharged: 0,
    allServed,
    allPaid
  };
}
export function settleTable(state, table) {
  const served = state.orders.filter(x => x.table === table && x.status === 'served');
  if (!served.length) throw Error('No served orders are ready for a simulated receipt yet.');
  for (const o of served) o.paid = true;
  return served.length;
}
const numberWords = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };
const plain = text => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
for(const d of menu) d.aliases.push(plain(dishName('ms',d)),plain(dishName('fr',d)));
const shortAliases={rice:['nasi','riz'],chicken:['ayam','poulet'],tofu:['tauhu'],pork:['perut babi','poitrine de porc'],ribs:['rusuk babi','travers de porc'],grouper:['kerapu','merou'],pomfret:['bawal'],snapper:['ikan merah','vivaneau'],kang:['kangkung'],egg:['tiram','huitres'],yam:['keladi'],mushroom:['cendawan','champignon'],tea:['teh puer','the puer'],calamansi:['limau kasturi'],barley:['barli','orge']};
for(const [id,aliases] of Object.entries(shortAliases)) dish(id).aliases.push(...aliases);
export function normaliseQuery(text) {
  let t=plain(text);
  const phrases=[
    [/pas epice|non epice|tidak pedas|tak pedas/g,'not spicy'],
    [/sans fruits de mer|tanpa makanan laut/g,'no seafood'],
    [/sans porc|tanpa (?:daging )?babi/g,'no pork'],[/sans poisson|tanpa ikan/g,'no fish'],[/sans riz|tanpa nasi/g,'no rice'],
    [/une autre suggestion|autre suggestion|autre proposition|cadangan lain|pilihan lain/g,'another suggestion'],
    [/recommandez|recommande|recommandation|conseillez|conseilles|conseille|suggerez|cadangkan|cadangan|syorkan/g,'recommend'],
    [/\bpersonnes?\b|\borang\b/g,'people'],[/\bbajet\b|moins de/g,'budget'],[/\bepice\b|\bpedas\b/g,'spicy'],
    [/allergie|allergique|alahan/g,'allergy'],[/vegetarien|vegetalien/g,'vegetarian'],[/panier|troli/g,'cart'],
    [/quel est le prix|combien coute|berapa harga|\bharga\b/g,'price'],[/panggil pelayan|appeler un serveur/g,'call server']
  ];
  for(const [pattern,replacement] of phrases)t=t.replace(pattern,replacement);
  const numbers={un:'one',une:'one',deux:'two',trois:'three',quatre:'four',cinq:'five',six:'six',satu:'one',dua:'two',tiga:'three',empat:'four',lima:'five',enam:'six'};
  t=t.replace(/\b(un|une|deux|trois|quatre|cinq|six|satu|dua|tiga|empat|lima|enam)\b/g,word=>numbers[word]);
  return t;
}
export function configureRecommendation(state,{pax,budget,spice,avoid}) {
  if(!Number.isInteger(pax)||pax<1||pax>12||budget!==null&&(!Number.isInteger(budget)||budget<0)||!['any','mild','spicy'].includes(spice)||!['none','pork','fish'].includes(avoid))throw Error('Please check the meal preferences.');
  state.recommendationContext={pax,budget,spice,mild:spice==='mild',noPork:avoid==='pork',noFish:avoid==='fish',noSeafood:false,noRice:false};
  state.preference=spice==='mild'?'No chilli requested; staff must confirm':'';
}
function aliasIndex(text, alias) {
  if (/[\u3400-\u9fff]/.test(alias)) return text.indexOf(alias);
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.search(new RegExp(`\\b${escaped}\\b`, 'i'));
}
function recommend(text, state, language) {
  const previous = state.recommendationContext || {};
  const context = { pax: 4, budget: null, mild: Boolean(state.preference), noPork: false, noFish: false, noSeafood: false, noRice: false, ...previous };
  const party = text.match(/(\d+|one|two|three|four|five|six|一|两|二|三|四|五|六|七|八|九|十)\s*(?:pax|people|persons?|人|位)/) || text.match(/(?:recommend|suggest)\s+(?:for\s+)?(\d+)/);
  if (party) context.pax = Math.min(12, Math.max(1, Number(party[1]) || numberWords[party[1]] || ({七:7,八:8,九:9,十:10})[party[1]]));
  const budget = text.match(/(?:budget(?:\s*(?:is|of))?|under|below|less than|within|预算|不超过|低于)[^\d]{0,12}(\d+(?:\.\d{1,2})?)/) || text.match(/(?:s\$|\$)\s*(\d+(?:\.\d{1,2})?)/);
  if (budget) context.budget = Math.round(Number(budget[1]) * 100);
  if (/no budget|any budget|不限预算/.test(text)) context.budget = null;
  if (/not spicy|no spic[ey]|non.spicy|no chilli|mild|不辣|kids|children/.test(text)) context.mild = true;
  else if (/spicy|chilli|辣/.test(text)) context.mild = false;
  context.spice=context.mild?'mild':/spicy|chilli|辣/.test(text)?'spicy':previous.spice==='spicy'?'spicy':'any';
  if (/no pork|without pork|不要猪|不吃猪/.test(text)) context.noPork = true;
  else if (/pork (?:is )?(?:okay|ok)|可以.*猪/.test(text)) context.noPork = false;
  if (/no seafood|without seafood|不吃海鲜|不要海鲜/.test(text)) context.noSeafood = true;
  else if (/seafood (?:is )?(?:okay|ok)|可以.*海鲜/.test(text)) context.noSeafood = false;
  if (/no fish|without fish|不吃鱼|不要鱼/.test(text)) context.noFish = true;
  else if (/fish (?:is )?(?:okay|ok)|可以.*鱼/.test(text)) context.noFish = false;
  if (/no rice|without rice|不要饭|不吃饭/.test(text)) context.noRice = true;
  else if (/with rice|include rice|要白饭/.test(text)) context.noRice = false;
  state.recommendationContext = context;
  state.preference = context.mild ? 'No chilli requested; staff must confirm' : '';
  const excluded = new Set(state.unavailable);
  if (context.mild) excluded.add('kang');
  if (context.noPork) ['pork','ribs'].forEach(id=>excluded.add(id));
  if (context.noFish || context.noSeafood) ['grouper','pomfret','snapper'].forEach(id=>excluded.add(id));
  if (context.noSeafood) ['chicken','kang','egg'].forEach(id=>excluded.add(id));
  const rank = { grouper:5, pomfret:4, snapper:3, chicken:5, tofu:4, kang:3, ribs:2.5, pork:2, egg:2 };
  const available = menu.filter(d=>d.id!=='rice'&&Object.hasOwn(rank,d.id)&&!excluded.has(d.id));
  // Prefer dishes not already ordered; suggestions remain separate from the cart.
  const target = context.pax<=2 ? 2 : context.pax<=4 ? 3 : context.pax<=6 ? 4 : 5;
  const pool = available;
  const rice = !context.noRice&&!excluded.has('rice') ? [makeLine('rice', context.pax, 'Regular', state.preference)] : [];
  const history = Array.isArray(state.recommendationHistory) ? state.recommendationHistory : [];
  const options = [];
  function combinations(start, selected) {
    if (selected.length) {
      const fish = selected.filter(d=>d.category==='Steamboat').length;
      if (fish<=1) {
        const lines=selected.map(d=>makeLine(d.id,1,context.pax>4?'Large':'Regular',state.preference)).concat(rice);
        const price=total(lines), signature=selected.map(d=>d.id).sort().join('|');
        if (context.budget===null || price<=context.budget) {
          const recent=history.slice(-4);
          const repeatedItems=selected.reduce((n,d)=>n+recent.filter(h=>h.split('|').includes(d.id)).length,0);
          const cartOverlap=selected.filter(d=>state.cart.some(x=>x.id===d.id)).length;
          const categoryBonus=new Set(selected.map(d=>d.category)).size*3;
          const score=-Math.abs(target-selected.length)*100 + fish*(context.pax>2?10:0) + categoryBonus + selected.reduce((n,d)=>n+rank[d.id],0) - repeatedItems*4 - cartOverlap*25;
          options.push({lines,signature,score,price});
        }
      }
    }
    if (selected.length>=target) return;
    for(let i=start;i<pool.length;i++) combinations(i+1,[...selected,pool[i]]);
  }
  combinations(0,[]);
  // Keep the best feasible number of dishes, then rotate within those options.
  const maxCount=Math.max(0,...options.map(o=>o.lines.length));
  const complete=options.filter(o=>o.lines.length===maxCount);
  const fresh=complete.filter(o=>!history.slice(-8).includes(o.signature));
  const choices=fresh.length ? fresh : complete;
  choices.sort((a,b)=>b.score-a.score || a.price-b.price || a.signature.localeCompare(b.signature));
  const selected=choices[0];
  if (!selected) return {text:replyText(language,'noRecommendation'),lines:[],language};
  state.recommendationHistory=[...history,selected.signature].slice(-12);
  const dishes=selected.lines.map(x=>`${x.qty} × ${dishName(language,dish(x.id))}`).join(language==='zh'?'、':', ');
  const labels=language==='zh'
    ? [context.mild?'不辣要求':null,context.noPork?'避开猪肉菜名':null,context.noFish?'避开鱼类菜品':null,context.noSeafood?'避开明显的海鲜菜品':null,context.noRice?'不配白饭':null,context.budget!==null?`建议套餐预算 ${money(context.budget)}`:null]
    : [context.mild?'mild requested':null,context.noPork?'omitting pork dishes':null,context.noFish?'omitting fish dishes':null,context.noSeafood?'omitting obvious seafood dishes':null,context.noRice?'no rice':null,context.budget!==null?`suggested-set budget ${money(context.budget)}`:null];
  let details=labels.filter(Boolean).join(' · ');
  if(language==='ms'||language==='fr') {
    const terms=language==='ms'?['tidak pedas','tanpa hidangan babi','tanpa hidangan ikan','tanpa hidangan makanan laut yang jelas','tanpa nasi','bajet cadangan']:['doux demandé','sans plats de porc','sans plats de poisson','sans plats de fruits de mer identifiables','sans riz','budget proposé'];
    details=[context.mild?terms[0]:null,context.noPork?terms[1]:null,context.noFish?terms[2]:null,context.noSeafood?terms[3]:null,context.noRice?terms[4]:null,context.budget!==null?`${terms[5]} ${money(context.budget)}`:null].filter(Boolean).join(' · ');
  }
  return {text:replyText(language,'recommendation',{pax:context.pax,amount:money(selected.price),dishes,details}),lines:selected.lines,language};
}
export function chat(text, state, selectedLanguage = state.replyLanguage) {
  const t = normaliseQuery(text).trim();
  const language = normaliseLanguage(selectedLanguage);
  const answer = (key, data = {}, lines = []) => ({ text: replyText(language, key, data), lines, language });
  if (/allerg|allergic|过敏|nut.free|gluten.free|celiac/.test(t)) return answer('allergy');
  if (/call.*(staff|server)|human|服务员/.test(t)) return answer('call');
  if (/checkout|submit|pay|place.*order|下单|付款/.test(t)) return answer('checkout');
  if (/review|cart|订单|购物车/.test(t)) return answer(state.cart.length ? 'cart' : 'emptyCart', { count: state.cart.reduce((n,x)=>n+x.qty,0), amount: money(total(state.cart)) });
  if (/vegetarian|vegan|素食|清真|halal/.test(t)) return answer('dietary');
  if (/recommend|suggest|pax|people|推荐|几个人|人吃|人餐|what.*good|another|different|换一|预算|budget|under\s*\$?\d/.test(t) || state.recommendationContext&&/no pork|no fish|no seafood|no rice|spicy|chilli|辣|不吃|不要鱼/.test(t)) return recommend(t,state,language);
  if (/no spicy|not spicy|non.spicy|mild|不辣|kids|children/.test(t)) state.preference = 'No chilli requested; staff must confirm';
  const found = menu.map(d => ({ d, at: Math.min(...d.aliases.map(a=>aliasIndex(t,a)).filter(i=>i>=0), Infinity) })).filter(x=>Number.isFinite(x.at));
  // Specific steamboat names take precedence over the generic word “steamboat”.
  const matches = found.filter(x=>x.d.id !== 'grouper' || !found.some(y=>['pomfret','snapper'].includes(y.d.id)) || /grouper|石斑/.test(t)).sort((a,b)=>a.at-b.at);
  if (matches.length) {
    if (/\b(no|without|don.t|remove|cancel)\b|不要|取消|去掉/.test(t) && !/no chilli|no spicy|without chilli/.test(t)) return answer('excluded');
    if (/price|how much|多少钱|价格|what is|what.s in/.test(t)) {
      const text = matches.map(({d})=>`${dishName(language,d)}: ${uiText(language,'price')} ${money(d.price)}.`).join('\n') + ' ' + uiText(language,'verify');
      return {text, lines: [], language};
    }
    const lines = matches.filter(({d})=>!state.unavailable.includes(d.id)).map(({d,at},i)=>{
      const start = i ? matches[i-1].at + matches[i-1].d.aliases.find(a=>aliasIndex(t,a)===matches[i-1].at)?.length || 0 : 0;
      const prefix = t.slice(start, at); const match = prefix.match(/(\d+|one|two|three|four|five|six|a|一|两|二|三|四|五|六)\s*(?:份|碗|个|壶|杯|x)?\s*(?:large|regular|small)?\s*$/);
      const qty = match ? Number(match[1]) || numberWords[match[1]] : 1;
      return makeLine(d.id, qty, !d.singleSize && /large|大份/.test(prefix.slice(-16)) ? 'Large' : 'Regular', state.preference);
    });
    if (!lines.length) return answer('unavailable');
    return answer('selected', {}, lines);
  }
  if (/menu|菜单/.test(t)) return answer('menu');
  return answer('fallback');
}
