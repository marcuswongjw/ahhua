# Ah Hua 阿华 — Restaurant ordering demo

A warm, responsive restaurant experience built from the menu and workflow in the earlier Ah Hua prototype. The earlier downloadable `ah-hua-chat-enabled.zip` was not accessible from this workspace; this is a fresh implementation of that concept.

## Explore

1. **Customer:** choose the explicitly labelled **Table number** (or tap the table badge to view the Table QR standee), type a request, dictate it with **Speak**, quick-add dishes (`Quick +1`), or customise dishes with traditional preparation chips (broth style, spice level, ice/sweetness) from the menu. Use the **At your table** service bar to request a steamboat broth refill, hot tea top-up, or extra bowls and chilli. Submit multiple ordering rounds to a shared table tab and open **View & split bill** to calculate per-diner shares and generate a simulated S$0.00 receipt.
2. **Staff:** view the live **20-table floor map** (idle, approval waiting, calling server, or dining), filter by table, review submitted rounds, tick the review box and approve them, or decline with a reason. Acknowledge categorised table service requests and toggle sample dish availability.
3. **Kitchen:** monitor active production counts (steamboat pots, wok dishes, steamed rice, drinks), check off individual dishes as they are plated at the pass, and move approved tickets through cooking, ready and served.
4. Return to Customer to see plated dish indicators, track round progress, and settle the simulated receipt after serving. Amount charged is always **S$0.00**.

## Safe demo boundaries

Customers can choose **English**, **中文（普通话）**, or **Singlish** in the visible **Ah Hua’s language · 回复语言** selector above the conversation. The selection is saved locally and governs new chat replies, order confirmations, spoken replies and microphone recognition. Switching languages leaves the cart and conversation history intact. Older messages replay in their original language. Singlish uses Singapore-style phrasing and requests `en-SG` speech; English requests `en-GB`, and Chinese requests `zh-CN`. Available voices and accents depend on the device/browser. This is reply-language selection, not a full translation of staff/kitchen screens.

- No payment SDK, payment credentials, real charges, restaurant APIs, kitchen printers, database or AI API is connected.
- Prices, recipes, allergens and portions are illustrative and unverified. The assistant never guarantees allergy, vegan, vegetarian or halal suitability.
- Staff and Kitchen are **public simulation controls**, not authenticated production staff systems.
- State is local to this browser profile and website origin using `localStorage`. Tabs on the same origin synchronize. Separate devices/visitors do not share orders. The cart belongs to this browser; the table selector assigns a table when submitting an order.
- Menu chat is a limited deterministic assistant supporting English, common Mandarin menu phrases and Singlish-style requests. It is not a connected LLM. Unknown requests receive an honest fallback. Every proposed cart update requires customer confirmation.
- Speech recognition requires HTTPS (or localhost), a supported browser and microphone permission. It is feature-detected; typing and manual selection remain available when unsupported or denied. Some browser implementations send audio to their speech service. This app does not record audio. Voice playback uses browser speech synthesis and installed voices; enable Turn on voice replies or press Listen to hear replies.
- Ah Hua is an original, locally animated SVG chef. He blinks and waves, tilts while listening, and moves his mouth during actual speech playback events. This is simple speech-state animation, not phoneme-level lip sync or a generated video avatar. Reduced-motion preferences disable animation while keeping status text visible.
- No personal details are requested. Reset demo clears local sample state.

## Run, test and build

Requires Node.js 22 or newer; no third-party runtime or build dependencies.

```sh
npm ci
npm test
npm run build
npm run dev
# Open http://127.0.0.1:4173
```

Use `/?table=03` through `/?table=20` for table-specific entry links. Invalid values default to Table 08. You can change tables in Customer.

`npm run build` creates the deployable `dist/` directory. `vercel.json` configures Vercel to build and serve it. No environment variables are required. Font loading falls back to system fonts if unavailable.

## Technical structure

- `src/domain.js`: menu, grounded chat proposals, integer-cent pricing, cart validation and order state transitions.
- `src/app.js`: interface, safe text escaping, browser speech, persistence and simulation controls.
- `src/styles.css`: responsive layout and visual design.
- `src/avatar.js`, `src/voice.js`: vector chef and speech playback lifecycle.
- `tests/domain.test.js`: meaningful workflow, multilingual cart, availability, pricing and validation coverage.

## Verification scope

Automated tests exercise order approval gating, legal kitchen transitions, immutable submitted snapshots, quantity limits, current availability, multilingual proposals and safe dietary handling. Browser checks cover the actual customer → staff → kitchen → customer flow and responsive display. Real microphone capture and audible voice quality depend on the end-user device and require a human listening test; they are not established by a successful build.

Voice API references: [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition), [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

This is an independent concept demo, not an official restaurant ordering service.

## Recommendation behaviour

The demo recommendation engine considers party size (1–12), a suggested-set budget, mild/spicy requests, named pork/fish/seafood/rice exclusions, current sample availability, dishes already in the cart, and recent suggestions. It enumerates feasible menu combinations and rotates alternatives instead of returning a fixed bundle. “Another suggestion” keeps the previous group size and preferences. Example: “Recommend for 4 people, budget $60, not spicy.” Budgets cover only the suggested set; the existing cart is excluded. Recipes and portion sizes still require staff confirmation, and allergy/dietary safety is never guaranteed. This is a local rule-based demo, not a connected LLM.

## Interactive multilingual meal planning

The language selector now includes **Bahasa Melayu** (`ms-MY`) and **Français** (`fr-FR`) alongside English, Mandarin and Singlish. New assistant messages, dish names in suggestions, price answers, planner controls and suggestion actions are localized. Common French/Malay ordering, budget and spice phrases are recognized; this remains a limited rule-based demo. Microphone and speech playback request the selected locale, subject to browser/device voice availability.

Customers can open the meal planner, select 1–12 guests, a suggested-set budget, spice preference and named pork/fish exclusions, then request a meal. Suggestions can be refined with another combination, a lower budget, preference editing, or individual dish removal before adding to the shared cart. These actions do not place an order or charge money. Removing named ingredients does not establish allergy, halal or other dietary suitability.
