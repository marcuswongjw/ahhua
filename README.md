# Ah Hua 阿华 — Restaurant ordering demo

A warm, responsive restaurant experience built from the menu and workflow in the earlier Ah Hua prototype. The earlier downloadable `ah-hua-chat-enabled.zip` was not accessible from this workspace; this is a fresh implementation of that concept.

## Explore

1. **Customer:** choose the explicitly labelled **Table number**, type a request, dictate it with **Speak**, or customise dishes directly from the menu. Speech fills an editable draft; press Send yourself. Chat suggestions require an explicit **Add suggestion to cart** click. All three methods share one cart. Enable **Turn on voice replies** to hear new replies automatically, or tap Ah Hua’s animated avatar to enable voice and replay the latest reply. **Stop voice** stops current playback.
2. **Staff:** review submitted orders, tick the review box and approve them, or decline with a reason. Change sample availability and acknowledge simulated server requests.
3. **Kitchen:** only approved orders appear. Move them through cooking, ready and served.
4. Return to Customer to follow the status and create a simulated receipt after serving. Amount charged is always **S$0.00**.

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
