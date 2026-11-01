export const languages = {
  en: { label: 'English', speech: 'en-GB', html: 'en' },
  zh: { label: '中文（普通话）', speech: 'zh-CN', html: 'zh-Hans' },
  singlish: { label: 'Singlish', speech: 'en-SG', html: 'en-SG' }
};
export const normaliseLanguage = value => Object.hasOwn(languages, value) ? value : 'en';
const messages = {
  welcome: {
    en: 'Hello, welcome! I’m Ah Hua. Tell me what you would like, ask for a recommendation, or browse the menu. 😊',
    zh: '您好，欢迎光临！我是阿华。想吃什么？您可以请我推荐，也可以直接浏览菜单。😊',
    singlish: 'Hello, welcome ah! I’m Ah Hua. What you feel like eating today? Tell me, or browse the menu. I help you choose, can? 😊'
  },
  switched: {
    en: 'Of course. I’ll reply in English from now on. Your cart is unchanged. What would you like?',
    zh: '好的，接下来我会用中文回复您。购物车里的菜品不变。请问想吃什么？',
    singlish: 'Can lah! From now on I reply in Singlish. Your cart still the same, don’t worry. What you want to makan?'
  },
  voiceEnabled: {
    en: 'Hello! I’m Ah Hua. I’ll read my replies aloud in English. What would you like to eat?',
    zh: '您好，我是阿华。接下来我会用普通话为您朗读回复。请问想吃什么？',
    singlish: 'Hello ah! Ah Hua here. I’ll read my replies aloud in Singlish. What you want to makan?'
  },
  allergy: {
    en: 'Please use “Call a server” for allergies. These sample recipes and allergen notes are unverified; I can’t confirm any dish is safe. I haven’t added anything.',
    zh: '如有过敏，请点击“Call a server”联系服务员。示例食谱和过敏原信息未经确认，我无法保证菜品安全，也没有添加菜品。',
    singlish: 'Got allergy, please tap “Call a server” and check with staff first, okay? These sample recipes and allergen notes not verified. I cannot confirm any dish is safe, so I haven’t added anything.'
  },
  call: {
    en: 'Tap “Call a server” above to create a simulated assistance request for staff.',
    zh: '请点击上方的“Call a server”，发送模拟服务请求。',
    singlish: 'Need someone to help? Tap “Call a server” above. It sends a demo request to staff, can.'
  },
  checkout: {
    en: 'Review your shared cart, then tap “Send to staff”. Only staff approval sends a demo ticket to the kitchen. There are no real payments.',
    zh: '请检查购物车，再点击“Send to staff”。员工批准后才会生成模拟厨房订单。没有真实付款。',
    singlish: 'Check your cart first, then tap “Send to staff”, okay? Staff must approve before the demo kitchen gets the order. No real payment lah.'
  },
  cart: {
    en: ({count,amount}) => `Your cart has ${count} items for ${amount}. You can change quantities in Your table order.`,
    zh: ({count,amount}) => `购物车共 ${count} 份，示例总额 ${amount}。您可以在购物车修改数量。`,
    singlish: ({count,amount}) => `Your cart got ${count} items, sample total ${amount}. Want more or less? Can change the quantity in Your table order.`
  },
  emptyCart: {
    en: 'Your cart is empty. Shall we start with a steamboat?',
    zh: '购物车还是空的。先来一份鱼头炉吗？',
    singlish: 'Your cart still empty leh. Start with one steamboat to share, can?'
  },
  dietary: {
    en: 'I can’t verify vegetarian, vegan or halal suitability from this sample menu. Please call a server before choosing. No dishes added.',
    zh: '此示例菜单无法确认素食或清真要求。请选择“Call a server”请员工确认。没有添加菜品。',
    singlish: 'Vegetarian, vegan or halal ah? This sample menu cannot confirm. Please call a server and check first. I haven’t added any dishes.'
  },
  recommendation: {
    en: ({pax,amount}) => `For ${pax}, how about a steamboat, crispy chicken, soft beancurd and rice? Here’s a sample sharing set (${amount}). Portions and recipes need staff confirmation. Review the suggestion below before adding.`,
    zh: ({pax,amount}) => `为 ${pax} 位推荐鱼头炉、虾酱鸡、豆腐和白饭。示例套餐 ${amount}，份量与食谱需员工确认。请检查下方建议后再加入购物车。`,
    singlish: ({pax,amount}) => `${pax} people ah? Steamboat, crispy chicken, beancurd and rice to share, can! Sample set is ${amount}. Portion and recipe must check with staff first. See the suggestion below before adding, okay?`
  },
  excluded: {
    en: 'I haven’t changed your cart. Use the minus controls to remove dishes, or tell me what you’d like to add.',
    zh: '我没有更改购物车。请使用减号删除菜品，或告诉我想添加什么。',
    singlish: 'Your cart I haven’t changed, okay? Tap the minus button to remove dishes, or tell me what you want to add.'
  },
  unavailable: {
    en: 'Those dishes are unavailable in this demo. Try another dish from the menu.',
    zh: '这些菜品暂时售罄，请从菜单选择其他菜品。',
    singlish: 'Those dishes sold out in this demo already. Choose another one from the menu, can?'
  },
  selected: {
    en: 'I’ve prepared your selection below. Check the quantities, sizes and notes, then add it to your cart. Nothing has been sent to staff yet.',
    zh: '好的！请检查下方菜品、数量和份量，再加入购物车。暂未发送给员工。',
    singlish: 'Can! Your selection is below. Check quantity, size and notes first, then add to cart. Haven’t sent anything to staff yet, don’t worry.'
  },
  menu: {
    en: 'Browse the menu beside our chat (or below on your phone). Every dish can be customised and added to the same cart.',
    zh: '您可以在旁边或手机下方浏览菜单，自定义菜品后加入同一个购物车。',
    singlish: 'Menu is beside our chat, or below if you’re on your phone. Choose and customise any dish, all go into the same cart lah.'
  },
  fallback: {
    en: 'I’m a demo menu assistant. Try “recommend for 4, not spicy”, “two rice and one prawn paste chicken”, or ask a dish’s price. You can always browse the menu or call a server.',
    zh: '我是示例菜单助手。试试“推荐四人餐”或“两碗白饭和一份虾酱鸡”。也可以询问价格、浏览菜单或呼叫服务员。',
    singlish: 'I’m a demo menu helper lah. Try “four pax, not spicy, what you recommend?” or “two rice and one prawn paste chicken”. Can ask the price also. Need help, just call a server.'
  },
  added: {
    en: 'Added to your cart. Review it, make any changes, then send it to staff when you’re ready.',
    zh: '已经加入购物车。请检查菜品并修改数量，准备好后再发送给员工审核。',
    singlish: 'Added to your cart already! Have a look, change anything you need, then send to staff when ready, can?'
  },
  submitted: {
    en: ({id}) => `Order ${id} is waiting for staff approval. Switch to Staff to review it, then Kitchen to follow the cooking simulation.`,
    zh: ({id}) => `订单 ${id} 正在等待员工审核。您可以切换到 Staff 审核，再切换到 Kitchen 查看模拟烹饪流程。`,
    singlish: ({id}) => `Order ${id} waiting for staff to approve, okay? Go to Staff to check, then Kitchen to try the cooking simulation.`
  },
  placeholder: {
    en: 'Ah Hua, what would you recommend for four people?',
    zh: '阿华，四个人吃什么好？',
    singlish: 'Ah Hua, four pax, what you recommend ah?'
  }
};
export function replyText(language, key, data = {}) {
  const entry = messages[key]?.[normaliseLanguage(language)];
  if (!entry) throw Error(`Unknown reply message: ${key}`);
  return typeof entry === 'function' ? entry(data) : entry;
}
