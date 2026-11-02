import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('data/nanhwachong_raw.json', 'utf8'));

const catMap = {
  'FISH HEAD STEAMBOAT 鱼头炉': 'Steamboat',
  'SPECIALTY 特质佳肴': 'Specialty',
  'CRAYFISH 虾婆': 'Crayfish & Seafood',
  'PRAWNS 虾': 'Crayfish & Seafood',
  'SQUID (SOTONG) 苏东': 'Crayfish & Seafood',
  'LALA 啦啦': 'Crayfish & Seafood',
  'CHICKEN 鸡肉类': 'Chicken & Pork',
  'PORK 猪肉类': 'Chicken & Pork',
  'OMELETTE 蛋类': 'Egg & Tofu',
  'BEANCURD 豆腐类': 'Egg & Tofu',
  'VEGETABLES菜类': 'Vegetables',
  'RICE 饭类': 'Rice & Noodles',
  'NOODLES 面类': 'Rice & Noodles',
  'SOUP 汤类': 'Soup'
};

const coreOverrides = {
  pomfret: {
    id: 'pomfret',
    name: 'Pomfret Steamboat',
    cn: '鲳鱼鱼头炉',
    price: 5800,
    category: 'Steamboat',
    icon: '🥘',
    image: 'https://ucarecdn.com/86808079-6b10-4abb-b036-e14ea8305639/',
    desc: 'All time favourite for Teochew for generations. Best known for its soft delicate texture and naturally sweet broth simmered over charcoal.',
    tag: 'For sharing',
    popularity: 92,
    spicyLevel: 0,
    allergens: 'Fish',
    modifiers: ['Charcoal milky broth', 'Clear teochew broth', 'Extra tang o greens', 'Soup on side'],
    aliases: ['pomfret', '鲳鱼', '昌鱼', 'pomfret steamboat', 'pomfret fishboat']
  },
  grouper: {
    id: 'grouper',
    name: 'Grouper Fish Head Steamboat',
    cn: '红石斑鱼头炉',
    price: 4800,
    category: 'Steamboat',
    icon: '🍲',
    image: 'https://ucarecdn.com/aa0c09b5-7d3a-4414-a16b-6d121aab84cb/',
    desc: 'Low in fat and cholesterol with firm texture and mild sweet flavour, bubbling in our signature charcoal broth with yam and vegetables.',
    tag: 'Ah Hua’s favourite',
    popularity: 98,
    spicyLevel: 0,
    allergens: 'Fish',
    modifiers: ['Charcoal milky broth', 'Clear ginger broth', 'Extra sour plum', 'Less salt'],
    aliases: ['grouper', '石斑', 'fish head', '鱼头炉', 'steamboat', '红石斑', 'grouper fishboat']
  },
  snapper: {
    id: 'snapper',
    name: 'Snapper Steamboat',
    cn: '红哥里鱼头炉',
    price: 4200,
    category: 'Steamboat',
    icon: '🍲',
    image: 'https://ucarecdn.com/c02d1ed8-3908-4ed4-bc79-87e8498e4298/',
    desc: 'More commonly known as Ang Go Li. Firm fish meat with clean sweet flavour, cooked in heritage charcoal soup.',
    tag: 'Classic',
    popularity: 86,
    spicyLevel: 0,
    allergens: 'Fish',
    modifiers: ['Charcoal milky broth', 'Clear ginger broth', 'Extra yam cubes', 'Mild'],
    aliases: ['snapper', '红哥里', 'ang go li', 'snapper fishboat']
  },
  chicken: {
    id: 'chicken',
    name: 'Prawn Paste Chicken',
    cn: '虾酱鸡',
    price: 1500,
    category: 'Chicken & Pork',
    icon: '🍗',
    image: 'https://ucarecdn.com/6ebbd458-935b-469d-8448-9b3b3a21766e/',
    desc: 'Crisp, golden-brown har cheong gai wings marinated in fragrant fermented prawn paste.',
    tag: 'Crowd pleaser',
    popularity: 99,
    spicyLevel: 0,
    allergens: 'Shellfish, wheat',
    modifiers: ['Extra crispy', 'Sauce on side', 'Less oil'],
    aliases: ['prawn paste chicken', 'prawn paste', 'chicken', 'har cheong', '虾酱鸡', 'chicken wings']
  },
  pork: {
    id: 'pork',
    name: 'Signature Pork Belly',
    cn: '南乳花肉',
    price: 1800,
    category: 'Chicken & Pork',
    icon: '🥓',
    image: 'https://ucarecdn.com/495be89c-5db9-4f7f-8be5-faec2d6a78d0/',
    desc: 'Deep-fried pork belly slices marinated with traditional fermented red beancurd (nam yu) for crisp skin and tender meat.',
    tag: 'Signature',
    popularity: 91,
    spicyLevel: 0,
    allergens: 'Soy, wheat',
    modifiers: ['Extra crispy', 'Leaner cut if available', 'Chilli dip on side'],
    aliases: ['pork belly', '南乳花肉', 'nam yu pork']
  },
  ribs: {
    id: 'ribs',
    name: 'Sweet & Sour Pork Ribs',
    cn: '排骨大王',
    price: 1700,
    category: 'Chicken & Pork',
    icon: '🍖',
    image: 'https://ucarecdn.com/f04c7eb3-bf80-4966-a3ec-8207908b8e05/',
    desc: 'Tender pork ribs glazed with a sticky, tangy-sweet heritage sauce and wok-tossed to perfection.',
    tag: 'Signature',
    popularity: 84,
    spicyLevel: 0,
    allergens: 'Soy, wheat',
    modifiers: ['Less sweet', 'Sauce on side', 'No onion'],
    aliases: ['pork ribs', 'ribs', '排骨', '排骨大王', 'sweet and sour ribs']
  },
  tofu: {
    id: 'tofu',
    name: 'Signature Homemade Beancurd (Tofu)',
    cn: '金块豆腐',
    price: 1400,
    category: 'Egg & Tofu',
    icon: '🥢',
    image: 'https://ucarecdn.com/0dd4d881-7a61-456e-af48-949a7c6d3876/',
    desc: 'Silky golden handmade tofu bricks topped with savoury minced sauce and crisp shallots.',
    tag: 'Signature',
    popularity: 88,
    spicyLevel: 0,
    allergens: 'Soy, egg; sauce unverified',
    modifiers: ['Mild / kid-friendly', 'Less gravy', 'No garnish'],
    aliases: ['beancurd', 'tofu', '豆腐', 'homemade beancurd', '金块豆腐', 'homemade tofu']
  },
  kang: {
    id: 'kang',
    name: 'Sambal Kang Kong',
    cn: '马来风光',
    price: 1300,
    category: 'Vegetables',
    icon: '🥬',
    image: 'https://ucarecdn.com/538129d1-b339-4efd-81d0-21deefb4dc88/',
    desc: 'Wok-tossed water spinach with spicy dried shrimp sambal belacan and garlic.',
    tag: 'Spicy',
    popularity: 95,
    spicyLevel: 2,
    allergens: 'Shellfish',
    modifiers: ['Less spicy', 'Extra spicy', 'Stir-fry with garlic instead'],
    aliases: ['kang kong', 'kangkong', 'sambal', '马来风光', '空心菜', 'water spinach']
  },
  egg: {
    id: 'egg',
    name: 'Oyster Omelette',
    cn: '招牌蚝蛋',
    price: 1500,
    category: 'Egg & Tofu',
    icon: '🍳',
    image: 'https://ucarecdn.com/6ec4ec1b-325b-402a-9642-1e967a356360/',
    desc: 'Crispy pan-fried egg omelette studded with plump, juicy oysters and fresh coriander.',
    tag: 'Signature',
    popularity: 87,
    spicyLevel: 0,
    allergens: 'Shellfish, egg',
    modifiers: ['Extra crispy edges', 'Chilli on side', 'No coriander'],
    aliases: ['oyster', 'omelette', '蚝煎', '招牌蚝蛋', '蚝蛋', 'oyster egg']
  },
  rice: {
    id: 'rice',
    name: 'Steamed Rice',
    cn: '白饭',
    price: 150,
    category: 'Rice & Noodles',
    icon: '🍚',
    image: 'https://ucarecdn.com/ccf843c0-1bed-4d5d-954f-c65f57359f65/',
    desc: 'One fluffy bowl of fragrant jasmine rice, perfect companion for fish broth and gravies.',
    allergens: 'None',
    popularity: 96,
    spicyLevel: 0,
    singleSize: true,
    modifiers: ['Serve first', 'Serve with dishes'],
    aliases: ['rice', '白饭', '米饭', 'steamed rice', 'plain rice', 'white rice']
  },
  yam: {
    id: 'yam',
    name: 'Crispy Yam & Fish Maw Add-on',
    cn: '炸芋头鱼鳔',
    price: 800,
    category: 'Steamboat',
    icon: '🍠',
    image: 'https://ucarecdn.com/dfb5c0b5-4ac3-45fc-9e38-350ef48dbab3/',
    desc: 'Golden fried taro pieces and spongy fish maw to soak up the rich steamboat broth.',
    tag: 'Steamboat add-on',
    popularity: 89,
    spicyLevel: 0,
    allergens: 'Fish, soy; oil unverified',
    modifiers: ['Serve on side', 'Add directly to pot', 'Extra crispy'],
    aliases: ['crispy yam', 'fish maw', 'taro', '芋头', '鱼鳔', 'yam']
  },
  mushroom: {
    id: 'mushroom',
    name: 'Golden Enoki & Tofu Puff Set',
    cn: '金针菇豆卜拼盘',
    price: 600,
    category: 'Steamboat',
    icon: '🍄',
    image: 'https://ucarecdn.com/22f8ed39-ad47-420e-b9a0-7683c94d5f0c/',
    desc: 'Fresh enoki mushrooms and golden tofu puffs for the steamboat or table.',
    tag: 'Sharing side',
    popularity: 82,
    spicyLevel: 0,
    allergens: 'Soy',
    modifiers: ['For steamboat pot', 'Serve on side'],
    aliases: ['enoki', 'mushroom', 'tofu puff', '金针菇', '豆卜']
  },
  tea: {
    id: 'tea',
    name: 'Aged Pu’er Tea (Pot)',
    cn: '陈年普洱茶（壶）',
    price: 400,
    category: 'Drinks & Tea',
    icon: '🍵',
    image: 'https://ucarecdn.com/86808079-6b10-4abb-b036-e14ea8305639/',
    desc: 'A warm, earthy pot of traditional Chinese tea for the table, with hot water refills.',
    tag: 'Refillable',
    popularity: 94,
    spicyLevel: 0,
    allergens: 'None',
    singleSize: true,
    modifiers: ['Hot pot for sharing', 'Extra teacups', 'Warm'],
    aliases: ['pu er', 'puer', 'chinese tea', 'tea pot', '普洱', '茶']
  },
  calamansi: {
    id: 'calamansi',
    name: 'Sour Plum Calamansi Juice',
    cn: '冰镇酸梅金桔',
    price: 350,
    category: 'Drinks & Tea',
    icon: '🍊',
    image: 'https://ucarecdn.com/1babb7fc-af40-4e49-9b01-a0248166ddac/',
    desc: 'Zesty freshly squeezed calamansi lime with a savoury-sweet sour plum.',
    tag: 'Refreshing',
    popularity: 90,
    spicyLevel: 0,
    allergens: 'None',
    singleSize: true,
    modifiers: ['Less ice', 'No ice', 'Warm', 'Less sweet'],
    aliases: ['calamansi', 'sour plum', 'lime juice', '金桔', '酸梅']
  },
  barley: {
    id: 'barley',
    name: 'Home-boiled Pandan Barley',
    cn: '自煲香兰薏米水',
    price: 300,
    category: 'Drinks & Tea',
    icon: '🌾',
    image: 'https://ucarecdn.com/0dd4d881-7a61-456e-af48-949a7c6d3876/',
    desc: 'Slow-boiled pearl barley infused with fragrant pandan leaves.',
    tag: 'Homemade',
    popularity: 85,
    spicyLevel: 0,
    allergens: 'Barley (gluten)',
    singleSize: true,
    modifiers: ['Warm', 'Chilled with less ice', 'No ice', 'Less sweet'],
    aliases: ['barley', 'pandan barley', '薏米', '薏米水']
  }
};

const cnToCoreId = {
  '鲳鱼鱼头炉': 'pomfret',
  '昌鱼鱼头炉': 'pomfret',
  '红石斑鱼头炉': 'grouper',
  '红哥里鱼头炉': 'snapper',
  '虾酱鸡': 'chicken',
  '南乳花肉': 'pork',
  '排骨大王': 'ribs',
  '金块豆腐': 'tofu',
  '马来风光': 'kang',
  '招牌蚝蛋': 'egg',
  '白饭': 'rice'
};

const idSet = new Set(Object.keys(coreOverrides));
const finalMenu = [];

// First insert core overrides in priority order
for (const core of Object.values(coreOverrides)) {
  finalMenu.push(core);
}

// Now parse raw items
for (const cat of raw) {
  if (!cat.items || !cat.items.length) continue;
  const category = catMap[cat.name] || 'Specialty';

  for (const it of cat.items) {
    let rawName = it.name.trim();
    let name = rawName;
    let cn = '';
    const startsWithCn = rawName.match(/^([\u3400-\u9fff\s]+)\s+([A-Za-z].*)$/);
    const endsWithCn = rawName.match(/^(.*?)\s*([\u3400-\u9fff].*)$/);
    if (startsWithCn) {
      cn = startsWithCn[1].trim();
      name = startsWithCn[2].trim();
    } else if (endsWithCn) {
      name = endsWithCn[1].trim();
      cn = endsWithCn[2].trim();
    }
    if (cn === '虾滑' || rawName.includes('虾滑')) {
      name = 'Fresh Prawn Paste (for Steamboat)';
      cn = '虾滑';
    }
    if (rawName === 'Plain White Rice') {
      name = 'Plain White Rice';
      cn = '白饭';
    }

    // If matches a core dish, already added!
    if (cnToCoreId[cn]) {
      continue;
    }

    // Slugify id
    let id = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let baseId = id;
    let counter = 2;
    while (idSet.has(id)) {
      id = `${baseId}-${counter++}`;
    }
    idSet.add(id);

    const price = it.variants?.[0]?.price ? Math.round(it.variants[0].price * 100) : 1000;
    const image = (it.imageFullUrls && it.imageFullUrls[0]) || '';
    const desc = (it.description || '').replace(/<[^>]+>/g, '').trim() ||
      `${cn ? cn + ' · ' : ''}Traditional Nan Hwa Chong dish freshly cooked to order.`;

    let icon = '🥢';
    if (category === 'Steamboat') icon = '🍲';
    else if (category === 'Specialty') icon = '✨';
    else if (category === 'Crayfish & Seafood') icon = /crayfish|虾婆/i.test(name + cn) ? '🦞' : /squid|sotong|苏东/i.test(name + cn) ? '🦑' : /lala|啦啦/i.test(name + cn) ? '🦪' : '🦐';
    else if (category === 'Chicken & Pork') icon = /chicken|鸡/i.test(name + cn) ? '🍗' : '🥓';
    else if (category === 'Egg & Tofu') icon = /egg|omelette|蛋/i.test(name + cn) ? '🍳' : '🥢';
    else if (category === 'Vegetables') icon = '🥬';
    else if (category === 'Rice & Noodles') icon = /noodle|mee|hor fun|bee hoon|面|河|米粉/i.test(name + cn) ? '🍜' : '🍚';
    else if (category === 'Soup') icon = '🥣';

    let spicyLevel = /sambal|chilli|spicy|宫保|叁巴|辣椒/i.test(name + cn) ? 2 : 0;
    let allergens = 'Soy, wheat';
    if (/fish|pomfret|snapper|grouper|鱼/i.test(name + cn)) allergens = 'Fish';
    if (/prawn|shrimp|crayfish|squid|lala|scallop|cuttlefish|海鲜|虾|啦啦|苏东/i.test(name + cn)) allergens = 'Shellfish';
    if (/egg|omelette|蛋/i.test(name + cn)) allergens = 'Egg';
    if (/tofu|beancurd|豆/i.test(name + cn)) allergens = 'Soy';

    const modifiers = [];
    if (category === 'Steamboat') {
      modifiers.push('Charcoal milky broth', 'Clear broth', 'Extra yam cubes');
    } else if (category === 'Rice & Noodles') {
      modifiers.push('Less oil', 'Add chilli padi', 'No bean sprouts');
    } else if (category === 'Vegetables') {
      modifiers.push('Stir-fry with garlic', 'Less spicy', 'Less oil');
    } else {
      modifiers.push('Sauce on side', 'Less salt', 'Extra crispy');
    }

    const aliases = [
      name.toLowerCase(),
      id.replace(/-/g, ' ')
    ];
    if (cn) aliases.push(cn);

    let tag = '';
    if (it.variants && it.variants.length > 2) tag = '3 portion sizes';
    if (/imperial|一品锅|salted egg|咸蛋|cereal|麦片/i.test(name + cn)) tag = 'Popular';

    finalMenu.push({
      id,
      name,
      cn,
      price,
      category,
      icon,
      image,
      desc,
      tag,
      popularity: 80,
      spicyLevel,
      allergens,
      modifiers,
      aliases
    });
  }
}

// Add steamboat top-up accompaniments from Oddle
const topups = [
  {
    id: 'tang-o',
    name: 'Tang-O Greens',
    cn: '茼蒿',
    price: 580,
    category: 'Steamboat',
    icon: '🥬',
    image: 'https://ucarecdn.com/2a205514-5b05-4acd-997a-2f5415194015/',
    desc: 'Crisp, aromatic garland chrysanthemum greens. Traditional essential pairing for fish head steamboat.',
    tag: 'Steamboat top-up',
    popularity: 88,
    spicyLevel: 0,
    allergens: 'None',
    modifiers: ['Serve fresh for pot'],
    aliases: ['tang o', 'tango', '茼蒿', 'garland chrysanthemum']
  },
  {
    id: 'cabbage',
    name: 'Chinese Cabbage',
    cn: '白菜',
    price: 580,
    category: 'Steamboat',
    icon: '🥬',
    image: 'https://ucarecdn.com/b928aebe-3327-4b7f-8114-e68b57779a5d/',
    desc: 'Sweet Chinese cabbage leaves that sweeten the steamboat soup as it simmers.',
    tag: 'Steamboat top-up',
    popularity: 85,
    spicyLevel: 0,
    allergens: 'None',
    modifiers: ['Add to pot'],
    aliases: ['cabbage', '白菜', 'chinese cabbage']
  },
  {
    id: 'crispy-sole-fish',
    name: 'Crispy Sole Fish',
    cn: '扁鱼',
    price: 580,
    category: 'Steamboat',
    icon: '🐟',
    image: 'https://ucarecdn.com/2533ec32-51be-4937-b54a-1aa46d0c9a4e/',
    desc: 'Deep fried crispy dried sole fish (ti-po), the secret umami foundation of traditional Teochew broth.',
    tag: 'Secret umami',
    popularity: 89,
    spicyLevel: 0,
    allergens: 'Fish',
    modifiers: ['Serve on side', 'Simmer in broth'],
    aliases: ['sole fish', 'crispy sole fish', '扁鱼', 'ti po']
  },
  {
    id: 'pomfret-fish-roe',
    name: 'Pomfret Fish Roe',
    cn: '鲳鱼鱼卵',
    price: 600,
    category: 'Steamboat',
    icon: '🐟',
    image: '',
    desc: 'Fresh pomfret roe to enrich your simmering steamboat soup.',
    tag: 'Seasonal',
    popularity: 84,
    spicyLevel: 0,
    allergens: 'Fish',
    modifiers: ['Serve fresh on ice'],
    aliases: ['fish roe', 'pomfret fish roe', '鲳鱼鱼卵', '鱼卵']
  }
];

for (const t of topups) {
  if (!idSet.has(t.id)) {
    idSet.add(t.id);
    finalMenu.push(t);
  }
}

console.log(`Generated menu with ${finalMenu.length} items!`);
const withImg = finalMenu.filter(x => x.image).length;
console.log(`Items with photos: ${withImg} / ${finalMenu.length}`);

fs.writeFileSync('data/generated_menu.json', JSON.stringify(finalMenu, null, 2));
