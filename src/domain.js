import { normaliseLanguage, replyText, dishName, uiText } from './languages.js';

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
const plain = text => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
for(const d of menu) d.aliases.push(plain(dishName('ms',d)),plain(dishName('fr',d)));
const shortAliases={rice:['nasi','riz'],chicken:['ayam','poulet'],tofu:['tauhu'],pork:['perut babi','poitrine de porc'],ribs:['rusuk babi','travers de porc'],grouper:['kerapu','merou'],pomfret:['bawal'],snapper:['ikan merah','vivaneau'],kang:['kangkung'],egg:['tiram','huitres']};
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
  const available = menu.filter(d=>d.id!=='rice'&&!excluded.has(d.id));
  // Prefer dishes not already ordered; suggestions remain separate from the cart.
  const target = context.pax<=2 ? 2 : context.pax<=4 ? 3 : context.pax<=6 ? 4 : 5;
  const pool = available;
  const rice = !context.noRice&&!excluded.has('rice') ? [makeLine('rice', context.pax, 'Regular', state.preference)] : [];
  const history = Array.isArray(state.recommendationHistory) ? state.recommendationHistory : [];
  const rank = { grouper:5, pomfret:4, snapper:3, chicken:5, tofu:4, kang:3, ribs:2.5, pork:2, egg:2 };
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
