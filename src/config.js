/**
 * TableHua brand, pricing, contact, and the demo restaurant.
 * Swap `restaurant` when another house tries the demo.
 * `exampleRestaurant` is an unused sample of that shape.
 * The WhatsApp buttons use contact.whatsappNumber. Do not put a personal name in this file.
 */

export const brand = {
  productName: 'TableHua',
  productNameZh: '招呼',
  wordmark: 'TableHua 招呼',
  line: 'TableHua, with Ah Hua your table host.',
  tagline: 'Ah Hua serves every table.',
  taglineZh: '每一桌，都有阿华招呼。',
  colors: {
    red: '#982226',
    cream: '#F6F1E7',
    charcoal: '#2C2826',
    jade: '#1F6A58'
  }
};

export const pricing = {
  monthlyPerOutlet: 129,
  perBillFee: 0,
  setup: 300,
  founding: {
    restaurantCap: 10,
    months: 3,
    monthlyPerOutlet: 69
  }
};

/** What TableHua is not. Kept next to the price so the offer stays honest. */
export const outOfScope = [
  'Delivery',
  'A full point-of-sale',
  'Taking the payment ourselves'
];

export const contact = {
  cta: 'WhatsApp us',
  /** Singapore 9630 4128, digits only with country code. */
  whatsappNumber: '6596304128',
  whatsappMessage: "Hi, I'd like to know more about TableHua"
};

export const site = {
  url: 'https://ahhua.vercel.app',
  locale: 'en_SG'
};

export const restaurant = {
  name: 'Nan Hwa Chong Fish Head Steamboat',
  nameZh: '南华昌',
  shortName: 'Nan Hwa Chong',
  alsoKnownAs: '南华昌 (亚秋)',
  cornerName: 'Nan Hwa Chong (南华昌) Fish Head Steamboat Corner',
  cuisine: 'Authentic charcoal fish head steamboat and Teochew zi char',
  fictional: false,
  established: 1927,
  heritageLine: 'NAN HWA CHONG · EST. 1927 · 百年老字号传统炭火鱼头炉',
  blurb: 'Traditional Teochew charcoal fish-head steamboat since 1927, at the corner of North Bridge Road and Jalan Sultan.',
  addressLines: ['812/814/816 North Bridge Road', 'Singapore 198779'],
  addressNote: 'North Bridge Road & Jalan Sultan · Singapore',
  billLocation: '812/814/816 North Bridge Rd · Est. 1927',
  phone: '+65 6297 9719',
  hostName: 'Ah Hua',
  hostNameZh: '阿华',
  hostRole: 'table host',
  receiptLegalName: 'Nan Hwa Chong (1927) Pte. Ltd.',
  receiptLegalNameZh: '南华昌（1927）私人有限公司',
  gstReg: 'M9-0012345-X',
  regNo: '192700012K',
  paynowDisplayName: 'NAN HWA CHONG STEAMBOAT PTE. LTD.',
  paynowUen: '201619270H',
  receiptPrefix: 'NHC',
  staffPin: '1927',
  staffPinHint: 'Demo PIN',
  logo: 'https://ucarecdn.com/3fcbba39-c037-4087-9aa9-c018c3ec8d87/-/crop/330x330/144,0/-/preview/',
  demoPath: '/demo'
};

/** Unused example. Copy these fields onto `restaurant` to point the demo at another house. */
export const exampleRestaurant = {
  name: 'Hua Yuan Steamboat House',
  nameZh: '华园鱼头炉',
  shortName: 'Hua Yuan',
  alsoKnownAs: '华园',
  cornerName: 'Hua Yuan Steamboat House (华园鱼头炉)',
  cuisine: 'Charcoal fish-head steamboat and Teochew-style zi char',
  fictional: true,
  established: null,
  heritageLine: 'HUA YUAN · CONCEPT DEMO',
  blurb: 'A fictional neighbourhood steamboat house. Not used unless copied over restaurant.',
  addressLines: ['18 Concept Lane', '#01-08'],
  addressNote: 'Fictional address. Not a real outlet.',
  billLocation: '18 Concept Lane · concept demo',
  phone: 'TODO',
  hostName: 'Ah Hua',
  hostNameZh: '阿华',
  hostRole: 'table host',
  receiptLegalName: 'Hua Yuan Steamboat House (demo)',
  receiptLegalNameZh: '华园鱼头炉（演示）',
  gstReg: 'Sample only — not GST registered',
  regNo: 'DEMO-NOT-REGISTERED',
  paynowDisplayName: 'HUA YUAN STEAMBOAT HOUSE (DEMO)',
  paynowUen: 'DEMO-NOT-A-UEN',
  receiptPrefix: 'HY',
  staffPin: '1927',
  staffPinHint: 'Demo floor PIN',
  logo: '/assets/seal.png',
  demoPath: '/demo'
};

export function sgd(amount) {
  return `S$${amount}`;
}

export function whatsappHref() {
  const n = String(contact.whatsappNumber || '');
  if (!/^[0-9]{8,15}$/.test(n)) return '';
  const text = encodeURIComponent(contact.whatsappMessage || '');
  return text ? `https://wa.me/${n}?text=${text}` : `https://wa.me/${n}`;
}

export function restaurantAddress() {
  return restaurant.addressLines.join(', ');
}

export function demoUrl(table) {
  const base = `${site.url}${restaurant.demoPath}`;
  return table ? `${base}?table=${encodeURIComponent(table)}` : base;
}

/** Swap the default host name if a restaurant configures another captain. */
export function applyHost(text) {
  return String(text ?? '')
    .replaceAll('Ah Hua', restaurant.hostName)
    .replaceAll('阿华', restaurant.hostNameZh);
}
