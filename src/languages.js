import { restaurant } from './config.js';

const host = restaurant.hostName;
const hostZh = restaurant.hostNameZh;

export const languages = {
  en: { label: 'English', speech: 'en-GB', html: 'en' },
  zh: { label: '中文（普通话）', speech: 'zh-CN', html: 'zh-Hans' },
  singlish: { label: 'Singlish', speech: 'en-SG', html: 'en-SG' },
  ms: { label: 'Bahasa Melayu', speech: 'ms-MY', html: 'ms' },
  fr: { label: 'Français', speech: 'fr-FR', html: 'fr' }
};
export const normaliseLanguage = value => Object.hasOwn(languages, value) ? value : 'en';
const messages = {
  welcome: {
    en: `Welcome. I’m ${host}, your table host. Name a dish, ask a sample price, or tell me how many people and a budget. I answer from a fixed script in this demo.`,
    zh: `欢迎。我是${hostZh}，这桌的招呼。您可以说菜名、问价钱，或告诉我几位、预算多少。这是演示用的固定回复，不是在线客服。`,
    singlish: `Welcome. I’m ${host}, your table host. Say the dish, ask the price, or tell me how many pax and the budget. I answer from a fixed script for this demo, can?`
  },
  switched: {
    en: 'Of course. I’ll reply in English from now on. Your cart is unchanged. What would you like?',
    zh: '好的，接下来我会用中文回复您。购物车里的菜品不变。请问想吃什么？',
    singlish: 'Can lah! From now on I reply in Singlish. Your cart still the same, don’t worry. What you want to makan?'
  },
  voiceEnabled: {
    en: `I’ll read this scripted reply aloud in English. Name a dish, or ask for a suggestion.`,
    zh: `接下来我会用普通话朗读这段固定回复。您可以说菜名，或请我建议一桌。`,
    singlish: `I will read this scripted reply aloud. Say the dish, or ask what to order, can?`
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
    en: ({pax,amount,dishes,details}) => `For ${pax}, how about ${dishes}? Suggested set: ${amount}${details?` (${details})`:''}. This total covers the suggestion only, not your existing cart. Recipes and portions need staff confirmation. Review below, or ask for another suggestion.`,
    zh: ({pax,amount,dishes,details}) => `为 ${pax} 位推荐 ${dishes}。建议套餐 ${amount}${details?`（${details}）`:''}，仅计算此次建议，不含购物车已有菜品。食谱和份量需员工确认。请检查下方建议，也可以换一组。`,
    singlish: ({pax,amount,dishes,details}) => `${pax} people ah? Try ${dishes} to share, can! Suggested set is ${amount}${details?` (${details})`:''}. This total is for the suggestion only, your existing cart not included. Recipe and portion must check with staff first. Want another combination? Just ask lah.`
  },
  noRecommendation: {
    en: 'I couldn’t find a dish combination within those preferences and the suggested-set budget. Try a higher budget, change the preferences, or browse the menu. Nothing has been added to your cart.',
    zh: '目前无法在这些偏好和建议套餐预算内找到菜品组合。您可以提高预算、调整偏好，或直接浏览菜单。没有添加任何菜品。',
    singlish: 'With these preferences and budget, I can’t put a set together leh. Can increase budget, change the preferences, or browse the menu? Nothing added to your cart yet.'
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
    en: 'I answer from a fixed script, not an open conversation. Try “recommend for 4, not spicy”, “two rice and one prawn paste chicken”, or ask a dish’s price. You can browse the menu or call a server.',
    zh: '我只能按固定脚本回复，不是随意聊天。试试“推荐四人餐”或“两碗白饭和一份虾酱鸡”。也可以问价钱、看菜单，或叫服务员。',
    singlish: 'I answer from a fixed script, not a free chat. Try “four pax, not spicy, what you recommend?” or “two rice and one prawn paste chicken”. Can ask the price also. Need a person, call a server.'
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
const extraMessages = {
  ms: {
    welcome: `Selamat datang. Saya ${host}, hos meja anda. Sebut hidangan, tanya harga, atau beritahu bilangan orang dan bajet. Saya membalas daripada skrip tetap dalam demo ini.`,
    switched: 'Baik, saya akan membalas dalam Bahasa Melayu. Troli anda tidak berubah. Nak makan apa?',
    voiceEnabled: 'Saya akan membacakan jawapan skrip ini dalam Bahasa Melayu. Sebut hidangan, atau minta cadangan.',
    allergy: 'Jika ada alahan, sila tekan “Call a server” dan semak dengan staf. Resipi dan maklumat alergen contoh ini belum disahkan. Saya tidak boleh menjamin mana-mana hidangan selamat. Tiada hidangan ditambah.',
    call: 'Tekan “Call a server” di atas untuk menghantar permintaan bantuan simulasi kepada staf.',
    checkout: 'Semak troli, kemudian tekan “Send to staff”. Tiket dapur simulasi hanya dihantar selepas kelulusan staf. Tiada bayaran sebenar.',
    cart: ({count,amount}) => `Troli anda ada ${count} item dengan jumlah contoh ${amount}. Kuantiti boleh diubah dalam troli.`,
    emptyCart: 'Troli anda masih kosong. Nak cuba hidangan untuk dikongsi?',
    dietary: 'Saya tidak dapat mengesahkan status halal, vegetarian atau vegan berdasarkan menu contoh ini. Sila semak dengan staf sebelum memilih. Tiada hidangan ditambah.',
    recommendation: ({pax,amount,dishes,details}) => `Untuk ${pax} orang, bagaimana dengan ${dishes}? Jumlah cadangan: ${amount}${details?` (${details})`:''}. Jumlah ini tidak termasuk hidangan sedia ada dalam troli. Resipi dan saiz hidangan perlu disahkan oleh staf. Semak di bawah atau minta pilihan lain.`,
    noRecommendation: 'Tiada gabungan hidangan yang memenuhi pilihan dan bajet ini. Cuba naikkan bajet, ubah pilihan atau lihat menu. Troli anda tidak berubah.',
    excluded: 'Troli anda tidak berubah. Gunakan butang tolak untuk membuang hidangan, atau beritahu saya apa yang hendak ditambah.',
    unavailable: 'Hidangan itu tidak tersedia dalam demo ini. Sila pilih hidangan lain daripada menu.',
    selected: 'Pilihan anda tersedia di bawah. Semak kuantiti, saiz dan nota sebelum menambahkannya ke troli. Belum dihantar kepada staf.',
    menu: 'Lihat menu di sebelah perbualan ini, atau di bawah pada telefon. Setiap hidangan boleh disesuaikan dan ditambah ke troli yang sama.',
    fallback: 'Saya membalas daripada skrip tetap, bukan perbualan bebas. Cuba “cadangan untuk 4 orang, tidak pedas”, tanya harga, atau gunakan perancang hidangan. Anda juga boleh memanggil staf.',
    added: 'Sudah ditambah ke troli. Semak dan ubah jika perlu, kemudian hantar kepada staf apabila sedia.',
    submitted: ({id}) => `Pesanan ${id} menunggu kelulusan staf. Buka Staff untuk menyemaknya, kemudian Kitchen untuk mengikuti simulasi memasak.`,
    placeholder: 'Ah Hua, cadangan untuk empat orang?',
  },
  fr: {
    welcome: `Bienvenue. Je suis ${host}, l’hôte de votre table. Indiquez un plat, un prix, ou le nombre de convives et un budget. Je réponds à partir d’un script fixe dans cette démo.`,
    switched: 'Bien sûr, je vous répondrai en français. Votre panier reste inchangé. Que souhaitez-vous manger ?',
    voiceEnabled: 'Je vais lire cette réponse scriptée en français. Indiquez un plat, ou demandez une suggestion.',
    allergy: 'En cas d’allergie, utilisez « Call a server » et consultez le personnel. Les recettes et allergènes de ce menu de démonstration ne sont pas vérifiés. Je ne peux garantir la sécurité d’aucun plat. Aucun ajout au panier.',
    call: 'Appuyez sur « Call a server » pour envoyer une demande d’aide simulée au personnel.',
    checkout: 'Vérifiez votre panier, puis appuyez sur « Send to staff ». La commande simulée ne passe en cuisine qu’après validation du personnel. Aucun paiement réel.',
    cart: ({count,amount}) => `Votre panier contient ${count} articles pour un total indicatif de ${amount}. Vous pouvez modifier les quantités dans le panier.`,
    emptyCart: 'Votre panier est vide. Commençons par quelques plats à partager ?',
    dietary: 'Ce menu de démonstration ne permet pas de confirmer qu’un plat est végétarien, végétalien ou halal. Veuillez consulter le personnel avant de choisir. Aucun plat ajouté.',
    recommendation: ({pax,amount,dishes,details}) => `Pour ${pax} personnes, que diriez-vous de ${dishes} ? Total proposé : ${amount}${details?` (${details})`:''}. Ce total exclut les plats déjà dans votre panier. Les recettes et les portions doivent être confirmées par le personnel. Vérifiez ci-dessous ou demandez une autre suggestion.`,
    noRecommendation: 'Aucune combinaison ne correspond à ces préférences et à ce budget. Essayez un budget plus élevé, modifiez vos préférences ou consultez le menu. Aucun ajout au panier.',
    excluded: 'Je n’ai pas modifié votre panier. Utilisez les boutons moins pour retirer des plats, ou dites-moi ce que vous souhaitez ajouter.',
    unavailable: 'Ces plats ne sont pas disponibles dans cette démonstration. Veuillez en choisir d’autres dans le menu.',
    selected: 'Votre sélection est prête ci-dessous. Vérifiez les quantités, les portions et les notes avant de l’ajouter au panier. Rien n’a encore été envoyé au personnel.',
    menu: 'Le menu se trouve à côté de la conversation, ou en dessous sur votre téléphone. Personnalisez vos plats et ajoutez-les au même panier.',
    fallback: 'Je réponds à partir d’un script fixe, pas d’une conversation libre. Essayez « conseillez-moi pour 4 personnes, pas épicé », demandez un prix, ou utilisez le planificateur. Vous pouvez aussi appeler le personnel.',
    added: 'La sélection a été ajoutée au panier. Vérifiez-la et apportez vos modifications avant de l’envoyer au personnel.',
    submitted: ({id}) => `La commande ${id} attend la validation du personnel. Ouvrez Staff pour la vérifier, puis Kitchen pour suivre la préparation simulée.`,
    placeholder: 'Ah Hua, que conseillez-vous pour quatre personnes ?',
  }
};
for (const [language, entries] of Object.entries(extraMessages)) {
  for (const [key, value] of Object.entries(entries)) messages[key][language] = value;
}
export function replyText(language, key, data = {}) {
  const entry = messages[key]?.[normaliseLanguage(language)];
  if (!entry) throw Error(`Unknown reply message: ${key}`);
  return typeof entry === 'function' ? entry(data) : entry;
}

const ui = {
  en: { plan:'Let’s plan your meal', people:'People', budget:'Budget for this suggestion', any:'Any', spice:'Spice preference', mild:'Mild', spicy:'Spicy', avoid:'Leave out', none:'Nothing', pork:'Pork dishes', fish:'Fish dishes', build:'Find my meal →', another:'Another suggestion', cheaper:'Try a lower budget', edit:'Change preferences', remove:'Remove', suggestion:'A suggestion for your table', add:'Add suggestion to cart +', dismiss:'Dismiss', recommend:'✧ Help me choose', review:'Review my cart', voiceNote:'Replies and microphone use your selected language. Voices depend on your device.', price:'Sample price', verify:'Recipes, allergens and prices need staff confirmation.', quickAdd:'Quick +1', customise:'Customise', soupRefill:'🍲 Refill broth', teaRefill:'🍵 Refill hot tea', extraBowls:'🥢 Bowls & cutlery', cutChilli:'🌶️ Extra chilli dip', extraWipes:'🧻 Napkins & wipes', tableBill:'🧾 View & split bill', splitBy:'Split evenly by', perPerson:'per diner (sample)', round:'Round', orderPlaced:'Order sent to staff!', orderPlacedDesc:'Staff will review your items before cooking starts.', callService:'🛎️ Need table assistance?', callServiceDesc:'Select what your table needs and our floor staff will bring it over.', potGuide:'🍲 Pot Cooking Guide & Timers', payShare:'Pay my share (Simulated)', reviewOrder:'Review table order', chooseLang:'Language / 语言', filterAll:'All items', filterSignatures:'👑 ★ Signatures', filterMild:'Non-spicy', filterNoPork:'No pork', welcomeTitle:'Welcome to Table ', tableSubtitle:'A fictional steamboat house for this concept demo. Order in rounds, or ask Ah Hua. Replies come from a fixed script.', shareBill:'📲 Share / Copy bill for WhatsApp & PayNow', copiedBill:'Bill breakdown copied! Ready to paste into WhatsApp group.', elderMode:'Aa Large Text', standardMode:'Aa Standard', orderedBadge:'ordered' },
  zh: { plan:'一起选一桌好菜', people:'人数', budget:'此次建议预算', any:'不限', spice:'辣度偏好', mild:'不辣', spicy:'辣', avoid:'避开菜品', none:'无', pork:'猪肉菜品', fish:'鱼类菜品', build:'为我推荐 →', another:'换一组推荐', cheaper:'试试更低预算', edit:'修改偏好', remove:'移除', suggestion:'为您推荐', add:'加入购物车 +', dismiss:'暂不选择', recommend:'✧ 帮我选菜', review:'查看购物车', voiceNote:'回复和麦克风使用所选语言，语音取决于设备。', price:'示例起价', verify:'食谱、过敏原和价格均需员工确认。', quickAdd:'快加 +1', customise:'选规格/口味', soupRefill:'🍲 加鱼头炉高汤', teaRefill:'🍵 续热茶/热水', extraBowls:'🥢 添碗筷餐具', cutChilli:'🌶️ 加生抽小辣椒', extraWipes:'🧻 湿巾与纸巾', tableBill:'🧾 账单与AA分摊', splitBy:'分摊人数', perPerson:'每位分摊（示例）', round:'第', orderPlaced:'订单已发送给服务员！', orderPlacedDesc:'服务员审核确认后，后厨将立即开始烹饪。', callService:'🛎️ 桌面贴心呼叫', callServiceDesc:'请选择您的桌面需求，服务员将立即送至桌前。', potGuide:'🍲 鱼头炉涮煮指南与计时', payShare:'模拟支付我的一份', reviewOrder:'查看整桌订单', chooseLang:'语言选择', filterAll:'全部菜品', filterSignatures:'👑 必点招牌', filterMild:'不辣口味', filterNoPork:'不含猪肉', welcomeTitle:'欢迎光临 · 第 ', welcomeTitleSuffix:' 桌', tableSubtitle:'这是虚构鱼头炉的概念演示。可分轮下单，或问阿华。回复来自固定脚本，不是在线客服。', shareBill:'📲 复制账单与AA分账明细 (微信/WhatsApp)', copiedBill:'账单明细已复制！可直接粘贴至微信或群聊。', elderMode:'Aa 大字模式', standardMode:'Aa 标准字', orderedBadge:'已下单' },
  singlish: { plan:'Come, we plan your makan', people:'How many people?', budget:'Budget for this set', any:'Anything can', spice:'Want spicy?', mild:'Not spicy', spicy:'Spicy can', avoid:'Leave out', none:'Nothing', pork:'Pork dishes', fish:'Fish dishes', build:'Help me choose lah →', another:'Another combination, can?', cheaper:'Try cheaper, can?', edit:'Change my preferences', remove:'Remove', suggestion:'How about this for your table?', add:'Add to cart +', dismiss:'Maybe later', recommend:'✧ What’s good ah?', review:'Check my cart', voiceNote:'Singlish replies · Singapore English voice where available.', price:'Sample price starts from', verify:'These details must check with staff first, okay?', quickAdd:'Quick +1', customise:'Customise', soupRefill:'🍲 Top up soup', teaRefill:'🍵 Refill hot tea', extraBowls:'🥢 Extra bowls & spoon', cutChilli:'🌶️ Extra chilli padi', extraWipes:'🧻 Extra wet tissue', tableBill:'🧾 Check & split bill', splitBy:'Split by how many pax', perPerson:'per pax (sample)', round:'Round', orderPlaced:'Order sent to staff already!', orderPlacedDesc:'Staff will double confirm before kitchen fire up wok.', callService:'🛎️ Call waiter for table', callServiceDesc:'Tap what you need, staff will bring over to your table.', potGuide:'🍲 Steamboat Guide & Timers', payShare:'Pay my share lah (Demo)', reviewOrder:'Check table order', chooseLang:'Choose Language', filterAll:'All items', filterSignatures:'👑 Top must-order', filterMild:'Not spicy', filterNoPork:'No pork', welcomeTitle:'Welcome to Table ', tableSubtitle:'Fictional steamboat house for this concept demo. Order in rounds, or ask Ah Hua. Fixed script only, can?', shareBill:'📲 Copy bill for WhatsApp / PayNow lah', copiedBill:'Bill copied already! Send to table group now.', elderMode:'Aa Big Text', standardMode:'Aa Standard', orderedBadge:'ordered already' },
  ms: { plan:'Jom rancang hidangan anda', people:'Bilangan orang', budget:'Bajet cadangan ini', any:'Tiada had', spice:'Tahap kepedasan', mild:'Tidak pedas', spicy:'Pedas', avoid:'Elakkan', none:'Tiada', pork:'Hidangan daging babi', fish:'Hidangan ikan', build:'Cadangkan hidangan →', another:'Cadangan lain', cheaper:'Cuba bajet lebih rendah', edit:'Ubah pilihan', remove:'Buang', suggestion:'Cadangan untuk meja anda', add:'Tambah ke troli +', dismiss:'Batal', recommend:'✧ Bantu saya memilih', review:'Semak troli saya', voiceNote:'Jawapan dan mikrofon menggunakan bahasa pilihan anda. Suara bergantung pada peranti.', price:'Harga contoh bermula', verify:'Resipi, alergen dan harga perlu disahkan oleh staf.', quickAdd:'Tambah +1', customise:'Suaikan', soupRefill:'🍲 Tambah kuah sup', teaRefill:'🍵 Tambah teh panas', extraBowls:'🥢 Mangkuk & sudu', cutChilli:'🌶️ Cili padi kicap', extraWipes:'🧻 Tisu basah ekstra', tableBill:'🧾 Bil & kongsi bil', splitBy:'Bahagi mengikut', perPerson:'setiap orang (contoh)', round:'Pusingan', orderPlaced:'Pesanan dihantar kepada staf!', orderPlacedDesc:'Staf akan menyemak sebelum dapur mula memasak.', callService:'🛎️ Perlukan bantuan meja?', callServiceDesc:'Pilih keperluan meja anda dan staf akan membawanya.', potGuide:'🍲 Panduan Memasak & Pemasa', payShare:'Bayar bahagian saya (Simulasi)', reviewOrder:'Semak pesanan meja', chooseLang:'Pilih Bahasa', filterAll:'Semua item', filterSignatures:'👑 Pilihan Utama', filterMild:'Tidak pedas', filterNoPork:'Tanpa babi', welcomeTitle:'Selamat datang ke Meja ', tableSubtitle:'Rumah steamboat rekaan untuk demo ini. Pesan mengikut pusingan, atau tanya Ah Hua. Jawapan daripada skrip tetap.', shareBill:'📲 Salin pecahan bil untuk WhatsApp / PayNow', copiedBill:'Pecahan bil disalin! Boleh tampal ke kumpulan WhatsApp.', elderMode:'Aa Teks Besar', standardMode:'Aa Standard', orderedBadge:'dipesan' },
  fr: { plan:'Composons votre repas', people:'Nombre de personnes', budget:'Budget de cette suggestion', any:'Sans limite', spice:'Préférence épicée', mild:'Doux', spicy:'Épicé', avoid:'Écarter', none:'Aucune', pork:'Plats de porc', fish:'Plats de poisson', build:'Proposer mon repas →', another:'Une autre suggestion', cheaper:'Essayer un budget plus bas', edit:'Modifier mes préférences', remove:'Retirer', suggestion:'Une suggestion pour votre table', add:'Ajouter au panier +', dismiss:'Ignorer', recommend:'✧ Aidez-moi à choisir', review:'Voir mon panier', voiceNote:'Réponses et microphone dans la langue choisie. Les voix dépendent de votre appareil.', price:'Prix indicatif à partir de', verify:'Recettes, allergènes et prix à confirmer auprès du personnel.', quickAdd:'Ajout +1', customise:'Options', soupRefill:'🍲 Rajouter du bouillon', teaRefill:'🍵 Remplir le thé chaud', extraBowls:'🥢 Bols et couverts', cutChilli:'🌶️ Piment & soja', extraWipes:'🧻 Serviettes & rince-doigts', tableBill:'🧾 Addition et partage', splitBy:'Partager entre', perPerson:'par convive (exemple)', round:'Service', orderPlaced:'Commande transmise au personnel !', orderPlacedDesc:'Le personnel valide avant le début de la cuisson.', callService:'🛎️ Besoin d’aide à table ?', callServiceDesc:'Sélectionnez votre demande et un serveur vous l’apportera.', potGuide:'🍲 Guide fondue & minuteurs', payShare:'Payer ma part (Simulé)', reviewOrder:'Voir la commande', chooseLang:'Choisir la langue', filterAll:'Tous les articles', filterSignatures:'👑 Incontournables', filterMild:'Non épicé', filterNoPork:'Sans porc', welcomeTitle:'Bienvenue à la table ', tableSubtitle:'Maison de steamboat fictive pour cette démo. Commandez par service, ou demandez à Ah Hua. Réponses d’un script fixe.', shareBill:'📲 Partager / Copier l’addition pour WhatsApp', copiedBill:'Détail de l’addition copié ! Prêt à partager.', elderMode:'Aa Grand texte', standardMode:'Aa Standard', orderedBadge:'commandé' }
};
export const uiText = (language, key) => ui[normaliseLanguage(language)][key] || ui.en[key];
export function plannerMessage(language, pax, budget) {
  const amount = budget!==null ? `S$${(budget/100).toFixed(2)}` : uiText(language,'any');
  return ({en:`Help me plan a meal for ${pax}. Budget: ${amount}.`,zh:`请为 ${pax} 位推荐，预算：${amount}。`,singlish:`${pax} people, help me choose ah. Budget: ${amount}.`,ms:`Cadangkan hidangan untuk ${pax} orang. Bajet: ${amount}.`,fr:`Proposez un repas pour ${pax} personnes. Budget : ${amount}.`})[normaliseLanguage(language)];
}
const dishNames = {
  ms: {grouper:'Sup steamboat kepala ikan kerapu',pomfret:'Steamboat ikan bawal',snapper:'Steamboat ikan merah',chicken:'Ayam pes udang',pork:'Perut babi istimewa',ribs:'Rusuk babi masam manis',tofu:'Tauhu buatan sendiri',kang:'Kangkung sambal',egg:'Telur dadar tiram',rice:'Nasi putih',yam:'Keladi rangup & gelembung ikan',mushroom:'Set cendawan enoki & tauhu pok',tea:'Teh Pu’er tua (teko)',calamansi:'Jus limau kasturi asam boi',barley:'Air barli pandan buatan sendiri'},
  fr: {grouper:'Fondue de tête de mérou',pomfret:'Fondue de pomfret',snapper:'Fondue de vivaneau',chicken:'Poulet à la pâte de crevettes',pork:'Poitrine de porc maison',ribs:'Travers de porc aigre-doux',tofu:'Tofu maison',kang:'Liseron d’eau au sambal',egg:'Omelette aux huîtres',rice:'Riz blanc',yam:'Taro croustillant et vessie de poisson',mushroom:'Assortiment enoki dorés et tofu frit',tea:'Thé Pu’er affiné (théière)',calamansi:'Jus de calamansi à la prune salée',barley:'Eau d’orge au pandan maison'}
};
export const dishName = (language, dish) => language==='zh' ? dish.cn : dishNames[language]?.[dish.id] || dish.name;

export const categoryNames = {
  zh: {
    'All dishes': '全部菜品',
    'Set Menus': '精选套餐',
    'Steamboat': '鱼头炉',
    'Specialty': '特质佳肴',
    'Crayfish & Seafood': '虾婆与海鲜',
    'Chicken & Pork': '鸡与猪肉',
    'Egg & Tofu': '蛋与豆腐',
    'Vegetables': '时蔬菜类',
    'Rice & Noodles': '主食饭面',
    'Soup': '热汤类',
    'Drinks & Tea': '传统饮品'
  },
  ms: {
    'All dishes': 'Semua Hidangan',
    'Set Menus': 'Set Hidangan',
    'Steamboat': 'Steamboat Ikan',
    'Specialty': 'Istimewa',
    'Crayfish & Seafood': 'Udang & Makanan Laut',
    'Chicken & Pork': 'Ayam & Daging Babi',
    'Egg & Tofu': 'Telur & Tauhu',
    'Vegetables': 'Sayur-sayuran',
    'Rice & Noodles': 'Nasi & Mee',
    'Soup': 'Sup',
    'Drinks & Tea': 'Minuman & Teh'
  },
  fr: {
    'All dishes': 'Tous les plats',
    'Set Menus': 'Menus Découverte',
    'Steamboat': 'Fondue de poisson',
    'Specialty': 'Spécialités',
    'Crayfish & Seafood': 'Écrevisses & Fruits de mer',
    'Chicken & Pork': 'Poulet & Porc',
    'Egg & Tofu': 'Œufs & Tofu',
    'Vegetables': 'Légumes',
    'Rice & Noodles': 'Riz & Nouilles',
    'Soup': 'Soupes',
    'Drinks & Tea': 'Boissons & Thé'
  }
};
export const categoryName = (language, cat) => categoryNames[normaliseLanguage(language)]?.[cat] || cat;
