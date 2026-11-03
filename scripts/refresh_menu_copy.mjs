import { readFileSync, writeFileSync } from 'node:fs';

/** Distinct sample descriptions. Illustrative, not a verified recipe card. */
const DESC = {
  'sambal-fish-head': 'Fish head wokked in dried-chilli sambal with onion and tomato. The table can ask for less heat.',
  'bittergourd-fish-head': 'Fish head simmered with bitter gourd until the melon turns sweet and the gravy stays light.',
  'imperial-pot': 'A large clay pot of prawn, scallop, fish maw and greens in a thick gravy, for the whole table.',
  'fried-shrimp-roll': 'Minced prawn and water chestnut in a crisp beancurd-skin roll, with a sweet dip.',
  'fresh-prawn-paste-for-steamboat': 'Bouncy minced prawn to scoop into the pot. It is ready a moment after it floats.',
  'butter-crayfish': 'Crayfish tossed in milk butter, curry leaves and cereal crumbs. Rich, and meant to share.',
  'cereal-crayfish': 'Crayfish in a toasted cereal crust with curry leaf. More of the crunch, less of the sauce.',
  'chilli-crayfish': 'Crayfish in a hot dried-chilli sauce. Ask the kitchen to hold the spice if children are eating.',
  'salted-egg-prawns': 'Prawns coated in a salted-egg crumb that is rich and a little sandy. Best with rice.',
  'butter-prawns': 'Prawns in a light milk-butter sauce with curry leaves. Softer than the cereal version.',
  'cereal-prawns': 'Prawns rolled in toasted oats and curry leaf. A smaller plate than the crayfish.',
  'salted-egg-squid': 'Squid rings in salted-egg crumb. Order it crisp, and eat it before it softens.',
  'butter-squid': 'Squid in a gentle butter sauce. A milder plate when the table does not want cereal or sambal.',
  'cereal-squid': 'Squid in a thin toasted-cereal coat. Lighter than the salted-egg squid.',
  'sambal-squid': 'Squid wokked quickly with sambal so the rings stay tender and the chilli stays fragrant.',
  'sambal-lala': 'Clams opened in a spicy sambal broth. The sauce is the point; keep a spoon for the rice.',
  'ginger-onion-lala': 'Clams with ginger and spring onion, not chilli. A clear plate next to a hot one.',
  'marmite-chicken-chop': 'A fried chicken chop glazed with savoury Marmite. Familiar, and not spicy.',
  'spicy-diced-chicken': 'Diced chicken with dried chilli, cashew and a little sweetness. The gong bao style of the house.',
  'sesame-oil-chicken': 'Chicken warmed in sesame oil and ginger. A quiet dish for elders, or for late in the meal.',
  'salted-egg-chicken': 'Chicken pieces in a salted-egg crust. Richer than the sesame chicken, and good with greens.',
  'braised-pig-intestine': 'Pork intestine braised until soft in a dark soy gravy. A small plate, not a main.',
  'braised-pig-trotters': 'Trotters braised until the skin is soft and the sauce is dark. Share it, and add rice.',
  'sweet-and-sour-pork': 'Pork in a bright sweet-sour glaze, distinct from the sticky pork-rib plate.',
  'marmite-pork-ribs': 'Ribs with a savoury Marmite glaze. Less sweet than the sweet-and-sour ribs.',
  'salted-egg-pork-ribs': 'Ribs in a salted-egg crumb. Salty and rich; one plate is enough for four.',
  'bittergourd-pork-ribs': 'Ribs braised with bitter gourd so the melon softens and the sauce stays light.',
  'onion-omelette': 'A soft egg pancake folded with plenty of sweet onion. A simple plate between heavier dishes.',
  'salted-turnip-omelette': 'Egg with chopped salted turnip. Savoury, and a little drier than the onion omelette.',
  'fu-rong-omelette': 'A fluffy egg omelette with prawn and crab stick, finished with a light gravy.',
  'minced-pork-omelette': 'Egg wrapped around seasoned minced pork. More filling than the plain onion omelette.',
  'bittergourd-omelette': 'Egg with bitter gourd. The melon is there for taste, not hidden.',
  'prawn-omelette': 'Egg studded with small prawns. Cleaner than the oyster omelette, and less rich.',
  'braised-beancurd': 'Soft beancurd in a brown braise with a little minced pork. A quiet plate next to the wok dishes.',
  'minced-pork-fried-beancurd': 'Fried beancurd with minced pork on top. The skin stays crisp if it is eaten soon.',
  'chilli-prawns-witih-beancurd': 'Prawns and fried beancurd in a chilli gravy. The beancurd takes up the sauce.',
  'kai-lan': 'Young kai lan stir-fried with garlic. A plain green, at a plain-green price.',
  'nai-bai': 'Nai bai, or milk cabbage, stir-fried with garlic. A soft leaf, priced with the other simple greens.',
  'four-heavenly-king': 'Four greens in one wok: a bitter, a sweet, a crunchy and a leafy. A mixed vegetable plate.',
  'sambal-sweet-potato-leaves': 'Sweet-potato leaves wokked with sambal. More heat than the garlic greens.',
  'salted-fish-beansprout': 'Beansprouts tossed with a little salted fish. The fish is seasoning, not a fillet.',
  'spinach': 'Spinach stir-fried quickly with garlic so the leaves stay bright.',
  'vegetarian-mixed-vegetables': 'A Buddhist-style mixed vegetable braise, without meat. Ask the floor to confirm the stock.',
  'salted-turnip-french-bean': 'French beans with salted turnip. Drier and more savoury than a plain garlic green.',
  'minced-meat-with-eggplant': 'Eggplant softened in the wok with a little minced pork. The sauce is for rice.',
  'salted-egg-with-bittergourd': 'Bitter gourd in a salted-egg sauce. The melon stays slightly bitter on purpose.',
  'stir-fried-broccoli': 'Broccoli florets stir-fried with garlic. A plain green, not the scallop plate.',
  'cuttlefish-kang-kong': 'Kang kong with sliced cuttlefish. The leaf is there; the seafood is why it costs more.',
  'broccoli-with-scallops': 'Broccoli with plump scallops. This is a seafood plate, not a side of greens.',
  'braised-sea-cucumber': 'Sea cucumber braised in a brown sauce. A banquet dish, priced as one.',
  'mui-fan': 'Rice in a light gravy with a little meat and vegetable. A one-bowl plate, not a shared zi char.',
  'fried-rice': 'Singapore-style fried rice with prawn, char siu and egg. A bowl, not a banquet portion.',
  'sambal-fried-rice': 'Fried rice finished with sambal. Hotter than the plain fried rice.',
  'salted-fish-fried-rice': 'Fried rice with salted fish. Savoury, and drier than the seafood fried rice.',
  'seafood-fried-rice': 'Fried rice with prawn and squid. A step up from the plain bowl.',
  'spicy-diced-chicken-rice': 'Rice topped with the spicy diced chicken. A single portion of that dish.',
  'sweet-sour-pork-rib-rice': 'Rice with a serving of the sweet-and-sour pork ribs.',
  'black-pepper-pork-meat-rice': 'Rice with pork in a black-pepper sauce. Peppery, not chilli-hot.',
  'ginger-pork-meat-rice': 'Rice with pork and plenty of ginger and spring onion.',
  'ginger-sliced-fish-with-rice': 'Rice with sliced fish, ginger and spring onion. A lighter bowl than the pork rice.',
  'pomfret-porridge': 'Rice porridge with pomfret. Soft fish, and a bowl rather than a shared pot.',
  'snapper-porridge': 'Rice porridge with snapper. A firmer fish than the pomfret porridge.',
  'hor-fun': 'Flat rice noodles in a light gravy with mixed toppings. The house “assorted” hor fun.',
  'hokkien-noodles': 'Yellow noodles and bee hoon tossed with prawn and squid stock. A classic plate, not a soup.',
  'ee-mian': 'Thick yi mein in gravy. Heavier than the hor fun, and usually shared.',
  'bee-hoon': 'Rice vermicelli with mixed toppings in a light sauce. The plain sibling of the fried bee hoon.',
  'fried-ee-fu-noodles': 'Yi mein fried dry, without the gravy. A crisp contrast to the wet ee mian.',
  'fried-bee-hoon': 'Bee hoon fried dry until the strands separate. Not the soup version.',
  'seafood-bee-hoon': 'A smaller seafood bee hoon, wetter than the dry-fried plate.',
  'crispy-bee-hoon': 'Bee hoon fried as a crisp cake, then sauced. The texture is the point.',
  'hong-kong-fried-noodles': 'Thin noodles fried in the Hong Kong style, with a little soy and vegetable.',
  'mee-goreng': 'Spiced yellow noodles, Malay style, with a little sweetness and chilli.',
  'shan-lao-hor-fun': 'Hor fun “three ways”: a little dry, a little wet, a little crisp, on one plate.',
  'fried-hor-fun': 'Hor fun fried dry, without gravy. Simpler than the seafood hor fun.',
  'seafood-hor-fun': 'Hor fun with prawn and squid in a light gravy.',
  'pomfret-bee-hoon-soup': 'Bee hoon in a clear soup with pomfret. A bowl, not the steamboat.',
  'snapper-bee-hoon-soup': 'Bee hoon soup with snapper. Cleaner and firmer than the pomfret bowl.',
  'seafood-soup': 'A clear soup of prawn, squid and a little vegetable. Lighter than the fish soups.',
  'seaweed-soup': 'A short soup of egg and seaweed. A palate plate, not a main.',
  'bittergourd-soup': 'Pork and bitter gourd in a clear soup. The melon is the flavour.',
  'tofu-soup': 'Soft beancurd in a clear soup. Gentle, and useful next to a spicy wok dish.',
  'pomfret-soup': 'Pomfret in a clear ginger soup. The fish is sliced, not a whole steamboat.',
  'snapper-soup': 'Snapper in a clear soup. A smaller bowl than the snapper steamboat.',
  'grouper-soup': 'Grouper in a clear soup. Mild and firm, without the charcoal pot.',
  'song-fish-head-fishboat': 'Song fish, or big-head carp, in a charcoal pot. A freshwater fish with a softer price than pomfret.'
};

let src = readFileSync('src/domain.js', 'utf8');
src = src.replace(
  '// Authentic Nan Hwa Chong (南华昌) Fish Head Steamboat & Traditional Zi Char Menu',
  '// Sample steamboat and zi char menu for the fictional demo house. Descriptions are illustrative.'
);
src = src.replace('"name": "Song Fish Head Fishboat"', '"name": "Song Fish Head Steamboat"');
src = src.replace('"name": "Chilli Prawns witih Beancurd"', '"name": "Chilli Prawns with Beancurd"');
src = src.replaceAll('chilli prawns witih beancurd', 'chilli prawns with beancurd');
src = src.replace(/("id": "nai-bai"[\s\S]*?"price": )2280/, '$11280');

for (const [id, desc] of Object.entries(DESC)) {
  const re = new RegExp(`("id": "${id}"[\\s\\S]*?"desc": )"(?:\\\\.|[^"\\\\])*"`);
  if (!re.test(src)) throw new Error(`missing dish ${id}`);
  const safe = desc.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  src = src.replace(re, `$1"${safe}"`);
}

src = src.replace('"id": "chilli-prawns-witih-beancurd"', '"id": "chilli-prawns-with-beancurd"');
if (/witih|Nan Hwa Chong dish freshly cooked/.test(src)) {
  throw new Error('old copy still present');
}
writeFileSync('src/domain.js', src);
console.log(`updated ${Object.keys(DESC).length} descriptions`);
