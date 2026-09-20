# 🎂 Happy Birthday

A one-page birthday website: an opening surprise, floating balloons you can pop, a
heartfelt letter, the day's details, a photo wall, a cake with candles you can
actually blow out (mic optional), a wish wall, and three little gifts to open.

No build step, no dependencies, no framework — plain HTML, CSS and JavaScript.
Fonts are **self-hosted**, so there are no third-party requests and the page works
offline. Open `index.html` and it works.

```
index.html                  ← the page
assets/css/style.css        ← all the styling
assets/js/main.js           ← all the behaviour
assets/js/config.js         ← ✏️  EVERYTHING YOU'D WANT TO EDIT LIVES HERE
assets/fonts/               ← Fredoka, Nunito and Caveat (self-hosted woff2)
assets/img/                 ← artwork + photo placeholders
```

## ✨ What's in it

**The party**
- Opening gift-box surprise with a confetti cannon and a whoosh
- Hero with a two-tone rainbow headline, balloon garland, and balloons you can pop
- Heartfelt letter with a wax seal, washi tape and ruled-paper lines
- Day cards: live clock (or countdown), the date, and a schedule of the day
- Photo wall with a full-screen viewer (arrow keys, swipe-friendly counter)
- Cake with candles you tap — or actually blow out with your microphone
- Wish wall saved on the visitor's own device, plus three openable gifts
- *Happy Birthday* synthesised live with the Web Audio API (no audio file)

**The polish**
- Ambient aurora that drifts behind the page, plus twinkling sparkles
- Garland/bunting strung across the hero and footer
- Scalloped paper edges between sections
- Cursor sparkle trail and a soft warm glow (desktop pointers only)
- 3D pointer tilt on cards, button shine sweep, and ripple on click
- Hero parallax + fade as you scroll, sticky nav that highlights the section
- Confetti canvas with bursts, rain and cannons
- Handwriting accents (Caveat) on both signatures

---

## ✏️ Make it yours (2 minutes)

Open **`assets/js/config.js`** and change the values. Save, refresh, done.

| What | Where in the config |
| --- | --- |
| Their name | `name: "Bestie"` |
| The sticker next to the name | `emoji: "🎉"` |
| A "turning 25" badge | `age: 25` (or `null` to hide) |
| The date of the birthday | `birthday: { month: 9, day: 19, year: null }` |
| Hero line + little badges | `hero: { subtitle, badges }` |
| The letter | `letter.paragraphs` — plain text, or a bit of `<strong>` / `<em>` |
| Number of candles | `candles: 5` |
| Photo wall | `gallery: [{ src, title, caption }]` |
| Wishes already on the wall | `wishes: [{ name, emoji, text }]` |
| The three gifts | `gifts: [{ emoji, lead, title, text }]` |
| Schedule of the day | `timeline: [{ time, label }]` (delete the array to hide it) |
| Closing line | `outro.text`, `outro.signature` |
| Confetti amount on open | `confettiOnOpen: 150` |

### Adding your own photos

1. Drop your images into `assets/img/` (square-ish JPG/WebP around 900 × 900 works best).
2. Point the gallery at them:

```js
gallery: [
  { src: "assets/img/us-at-the-beach.jpg", title: "That beach day", caption: "You, me and 200 seagulls." },
  { src: "assets/img/cake-night.jpg",      title: "Cake o'clock",   caption: "Seconds before the frosting incident." }
]
```

Any number of photos works — the grid re-flows on its own, and clicking one opens
it full size with arrow-key navigation.

---

## 🕯️ Blowing out the candles

- **Tap or click each candle** to blow it out.
- Or press **"Use my breath"** and actually blow at your device — the browser
  listens through the microphone and snuffs the flames when it hears a puff.
  (Microphone access is asked for right there, is only used locally on the page,
  and stops the moment you tap the button again.)

Blowing out all the candles sets off confetti, a fanfare, and "Light them again"
if you want a rerun.

## 🎵 The birthday tune

The music button in the corner plays *Happy Birthday* — synthesised live in the
browser with the Web Audio API, so there's no audio file to host and no
copyright trouble. It loops until you pause it.

## 💌 The wish wall

Visitors can add their own wishes. They're stored in the visitor's own browser
(`localStorage`) — nothing is sent anywhere, no backend, no accounts. Seed wishes
from the config are pinned and can't be deleted; visitor wishes can.

---

## 🚀 Putting it online

Any static host works. Pick one:

- **GitHub Pages** — push this repo, then *Settings → Pages → Source: GitHub Actions*.
  A ready-made workflow lives in `.github/workflows/pages.yml` and deploys on every
  push to `main`.
- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, no settings needed.
- **Locally** — `python3 -m http.server 8000` (or just double-click `index.html`).

## ♿ Accessibility & performance

- **Keyboard friendly:** skip link, visible focus outlines, `Esc` to close the photo
  viewer, arrow keys to move between photos, real buttons everywhere.
- **`prefers-reduced-motion`:** animations stop, balloons/sparkles/trail are removed,
  and every section renders in its final state.
- **`<noscript>`:** without JavaScript the page still shows all of its content.
- **Prints correctly:** animations are disabled in the print stylesheet, so a printed
  page is never blank.
- **Reveal-on-scroll is fail-safe:** an IntersectionObserver drives the staggered
  timing, and a scroll sweep guarantees nothing can stay invisible — even if you
  drag the scrollbar straight to the bottom.
- **Tap targets:** interactive elements are at least ~44px on phones.
- **Weight:** ~700 KB in total on a cold load including every illustration, no
  dependencies, no trackers, no external requests.

## ✅ How it was verified

- `node --check` on both scripts.
- A **jsdom** functional suite driving the real markup: candles, relight, lightbox
  navigation, wish add/delete with `localStorage`, gift toggles, music toggle,
  balloon pop, mic-denied fallback, ripple, reveal fallback — **0 errors**.
- A **headless Chromium** pass at 1366×860 and at 390×844 (mobile) checking console
  errors, network failures, horizontal overflow, computed styles and tap-target
  sizes, plus a hard fast-scroll test for the reveal animations.
- Accessibility/robustness guards were verified by running the suite with
  `IntersectionObserver` removed.

---

Made with 🎈 confetti and a lot of cake.
