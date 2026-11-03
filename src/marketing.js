import { brand, pricing, outOfScope, contact, site, restaurant, sgd, whatsappHref } from './config.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

function cta(className = 'btn btn-red') {
  const href = whatsappHref();
  const label = esc(contact.cta);
  if (href) return `<a class="${className}" href="${esc(href)}">${label}</a>`;
  return `<a class="${className}" href="#talk">${label}</a>`;
}

function todoNote() {
  if (whatsappHref()) return '';
  return `<p class="todo"><strong>TODO:</strong> The WhatsApp number is not set. It is marked <code>TODO</code> in <code>src/config.js</code> (<code>contact.whatsappNumber</code>). This button only scrolls here until that field is a real number. Do not guess one.</p>`;
}

export function marketingDocument() {
  const title = `${brand.wordmark} — ${brand.tagline}`;
  const description = `${brand.line} ${brand.tagline} ${brand.taglineZh} A digital host for heritage zi char and steamboat restaurants: greet every table, help groups order in their own language, and send each round to staff before the kitchen cooks.`;
  const monthly = sgd(pricing.monthlyPerOutlet);
  const founding = sgd(pricing.founding.monthlyPerOutlet);
  const setup = sgd(pricing.setup);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="${brand.colors.red}" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(site.url)}/" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${esc(brand.wordmark)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(site.url)}/" />
  <meta property="og:image" content="${esc(site.url)}/assets/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="${esc(site.locale)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(site.url)}/assets/og.png" />
  <link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png" />
  <link rel="apple-touch-icon" href="/assets/apple-touch.png" />
  <link rel="stylesheet" href="/src/site.css" />
  <script src="/src/legacy-table-redirect.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="/" aria-label="${esc(brand.wordmark)} home">
        <img src="/assets/seal.png" width="44" height="44" alt="" />
        <span class="word">${esc(brand.productName)} <small>${esc(brand.productNameZh)}</small></span>
      </a>
      <nav class="nav" aria-label="Page">
        <a href="#how">How it works</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
        ${cta()}
      </nav>
    </div>
  </header>
  <main id="main">
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <p class="eyebrow">For zi char and steamboat houses short on staff</p>
          <h1>${esc(brand.tagline)}</h1>
          <p class="zh-line">${esc(brand.taglineZh)}</p>
          <p class="lede">${esc(brand.line)} A digital host greets every table, helps a group order the right dishes in their own language, and sends each round to staff before the kitchen cooks.</p>
          <div class="actions">
            ${cta()}
            <a class="btn btn-ghost" href="${esc(restaurant.demoPath)}">Open the concept demo</a>
          </div>
          <p class="fine">Unlike a QR menu that only lists dishes, ${esc(restaurant.hostName)} serves like your best captain, and gives regulars a reason to come back. ${esc(monthly)} a month per outlet. No per-bill fee.</p>
        </div>
        <aside class="captain" aria-label="Sample greeting">
          <div class="captain-top">
            <img src="/assets/seal.png" width="56" height="56" alt="Round chop seal with the character 华" />
            <div>
              <strong>${esc(restaurant.hostName)} · your ${esc(restaurant.hostRole)}</strong>
              <span>Gender-neutral. The name is set per restaurant.</span>
            </div>
          </div>
          <p class="bubble">Welcome. Four of you, and not too spicy? I would start with one charcoal pot, a plate of greens, and rice. I will hold the round until your floor approves it.</p>
          <div class="langs" aria-label="Languages">
            <span>English</span><span>中文</span><span>Singlish</span><span>Melayu</span><span>Français</span>
          </div>
        </aside>
      </div>
    </section>

    <section id="problem">
      <div class="wrap">
        <p class="eyebrow">The problem</p>
        <h2>The floor is short. The QR code does not serve.</h2>
        <p class="section-lead">On a busy night the captain cannot stand at every table. A QR menu can list the dishes. It does not greet anyone, it does not help a mixed table choose, and it does not keep a round off the wok until a person has looked at it.</p>
        <div class="cards">
          <article class="card">
            <h3>Not enough captains</h3>
            <p>Heritage houses run on people who remember regulars, portions, and how a family likes the pot. Those people are hard to hire, and they cannot be at twenty tables at once.</p>
          </article>
          <article class="card">
            <h3>A list is not a host</h3>
            <p>Guests still wave for help, still over-order, still miss the rice. The kitchen receives whatever was tapped, with no one on the floor to say yes first.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="how">
      <div class="wrap">
        <p class="eyebrow">How it works</p>
        <h2>Greet, plan, then ask the floor.</h2>
        <p class="section-lead">Each step is something your captain already does. TableHua does it at every table, and still waits for your staff.</p>
        <div class="steps">
          <article class="step"><span class="num">1</span><h3>Greet</h3><p>${esc(restaurant.hostName)} welcomes the table and asks how many people are eating.</p></article>
          <article class="step"><span class="num">2</span><h3>Plan</h3><p>Guests set a budget, a spice level, and what to leave out. They can edit the suggestion before anything is sent.</p></article>
          <article class="step"><span class="num">3</span><h3>Approve the round</h3><p>The table sends a round. Staff check it. The kitchen does not start until that yes.</p></article>
          <article class="step"><span class="num">4</span><h3>Kitchen</h3><p>Approved tickets show on the kitchen screen. A declined or waiting round never reaches the pass.</p></article>
          <article class="step"><span class="num">5</span><h3>PayNow split</h3><p>The bill can be split for the table, with a sample PayNow code. TableHua does not take the payment.</p></article>
          <article class="step"><span class="num">6</span><h3>Membership</h3><p>Regulars can keep a stored-value balance and come back to a host that remembers the house, not a new QR each visit.</p></article>
        </div>
      </div>
    </section>

    <section id="languages">
      <div class="wrap">
        <p class="eyebrow">Languages</p>
        <h2>The table’s language, not only the menu’s.</h2>
        <p class="section-lead">Guests read and speak with ${esc(restaurant.hostName)} in English, 中文, Singlish, Bahasa Melayu, or Français. The floor still sees the order in the kitchen’s own words.</p>
        <div class="lang-grid">
          <article class="lang-card"><strong>English · 中文 · Singlish</strong><p>A family can mix a clear English order with a Singlish aside, and an auntie can ask in Mandarin.</p></article>
          <article class="lang-card"><strong>Bahasa Melayu · Français</strong><p>The same host, the same menu, another language. Useful for mixed tables and for guests who are not local.</p></article>
        </div>
      </div>
    </section>

    <section id="pricing">
      <div class="wrap">
        <p class="eyebrow">Pricing</p>
        <h2>One price for the outlet. Nothing on the bill.</h2>
        <div class="price-grid">
          <article class="price-main">
            <p>Per outlet, per month</p>
            <p class="amount">${esc(monthly)} <small>/ month</small></p>
            <ul>
              <li>No per-bill fee</li>
              <li>${esc(setup)} setup</li>
              <li>Staff approval before the kitchen</li>
              <li>Host name set per restaurant. ${esc(restaurant.hostName)} is the default.</li>
            </ul>
          </article>
          <article class="founding">
            <p class="eyebrow">Founding offer</p>
            <p>First ${pricing.founding.restaurantCap} restaurants</p>
            <p class="amount">${esc(founding)} <small>/ month</small></p>
            <p>For ${pricing.founding.months} months, then ${esc(monthly)}. <span class="was">${esc(monthly)}</span></p>
            <p class="scope">Not included: ${esc(outOfScope.join(' · '))}.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="faq" class="faq">
      <div class="wrap">
        <p class="eyebrow">FAQ</p>
        <h2>Before you write to us</h2>
        <details>
          <summary>Does it work alongside the POS we already use?</summary>
          <p>Yes. TableHua sits with the till you already have. Staff approve each round before it is cooked. It does not replace your POS.</p>
        </details>
        <details>
          <summary>Do we need new hardware?</summary>
          <p>No. Diners use their own phones on the table link. Staff and the kitchen use a browser on a phone, tablet, or computer you already have.</p>
        </details>
        <details>
          <summary>Can this be claimed under a grant?</summary>
          <p>You may be eligible for the EDGE Grant. Ask us.</p>
        </details>
        <details>
          <summary>Do you deliver, run the till, or take the payment?</summary>
          <p>No. ${esc(outOfScope.join(', '))}. PayNow on the bill is a split your guests can pay to you. The concept demo charges S$0.00.</p>
        </details>
      </div>
    </section>

    <section id="talk">
      <div class="wrap">
        <div class="talk">
          <p class="eyebrow" style="color:#f0d2d3">WhatsApp us</p>
          <h2>Tell us about the house.</h2>
          <p class="section-lead">How many outlets, what you cook, and whether the floor is short on Friday. We will reply like a captain: warm, polite, brief.</p>
          <div class="actions">
            ${cta('btn btn-red')}
            <a class="btn btn-ghost" href="${esc(restaurant.demoPath)}">Try the concept demo</a>
          </div>
          ${todoNote()}
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <strong>${esc(brand.wordmark)}</strong>
      <span>${esc(brand.line)}</span>
      <span>${esc(brand.tagline)} ${esc(brand.taglineZh)}</span>
      <span>The diner flow is a concept demo for ${esc(restaurant.name)} (${esc(restaurant.nameZh)}), since ${restaurant.established}. ${esc(restaurant.addressNote)}</span>
      <a href="${esc(restaurant.demoPath)}">Open the concept demo</a>
    </div>
  </footer>
</body>
</html>`;
}
