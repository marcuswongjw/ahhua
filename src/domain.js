import { normaliseLanguage, replyText, dishName, uiText } from './languages.js';

// Authentic Nan Hwa Chong (南华昌) Fish Head Steamboat & Traditional Zi Char Menu
export const menu = [
  {
    "id": "pomfret",
    "name": "Pomfret Steamboat",
    "cn": "鲳鱼鱼头炉",
    "price": 5800,
    "category": "Steamboat",
    "icon": "🥘",
    "image": "https://ucarecdn.com/86808079-6b10-4abb-b036-e14ea8305639/",
    "desc": "All time favourite for Teochew for generations. Best known for its soft delicate texture and naturally sweet broth simmered over charcoal.",
    "tag": "For sharing",
    "popularity": 92,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Charcoal milky broth",
      "Clear teochew broth",
      "Extra tang o greens",
      "Soup on side"
    ],
    "aliases": [
      "pomfret",
      "鲳鱼",
      "昌鱼",
      "pomfret steamboat",
      "pomfret fishboat"
    ]
  },
  {
    "id": "grouper",
    "name": "Grouper Fish Head Steamboat",
    "cn": "红石斑鱼头炉",
    "price": 4800,
    "category": "Steamboat",
    "icon": "🍲",
    "image": "https://ucarecdn.com/aa0c09b5-7d3a-4414-a16b-6d121aab84cb/",
    "desc": "Low in fat and cholesterol with firm texture and mild sweet flavour, bubbling in our signature charcoal broth with yam and vegetables.",
    "tag": "Ah Hua’s favourite",
    "popularity": 98,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Charcoal milky broth",
      "Clear ginger broth",
      "Extra sour plum",
      "Less salt"
    ],
    "aliases": [
      "grouper",
      "石斑",
      "fish head",
      "鱼头炉",
      "steamboat",
      "红石斑",
      "grouper fishboat"
    ]
  },
  {
    "id": "snapper",
    "name": "Snapper Steamboat",
    "cn": "红哥里鱼头炉",
    "price": 4200,
    "category": "Steamboat",
    "icon": "🍲",
    "image": "https://ucarecdn.com/c02d1ed8-3908-4ed4-bc79-87e8498e4298/",
    "desc": "More commonly known as Ang Go Li. Firm fish meat with clean sweet flavour, cooked in heritage charcoal soup.",
    "tag": "Classic",
    "popularity": 86,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Charcoal milky broth",
      "Clear ginger broth",
      "Extra yam cubes",
      "Mild"
    ],
    "aliases": [
      "snapper",
      "红哥里",
      "ang go li",
      "snapper fishboat"
    ]
  },
  {
    "id": "chicken",
    "name": "Prawn Paste Chicken",
    "cn": "虾酱鸡",
    "price": 1500,
    "category": "Chicken & Pork",
    "icon": "🍗",
    "image": "https://ucarecdn.com/6ebbd458-935b-469d-8448-9b3b3a21766e/",
    "desc": "Crisp, golden-brown har cheong gai wings marinated in fragrant fermented prawn paste.",
    "tag": "Crowd pleaser",
    "popularity": 99,
    "spicyLevel": 0,
    "allergens": "Shellfish, wheat",
    "modifiers": [
      "Extra crispy",
      "Sauce on side",
      "Less oil"
    ],
    "aliases": [
      "prawn paste chicken",
      "prawn paste",
      "chicken",
      "har cheong",
      "虾酱鸡",
      "chicken wings"
    ]
  },
  {
    "id": "pork",
    "name": "Signature Pork Belly",
    "cn": "南乳花肉",
    "price": 1800,
    "category": "Chicken & Pork",
    "icon": "🥓",
    "image": "https://ucarecdn.com/495be89c-5db9-4f7f-8be5-faec2d6a78d0/",
    "desc": "Deep-fried pork belly slices marinated with traditional fermented red beancurd (nam yu) for crisp skin and tender meat.",
    "tag": "Signature",
    "popularity": 91,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Extra crispy",
      "Leaner cut if available",
      "Chilli dip on side"
    ],
    "aliases": [
      "pork belly",
      "南乳花肉",
      "nam yu pork"
    ]
  },
  {
    "id": "ribs",
    "name": "Sweet & Sour Pork Ribs",
    "cn": "排骨大王",
    "price": 1700,
    "category": "Chicken & Pork",
    "icon": "🍖",
    "image": "https://ucarecdn.com/f04c7eb3-bf80-4966-a3ec-8207908b8e05/",
    "desc": "Tender pork ribs glazed with a sticky, tangy-sweet heritage sauce and wok-tossed to perfection.",
    "tag": "Signature",
    "popularity": 84,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less sweet",
      "Sauce on side",
      "No onion"
    ],
    "aliases": [
      "pork ribs",
      "ribs",
      "排骨",
      "排骨大王",
      "sweet and sour ribs"
    ]
  },
  {
    "id": "tofu",
    "name": "Signature Homemade Beancurd (Tofu)",
    "cn": "金块豆腐",
    "price": 1400,
    "category": "Egg & Tofu",
    "icon": "🥢",
    "image": "https://ucarecdn.com/0dd4d881-7a61-456e-af48-949a7c6d3876/",
    "desc": "Silky golden handmade tofu bricks topped with savoury minced sauce and crisp shallots.",
    "tag": "Signature",
    "popularity": 88,
    "spicyLevel": 0,
    "allergens": "Soy, egg; sauce unverified",
    "modifiers": [
      "Mild / kid-friendly",
      "Less gravy",
      "No garnish"
    ],
    "aliases": [
      "beancurd",
      "tofu",
      "豆腐",
      "homemade beancurd",
      "金块豆腐",
      "homemade tofu"
    ]
  },
  {
    "id": "kang",
    "name": "Sambal Kang Kong",
    "cn": "马来风光",
    "price": 1300,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/538129d1-b339-4efd-81d0-21deefb4dc88/",
    "desc": "Wok-tossed water spinach with spicy dried shrimp sambal belacan and garlic.",
    "tag": "Spicy",
    "popularity": 95,
    "spicyLevel": 2,
    "allergens": "Shellfish",
    "modifiers": [
      "Less spicy",
      "Extra spicy",
      "Stir-fry with garlic instead"
    ],
    "aliases": [
      "kang kong",
      "kangkong",
      "sambal",
      "马来风光",
      "空心菜",
      "water spinach"
    ]
  },
  {
    "id": "egg",
    "name": "Oyster Omelette",
    "cn": "招牌蚝蛋",
    "price": 1500,
    "category": "Egg & Tofu",
    "icon": "🍳",
    "image": "https://ucarecdn.com/6ec4ec1b-325b-402a-9642-1e967a356360/",
    "desc": "Crispy pan-fried egg omelette studded with plump, juicy oysters and fresh coriander.",
    "tag": "Signature",
    "popularity": 87,
    "spicyLevel": 0,
    "allergens": "Shellfish, egg",
    "modifiers": [
      "Extra crispy edges",
      "Chilli on side",
      "No coriander"
    ],
    "aliases": [
      "oyster",
      "omelette",
      "蚝煎",
      "招牌蚝蛋",
      "蚝蛋",
      "oyster egg"
    ]
  },
  {
    "id": "rice",
    "name": "Steamed Rice",
    "cn": "白饭",
    "price": 150,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "https://ucarecdn.com/ccf843c0-1bed-4d5d-954f-c65f57359f65/",
    "desc": "One fluffy bowl of fragrant jasmine rice, perfect companion for fish broth and gravies.",
    "allergens": "None",
    "popularity": 96,
    "spicyLevel": 0,
    "singleSize": true,
    "modifiers": [
      "Serve first",
      "Serve with dishes"
    ],
    "aliases": [
      "rice",
      "白饭",
      "米饭",
      "steamed rice",
      "plain rice",
      "white rice"
    ]
  },
  {
    "id": "yam",
    "name": "Crispy Yam & Fish Maw Add-on",
    "cn": "炸芋头鱼鳔",
    "price": 800,
    "category": "Steamboat",
    "icon": "🍠",
    "image": "https://ucarecdn.com/dfb5c0b5-4ac3-45fc-9e38-350ef48dbab3/",
    "desc": "Golden fried taro pieces and spongy fish maw to soak up the rich steamboat broth.",
    "tag": "Steamboat add-on",
    "popularity": 89,
    "spicyLevel": 0,
    "allergens": "Fish, soy; oil unverified",
    "modifiers": [
      "Serve on side",
      "Add directly to pot",
      "Extra crispy"
    ],
    "aliases": [
      "crispy yam",
      "fish maw",
      "taro",
      "芋头",
      "鱼鳔",
      "yam"
    ]
  },
  {
    "id": "mushroom",
    "name": "Golden Enoki & Tofu Puff Set",
    "cn": "金针菇豆卜拼盘",
    "price": 600,
    "category": "Steamboat",
    "icon": "🍄",
    "image": "https://ucarecdn.com/22f8ed39-ad47-420e-b9a0-7683c94d5f0c/",
    "desc": "Fresh enoki mushrooms and golden tofu puffs for the steamboat or table.",
    "tag": "Sharing side",
    "popularity": 82,
    "spicyLevel": 0,
    "allergens": "Soy",
    "modifiers": [
      "For steamboat pot",
      "Serve on side"
    ],
    "aliases": [
      "enoki",
      "mushroom",
      "tofu puff",
      "金针菇",
      "豆卜"
    ]
  },
  {
    "id": "tea",
    "name": "Aged Pu’er Tea (Pot)",
    "cn": "陈年普洱茶（壶）",
    "price": 400,
    "category": "Drinks & Tea",
    "icon": "🍵",
    "image": "https://ucarecdn.com/86808079-6b10-4abb-b036-e14ea8305639/",
    "desc": "A warm, earthy pot of traditional Chinese tea for the table, with hot water refills.",
    "tag": "Refillable",
    "popularity": 94,
    "spicyLevel": 0,
    "allergens": "None",
    "singleSize": true,
    "modifiers": [
      "Hot pot for sharing",
      "Extra teacups",
      "Warm"
    ],
    "aliases": [
      "pu er",
      "puer",
      "chinese tea",
      "tea pot",
      "普洱",
      "茶"
    ]
  },
  {
    "id": "calamansi",
    "name": "Sour Plum Calamansi Juice",
    "cn": "冰镇酸梅金桔",
    "price": 350,
    "category": "Drinks & Tea",
    "icon": "🍊",
    "image": "https://ucarecdn.com/1babb7fc-af40-4e49-9b01-a0248166ddac/",
    "desc": "Zesty freshly squeezed calamansi lime with a savoury-sweet sour plum.",
    "tag": "Refreshing",
    "popularity": 90,
    "spicyLevel": 0,
    "allergens": "None",
    "singleSize": true,
    "modifiers": [
      "Less ice",
      "No ice",
      "Warm",
      "Less sweet"
    ],
    "aliases": [
      "calamansi",
      "sour plum",
      "lime juice",
      "金桔",
      "酸梅"
    ]
  },
  {
    "id": "barley",
    "name": "Home-boiled Pandan Barley",
    "cn": "自煲香兰薏米水",
    "price": 300,
    "category": "Drinks & Tea",
    "icon": "🌾",
    "image": "https://ucarecdn.com/0dd4d881-7a61-456e-af48-949a7c6d3876/",
    "desc": "Slow-boiled pearl barley infused with fragrant pandan leaves.",
    "tag": "Homemade",
    "popularity": 85,
    "spicyLevel": 0,
    "allergens": "Barley (gluten)",
    "singleSize": true,
    "modifiers": [
      "Warm",
      "Chilled with less ice",
      "No ice",
      "Less sweet"
    ],
    "aliases": [
      "barley",
      "pandan barley",
      "薏米",
      "薏米水"
    ]
  },
  {
    "id": "song-fish-head-fishboat",
    "name": "Song Fish Head Fishboat",
    "cn": "松鱼鱼头炉",
    "price": 2580,
    "category": "Steamboat",
    "icon": "🍲",
    "image": "https://ucarecdn.com/1dcdd770-9750-4e39-8312-e8ab07950b1c/",
    "desc": "Song Fish also known as Big Head Carp. It is a freshwater fish and popular among the Teochews for generations",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Charcoal milky broth",
      "Clear broth",
      "Extra yam cubes"
    ],
    "aliases": [
      "song fish head fishboat",
      "song fish head fishboat",
      "松鱼鱼头炉"
    ]
  },
  {
    "id": "sambal-fish-head",
    "name": "Sambal Fish Head",
    "cn": "叁巴鱼头",
    "price": 2480,
    "category": "Specialty",
    "icon": "✨",
    "image": "",
    "desc": "叁巴鱼头 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 2,
    "allergens": "Fish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "sambal fish head",
      "sambal fish head",
      "叁巴鱼头"
    ]
  },
  {
    "id": "bittergourd-fish-head",
    "name": "Bittergourd Fish Head",
    "cn": "苦瓜鱼头",
    "price": 2480,
    "category": "Specialty",
    "icon": "✨",
    "image": "https://ucarecdn.com/05ad07c9-a834-41c9-adcd-4a99da8cde3c/",
    "desc": "苦瓜鱼头 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "bittergourd fish head",
      "bittergourd fish head",
      "苦瓜鱼头"
    ]
  },
  {
    "id": "imperial-pot",
    "name": "Imperial Pot",
    "cn": "一品锅",
    "price": 7480,
    "category": "Specialty",
    "icon": "✨",
    "image": "https://ucarecdn.com/4ecf30b9-9888-43c6-a3b1-d733bc85d3c2/",
    "desc": "一品锅 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "Popular",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "imperial pot",
      "imperial pot",
      "一品锅"
    ]
  },
  {
    "id": "fried-shrimp-roll",
    "name": "Fried Shrimp Roll",
    "cn": "虾枣",
    "price": 1180,
    "category": "Specialty",
    "icon": "✨",
    "image": "https://ucarecdn.com/481ae670-2f05-410e-88c1-3ec653a2f4b7/",
    "desc": "虾枣 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "fried shrimp roll",
      "fried shrimp roll",
      "虾枣"
    ]
  },
  {
    "id": "fresh-prawn-paste-for-steamboat",
    "name": "Fresh Prawn Paste (for Steamboat)",
    "cn": "虾滑",
    "price": 1380,
    "category": "Specialty",
    "icon": "✨",
    "image": "https://ucarecdn.com/810a37a2-f111-41f0-ac80-cdbeaed0f854/",
    "desc": "虾滑 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "fresh prawn paste (for steamboat)",
      "fresh prawn paste for steamboat",
      "虾滑"
    ]
  },
  {
    "id": "butter-crayfish",
    "name": "Butter Crayfish",
    "cn": "牛油虾婆",
    "price": 3280,
    "category": "Crayfish & Seafood",
    "icon": "🦞",
    "image": "https://ucarecdn.com/1babb7fc-af40-4e49-9b01-a0248166ddac/",
    "desc": "牛油虾婆 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "butter crayfish",
      "butter crayfish",
      "牛油虾婆"
    ]
  },
  {
    "id": "cereal-crayfish",
    "name": "Cereal Crayfish",
    "cn": "麦片虾婆",
    "price": 5580,
    "category": "Crayfish & Seafood",
    "icon": "🦞",
    "image": "https://ucarecdn.com/edc12af1-76d9-44ec-9683-e74766957934/",
    "desc": "麦片虾婆 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "Popular",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "cereal crayfish",
      "cereal crayfish",
      "麦片虾婆"
    ]
  },
  {
    "id": "chilli-crayfish",
    "name": "Chilli Crayfish",
    "cn": "辣椒虾婆",
    "price": 5580,
    "category": "Crayfish & Seafood",
    "icon": "🦞",
    "image": "https://ucarecdn.com/52ab1efa-61bd-46ad-bb32-fd771ccc407c/",
    "desc": "辣椒虾婆 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 2,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "chilli crayfish",
      "chilli crayfish",
      "辣椒虾婆"
    ]
  },
  {
    "id": "salted-egg-prawns",
    "name": "Salted Egg Prawns",
    "cn": "咸蛋虾球",
    "price": 4580,
    "category": "Crayfish & Seafood",
    "icon": "🦐",
    "image": "https://ucarecdn.com/9e213032-3c8c-4642-a0a7-1eb2bbc7e922/",
    "desc": "咸蛋虾球 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "Popular",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "salted egg prawns",
      "salted egg prawns",
      "咸蛋虾球"
    ]
  },
  {
    "id": "butter-prawns",
    "name": "Butter Prawns",
    "cn": "牛油虾",
    "price": 3480,
    "category": "Crayfish & Seafood",
    "icon": "🦐",
    "image": "https://ucarecdn.com/17242588-82ab-4605-bed0-38d0e875fb48/",
    "desc": "牛油虾 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "butter prawns",
      "butter prawns",
      "牛油虾"
    ]
  },
  {
    "id": "cereal-prawns",
    "name": "Cereal Prawns",
    "cn": "麦片虾",
    "price": 2280,
    "category": "Crayfish & Seafood",
    "icon": "🦐",
    "image": "https://ucarecdn.com/5384c23d-7ddd-4de6-a62a-63a6da53bc52/",
    "desc": "麦片虾 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "Popular",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "cereal prawns",
      "cereal prawns",
      "麦片虾"
    ]
  },
  {
    "id": "salted-egg-squid",
    "name": "Salted Egg Squid",
    "cn": "咸蛋苏东",
    "price": 2080,
    "category": "Crayfish & Seafood",
    "icon": "🦑",
    "image": "https://ucarecdn.com/e887ffb7-0e6a-4798-abdc-cbeacd962b7f/",
    "desc": "咸蛋苏东 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "Popular",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "salted egg squid",
      "salted egg squid",
      "咸蛋苏东"
    ]
  },
  {
    "id": "butter-squid",
    "name": "Butter Squid",
    "cn": "牛油苏东",
    "price": 1380,
    "category": "Crayfish & Seafood",
    "icon": "🦑",
    "image": "https://ucarecdn.com/41f2e46a-0090-4290-b718-73c027c645b4/",
    "desc": "牛油苏东 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "butter squid",
      "butter squid",
      "牛油苏东"
    ]
  },
  {
    "id": "cereal-squid",
    "name": "Cereal Squid",
    "cn": "麦片苏东",
    "price": 1380,
    "category": "Crayfish & Seafood",
    "icon": "🦑",
    "image": "https://ucarecdn.com/746f7ea0-38b2-4872-a5db-c2a4f248feab/",
    "desc": "麦片苏东 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "Popular",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "cereal squid",
      "cereal squid",
      "麦片苏东"
    ]
  },
  {
    "id": "sambal-squid",
    "name": "Sambal Squid",
    "cn": "叁巴苏东",
    "price": 2080,
    "category": "Crayfish & Seafood",
    "icon": "🦑",
    "image": "https://ucarecdn.com/c9e2f77b-c967-4f4c-8693-971a23ebf7ea/",
    "desc": "叁巴苏东 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 2,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "sambal squid",
      "sambal squid",
      "叁巴苏东"
    ]
  },
  {
    "id": "sambal-lala",
    "name": "Sambal Lala",
    "cn": "叁巴啦啦",
    "price": 1380,
    "category": "Crayfish & Seafood",
    "icon": "🦪",
    "image": "https://ucarecdn.com/b8b0518d-d5a2-44c3-93a9-43f4e22f54f6/",
    "desc": "叁巴啦啦 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 2,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "sambal lala",
      "sambal lala",
      "叁巴啦啦"
    ]
  },
  {
    "id": "ginger-onion-lala",
    "name": "Ginger & Onion Lala",
    "cn": "姜葱啦啦",
    "price": 2080,
    "category": "Crayfish & Seafood",
    "icon": "🦪",
    "image": "https://ucarecdn.com/a26e2bc2-db0d-4ac0-b15f-16a874c8c89e/",
    "desc": "姜葱啦啦 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "ginger & onion lala",
      "ginger onion lala",
      "姜葱啦啦"
    ]
  },
  {
    "id": "marmite-chicken-chop",
    "name": "Marmite Chicken Chop",
    "cn": "妈蜜鸡扒",
    "price": 1380,
    "category": "Chicken & Pork",
    "icon": "🍗",
    "image": "https://ucarecdn.com/ca49cee0-4c6d-4e72-a198-b636c6e5025b/",
    "desc": "妈蜜鸡扒 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "marmite chicken chop",
      "marmite chicken chop",
      "妈蜜鸡扒"
    ]
  },
  {
    "id": "spicy-diced-chicken",
    "name": "Spicy Diced Chicken",
    "cn": "宫保鸡丁",
    "price": 2880,
    "category": "Chicken & Pork",
    "icon": "🍗",
    "image": "https://ucarecdn.com/44061a12-9ef1-4556-9b04-76714c8f628d/",
    "desc": "宫保鸡丁 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 2,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "spicy diced chicken",
      "spicy diced chicken",
      "宫保鸡丁"
    ]
  },
  {
    "id": "sesame-oil-chicken",
    "name": "Sesame Oil Chicken",
    "cn": "麻油鸡",
    "price": 1380,
    "category": "Chicken & Pork",
    "icon": "🍗",
    "image": "https://ucarecdn.com/3e584908-8694-4c46-8d7b-91aea55c62c9/",
    "desc": "麻油鸡 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "sesame oil chicken",
      "sesame oil chicken",
      "麻油鸡"
    ]
  },
  {
    "id": "salted-egg-chicken",
    "name": "Salted Egg Chicken",
    "cn": "咸蛋鸡丁",
    "price": 1380,
    "category": "Chicken & Pork",
    "icon": "🍗",
    "image": "https://ucarecdn.com/b9afc21f-910d-466f-817d-8e533e884d42/",
    "desc": "咸蛋鸡丁 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "Popular",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "salted egg chicken",
      "salted egg chicken",
      "咸蛋鸡丁"
    ]
  },
  {
    "id": "braised-pig-intestine",
    "name": "Braised Pig Intestine",
    "cn": "卤大肠",
    "price": 1180,
    "category": "Chicken & Pork",
    "icon": "🥓",
    "image": "https://ucarecdn.com/596d4ae3-59f3-4519-b840-9c4f9cfa03a0/",
    "desc": "卤大肠 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "braised pig intestine",
      "braised pig intestine",
      "卤大肠"
    ]
  },
  {
    "id": "braised-pig-trotters",
    "name": "Braised Pig Trotters",
    "cn": "卤猪脚",
    "price": 1180,
    "category": "Chicken & Pork",
    "icon": "🥓",
    "image": "https://ucarecdn.com/d70c8dd7-6b60-49ed-91d7-c58423026ac8/",
    "desc": "卤猪脚 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "braised pig trotters",
      "braised pig trotters",
      "卤猪脚"
    ]
  },
  {
    "id": "sweet-and-sour-pork",
    "name": "Sweet and Sour Pork",
    "cn": "咕噜肉",
    "price": 2080,
    "category": "Chicken & Pork",
    "icon": "🥓",
    "image": "https://ucarecdn.com/dd37a2dd-f13c-4e42-8aea-60ef1bb00570/",
    "desc": "咕噜肉 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "sweet and sour pork",
      "sweet and sour pork",
      "咕噜肉"
    ]
  },
  {
    "id": "marmite-pork-ribs",
    "name": "Marmite Pork Ribs",
    "cn": "妈蜜排骨",
    "price": 1380,
    "category": "Chicken & Pork",
    "icon": "🥓",
    "image": "https://ucarecdn.com/ca49cee0-4c6d-4e72-a198-b636c6e5025b/",
    "desc": "妈蜜排骨 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "marmite pork ribs",
      "marmite pork ribs",
      "妈蜜排骨"
    ]
  },
  {
    "id": "salted-egg-pork-ribs",
    "name": "Salted Egg Pork Ribs",
    "cn": "咸蛋排骨",
    "price": 1380,
    "category": "Chicken & Pork",
    "icon": "🥓",
    "image": "https://ucarecdn.com/65d1b75a-a4fc-4f32-85a8-eef8c1904c6a/",
    "desc": "咸蛋排骨 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "Popular",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "salted egg pork ribs",
      "salted egg pork ribs",
      "咸蛋排骨"
    ]
  },
  {
    "id": "bittergourd-pork-ribs",
    "name": "Bittergourd Pork Ribs",
    "cn": "苦瓜排骨",
    "price": 1380,
    "category": "Chicken & Pork",
    "icon": "🥓",
    "image": "",
    "desc": "苦瓜排骨 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "bittergourd pork ribs",
      "bittergourd pork ribs",
      "苦瓜排骨"
    ]
  },
  {
    "id": "onion-omelette",
    "name": "Onion Omelette",
    "cn": "大葱蛋",
    "price": 1380,
    "category": "Egg & Tofu",
    "icon": "🍳",
    "image": "https://ucarecdn.com/2455ccde-056e-45d7-bbf5-fb35544dbc5c/",
    "desc": "大葱蛋 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "onion omelette",
      "onion omelette",
      "大葱蛋"
    ]
  },
  {
    "id": "salted-turnip-omelette",
    "name": "Salted Turnip Omelette",
    "cn": "菜浦蛋",
    "price": 980,
    "category": "Egg & Tofu",
    "icon": "🍳",
    "image": "https://ucarecdn.com/a0196df6-5d86-481e-a81e-1fe6e923e4b2/",
    "desc": "菜浦蛋 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "salted turnip omelette",
      "salted turnip omelette",
      "菜浦蛋"
    ]
  },
  {
    "id": "fu-rong-omelette",
    "name": "Fu-Rong Omelette",
    "cn": "芙蓉蛋",
    "price": 1380,
    "category": "Egg & Tofu",
    "icon": "🍳",
    "image": "https://ucarecdn.com/c2543fe5-7051-40b8-aead-f53d8a3e3a74/",
    "desc": "芙蓉蛋 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "fu-rong omelette",
      "fu rong omelette",
      "芙蓉蛋"
    ]
  },
  {
    "id": "minced-pork-omelette",
    "name": "Minced Pork Omelette",
    "cn": "肉碎煎蛋",
    "price": 2080,
    "category": "Egg & Tofu",
    "icon": "🍳",
    "image": "https://ucarecdn.com/84919412-cc38-4172-be2e-8c45e3349424/",
    "desc": "肉碎煎蛋 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "minced pork omelette",
      "minced pork omelette",
      "肉碎煎蛋"
    ]
  },
  {
    "id": "bittergourd-omelette",
    "name": "Bittergourd Omelette",
    "cn": "苦瓜煎蛋",
    "price": 1180,
    "category": "Egg & Tofu",
    "icon": "🍳",
    "image": "https://ucarecdn.com/c9ab4cc7-d292-468d-ac58-4b01b56af14f/",
    "desc": "苦瓜煎蛋 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "bittergourd omelette",
      "bittergourd omelette",
      "苦瓜煎蛋"
    ]
  },
  {
    "id": "prawn-omelette",
    "name": "Prawn Omelette",
    "cn": "虾仁煎蛋",
    "price": 1380,
    "category": "Egg & Tofu",
    "icon": "🍳",
    "image": "https://ucarecdn.com/19d11d64-ec54-42cd-8737-10bb2c25b612/",
    "desc": "虾仁煎蛋 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "prawn omelette",
      "prawn omelette",
      "虾仁煎蛋"
    ]
  },
  {
    "id": "braised-beancurd",
    "name": "Braised Beancurd",
    "cn": "红烧豆腐",
    "price": 1780,
    "category": "Egg & Tofu",
    "icon": "🥢",
    "image": "https://ucarecdn.com/7e533afe-7fd4-4f71-96e0-71a12bb8ba75/",
    "desc": "红烧豆腐 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "braised beancurd",
      "braised beancurd",
      "红烧豆腐"
    ]
  },
  {
    "id": "minced-pork-fried-beancurd",
    "name": "Minced Pork Fried Beancurd",
    "cn": "肉碎炸豆腐",
    "price": 1780,
    "category": "Egg & Tofu",
    "icon": "🥢",
    "image": "https://ucarecdn.com/d3952f39-25ea-467b-bd00-02d5d829d6ea/",
    "desc": "肉碎炸豆腐 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "minced pork fried beancurd",
      "minced pork fried beancurd",
      "肉碎炸豆腐"
    ]
  },
  {
    "id": "chilli-prawns-witih-beancurd",
    "name": "Chilli Prawns witih Beancurd",
    "cn": "虾球豆腐",
    "price": 3480,
    "category": "Egg & Tofu",
    "icon": "🥢",
    "image": "https://ucarecdn.com/28c982a1-8cca-4521-84f6-21b7f7b930fe/",
    "desc": "虾球豆腐 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 2,
    "allergens": "Soy",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "chilli prawns witih beancurd",
      "chilli prawns witih beancurd",
      "虾球豆腐"
    ]
  },
  {
    "id": "kai-lan",
    "name": "Kai Lan",
    "cn": "芥兰苗",
    "price": 1180,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/36bb4dbe-2d8d-4bb8-a0db-32bc83346a8c/",
    "desc": "芥兰苗 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "kai lan",
      "kai lan",
      "芥兰苗"
    ]
  },
  {
    "id": "nai-bai",
    "name": "Nai Bai",
    "cn": "奶白菜",
    "price": 2280,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/1d4377d1-8bee-4a21-bb93-cfd8714d30ba/",
    "desc": "奶白菜 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "nai bai",
      "nai bai",
      "奶白菜"
    ]
  },
  {
    "id": "four-heavenly-king",
    "name": "Four Heavenly King",
    "cn": "四大天王",
    "price": 1880,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/2f94a543-474f-4632-a171-af22563bfaa9/",
    "desc": "四大天王 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "four heavenly king",
      "four heavenly king",
      "四大天王"
    ]
  },
  {
    "id": "sambal-sweet-potato-leaves",
    "name": "Sambal Sweet Potato Leaves",
    "cn": "叁巴番薯叶",
    "price": 1180,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/8329fa72-4313-4371-bf19-f30198556fd5/",
    "desc": "叁巴番薯叶 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 2,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "sambal sweet potato leaves",
      "sambal sweet potato leaves",
      "叁巴番薯叶"
    ]
  },
  {
    "id": "salted-fish-beansprout",
    "name": "Salted Fish Beansprout",
    "cn": "咸鱼豆芽",
    "price": 1180,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/7fccee9d-632e-4818-a09b-1cf6c687e0dd/",
    "desc": "咸鱼豆芽 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "salted fish beansprout",
      "salted fish beansprout",
      "咸鱼豆芽"
    ]
  },
  {
    "id": "spinach",
    "name": "Spinach",
    "cn": "菠菜",
    "price": 1180,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/c0658c73-467c-4361-b97c-f4d8e9fed3c4/",
    "desc": "菠菜 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "spinach",
      "spinach",
      "菠菜"
    ]
  },
  {
    "id": "vegetarian-mixed-vegetables",
    "name": "Vegetarian Mixed Vegetables",
    "cn": "罗汉斋",
    "price": 1180,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/e7b46965-1b46-4e69-88c6-b4cef9c71fad/",
    "desc": "罗汉斋 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "vegetarian mixed vegetables",
      "vegetarian mixed vegetables",
      "罗汉斋"
    ]
  },
  {
    "id": "salted-turnip-french-bean",
    "name": "Salted Turnip French Bean",
    "cn": "菜脯四季豆",
    "price": 1880,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/b6625a32-8f7e-444c-9d43-42c4ac4d8ae3/",
    "desc": "菜脯四季豆 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "salted turnip french bean",
      "salted turnip french bean",
      "菜脯四季豆"
    ]
  },
  {
    "id": "minced-meat-with-eggplant",
    "name": "Minced Meat with Eggplant",
    "cn": "香肉茄子",
    "price": 1380,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/c3d7f29f-24ee-41e4-adb2-46635abf4427/",
    "desc": "香肉茄子 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "minced meat with eggplant",
      "minced meat with eggplant",
      "香肉茄子"
    ]
  },
  {
    "id": "salted-egg-with-bittergourd",
    "name": "Salted Egg with Bittergourd",
    "cn": "咸蛋苦瓜",
    "price": 2080,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/2d153e6b-4a74-4fa3-90c9-34e8bd84ef8a/",
    "desc": "咸蛋苦瓜 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "Popular",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Egg",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "salted egg with bittergourd",
      "salted egg with bittergourd",
      "咸蛋苦瓜"
    ]
  },
  {
    "id": "stir-fried-broccoli",
    "name": "Stir Fried Broccoli",
    "cn": "西兰花",
    "price": 2080,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/0ec82ebe-81ad-4f96-b3bc-9e089ea2c8f5/",
    "desc": "西兰花 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "stir fried broccoli",
      "stir fried broccoli",
      "西兰花"
    ]
  },
  {
    "id": "cuttlefish-kang-kong",
    "name": "Cuttlefish Kang Kong",
    "cn": "鱿鱼蕹菜",
    "price": 2780,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/312ebe55-c896-4932-a584-062f56ce5830/",
    "desc": "鱿鱼蕹菜 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "cuttlefish kang kong",
      "cuttlefish kang kong",
      "鱿鱼蕹菜"
    ]
  },
  {
    "id": "broccoli-with-scallops",
    "name": "Broccoli with Scallops",
    "cn": "西兰带子",
    "price": 4380,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "https://ucarecdn.com/2689e11c-c993-4077-8b66-3c5f8fc2cece/",
    "desc": "西兰带子 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "broccoli with scallops",
      "broccoli with scallops",
      "西兰带子"
    ]
  },
  {
    "id": "braised-sea-cucumber",
    "name": "Braised Sea Cucumber",
    "cn": "红烧海参",
    "price": 3280,
    "category": "Vegetables",
    "icon": "🥬",
    "image": "",
    "desc": "红烧海参 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Stir-fry with garlic",
      "Less spicy",
      "Less oil"
    ],
    "aliases": [
      "braised sea cucumber",
      "braised sea cucumber",
      "红烧海参"
    ]
  },
  {
    "id": "mui-fan",
    "name": "Mui Fan",
    "cn": "烩饭",
    "price": 720,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "https://ucarecdn.com/67fc5705-76b3-43ed-9410-7c1398b84129/",
    "desc": "烩饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "mui fan",
      "mui fan",
      "烩饭"
    ]
  },
  {
    "id": "fried-rice",
    "name": "Fried Rice",
    "cn": "星洲炒饭",
    "price": 720,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "https://ucarecdn.com/6f5dc8ef-e754-4d73-beb0-e7f327c475c8/",
    "desc": "星洲炒饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "fried rice",
      "fried rice",
      "星洲炒饭"
    ]
  },
  {
    "id": "sambal-fried-rice",
    "name": "Sambal Fried Rice",
    "cn": "叁巴炒饭",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "https://ucarecdn.com/b1c561e1-0023-43f4-b432-e7701078a5c4/",
    "desc": "叁巴炒饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 2,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "sambal fried rice",
      "sambal fried rice",
      "叁巴炒饭"
    ]
  },
  {
    "id": "salted-fish-fried-rice",
    "name": "Salted Fish Fried Rice",
    "cn": "咸鱼炒饭",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "https://ucarecdn.com/fb3fafce-35c9-45cb-95ea-423b9a402de4/",
    "desc": "咸鱼炒饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "salted fish fried rice",
      "salted fish fried rice",
      "咸鱼炒饭"
    ]
  },
  {
    "id": "seafood-fried-rice",
    "name": "Seafood Fried Rice",
    "cn": "海鲜炒饭",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "https://ucarecdn.com/92eacf01-b4ae-4f90-8447-2278cc4c0177/",
    "desc": "海鲜炒饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "seafood fried rice",
      "seafood fried rice",
      "海鲜炒饭"
    ]
  },
  {
    "id": "spicy-diced-chicken-rice",
    "name": "Spicy Diced Chicken Rice",
    "cn": "宫保鸡丁饭",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "https://ucarecdn.com/d0e2698f-4f6b-4a35-92a1-29b8ea81d5ef/",
    "desc": "宫保鸡丁饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 2,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "spicy diced chicken rice",
      "spicy diced chicken rice",
      "宫保鸡丁饭"
    ]
  },
  {
    "id": "sweet-sour-pork-rib-rice",
    "name": "Sweet & Sour Pork Rib Rice",
    "cn": "排骨王饭",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "",
    "desc": "排骨王饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "sweet & sour pork rib rice",
      "sweet sour pork rib rice",
      "排骨王饭"
    ]
  },
  {
    "id": "black-pepper-pork-meat-rice",
    "name": "Black Pepper Pork Meat Rice",
    "cn": "黑胡椒猪肉饭",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "",
    "desc": "黑胡椒猪肉饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "black pepper pork meat rice",
      "black pepper pork meat rice",
      "黑胡椒猪肉饭"
    ]
  },
  {
    "id": "ginger-pork-meat-rice",
    "name": "Ginger Pork Meat Rice",
    "cn": "姜葱猪肉饭",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "https://ucarecdn.com/729b4673-cd08-4dae-9ff5-724a2b52ac7c/",
    "desc": "姜葱猪肉饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "ginger pork meat rice",
      "ginger pork meat rice",
      "姜葱猪肉饭"
    ]
  },
  {
    "id": "ginger-sliced-fish-with-rice",
    "name": "Ginger Sliced Fish with Rice",
    "cn": "姜葱鱼片饭",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "",
    "desc": "姜葱鱼片饭 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "ginger sliced fish with rice",
      "ginger sliced fish with rice",
      "姜葱鱼片饭"
    ]
  },
  {
    "id": "pomfret-porridge",
    "name": "Pomfret Porridge",
    "cn": "鲳鱼粥",
    "price": 1500,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "https://ucarecdn.com/ffb1e5ca-0ecd-4fcf-80a6-5be5ee68b14b/",
    "desc": "鲳鱼粥 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "pomfret porridge",
      "pomfret porridge",
      "鲳鱼粥"
    ]
  },
  {
    "id": "snapper-porridge",
    "name": "Snapper Porridge",
    "cn": "红哥里粥",
    "price": 1500,
    "category": "Rice & Noodles",
    "icon": "🍚",
    "image": "",
    "desc": "红哥里粥 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "snapper porridge",
      "snapper porridge",
      "红哥里粥"
    ]
  },
  {
    "id": "hor-fun",
    "name": "Hor Fun",
    "cn": "什锦河",
    "price": 720,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/07b33d51-36f0-44d6-97bd-b252215086de/",
    "desc": "什锦河 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "hor fun",
      "hor fun",
      "什锦河"
    ]
  },
  {
    "id": "hokkien-noodles",
    "name": "Hokkien Noodles",
    "cn": "福建面",
    "price": 1180,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/cd1c497f-ebb6-476b-9fb5-5c27236c6c0b/",
    "desc": "福建面 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "hokkien noodles",
      "hokkien noodles",
      "福建面"
    ]
  },
  {
    "id": "ee-mian",
    "name": "Ee Mian",
    "cn": "伊面",
    "price": 1780,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/81c1d8d7-e796-4d7f-a184-3d1df3a549a6/",
    "desc": "伊面 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "ee mian",
      "ee mian",
      "伊面"
    ]
  },
  {
    "id": "bee-hoon",
    "name": "Bee Hoon",
    "cn": "什锦米粉",
    "price": 1180,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/cd26f1e8-6bef-470b-828d-99202d35b136/",
    "desc": "什锦米粉 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "bee hoon",
      "bee hoon",
      "什锦米粉"
    ]
  },
  {
    "id": "fried-ee-fu-noodles",
    "name": "Fried Ee-Fu Noodles",
    "cn": "干炒伊面",
    "price": 1880,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/a5ffe7d5-a6bc-42ed-b469-ce48dd9bb7ac/",
    "desc": "干炒伊面 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "fried ee-fu noodles",
      "fried ee fu noodles",
      "干炒伊面"
    ]
  },
  {
    "id": "fried-bee-hoon",
    "name": "Fried Bee Hoon",
    "cn": "干炒米粉",
    "price": 1880,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/e1b383a9-a3c0-49cc-9d4d-52f43a8256d6/",
    "desc": "干炒米粉 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "fried bee hoon",
      "fried bee hoon",
      "干炒米粉"
    ]
  },
  {
    "id": "seafood-bee-hoon",
    "name": "Seafood Bee Hoon",
    "cn": "海鲜米粉",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "",
    "desc": "海鲜米粉 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "seafood bee hoon",
      "seafood bee hoon",
      "海鲜米粉"
    ]
  },
  {
    "id": "crispy-bee-hoon",
    "name": "Crispy Bee Hoon",
    "cn": "香底米粉",
    "price": 1880,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "",
    "desc": "香底米粉 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "crispy bee hoon",
      "crispy bee hoon",
      "香底米粉"
    ]
  },
  {
    "id": "hong-kong-fried-noodles",
    "name": "Hong Kong Fried Noodles",
    "cn": "港式炒面",
    "price": 1380,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/a3f57a4e-b2bd-4742-8cdf-43f53896d4f8/",
    "desc": "港式炒面 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "hong kong fried noodles",
      "hong kong fried noodles",
      "港式炒面"
    ]
  },
  {
    "id": "mee-goreng",
    "name": "Mee Goreng",
    "cn": "马来面",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/37e09555-5a26-4b15-88b0-e869269591ea/",
    "desc": "马来面 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "mee goreng",
      "mee goreng",
      "马来面"
    ]
  },
  {
    "id": "shan-lao-hor-fun",
    "name": "Shan Lao Hor Fun",
    "cn": "三捞河",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/7087b4d1-3042-40d3-b58b-0e76299e1ff7/",
    "desc": "三捞河 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "shan lao hor fun",
      "shan lao hor fun",
      "三捞河"
    ]
  },
  {
    "id": "fried-hor-fun",
    "name": "Fried Hor Fun",
    "cn": "干炒河",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "https://ucarecdn.com/915885df-b778-4f64-91da-bf63ad6f3ffd/",
    "desc": "干炒河 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "fried hor fun",
      "fried hor fun",
      "干炒河"
    ]
  },
  {
    "id": "seafood-hor-fun",
    "name": "Seafood Hor Fun",
    "cn": "海鲜河",
    "price": 950,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "",
    "desc": "海鲜河 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "3 portion sizes",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "seafood hor fun",
      "seafood hor fun",
      "海鲜河"
    ]
  },
  {
    "id": "pomfret-bee-hoon-soup",
    "name": "Pomfret Bee Hoon Soup",
    "cn": "鲳鱼米粉汤",
    "price": 1500,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "",
    "desc": "鲳鱼米粉汤 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "pomfret bee hoon soup",
      "pomfret bee hoon soup",
      "鲳鱼米粉汤"
    ]
  },
  {
    "id": "snapper-bee-hoon-soup",
    "name": "Snapper Bee Hoon Soup",
    "cn": "红哥里米粉汤",
    "price": 1500,
    "category": "Rice & Noodles",
    "icon": "🍜",
    "image": "",
    "desc": "红哥里米粉汤 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Less oil",
      "Add chilli padi",
      "No bean sprouts"
    ],
    "aliases": [
      "snapper bee hoon soup",
      "snapper bee hoon soup",
      "红哥里米粉汤"
    ]
  },
  {
    "id": "seafood-soup",
    "name": "Seafood Soup",
    "cn": "海鲜汤",
    "price": 1180,
    "category": "Soup",
    "icon": "🥣",
    "image": "https://ucarecdn.com/92762c72-3824-47a0-8bb5-350c3539920d/",
    "desc": "海鲜汤 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Shellfish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "seafood soup",
      "seafood soup",
      "海鲜汤"
    ]
  },
  {
    "id": "seaweed-soup",
    "name": "Seaweed Soup",
    "cn": "紫菜汤",
    "price": 1080,
    "category": "Soup",
    "icon": "🥣",
    "image": "https://ucarecdn.com/07db0462-aedb-40c4-9ca4-c55a7987259f/",
    "desc": "紫菜汤 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "seaweed soup",
      "seaweed soup",
      "紫菜汤"
    ]
  },
  {
    "id": "bittergourd-soup",
    "name": "Bittergourd Soup",
    "cn": "苦瓜汤",
    "price": 1080,
    "category": "Soup",
    "icon": "🥣",
    "image": "https://ucarecdn.com/27a9e48f-7491-48db-bfc4-ca00f0f563a5/",
    "desc": "苦瓜汤 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy, wheat",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "bittergourd soup",
      "bittergourd soup",
      "苦瓜汤"
    ]
  },
  {
    "id": "tofu-soup",
    "name": "Tofu Soup",
    "cn": "豆腐汤",
    "price": 1080,
    "category": "Soup",
    "icon": "🥣",
    "image": "https://ucarecdn.com/db367c38-8d35-4b36-8da9-d956edec9be6/",
    "desc": "豆腐汤 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Soy",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "tofu soup",
      "tofu soup",
      "豆腐汤"
    ]
  },
  {
    "id": "pomfret-soup",
    "name": "Pomfret Soup",
    "cn": "鲳鱼汤",
    "price": 1780,
    "category": "Soup",
    "icon": "🥣",
    "image": "https://ucarecdn.com/ffb1e5ca-0ecd-4fcf-80a6-5be5ee68b14b/",
    "desc": "鲳鱼汤 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "pomfret soup",
      "pomfret soup",
      "鲳鱼汤"
    ]
  },
  {
    "id": "snapper-soup",
    "name": "Snapper Soup",
    "cn": "红哥里汤",
    "price": 1380,
    "category": "Soup",
    "icon": "🥣",
    "image": "https://ucarecdn.com/9a462863-dd80-43f3-b4ce-888ddc5684ec/",
    "desc": "红哥里汤 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "snapper soup",
      "snapper soup",
      "红哥里汤"
    ]
  },
  {
    "id": "grouper-soup",
    "name": "Grouper Soup",
    "cn": "红石斑汤",
    "price": 1780,
    "category": "Soup",
    "icon": "🥣",
    "image": "https://ucarecdn.com/1d98663a-473a-4f79-a1e2-ba5a2607ea13/",
    "desc": "红石斑汤 · Traditional Nan Hwa Chong dish freshly cooked to order.",
    "tag": "",
    "popularity": 80,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Sauce on side",
      "Less salt",
      "Extra crispy"
    ],
    "aliases": [
      "grouper soup",
      "grouper soup",
      "红石斑汤"
    ]
  },
  {
    "id": "tang-o",
    "name": "Tang-O Greens",
    "cn": "茼蒿",
    "price": 580,
    "category": "Steamboat",
    "icon": "🥬",
    "image": "https://ucarecdn.com/2a205514-5b05-4acd-997a-2f5415194015/",
    "desc": "Crisp, aromatic garland chrysanthemum greens. Traditional essential pairing for fish head steamboat.",
    "tag": "Steamboat top-up",
    "popularity": 88,
    "spicyLevel": 0,
    "allergens": "None",
    "modifiers": [
      "Serve fresh for pot"
    ],
    "aliases": [
      "tang o",
      "tango",
      "茼蒿",
      "garland chrysanthemum"
    ]
  },
  {
    "id": "cabbage",
    "name": "Chinese Cabbage",
    "cn": "白菜",
    "price": 580,
    "category": "Steamboat",
    "icon": "🥬",
    "image": "https://ucarecdn.com/b928aebe-3327-4b7f-8114-e68b57779a5d/",
    "desc": "Sweet Chinese cabbage leaves that sweeten the steamboat soup as it simmers.",
    "tag": "Steamboat top-up",
    "popularity": 85,
    "spicyLevel": 0,
    "allergens": "None",
    "modifiers": [
      "Add to pot"
    ],
    "aliases": [
      "cabbage",
      "白菜",
      "chinese cabbage"
    ]
  },
  {
    "id": "crispy-sole-fish",
    "name": "Crispy Sole Fish",
    "cn": "扁鱼",
    "price": 580,
    "category": "Steamboat",
    "icon": "🐟",
    "image": "https://ucarecdn.com/2533ec32-51be-4937-b54a-1aa46d0c9a4e/",
    "desc": "Deep fried crispy dried sole fish (ti-po), the secret umami foundation of traditional Teochew broth.",
    "tag": "Secret umami",
    "popularity": 89,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Serve on side",
      "Simmer in broth"
    ],
    "aliases": [
      "sole fish",
      "crispy sole fish",
      "扁鱼",
      "ti po"
    ]
  },
  {
    "id": "pomfret-fish-roe",
    "name": "Pomfret Fish Roe",
    "cn": "鲳鱼鱼卵",
    "price": 600,
    "category": "Steamboat",
    "icon": "🐟",
    "image": "",
    "desc": "Fresh pomfret roe to enrich your simmering steamboat soup.",
    "tag": "Seasonal",
    "popularity": 84,
    "spicyLevel": 0,
    "allergens": "Fish",
    "modifiers": [
      "Serve fresh on ice"
    ],
    "aliases": [
      "fish roe",
      "pomfret fish roe",
      "鲳鱼鱼卵",
      "鱼卵"
    ]
  }
];
export const serviceTypes = {
  soup: { id: 'soup', icon: '🍲', label: 'Refill steamboat broth' },
  tea: { id: 'tea', icon: '🍵', label: 'Refill hot Chinese tea / water' },
  bowls: { id: 'bowls', icon: '🥢', label: 'Extra bowls, spoons & chilli' },
  chilli: { id: 'chilli', icon: '🌶️', label: 'Cut red chilli & garlic soy dip' },
  plates: { id: 'plates', icon: '🍽️', label: 'Clear empty plates / 换骨碟' },
  takeaway: { id: 'takeaway', icon: '🥡', label: 'Takeaway boxes / 打包盒' },
  wipe: { id: 'wipe', icon: '🧻', label: 'Extra wet wipes & napkins' },
  bill: { id: 'bill', icon: '🧾', label: 'Table bill & split check' },
  assistance: { id: 'assistance', icon: '♧', label: 'Customer would like assistance' }
};
export const money = cents => `S$${(cents / 100).toFixed(2)}`;
export const dish = id => menu.find(x => x.id === id);

export function initialAhHuaAnalytics() {
  return {
    cartCheckImpressions: 0,
    cartCheckAccepted: 0,
    cartCheckRevenue: 0,
    chipClicks: 0,
    chipConversions: 0,
    proposalsShown: 0,
    proposalsAccepted: 0,
    proposalRevenue: 0
  };
}

export const DEFAULT_CART_RULES = [
  {
    id: 'portion_guard',
    name: 'Portion Guard (份量控制 · 避免过度点单)',
    desc: 'Alerts diners when dishes exceed pax + 2, building diner trust and preventing food waste',
    enabled: true,
    category: 'trust'
  },
  {
    id: 'missing_staple',
    name: 'Missing Staple Rice / Noodles (点白饭了吗)',
    desc: 'Suggests fragrant Jasmine rice when 2+ savoury zi char gravy dishes are ordered without staples',
    enabled: true,
    category: 'pairing'
  },
  {
    id: 'steamboat_starter',
    name: 'Steamboat Wait Starter (等候开胃前菜)',
    desc: 'Suggests quick Har Cheong Gai (Prawn Paste Chicken) when steamboat will take 12 mins to simmer',
    enabled: true,
    category: 'upsell'
  },
  {
    id: 'cooling_drinks',
    name: 'Cooling Drink Pairing (解腻清凉饮品)',
    desc: 'Suggests refreshing Sour Plum Calamansi Juices to balance hot charcoal steamboat',
    enabled: true,
    category: 'pairing'
  }
];

export function evaluateCartRules(cartItems, { pax = 4, unavailable = [], language = 'en', rulesConfig = DEFAULT_CART_RULES } = {}) {
  const isRuleActive = id => {
    const r = (rulesConfig || DEFAULT_CART_RULES).find(x => x.id === id);
    return r ? r.enabled !== false : true;
  };

  const isZh = language === 'zh';
  const isSinglish = language === 'singlish';

  // Rule 1: Portion Guard by head count (avoid over-ordering)
  if (isRuleActive('portion_guard') && pax > 0) {
    const foodLines = cartItems.filter(x => !['tea', 'calamansi', 'barley', 'rice'].includes(x.id));
    const foodDishesCount = foodLines.reduce((n, x) => n + x.qty, 0);
    const steamboatCount = cartItems.filter(x => ['pomfret', 'grouper', 'snapper', 'song-fish-head-fishboat'].includes(x.id)).reduce((n, x) => n + x.qty, 0);
    const effectiveDishes = foodDishesCount + (steamboatCount > 0 ? 1 : 0);
    const maxRecommended = Math.max(3, pax + 2);

    if (effectiveDishes > maxRecommended) {
      return {
        type: 'portion_guard',
        isOverOrder: true,
        title: isZh ? '份量温馨提示 · 避免点多' : 'Ah Hua Portion Check',
        message: isZh
          ? `温馨提示：您当前 ${pax} 位用餐，已选了 ${foodDishesCount} 道菜${steamboatCount ? '（含炭火大炉）' : ''}。南华昌份量实在，通常 ${pax} 位点 ${Math.max(2, pax - 1)}～${pax + 1} 道刚好饱足。确认要点这么多，还是先下这一批，不够再加？`
          : isSinglish
            ? `Wah, ${pax} pax ordering ${foodDishesCount} dishes${steamboatCount ? ' with steamboat' : ''}! Our portions are solid Teochew sizing leh. Most ${pax}-pax tables order ${Math.max(2, pax - 1)}–${pax + 1} dishes. Confirm want so much, or start with these first and order round 2 later?`
            : `Heads up for ${pax} guests: You have selected ${foodDishesCount} dishes${steamboatCount ? ' including a charcoal steamboat' : ''}. Our traditional portions are generous; most tables of ${pax} are satisfied with ${Math.max(2, pax - 1)}–${pax + 1} dishes. Confirm you want this feast, or start with these and add more in Round 2?`,
        actionLabel: isZh ? '坚持下单，我们胃口好 →' : 'Keep all & send order →',
        skipLabel: isZh ? '返回购物车调整菜品' : 'Review & adjust cart'
      };
    }
  }

  // Rule 2: Missing Staple (gravy dishes without rice/noodles)
  // Notice: 'chicken' (Har Cheong Gai) is deep-fried finger food, NOT in ziCharGravyIds!
  if (isRuleActive('missing_staple') && !unavailable.includes('rice')) {
    const ziCharGravyIds = [
      'pork', 'ribs', 'tofu', 'kang', 'egg', 'sambal-prawn', 'sambal-lala',
      'ginger-onion-lala', 'braised-pig-intestine', 'braised-pig-trotters',
      'braised-beancurd', 'sweet-and-sour-pork', 'marmite-pork-ribs', 'salted-egg-pork-ribs'
    ];
    const stapleIds = [
      'rice', 'mui-fan', 'fried-rice', 'sambal-fried-rice', 'salted-fish-fried-rice',
      'seafood-fried-rice', 'hor-fun', 'hokkien-noodles', 'ee-mian', 'bee-hoon',
      'fried-ee-fu-noodles', 'fried-bee-hoon', 'seafood-bee-hoon', 'crispy-bee-hoon',
      'hong-kong-fried-noodles', 'mee-goreng', 'shan-lao-hor-fun', 'fried-hor-fun', 'seafood-hor-fun'
    ];
    const ziCharCount = cartItems.filter(x => ziCharGravyIds.includes(x.id)).reduce((n, x) => n + x.qty, 0);
    const stapleCount = cartItems.filter(x => stapleIds.includes(x.id)).reduce((n, x) => n + x.qty, 0);

    if (ziCharCount >= 2 && stapleCount === 0) {
      return {
        type: 'missing_rice',
        dishId: 'rice',
        suggestQty: 2,
        title: isZh ? '点白饭了吗？' : 'Missing White Rice?',
        message: isZh
          ? `您点了 ${ziCharCount} 道浓香多汁的经典煮炒，但尚未添加米饭。确认不需要来 2 碗茉莉香米饭（每碗 S$1.50）配汁吗？`
          : isSinglish
            ? `Wah, you ordered ${ziCharCount} zi char dishes with rich gravy but zero rice leh! Sure don't need fluffy Jasmine rice (S$1.50) to eat together?`
            : `You ordered ${ziCharCount} savoury zi char dishes with rich gravy, but zero white rice! Confirm no need fragrant Jasmine rice (S$1.50)?`,
        actionLabel: isZh ? '+ 添加2碗白饭并下单' : '+ Add 2 White Rice (S$3.00) & Send Order',
        skipLabel: isZh ? '不需要米饭，直接下单 →' : 'No rice needed, Send as is →'
      };
    }
  }

  // Rule 3: Steamboat starter (waiting for charcoal pot to simmer)
  if (isRuleActive('steamboat_starter') && !unavailable.includes('chicken')) {
    const steamboatCount = cartItems.filter(x => ['pomfret', 'grouper', 'snapper', 'song-fish-head-fishboat'].includes(x.id)).reduce((n, x) => n + x.qty, 0);
    const starterCount = cartItems.filter(x => ['chicken', 'fried-shrimp-roll'].includes(x.id)).reduce((n, x) => n + x.qty, 0);

    if (steamboatCount >= 1 && starterCount === 0) {
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
  }

  // Rule 4: Cooling drinks pairing for hot steamboat
  if (isRuleActive('cooling_drinks') && !unavailable.includes('calamansi')) {
    const steamboatCount = cartItems.filter(x => ['pomfret', 'grouper', 'snapper', 'song-fish-head-fishboat'].includes(x.id)).reduce((n, x) => n + x.qty, 0);
    const drinkCount = cartItems.filter(x => ['tea', 'calamansi', 'barley'].includes(x.id)).reduce((n, x) => n + x.qty, 0);

    if (steamboatCount >= 1 && drinkCount === 0) {
      return {
        type: 'missing_drink',
        dishId: 'calamansi',
        suggestQty: 2,
        title: isZh ? '来点清爽解腻饮品？' : 'Cooling Drinks for Steamboat?',
        message: isZh
          ? `炭火鱼头炉热气腾腾，来 2 杯传统金桔话梅冰露（每杯 S$3.20）解热生津，搭配最舒畅！`
          : isSinglish
            ? `Steamboat bubbling hot on the table! Want 2 Sour Plum Calamansi Juices (S$3.20 each) to quench thirst and cut grease?`
            : `Charcoal steamboat runs hot! Add 2 refreshing Sour Plum Calamansi Juices (S$3.20 each) to balance the rich heritage broth?`,
        actionLabel: isZh ? '+ 添加2杯金桔话梅冰 (S$6.40) 并下单' : '+ Add 2 Calamansi Juices (S$6.40) & Send',
        skipLabel: isZh ? '暂不需要饮品 →' : 'No drinks, Send as is →'
      };
    }
  }

  return null;
}

export function recordAhHuaEvent(state, eventType, data = {}) {
  if (!state.ahHuaAnalytics) {
    state.ahHuaAnalytics = initialAhHuaAnalytics();
  }
  const a = state.ahHuaAnalytics;
  switch (eventType) {
    case 'CART_CHECK_IMPRESSION':
      a.cartCheckImpressions = (a.cartCheckImpressions || 0) + 1;
      break;
    case 'CART_CHECK_ACCEPTED':
      a.cartCheckAccepted = (a.cartCheckAccepted || 0) + 1;
      a.cartCheckRevenue = (a.cartCheckRevenue || 0) + (data.cents || 0);
      break;
    case 'CHIP_CLICK':
      a.chipClicks = (a.chipClicks || 0) + 1;
      break;
    case 'CHIP_CONVERSION':
      a.chipConversions = (a.chipConversions || 0) + 1;
      break;
    case 'PROPOSAL_SHOWN':
      a.proposalsShown = (a.proposalsShown || 0) + 1;
      break;
    case 'PROPOSAL_ACCEPTED':
      a.proposalsAccepted = (a.proposalsAccepted || 0) + 1;
      a.proposalRevenue = (a.proposalRevenue || 0) + (data.cents || 0);
      break;
  }
  return a;
}

export function getAhHuaSalesMetrics(state) {
  const a = state.ahHuaAnalytics || initialAhHuaAnalytics();
  const impressions = a.cartCheckImpressions || 0;
  const accepted = a.cartCheckAccepted || 0;
  const cartCheckRate = impressions > 0 ? Math.round((accepted / impressions) * 100) : 0;

  const chipClicks = a.chipClicks || 0;
  const chipConversions = a.chipConversions || 0;
  const chipConversionRate = chipClicks > 0 ? Math.round((chipConversions / chipClicks) * 100) : 0;

  const proposalsShown = a.proposalsShown || 0;
  const proposalsAccepted = a.proposalsAccepted || 0;
  const proposalRate = proposalsShown > 0 ? Math.round((proposalsAccepted / proposalsShown) * 100) : 0;

  const totalExtraRevenue = (a.cartCheckRevenue || 0) + (a.proposalRevenue || 0);

  return {
    ...a,
    cartCheckRate,
    chipConversionRate,
    proposalRate,
    totalExtraRevenue
  };
}

export function initialState() {
  return {
    version: 1,
    replyLanguage: 'en',
    cart: [],
    orders: [],
    calls: [],
    unavailable: [],
    messages: [{ role: 'host', text: replyText('en', 'welcome'), language: 'en' }],
    proposal: [],
    preference: '',
    sessions: {},
    members: {},
    coupons: [],
    reviews: [],
    banquets: [],
    queues: {},
    cartRules: structuredClone(DEFAULT_CART_RULES),
    ahHuaAnalytics: initialAhHuaAnalytics()
  };
}
export function total(items) { return items.reduce((sum, x) => sum + x.qty * x.unitPrice, 0); }

export const STORED_VALUE_TIERS = [
  { id: 'topup-100', pay: 10000, credit: 11000, bonus: 1000, label: 'Top-up S$100 get S$110 (充S$100送S$10)', tag: '+10% Bonus' },
  { id: 'topup-200', pay: 20000, credit: 23000, bonus: 3000, label: 'Top-up S$200 get S$230 (充S$200送S$30)', tag: '+15% Bonus · Popular' },
  { id: 'topup-500', pay: 50000, credit: 60000, bonus: 10000, label: 'Top-up S$500 get S$600 (充S$500送S$100)', tag: '+20% Bonus · Best Value' }
];

export const COUPON_TEMPLATES = [
  { code: 'WELCOME-TEA', title: 'Free Table Pu’er Tea (免茶位费)', discount: 300, minSpend: 0, desc: 'Complimentary Chinese Tea for your whole table' },
  { code: 'STEAMBOAT-10', title: 'S$10 Off Steamboat (满S$60立减S$10)', discount: 1000, minSpend: 6000, desc: 'Valid on charcoal fish head steamboat orders' },
  { code: 'RETURN-15', title: 'S$15 Return Voucher (30天复购券)', discount: 1500, minSpend: 8000, desc: 'S$15 off on your next visit within 30 days' }
];
export const STATIONS = {
  all: { id: 'all', label: 'All Stations · 全部档口', icon: '📋' },
  steamboat: { id: 'steamboat', label: 'Steamboat & Charcoal · 炭火炉档', icon: '🍲' },
  wok: { id: 'wok', label: 'Wok & Hot Dishes · 镬气热炒', icon: '🔥' },
  bar: { id: 'bar', label: 'Drinks & Bar · 水吧茶水', icon: '🍵' },
  dessert: { id: 'dessert', label: 'Cold / Dessert · 凉菜甜品', icon: '🍧' }
};

export function getDishStation(dishItem) {
  if (!dishItem) return 'wok';
  const id = String(dishItem.id || '').toLowerCase();
  const cat = String(dishItem.category || '');
  if (cat === 'Steamboat' || id.includes('steamboat')) return 'steamboat';
  if (cat === 'Drinks & Tea' || ['tea', 'barley', 'calamansi'].includes(id)) return 'bar';
  if (cat === 'Dessert' || ['yam', 'mango-pomelo', 'taro'].includes(id)) return 'dessert';
  return 'wok';
}

export const SET_MENUS = [
  {
    id: 'set-2pax',
    name: 'Couple Steamboat Set (双人温馨炉)',
    cn: '双人温馨炉',
    pax: 2,
    price: 5800,
    icon: '🍲',
    desc: 'Choice of Grouper / Pomfret / Red Snapper Steamboat + 1 Hot Dish + Greens + 2 Rice + 2 Pu’er Tea',
    image: 'https://ucarecdn.com/f044bbd1-58c0-43be-a6b1-36baea4d9520/',
    slots: [
      {
        name: 'Fish Steamboat (选择鱼头炉)',
        options: [
          { id: 'grouper', name: 'Red Grouper Slices (红斑炉)', priceDiff: 0 },
          { id: 'pomfret', name: 'Chinese Pomfret (斗鲳炉)', priceDiff: 600 },
          { id: 'snapper', name: 'Red Snapper (红鲷鱼炉)', priceDiff: 0 }
        ]
      },
      {
        name: 'Signature Hot Dish (招牌热炒)',
        options: [
          { id: 'chicken', name: 'Prawn Paste Chicken (虾酱鸡)', priceDiff: 0 },
          { id: 'pork', name: 'Nam Yu Pork Belly (南乳五花肉)', priceDiff: 0 },
          { id: 'tofu', name: 'Handmade Tofu (招牌手工豆腐)', priceDiff: 0 }
        ]
      },
      {
        name: 'Vegetable (时蔬)',
        options: [
          { id: 'kang', name: 'Sambal Kang Kong (参巴空心菜)', priceDiff: 0 },
          { id: 'tango', name: 'Fresh Tang Oh (清炒茼蒿)', priceDiff: 0 }
        ]
      }
    ],
    fixedItems: [
      { id: 'rice', qty: 2, name: 'Steamed Rice', size: 'Regular' },
      { id: 'tea', qty: 2, name: 'Pu’er Chinese Tea', size: 'Regular' }
    ]
  },
  {
    id: 'set-4pax',
    name: 'Heritage Family Sharing Set (四人经典老字号)',
    cn: '四人老字号聚餐宴',
    pax: 4,
    price: 12800,
    icon: '👑',
    desc: 'Large Charcoal Steamboat + Har Cheong Gai + Signature Tofu + Wok-hei Greens + Crispy Yam + 4 Rice + 4 Pu’er Tea',
    image: 'https://ucarecdn.com/978c4a16-64ad-4e55-83fb-e4f4fb38e945/',
    slots: [
      {
        name: 'Fish Steamboat (选择大份鱼头炉)',
        options: [
          { id: 'pomfret', name: 'Chinese Pomfret Large (大份斗鲳炉)', priceDiff: 800 },
          { id: 'grouper', name: 'Red Grouper Slices Large (大份红斑炉)', priceDiff: 0 },
          { id: 'song-fish-head', name: 'Heritage Song Fish Head (传统松鱼头炉)', priceDiff: 0 }
        ]
      },
      {
        name: 'Seafood / Meat Specialty (精选荤菜)',
        options: [
          { id: 'chicken', name: 'Prawn Paste Chicken (虾酱鸡)', priceDiff: 0 },
          { id: 'prawn-paste', name: '100% Tiger Prawn Meat (纯虾滑)', priceDiff: 0 },
          { id: 'egg', name: 'Oyster Omelette (蚝煎)', priceDiff: 0 }
        ]
      },
      {
        name: 'Tofu & Greens (豆腐与时蔬)',
        options: [
          { id: 'tofu', name: 'Handmade Silken Tofu (手工豆腐)', priceDiff: 0 },
          { id: 'kang', name: 'Sambal Kang Kong (参巴空心菜)', priceDiff: 0 }
        ]
      }
    ],
    fixedItems: [
      { id: 'yam', qty: 1, name: 'Crispy Fried Yam', size: 'Regular' },
      { id: 'rice', qty: 4, name: 'Steamed Rice', size: 'Regular' },
      { id: 'tea', qty: 4, name: 'Pu’er Chinese Tea', size: 'Regular' }
    ]
  },
  {
    id: 'set-8pax',
    name: 'Prosperity Grand Banquet for 8 (八人八方聚宝宴)',
    cn: '八人八方聚宝宴',
    pax: 8,
    price: 26800,
    icon: '🏮',
    desc: 'Two Steamboats or Giant Pomfret Pot + 4 Seafood & Meat Classics + 2 Vegetables + Crispy Yam Dessert + 8 Rice + Drinks',
    image: 'https://ucarecdn.com/1babb7fc-af40-4e49-9b01-a0248166ddac/',
    slots: [
      {
        name: 'Steamboat Selection (精选双炭炉)',
        options: [
          { id: 'pomfret', name: 'Wild Chinese Pomfret (野生白鲳炉)', priceDiff: 0 },
          { id: 'grouper', name: 'Red Grouper Charcoal Pot (深海红斑炉)', priceDiff: 0 }
        ]
      },
      {
        name: 'Seafood Selection (精选海鲜盛宴)',
        options: [
          { id: 'cereal-crayfish', name: 'Cereal Crayfish (麦片虾婆)', priceDiff: 0 },
          { id: 'butter-crayfish', name: 'Butter Crayfish (牛油虾婆)', priceDiff: 0 },
          { id: 'egg', name: 'Teochew Oyster Omelette (潮州蚝煎)', priceDiff: 0 }
        ]
      }
    ],
    fixedItems: [
      { id: 'chicken', qty: 2, name: 'Prawn Paste Chicken', size: 'Regular' },
      { id: 'tofu', qty: 2, name: 'Handmade Tofu', size: 'Regular' },
      { id: 'kang', qty: 2, name: 'Sambal Kang Kong', size: 'Regular' },
      { id: 'yam', qty: 2, name: 'Crispy Fried Yam', size: 'Regular' },
      { id: 'rice', qty: 8, name: 'Steamed Rice', size: 'Regular' },
      { id: 'tea', qty: 8, name: 'Pu’er Chinese Tea', size: 'Regular' }
    ]
  }
];

export function getTableSession(state, rawTableId) {
  if (!rawTableId) return { cart: state.cart || [], proposal: state.proposal || [], messages: state.messages || [], status: 'ordering', pax: 4, teaFeeWaived: false, coupon: null, gear: 'dock', seatingConfirmed: false };
  const safeId = String(rawTableId).trim().slice(0, 16);
  if (['__proto__', 'constructor', 'prototype'].includes(safeId)) {
    throw Error('Invalid table identifier.');
  }
  const tableId = safeId;
  if (!state.sessions || typeof state.sessions !== 'object' || Array.isArray(state.sessions)) state.sessions = {};
  if (!state.sessions[tableId]) {
    state.sessions[tableId] = {
      cart: [],
      proposal: [],
      messages: [{ role: 'host', text: replyText(state.replyLanguage || 'en', 'welcome'), language: state.replyLanguage || 'en' }],
      guests: [],
      status: 'ordering',
      pax: 4,
      teaFeeWaived: false,
      coupon: null,
      gear: 'dock',
      seatingConfirmed: false,
      babyChair: false,
      kidsCutlery: false,
      teaChoice: 'puer',
      openedAt: new Date().toISOString()
    };
  }
  return state.sessions[tableId];
}

export const MID_MEAL_REORDER_ITEMS = [
  { id: 'rice', name: 'Steamed Jasmine Rice', cn: '香浓白米饭', price: 150, icon: '🍚', tag: 'Fast 1-min' },
  { id: 'yam', name: 'Crispy Yam & Fish Maw', cn: '酥炸芋头鱼鳔', price: 800, icon: '🍠', tag: 'Soup favourite' },
  { id: 'tea', name: 'Pu’er Chinese Tea (Pot)', cn: '特选陈年普洱茶', price: 400, icon: '🍵', tag: 'Hot refill' },
  { id: 'calamansi', name: 'Sour Plum Calamansi', cn: '金桔话梅冰露', price: 320, icon: '🥤', tag: 'Ice cooling' },
  { id: 'kai-lan', name: 'Baby Kai Lan Greens', cn: '蒜蓉芥兰时蔬', price: 800, icon: '🥬', tag: 'Fresh greens' }
];

export function confirmTableSeating(state, tableId, { pax = 4, babyChair = false, kidsCutlery = false, teaChoice = 'puer', isMember = false } = {}) {
  const session = getTableSession(state, tableId);
  session.pax = Math.max(1, Math.min(20, Number(pax) || 4));
  session.seatingConfirmed = true;
  session.babyChair = Boolean(babyChair);
  session.kidsCutlery = Boolean(kidsCutlery);
  session.teaChoice = teaChoice;

  if (isMember) {
    session.teaFeeWaived = true;
  }

  if (teaChoice && teaChoice !== 'water' && !state.unavailable.includes('tea')) {
    const teaName = teaChoice === 'chrysanthemum' ? 'Chrysanthemum Tea (胎菊王)' : 'Aged Pu’er Tea (陈年普洱)';
    const hasTea = session.cart.some(x => x.id === 'tea');
    if (!hasTea) {
      const teaLine = makeLine('tea', 1, 'Regular', `${teaName} · Table Tea Choice`, 'fire', 'Table Captain', '🍵');
      session.cart.push(teaLine);
      if (session === state.sessions?.[tableId]) {
        state.cart = session.cart;
      }
    }
  }

  if (babyChair || kidsCutlery) {
    const items = [];
    if (babyChair) items.push('Baby High Chair (宝宝椅)');
    if (kidsCutlery) items.push('Children Cutlery (儿童餐具)');
    requestService(state, tableId, 'assistance', `Seating setup: ${items.join(' + ')}`);
  }

  return session;
}
export function makeLine(id, qty = 1, size = 'Regular', notes = '', timing = 'fire', addedBy = 'Table', guestEmoji = '👥') {
  const d = dish(id);
  if (!d || !Number.isInteger(qty) || qty < 1 || qty > 20 || !['Regular', 'Large'].includes(size) || (d.singleSize && size !== 'Regular')) throw Error('Please choose a valid dish, size and quantity (1–20).');
  return {
    id,
    name: d.name,
    size,
    notes: String(notes).trim().slice(0, 160),
    qty,
    unitPrice: d.price + (size === 'Large' ? 800 : 0),
    timing: timing === 'hold' ? 'hold' : 'fire',
    station: getDishStation(d),
    addedBy: addedBy || 'Table',
    guestEmoji: guestEmoji || '👥'
  };
}
export function addLines(state, lines, tableId = null) {
  const targetCart = tableId ? getTableSession(state, tableId).cart : (state.cart || []);
  const next = structuredClone(targetCart);
  for (const raw of lines) {
    if (state.unavailable.includes(raw.id)) throw Error(`${dish(raw.id)?.name || 'Dish'} is unavailable. Please choose another dish.`);
    const x = makeLine(raw.id, raw.qty, raw.size, raw.notes, raw.timing, raw.addedBy || 'Table', raw.guestEmoji || '👥');
    if (raw.station) { x.station = raw.station; }
    const existing = next.find(y => y.id === x.id && y.size === x.size && y.notes === x.notes && (y.timing || 'fire') === (x.timing || 'fire'));
    if (existing) { if (existing.qty + x.qty > 20) throw Error('Maximum 20 of each dish.'); existing.qty += x.qty; } else next.push(x);
  }
  if (tableId) {
    getTableSession(state, tableId).cart = next;
    state.cart = next; // keep root in sync for single-table backwards compat
  } else {
    state.cart = next;
  }
}
export function submit(state, table, options = {}) {
  const session = table ? getTableSession(state, table) : null;
  const cartToSubmit = session && session.cart.length ? session.cart : state.cart;
  if (!cartToSubmit.length) throw Error('Add a dish before sending your order.');
  if (state.orders.filter(x => x.status === 'pending').length >= 20) throw Error('Please review pending orders in Staff first.');
  for (const x of cartToSubmit) if (state.unavailable.includes(x.id)) throw Error(`${x.name} is now unavailable. Please remove it from your cart.`);
  const tableRound = state.orders.filter(x => x.table === table && x.status !== 'rejected').length + 1;
  const cartTotal = total(cartToSubmit);

  const shouldAutoFire = options.autoFire ?? state.settings?.autoFire ?? false;
  const hasLargeQty = cartToSubmit.some(x => x.qty >= 5);
  const isHighValue = cartTotal > 25000;
  const hasLongNotes = cartToSubmit.some(x => (x.notes || '').length > 40);
  const isFlagged = hasLargeQty || isHighValue || hasLongNotes;

  let initialStatus = 'pending';
  let flaggedReason = null;

  if (shouldAutoFire && !isFlagged) {
    initialStatus = 'approved';
  } else if (isFlagged) {
    flaggedReason = hasLargeQty ? 'High quantity item (≥5)' : isHighValue ? 'Large round total (>S$250)' : 'Special kitchen instructions';
  }

  const order = {
    id: `AH-${String(state.orders.length + 1001)}`,
    table,
    round: tableRound,
    items: structuredClone(cartToSubmit).map(x => ({
      ...x,
      timing: x.timing || 'fire',
      station: x.station || getDishStation(x)
    })),
    checkedItems: [],
    status: initialStatus,
    autoApproved: initialStatus === 'approved',
    flaggedReason,
    created: new Date().toISOString(),
    paid: false,
    reason: ''
  };

  state.orders.push(order);
  if (state.orders.length > 100) {
    state.orders = state.orders.slice(-100);
  }
  if (session) {
    session.cart = [];
    session.proposal = [];
    session.status = 'dining';
    session.gear = 'stage';
  }
  state.cart = [];
  state.proposal = [];
  return order;
}

export function fireHeldItem(state, orderId, itemIndex) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order || !order.items[itemIndex]) throw Error('Dish item not found.');
  order.items[itemIndex].timing = 'fire';
  return order.items[itemIndex];
}

export function hurryItem(state, table, orderId, itemIndex, dishName = '') {
  const order = state.orders.find(o => o.id === orderId);
  if (!order || !order.items[itemIndex]) throw Error('Dish item not found.');
  const item = order.items[itemIndex];
  item.hurried = true;
  item.lastHurried = new Date().toISOString();
  
  const entry = {
    id: typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : String(Math.random()),
    table,
    type: 'hurry',
    label: `⚡ 催菜 (Hurry): Table ${table} · ${dishName || item.name} (${orderId})`,
    created: new Date().toISOString(),
    done: false
  };
  state.calls.push(entry);
  if (state.calls.length > 50) {
    const active = state.calls.filter(x => !x.done);
    const completed = state.calls.filter(x => x.done).slice(-20);
    state.calls = [...active, ...completed];
  }
  return entry;
}

export function voidItem(state, table, orderId, itemIndex, reason = '') {
  const order = state.orders.find(o => o.id === orderId);
  if (!order || !order.items[itemIndex]) throw Error('Dish item not found.');
  const item = order.items[itemIndex];
  if (item.voided) throw Error('Dish has already been voided.');
  item.voided = true;
  item.voidReason = String(reason || 'Customer request').trim().slice(0, 100);

  const entry = {
    id: typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : String(Math.random()),
    table,
    type: 'void',
    label: `❌ 退菜 (Void): Table ${table} · ${item.name} (${item.voidReason})`,
    created: new Date().toISOString(),
    done: false
  };
  state.calls.push(entry);
  if (state.calls.length > 50) {
    const active = state.calls.filter(x => !x.done);
    const completed = state.calls.filter(x => x.done).slice(-20);
    state.calls = [...active, ...completed];
  }
  return entry;
}

export function applyOp(state, op) {
  if (!op || !op.type) return;
  const { type, table: opTable, lines, lineIndex, delta, id, status, reason, serviceType, note } = op;
  const session = opTable ? getTableSession(state, opTable) : null;
  const cart = session ? session.cart : state.cart;

  switch (type) {
    case 'ADD_LINE':
    case 'ADD_LINES': {
      addLines(state, lines || [], opTable);
      break;
    }
    case 'UPDATE_QTY': {
      if (cart && cart[lineIndex]) {
        cart[lineIndex].qty += (delta || 0);
        if (cart[lineIndex].qty <= 0) cart.splice(lineIndex, 1);
        if (session) state.cart = cart;
      }
      break;
    }
    case 'SUBMIT_ORDER': {
      submit(state, opTable, { autoFire: Boolean(op.autoFire) });
      break;
    }
    case 'TRANSITION_ORDER': {
      transition(state, id, status, reason || '');
      break;
    }
    case 'REQUEST_SERVICE': {
      requestService(state, opTable, serviceType, note);
      break;
    }
    case 'FIRE_HELD_ITEM': {
      fireHeldItem(state, op.orderId || id, op.itemIndex ?? lineIndex);
      break;
    }
    case 'HURRY_ITEM': {
      hurryItem(state, opTable, op.orderId || id, op.itemIndex ?? lineIndex, op.dishName || note);
      break;
    }
    case 'VOID_ITEM': {
      voidItem(state, opTable, op.orderId || id, op.itemIndex ?? lineIndex, reason);
      break;
    }
    case 'SET_SESSION_STATUS': {
      if (session && op.sessionStatus) session.status = op.sessionStatus;
      break;
    }
    case 'CLOSE_TABLE': {
      closeTableSession(state, opTable);
      break;
    }
    case 'SET_UNAVAILABLE': {
      if (Array.isArray(op.unavailable)) state.unavailable = op.unavailable;
      break;
    }
    case 'SETTLE_TABLE': {
      settleTable(state, opTable);
      break;
    }
    case 'REGISTER_MEMBER': {
      registerMember(state, op);
      break;
    }
    case 'TOP_UP_STORED_VALUE': {
      topUpMemberBalance(state, op.phone, op.payCents, op.creditCents);
      break;
    }
    case 'APPLY_COUPON': {
      applyCoupon(state, opTable, op.couponCode);
      break;
    }
    case 'REMOVE_COUPON': {
      removeCoupon(state, opTable);
      break;
    }
    case 'PAY_WITH_BALANCE': {
      payWithMemberBalance(state, opTable, op.phone);
      break;
    }
    case 'SUBMIT_REVIEW': {
      submitReview(state, op);
      break;
    }
    case 'CREATE_BANQUET_BOOKING': {
      createBanquetBooking(state, op.booking || op);
      break;
    }
    case 'CREATE_QUEUE_TICKET': {
      createQueueTicket(state, op.pax, op.guestName);
      break;
    }
    case 'TRANSFER_QUEUE_TO_TABLE': {
      transferQueueToTable(state, op.queueId, opTable);
      break;
    }
    case 'RECORD_AH_HUA_EVENT': {
      recordAhHuaEvent(state, op.eventType, op.data);
      break;
    }
    case 'SET_TABLE_GEAR': {
      if (session && op.gear) {
        session.gear = op.gear;
      }
      break;
    }
    case 'TOGGLE_CART_RULE': {
      if (!state.cartRules) state.cartRules = structuredClone(DEFAULT_CART_RULES);
      const r = state.cartRules.find(x => x.id === op.ruleId);
      if (r) r.enabled = op.enabled !== undefined ? op.enabled : !r.enabled;
      break;
    }
    case 'CONFIRM_SEATING': {
      confirmTableSeating(state, opTable, {
        pax: op.pax,
        babyChair: op.babyChair,
        kidsCutlery: op.kidsCutlery,
        teaChoice: op.teaChoice,
        isMember: op.isMember
      });
      break;
    }
  }
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
  if (state.calls.length > 50) {
    const active = state.calls.filter(x => !x.done);
    const completed = state.calls.filter(x => x.done).slice(-20);
    state.calls = [...active, ...completed];
  }
  return entry;
}
export function tableSummary(state, table, pax = 4) {
  const session = table ? getTableSession(state, table) : null;
  const safePax = Math.min(20, Math.max(1, Number.isInteger(pax) ? pax : 4));
  const tableOrders = state.orders.filter(x => x.table === table);
  const activeOrders = tableOrders.filter(x => x.status !== 'rejected');
  const rawSubtotal = activeOrders.reduce((sum, o) => {
    const validItems = (o.items || []).filter(x => !x.voided);
    return sum + total(validItems);
  }, 0);
  const coupon = session?.coupon || null;
  let discount = 0;
  if (coupon && rawSubtotal >= (coupon.minSpend || 0)) {
    discount = Math.min(coupon.discount || 0, rawSubtotal);
  }
  const subtotal = Math.max(0, rawSubtotal - discount);
  const serviceCharge = Math.round(subtotal * 0.10);
  const gst = Math.round((subtotal + serviceCharge) * 0.09);
  const grandTotal = subtotal + serviceCharge + gst;
  const itemCount = activeOrders.reduce((sum, o) => sum + (o.items || []).filter(x => !x.voided).reduce((n, x) => n + x.qty, 0), 0);
  const allServed = activeOrders.length > 0 && activeOrders.every(o => o.status === 'served');
  const allPaid = activeOrders.length > 0 && activeOrders.every(o => o.paid);
  return {
    table,
    pax: safePax,
    rounds: activeOrders.length,
    itemCount,
    orders: tableOrders,
    activeOrders,
    rawSubtotal,
    discount,
    coupon,
    subtotal,
    serviceCharge,
    gst,
    grandTotal,
    subtotalPerPax: safePax ? Math.ceil(subtotal / safePax) : subtotal,
    grandTotalPerPax: safePax ? Math.ceil(grandTotal / safePax) : grandTotal,
    amountCharged: 0,
    allServed,
    allPaid,
    status: session?.status || 'dining'
  };
}
export function settleTable(state, table) {
  const served = state.orders.filter(x => x.table === table && x.status === 'served');
  if (!served.length) throw Error('No served orders are ready for a simulated receipt yet.');
  for (const o of served) o.paid = true;
  return served.length;
}
export function guestBreakdown(state, table) {
  const tableOrders = state.orders.filter(x => x.table === table && x.status !== 'rejected');
  const guestMap = new Map();

  for (const ord of tableOrders) {
    for (const it of (ord.items || [])) {
      if (it.voided) continue;
      const guestKey = it.addedBy || 'Shared Table';
      if (!guestMap.has(guestKey)) {
        guestMap.set(guestKey, {
          guestName: guestKey,
          emoji: it.guestEmoji || (guestKey === 'Shared Table' ? '👥' : '👤'),
          items: [],
          subtotal: 0
        });
      }
      const g = guestMap.get(guestKey);
      g.items.push(it);
      g.subtotal += (it.qty * it.unitPrice);
    }
  }

  const breakdown = [];
  for (const g of guestMap.values()) {
    const svc = Math.round(g.subtotal * 0.10);
    const gst = Math.round((g.subtotal + svc) * 0.09);
    breakdown.push({
      ...g,
      serviceCharge: svc,
      gst,
      grandTotal: g.subtotal + svc + gst
    });
  }
  return breakdown;
}

export const STEAMBOAT_PORTIONS = {
  Regular: {
    label: 'Medium Pot (中炉 · 招牌)',
    paxLabel: '2–4 Pax (建议2–4人)',
    paxMin: 2,
    paxMax: 4,
    fishWeight: '~700g Fresh Cutlets',
    brothVolume: '1.8L Charcoal Broth',
    desc: 'Simmered over glowing charcoal with fried yam cubes, sour plum & seasonal greens.'
  },
  Large: {
    label: 'Large Pot (大炉 · 欢聚)',
    paxLabel: '5–8 Pax (建议5–8人)',
    paxMin: 5,
    paxMax: 8,
    fishWeight: '~1,100g Jumbo Cutlets & Whole Head',
    brothVolume: '2.8L Charcoal Broth',
    desc: 'Bountiful family size with double yam portions, sole fish & extra rich charcoal broth refill.'
  }
};

export const STEAMBOAT_BROTHS = [
  {
    id: 'milky',
    name: 'Charcoal Milky Broth',
    cn: '招牌炭火奶白浓汤',
    desc: 'Simmered 8 hours with deep-sea fish bones & old hen. Velvety sweet.',
    icon: '🍲'
  },
  {
    id: 'clear',
    name: 'Clear Teochew Ginger Broth',
    cn: '潮州清甜老姜鲜汤',
    desc: 'Traditional Teochew recipe with fresh old ginger, sour plum & celery. Clean & light.',
    icon: '🥣'
  }
];

export function generateAABillMessage(state, tableId, { hostName = 'Host', hostPhone = '', mode = 'even', pax = 4 } = {}) {
  const summary = tableSummary(state, tableId, pax);
  const guests = guestBreakdown(state, tableId);
  const safePax = Math.max(1, Number(pax) || 4);
  const dateStr = new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });

  let text = `🍲 *NAN HWA CHONG (南华昌) · Table ${tableId} Bill Split (好友分账)*\n`;
  text += `📍 812/814/816 North Bridge Rd · Est. 1927\n`;
  text += `📅 ${dateStr} · ${safePax} Diners\n`;
  text += `────────────────────────────\n`;
  text += `💰 *Total Bill:* ${money(summary.grandTotal)} (Dishes: ${money(summary.rawSubtotal ?? summary.subtotal)}`;
  if (summary.discount > 0) text += `, Voucher: -${money(summary.discount)}`;
  text += ` + 10% SC + 9% GST)\n`;

  if (mode === 'even' || guests.length <= 1) {
    text += `👥 *Even Split (AA均分):* *${money(summary.grandTotalPerPax)}* / person\n\n`;
    text += `📋 *Dishes Ordered:*\n`;
    for (const o of summary.activeOrders) {
      for (const it of o.items) {
        if (!it.voided) {
          text += `  • ${it.qty}× ${it.name}${it.size === 'Large' ? ' (Large)' : ''} (${money(it.qty * it.unitPrice)})\n`;
        }
      }
    }
  } else {
    text += `👥 *Itemized Breakdown (按人分账):*\n`;
    for (const g of guests) {
      text += `\n${g.emoji} *${g.guestName}:* *${money(g.grandTotal)}*\n`;
      for (const it of g.items) {
        text += `  • ${it.qty}× ${it.name}${it.size === 'Large' ? ' (Large)' : ''} (${money(it.qty * it.unitPrice)})\n`;
      }
      text += `  └ Incl. 10% SC & 9% GST\n`;
    }
  }

  text += `\n────────────────────────────\n`;
  if (hostPhone) {
    text += `👉 *PayNow to ${hostName}:* \`${hostPhone}\`\n`;
    text += `📲 PayNow Amount: *${mode === 'even' ? money(summary.grandTotalPerPax) : 'See your share above'}*\n`;
  } else {
    text += `👉 *PayNow to Table Host (${hostName})*\n`;
  }
  text += `🔗 *View Live Table Check:* https://ahhua.vercel.app/?table=${tableId}\n`;
  text += `✨ Thank you for dining with Ah Hua! 欢聚南华昌，炭火传温情。`;

  return text;
}
export function closeTableSession(state, table) {
  const session = table ? getTableSession(state, table) : null;
  const activeOrders = state.orders.filter(x => x.table === table && x.status !== 'rejected');
  for (const o of activeOrders) {
    o.paid = true;
    if (o.status !== 'served') o.status = 'served';
  }
  if (session) {
    session.status = 'closed';
    session.closedAt = new Date().toISOString();
    session.cart = [];
    session.proposal = [];
    session.seatingConfirmed = false;
    session.gear = 'dock';
  }
  return { ok: true, table, closedOrders: activeOrders.length };
}
export function getEReceipt(state, table, pax = 4) {
  const summary = tableSummary(state, table, pax);
  const now = new Date();
  const receiptNo = `NHC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${table}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    merchant: {
      name: 'Nan Hwa Chong (1927) Pte. Ltd.',
      cn: '南华昌（1927）私人有限公司',
      gstReg: 'M9-0012345-X',
      regNo: '192700012K',
      address: '812/814/816 North Bridge Road, Singapore 198779',
      phone: '+65 6297 9719'
    },
    receiptNo,
    table,
    pax: summary.pax,
    dateTime: now.toLocaleString('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short' }),
    items: summary.activeOrders.flatMap(o => (o.items || []).filter(x => !x.voided)),
    voidedItems: summary.activeOrders.flatMap(o => (o.items || []).filter(x => x.voided)),
    rawSubtotal: summary.rawSubtotal ?? summary.subtotal,
    discount: summary.discount || 0,
    coupon: summary.coupon || null,
    subtotal: summary.subtotal,
    serviceCharge: summary.serviceCharge,
    gst: summary.gst,
    grandTotal: summary.grandTotal,
    paymentStatus: 'PAID · FULLY SETTLED'
  };
}

export function getMember(state, phone) {
  if (!state.members) state.members = {};
  const clean = String(phone || '').trim().replace(/\D/g, '').slice(-8);
  return state.members[clean] || null;
}

export function registerMember(state, { phone, name, email = '' }) {
  const clean = String(phone || '').trim().replace(/\D/g, '').slice(-8);
  if (!clean || clean.length < 8) throw Error('Please provide an 8-digit Singapore phone number.');
  if (!state.members) state.members = {};
  if (!state.members[clean]) {
    state.members[clean] = {
      phone: clean,
      name: (name || 'VIP Member').trim(),
      email: String(email).trim(),
      balance: 0,
      points: 100, // Welcome points
      tier: 'Bronze',
      visits: 1,
      teaWaived: true,
      coupons: ['WELCOME-TEA', 'RETURN-15'],
      joinedAt: new Date().toISOString()
    };
  } else {
    state.members[clean].visits += 1;
    if (name) state.members[clean].name = String(name).trim();
  }
  return state.members[clean];
}

export function topUpMemberBalance(state, phone, payCents, creditCents) {
  const member = getMember(state, phone);
  if (!member) throw Error('Member account not found. Please register first.');
  member.balance = (member.balance || 0) + Number(creditCents);
  member.points = (member.points || 0) + Math.floor(payCents / 100);
  if (member.balance >= 50000) member.tier = 'Gold';
  else if (member.balance >= 20000) member.tier = 'Silver';
  return member;
}

export function applyCoupon(state, table, couponCode) {
  const session = getTableSession(state, table);
  const found = COUPON_TEMPLATES.find(c => c.code === couponCode) || {
    code: couponCode,
    title: 'Custom Voucher',
    discount: 500,
    minSpend: 4000,
    desc: 'Promotional discount'
  };
  session.coupon = found;
  return found;
}

export function removeCoupon(state, table) {
  const session = getTableSession(state, table);
  session.coupon = null;
}

export function payWithMemberBalance(state, table, phone) {
  const member = getMember(state, phone);
  if (!member) throw Error('Member not found.');
  const summary = tableSummary(state, table);
  if (member.balance < summary.grandTotal) {
    throw Error(`Insufficient stored value balance. Available: ${money(member.balance)}, Required: ${money(summary.grandTotal)}.`);
  }
  member.balance -= summary.grandTotal;
  const pts = Math.floor(summary.grandTotal / 100);
  member.points = (member.points || 0) + pts;
  settleTable(state, table);
  return { success: true, remainingBalance: member.balance, pointsEarned: pts };
}

export function submitReview(state, { table, phone, rating, tags = [], comment = '' }) {
  if (!state.reviews) state.reviews = [];
  const review = {
    id: `REV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    table,
    phone: String(phone || '').trim().replace(/\D/g, '').slice(-8),
    rating: Number(rating) || 5,
    tags: Array.isArray(tags) ? tags : [],
    comment: String(comment).trim().slice(0, 300),
    created: new Date().toISOString()
  };
  state.reviews.push(review);
  if (review.phone) {
    const member = getMember(state, review.phone);
    if (member) member.points = (member.points || 0) + 50;
  }
  return review;
}

export function createBanquetBooking(state, { name, phone, date, time, pax, setId, notes = '' }) {
  if (!state.banquets) state.banquets = [];
  const sm = SET_MENUS.find(s => s.id === setId);
  const booking = {
    id: `NHC-BANQ-${Date.now().toString().slice(-6)}`,
    name: String(name || 'Banquet Guest').trim(),
    phone: String(phone || '').trim(),
    date: date || new Date().toISOString().slice(0, 10),
    time: time || '19:00',
    pax: Number(pax) || (sm ? sm.pax : 8),
    setId: sm ? sm.id : 'set-8pax',
    setName: sm ? sm.name : 'Prosperity Feast (八仙聚宝宴)',
    notes: String(notes).trim(),
    depositCents: 5000,
    depositPaid: true,
    status: 'confirmed',
    created: new Date().toISOString()
  };
  state.banquets.push(booking);
  return booking;
}

export function createQueueTicket(state, pax = 4, guestName = 'Diner') {
  if (!state.queues) state.queues = {};
  const count = Object.keys(state.queues).length + 1;
  const queueId = `Q-${String(count).padStart(2, '0')}`;
  state.queues[queueId] = {
    queueId,
    pax: Number(pax) || 4,
    guestName: String(guestName || 'Diner').trim(),
    cart: [],
    estWaitMins: count * 8,
    status: 'waiting',
    created: new Date().toISOString()
  };
  return state.queues[queueId];
}

export function transferQueueToTable(state, queueId, tableNum) {
  if (!state.queues || !state.queues[queueId]) throw Error(`Queue ticket ${queueId} not found.`);
  const q = state.queues[queueId];
  if (q.cart && q.cart.length) {
    addLines(state, q.cart, tableNum);
  }
  const session = getTableSession(state, tableNum);
  session.pax = q.pax;
  q.status = 'seated';
  q.table = tableNum;
  return session;
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
  const found = [];
  for (const d of menu) {
    let bestAt = Infinity;
    let bestLen = 0;
    for (const a of d.aliases) {
      const idx = aliasIndex(t, a);
      if (idx >= 0 && (idx < bestAt || (idx === bestAt && a.length > bestLen))) {
        bestAt = idx;
        bestLen = a.length;
      }
    }
    if (Number.isFinite(bestAt)) {
      found.push({ d, at: bestAt, end: bestAt + bestLen });
    }
  }
  const nonSubsumed = found.filter(m => !found.some(o => o.d.id !== m.d.id && o.at <= m.at && o.end >= m.end && (o.end - o.at > m.end - m.at)));
  const matches = nonSubsumed.filter(x => x.d.id !== 'grouper' || !nonSubsumed.some(y => ['pomfret', 'snapper'].includes(y.d.id)) || /grouper|石斑/.test(t)).sort((a, b) => a.at - b.at);
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
