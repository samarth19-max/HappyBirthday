# 🎂 Happy Birthday

A one-page birthday website: an opening surprise, floating balloons you can pop, a
heartfelt letter, the day's details, a photo wall, a cake with candles you can
actually blow out (mic optional), a wish wall, and three little gifts to open.

No build step, no dependencies, no framework — plain HTML, CSS and JavaScript.
Open `index.html` and it works.

```
index.html                  ← the page
assets/css/style.css        ← all the styling
assets/js/main.js           ← all the behaviour
assets/js/config.js         ← ✏️  EVERYTHING YOU'D WANT TO EDIT LIVES HERE
assets/img/                 ← artwork + photo placeholders
```

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

## ♿ A few notes

- Keyboard friendly: skip link, focus outlines, `Esc` to close the photo viewer,
  arrow keys to move between photos.
- Respects `prefers-reduced-motion` — animations, balloons and confetti scale back.
- Mobile-first layout, works down to small phones and up to big desktop screens.
- Blocks all artwork is AI-generated for this project; swap in real photos for the
  personal bits and it gets much better. 😄

---

Made with 🎈 confetti and a lot of cake.
