/**
 * TableHua brand, pricing, contact, and the demo restaurant.
 * Change this file when a real client replaces the fictional house.
 * Leave contact.whatsappNumber as TODO until Marcus supplies a number.
 * Do not invent a phone number.
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
  person: 'Marcus',
  cta: 'WhatsApp Marcus',
  /**
   * TODO: replace with Marcus’s WhatsApp number.
   * Digits only, country code included, no plus and no spaces.
   * Example shape, not a real number: 6591234567
   */
  whatsappNumber: 'TODO'
};

export const site = {
  url: 'https://ahhua.vercel.app',
  locale: 'en_SG'
};

export const restaurant = {
  name: 'Hua Yuan Steamboat House',
  nameZh: '华园鱼头炉',
  shortName: 'Hua Yuan',
  cuisine: 'Charcoal fish-head steamboat and Teochew-style zi char',
  fictional: true,
  blurb: 'A fictional neighbourhood steamboat house used to show TableHua. Replace this block when a real restaurant goes live.',
  addressLines: ['18 Concept Lane', '#01-08'],
  addressNote: 'Fictional address for this demo. Not a real outlet.',
  // TODO: set a real client phone here. Leave TODO until then.
  phone: 'TODO',
  hostName: 'Ah Hua',
  hostNameZh: '阿华',
  hostRole: 'table host',
  receiptLegalName: 'Hua Yuan Steamboat House (demo)',
  receiptLegalNameZh: '华园鱼头炉（演示）',
  regNo: 'DEMO-NOT-REGISTERED',
  paynowDisplayName: 'HUA YUAN STEAMBOAT HOUSE (DEMO)',
  paynowUen: 'DEMO-NOT-A-UEN',
  receiptPrefix: 'HY',
  /** Demo floor PIN. It opens the simulated staff and kitchen views. It is not a founding year. */
  staffPin: '1927',
  staffPinHint: 'Demo floor PIN. It is not a founding year.',
  demoPath: '/demo'
};

export function sgd(amount) {
  return `S$${amount}`;
}

export function whatsappHref() {
  const n = String(contact.whatsappNumber || '');
  if (!/^[0-9]{8,15}$/.test(n)) return '';
  const text = encodeURIComponent(`Hello ${contact.person}, I would like to ask about TableHua for my restaurant.`);
  return `https://wa.me/${n}?text=${text}`;
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
