/* =========================================================================
   ✏️  EDIT ME — everything you'd want to change lives in this one file.
   Save the file, refresh the page, done. No build step, no fuss.
   ========================================================================= */

window.BIRTHDAY = {

  /* ---------------------------- who is it for? -------------------------- */
  name: "Bestie",                 // shown big in the hero, e.g. "Priya"
  emoji: "🎉",                    // a sticker next to the name
  age: null,                      // e.g. 25 → shows a "turning 25" badge. null = hidden
  pronouns: "",                   // optional, unused unless you want it in the note

  /* ------------------------------- the date ----------------------------- */
  // Used for the "big day" cards. Leave year as null if you'd rather not say.
  birthday: { month: 9, day: 19, year: null },

  /* -------------------------------- hero -------------------------------- */
  hero: {
    eyebrow: "Party mode: on",
    subtitle: "Today the internet is wearing a party hat, and it is all because of you.",
    badges: [
      "🎂 Cake is non-negotiable",
      "🎈 Balloons deployed",
      "🕺 Dance floor open",
      "💌 One letter inside"
    ]
  },

  /* ------------------------- the letter (the note) ---------------------- */
  letter: {
    paragraphs: [
      "Happy birthday! I built you this whole little corner of the internet because a text message felt far too small for how much you matter.",
      "Thank you for the way you show up — for the <strong>loud laughs</strong>, the ridiculous inside jokes, and the way you make ordinary days feel like something worth remembering. You have a habit of making people feel <em>seen</em>, and that's a rare and lovely thing.",
      "I hope this year is kind to you. I hope it's full of good news, better sleep, spontaneous plans that actually happen, food that hits the spot, and people who love you the way you deserve to be loved.",
      "So go on — blow out the candles, make an unreasonable wish, and eat the corner piece with the most frosting. You've earned it."
    ],
    signature: "— with all the love, always 💛"
  },

  /* ------------------------- candle / cake settings --------------------- */
  candles: 5,            // how many candles are on the cake
  rewardText: "Now make a plate, cut a slice, and remind everyone for the rest of the day that it's your birthday.",

  /* --------------------- the plan for the day (optional) --------------- */
  // A little schedule shown under the day cards. Delete the whole array to hide it.
  timeline: [
    { time: "09:00", label: "Balloons deployed" },
    { time: "12:00", label: "Cake arrives" },
    { time: "15:00", label: "Embarrassing photos" },
    { time: "19:00", label: "Dinner, no phones" },
    { time: "22:00", label: "Dance floor opens" }
  ],

  /* --------------------------- photo memories --------------------------- */
  // Drop your own images into assets/img/ and point src at them.
  // Recommended: square-ish JPG/WEBP, ~900px wide.
  gallery: [
    { src: "assets/img/memory-1.webp", title: "Balloons everywhere", caption: "Because subtle was never the plan." },
    { src: "assets/img/memory-2.webp", title: "The cake moment",     caption: "Three tiers of pure showing off." },
    { src: "assets/img/memory-3.webp", title: "Presents pile",       caption: "All wrapped, none of them socks." },
    { src: "assets/img/memory-4.webp", title: "Dancing crew",        caption: "The floor was ours for one night." },
    { src: "assets/img/memory-5.webp", title: "Fireworks night",     caption: "The sky joined in too." },
    { src: "assets/img/memory-6.webp", title: "Crown & hat",         caption: "Royalty behaviour, honestly." }
  ],

  /* ------------------------ wishes on the wall -------------------------- */
  // These appear first. Visitors can add their own (saved on their device).
  wishes: [
    { name: "Your biggest fan", emoji: "🎈", text: "Happiest birthday! May this year bring you everything you keep quietly hoping for." },
    { name: "The group chat",   emoji: "😂", text: "We voted: you're officially the best of us. Cake's on the way (metaphorically, sorry)." },
    { name: "Everyone here",    emoji: "🥳", text: "Thanks for being the person who makes plans fun. Have the best day!" }
  ],

  /* ---------------------------- tiny gifts ------------------------------ */
  gifts: [
    { emoji: "🎟️", lead: "Gift one", title: "One free favour", text: "Redeemable any time, no expiry, no questions asked. Yes, even for the weird requests." },
    { emoji: "📸",   lead: "Gift two", title: "A whole day out",  text: "Pick the day, pick the place. I'll handle the snacks and the embarrassing photos." },
    { emoji: "🎵",   lead: "Gift three", title: "Your anthem",   text: "Press the tune button in the corner — I taught the browser your birthday song." }
  ],

  /* ------------------------------ endings ------------------------------- */
  outro: {
    text: "Have the best day — you've earned every bit of it.",
    signature: "— from someone who thinks you're pretty great"
  },

  /* ------------------------------- extras ------------------------------- */
  confettiOnOpen: 150     // how much confetti when the page opens (0 to disable)
};
