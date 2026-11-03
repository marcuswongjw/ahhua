// Saved answers for the scripted host. Not a live model.
export const QUICK_CHIPS = {
  viewing: [
    { id: 'fish_diff', label: '🐟 Pomfret vs Grouper?', question: 'What is the difference between Pomfret and Grouper?' },
    { id: 'spicy', label: '🌶️ How spicy is the food?', question: 'Which dishes are spicy and can they be made mild?' },
    { id: 'kids', label: '👶 Good for kids & elders?', question: 'What dishes are best for children and seniors?' },
    { id: 'pairs', label: '🍲 What is the classic pairing?', question: 'What is the classic Teochew feast combination?' }
  ],
  waiting: [
    { id: 'steamboat_story', label: '📖 What is this house?', question: 'What is this restaurant?' },
    { id: 'sole_fish', label: '🐟 Why sole fish in the broth?', question: 'What is the secret ingredient in the steamboat soup?' },
    { id: 'rounds', label: '🧾 How do rounds work?', question: 'How does an order reach the kitchen?' },
    { id: 'split', label: '💳 Can we split the bill?', question: 'Can we split the bill with PayNow?' }
  ]
};

export const LORE_ANSWERS = {
  fish_diff: {
    en: 'Pomfret (昌鱼) has soft, velvety flakes with delicate natural sweetness—the traditional gold standard for Teochew steamboat. Grouper (石斑) is firmer, springier, and low in fat. Red Snapper (红哥里) has robust collagen texture. All simmered fresh over charcoal!',
    zh: '鲳鱼肉质最细嫩柔滑、鲜甜清香，是潮州鱼头炉世代首选；红石斑鱼肉紧实弹牙、低脂健康；红哥里肉厚少刺胶质丰富。所有鱼头炉均用百年传统炭火慢炖！',
    singlish: 'Pomfret is super tender and sweet lah, the traditional king for steamboat! Grouper meat is more bouncy and firm. If want firm fish, go Grouper; if want melt-in-mouth sweetness, Pomfret definitely!'
  },
  spicy: {
    en: 'Almost all our dishes can be cooked non-spicy on request! Only Sambal Kang Kong has natural spicy kick. For steamboat, the broth is 100% soothing and non-spicy—we provide cut chilli padi on the side so everyone customises their own heat.',
    zh: '本店绝大多数传统佳肴均可按需求免辣！仅叁巴空心菜带有香辣风味。鱼头炉高汤浓郁鲜甜、完全不辣，桌上备有生抽小辣椒碟，同桌可随心调配辣度。',
    singlish: 'Don’t worry! Steamboat broth is totally not spicy, soothing and sweet. Only Sambal Kang Kong got kick. We give cut chilli on the side so anyone who wants spicy can dip themselves!'
  },
  kids: {
    en: 'Great picks for children & elders: 1) Homemade Beancurd with Minced Pork (silky and comforting), 2) Sweet & Sour Pork (tangy & crispy), 3) Prawn Paste Chicken wings, and 4) Clear Sliced Fish Soup with fluffy white rice!',
    zh: '长辈与小朋友特别喜爱的老少咸宜菜品：1）肉碎自制豆腐（嫩滑浓香）、2）糖醋咕噜肉（酸甜开胃）、3）经典虾酱鸡中翅、4）鲜嫩鱼片汤配香米饭！',
    singlish: 'Very family friendly! Kids love our Homemade Tofu with minced meat, Sweet & Sour Pork, and Har Cheong Gai. For Ah Gong Ah Ma, Pomfret steamboat and tofu are super soft and easy to eat!'
  },
  pairs: {
    en: 'A classic shared table: 1 charcoal fish-head steamboat in the middle, 1 prawn paste chicken, 1 sambal kang kong, 1 homemade tofu, and rice for each person.',
    zh: '一桌常见的搭配：炭火鱼头炉放中间，加上虾酱鸡、叁巴空心菜、自制豆腐，再按人数配白饭。',
    singlish: 'The usual table: 1 charcoal steamboat in the middle, 1 plate har cheong gai, 1 plate sambal kang kong, and rice for everyone.'
  },
  steamboat_story: {
    en: 'This is Hua Yuan, a fictional steamboat house for the TableHua demo. The menu is sample zi char and charcoal steamboat. It is not a real restaurant’s history or address.',
    zh: '这里是华园，一间为 TableHua 演示而设的虚构鱼头炉。菜单是示例煮炒和炭火炉，不是某家真实餐厅的历史或地址。',
    singlish: 'This one is Hua Yuan, a made-up steamboat house for the TableHua demo. Sample menu only. Not a real restaurant story, okay?'
  },
  sole_fish: {
    en: 'The secret umami in traditional Teochew steamboat broth comes from sun-dried sole fish (大地鱼 / 扁鱼干). We deep-fry it until crisp and simmer it in the soup, releasing deep natural sweetness without MSG.',
    zh: '潮州鱼头炉鲜绝天下的秘密，在于特选日晒大地鱼（扁鱼干）。经大火炸至酥香后投入高汤慢熬，鱼干天然咸鲜与生姜香气交融，回味悠长。',
    singlish: 'The secret weapon is the crispy dried sole fish (Ti Po)! Fried until crispy and simmered into the broth. That’s where the deep seafood umami comes from lah!'
  },
  rounds: {
    en: 'Add dishes, then send the round. Staff approve it in the Staff view. Only then does the Kitchen view start cooking. Nothing is sent to a real kitchen.',
    zh: '先把菜放进购物车，再发送这一轮。服务员在 Staff 页面批准后，Kitchen 页面才会开始做。这里没有真实厨房。',
    singlish: 'Add the dishes, then send the round. Staff must approve it on the Staff screen. Kitchen only starts after that. This is a demo, not a real wok.'
  },
  split: {
    en: 'Open the bill to split the sample total. The PayNow code is a picture for the demo. Nothing is charged, and TableHua does not take the payment.',
    zh: '打开账单可以把示例总额分摊。PayNow 码只是演示图片，不会扣款，TableHua 也不代收钱。',
    singlish: 'Open the bill and split the sample total. The PayNow picture is for show. Nothing is charged, and we don’t take the money.'
  }
};

export const STORY_CARDS = [
  {
    id: 'masterclass',
    badge: '👑 Masterclass',
    title: 'The 3-Step Teochew Masterclass',
    subtitle: 'How regulars eat fish head steamboat',
    steps: [
      { num: '01', head: 'Sip the first boil pure', body: 'Before dipping sides, ladle soup into your bowl. Taste the toasted sole fish umami at its peak.' },
      { num: '02', head: 'Dip, don’t drown', body: 'Dip tender fish flakes in fermented yellow bean & fresh cut chilli padi in dark soy.' },
      { num: '03', head: 'Fried yam goes last', body: 'Simmer golden taro yam sticks towards the end until the broth thickens into velvety silk.' }
    ]
  },
  {
    id: 'charcoal',
    badge: '🔥 Charcoal pot',
    title: 'Why the pot is charcoal',
    subtitle: 'A steady heat, not a flat ring',
    quote: '“A ring heats the metal. Charcoal keeps the soup moving.”',
    text: 'A chimney of charcoal under a tall pot keeps a gentle heat, so the broth stays sweet and the fish does not fall apart. This house is fictional. The method is the one cooks still use.'
  },
  {
    id: 'rounds',
    badge: '01 02 03',
    title: 'How a round reaches the wok',
    subtitle: 'Staff approve before the kitchen starts',
    spots: [
      { icon: '1', name: 'The table sends a round', dist: 'The cart stays here until you send it' },
      { icon: '2', name: 'Staff approve', dist: 'Open Staff in this same browser' },
      { icon: '3', name: 'Kitchen cooks', dist: 'Open Kitchen after the round is approved' }
    ]
  },
  {
    id: 'slang',
    badge: '🗣️ Teochew',
    title: 'Three words regulars use',
    subtitle: 'Three words that warm up every table',
    slangs: [
      { word: 'Gao (厚)', meaning: 'Thick, collagen-rich broth that coats the spoon.' },
      { word: 'Ho Jiak (好吃)', meaning: 'Delicious! The highest compliment to the chef.' },
      { word: 'Jia Pa Buay? (吃饱没)', meaning: '“Have you eaten yet?” The warmest Teochew greeting.' }
    ]
  }
];

export function computeDishBadge(dishId, state) {
  if (!state) return '';
  const isSoldOut = state.unavailable?.includes(dishId);
  if (isSoldOut) return '';
  
  // Real orders count across all table orders today in state
  const totalOrderedQty = (state.orders || []).flatMap(o => (o.items || []).filter(x => x.id === dishId)).reduce((sum, x) => sum + x.qty, 0);
  
  if (totalOrderedQty >= 5) {
    return `🔥 Ordered ${totalOrderedQty}× today`;
  } else if (totalOrderedQty >= 2) {
    return `✨ Popular pick (${totalOrderedQty} ordered)`;
  }
  
  // Real culinary prep & heritage tags
  const heritageBadges = {
    pomfret: '👑 Traditional Choice',
    'pomfret-steamboat': '👑 Traditional Choice',
    grouper: '⚡ Low-fat Tender Grouper',
    'grouper-steamboat': '⚡ Low-fat Tender Grouper',
    snapper: '🐟 Rich Collagen Broth',
    'red-snapper-steamboat': '🐟 Rich Collagen Broth',
    'song-fish-head': '🍲 Century-old Heritage',
    'fish-head-steamboat': '🍲 Century-old Heritage',
    chicken: '👑 Fermented Prawn Paste',
    'prawn-paste-chicken': '👑 Fermented Prawn Paste',
    pork: '🔥 Nam Yu Red Beancurd',
    'sweet-and-sour-pork': '🔥 Nam Yu Red Beancurd',
    ribs: '✨ Crispy Golden Glaze',
    tofu: '🥢 Handmade Egg Tofu',
    'signature-tofu': '🥢 Handmade Egg Tofu',
    kang: '🌶️ Wok-hei Sambal',
    'sambal-kangkong': '🌶️ Wok-hei Sambal',
    egg: '🦪 Sizzling Oyster Omelette',
    'fried-oyster-omelette': '🦪 Sizzling Oyster Omelette',
    tango: '🥬 Sweet Tang Oh Greens',
    yam: '🍠 Golden Fried Taro',
    'prawn-paste': '🦐 100% Tiger Prawn Meat',
    'fresh-prawn-paste-for-steamboat': '🦐 100% Tiger Prawn Meat',
    rice: '🍚 Fragrant Jasmine Rice'
  };
  return heritageBadges[dishId] || '';
}

export const GUEST_PERSONAS = [
  { name: 'Kopi Uncle', emoji: '☕' },
  { name: 'Chilli Crab', emoji: '🦀' },
  { name: 'Bishan Otter', emoji: '🦦' },
  { name: 'Merlion Kid', emoji: '🦁' },
  { name: 'Durian King', emoji: '👑' },
  { name: 'Kaya Toast', emoji: '🍞' }
];

export const POPULAR_MODIFIERS = [
  { id: 'less_spicy', label: '🌶️ Less Spicy / 少辣' },
  { id: 'no_spicy', label: '🚫 Non-Spicy / 免辣' },
  { id: 'no_coriander', label: '🌿 No Coriander / 免香菜' },
  { id: 'no_onion', label: '🧅 No Spring Onion / 免葱' },
  { id: 'sauce_side', label: '🥣 Sauce on Side / 酱料另放' },
  { id: 'less_oil_salt', label: '🧂 Less Oil & Salt / 少油少盐' },
  { id: 'kosong', label: '🍵 Kosong / 无糖' },
  { id: 'deboned', label: '🐟 Deboned / 去骨' },
  { id: 'rich_broth', label: '🍲 Extra Rich Broth / 加浓高汤' }
];

