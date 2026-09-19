/* =========================================================================
   Happy Birthday — main script
   Vanilla JS, no dependencies. Everything is wired up from window.BIRTHDAY
   (see assets/js/config.js).
   ========================================================================= */
(() => {
  "use strict";

  /* ------------------------------ helpers ------------------------------ */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const cfg = window.BIRTHDAY || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randInt = (min, max) => Math.floor(rand(min, max + 1));
  const pick = (arr) => arr[randInt(0, arr.length - 1)];
  const clamp01 = (n) => Math.max(0, Math.min(1, n));

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem("hb:" + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (err) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("hb:" + key, JSON.stringify(value)); } catch (err) { /* private mode */ }
    }
  };

  const PALETTE = ["#ff6b9d", "#ff7a59", "#ffa53d", "#ffd23f", "#3fc9b8", "#58bdf0", "#a06cd5"];
  const MONTHS = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ------------------------------- audio ------------------------------- */
  const Sfx = (() => {
    let ctx = null;
    let master = null;

    function ready() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }

    function tone(freq, dur, { type = "triangle", vol = 0.18, delay = 0, glide = null } = {}) {
      const c = ready();
      if (!c) return;
      const t0 = c.currentTime + delay;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    }

    function noise(dur = 0.2, { vol = 0.2, freq = 1200, q = 1, delay = 0 } = {}) {
      const c = ready();
      if (!c) return;
      const t0 = c.currentTime + delay;
      const frames = Math.max(1, Math.floor(c.sampleRate * dur));
      const buffer = c.createBuffer(1, frames, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      const src = c.createBufferSource();
      src.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = q;
      const gain = c.createGain();
      gain.gain.value = vol;
      src.connect(filter).connect(gain).connect(master);
      src.start(t0);
    }

    const api = {
      ready,
      tone,
      noise,
      pop()   { tone(rand(500, 760), 0.09, { type: "sine", vol: 0.16, glide: 160 }); noise(0.08, { vol: 0.12, freq: 2400, q: 0.8 }); },
      puff()  { noise(0.32, { vol: 0.16, freq: 900, q: 0.6 }); },
      clap()  { for (let i = 0; i < 8; i++) noise(0.06, { vol: 0.09, freq: rand(1400, 2600), q: 1.2, delay: i * 0.055 + rand(-0.006, 0.006) }); },
      whoosh(){ noise(0.5, { vol: 0.14, freq: 600, q: 0.7 }); },
      fanfare() {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.4, { vol: 0.16, delay: i * 0.11, type: "triangle" }));
        tone(1318.5, 0.9, { vol: 0.12, delay: 0.5, type: "sine" });
      }
    };
    return api;
  })();

  /* ------------------------- birthday tune (music) --------------------- */
  const Tune = (() => {
    const F = { G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
    const MELODY = [
      ["G4", .5], ["G4", .5], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
      ["G4", .5], ["G4", .5], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
      ["G4", .5], ["G4", .5], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
      ["F5", .5], ["F5", .5], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2]
    ];
    const BEAT = 0.34;
    let playing = false;
    let timer = null;

    function scheduleRun() {
      const c = Sfx.ready();
      if (!c || !playing) return;
      let t = c.currentTime + 0.08;
      MELODY.forEach(([note, len]) => {
        const dur = len * BEAT;
        // two slightly detuned voices give it a music-box warmth
        Sfx.tone(F[note], dur * 0.92, { vol: 0.13, type: "triangle", delay: t - c.currentTime });
        Sfx.tone(F[note] * 2, dur * 0.5, { vol: 0.045, type: "sine", delay: t - c.currentTime });
        t += dur;
      });
      const total = MELODY.reduce((sum, [, len]) => sum + len * BEAT, 0);
      timer = window.setTimeout(scheduleRun, (total + 1.2) * 1000);
    }

    return {
      toggle() {
        playing = !playing;
        if (playing) {
          Sfx.ready();
          scheduleRun();
        } else {
          window.clearTimeout(timer);
          timer = null;
        }
        return playing;
      },
      stop() {
        playing = false;
        window.clearTimeout(timer);
        timer = null;
        return false;
      },
      get playing() { return playing; }
    };
  })();

  /* ------------------------------ confetti ----------------------------- */
  const Confetti = (() => {
    const canvas = $("#confetti");
    const noop = { burst() {}, rain() {}, cannon() {}, start() {} };
    if (!canvas) return noop;
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return noop;
    let W = 0, H = 0, dpr = 1, raf = null, last = 0;
    const parts = [];
    const SHAPES = ["rect", "circle", "strip"];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(o) {
      parts.push(Object.assign({
        x: rand(0, W), y: -20,
        vx: rand(-1.2, 1.2), vy: rand(1, 3),
        g: 0.028, drag: 0.992,
        size: rand(6, 13),
        color: pick(PALETTE),
        shape: pick(SHAPES),
        rot: rand(0, Math.PI * 2),
        vrot: rand(-0.14, 0.14),
        wobble: rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.03, 0.09),
        life: 0,
        ttl: rand(320, 560)
      }, o));
      if (parts.length > 900) parts.splice(0, parts.length - 900);
      start();
    }

    function burst(x, y, count = 40, power = 9, spread = Math.PI * 2, angle = -Math.PI / 2) {
      if (reduceMotion) count = Math.round(count / 3);
      for (let i = 0; i < count; i++) {
        const a = angle + rand(-spread / 2, spread / 2);
        const sp = power * rand(0.35, 1);
        spawn({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          g: rand(0.14, 0.24),
          drag: 0.965,
          ttl: rand(140, 260),
          size: rand(5, 12)
        });
      }
    }

    function rain(count = 120) {
      if (reduceMotion) count = Math.min(count, 30);
      for (let i = 0; i < count; i++) {
        spawn({ x: rand(-40, W + 40), y: rand(-H * 0.5, -20), vy: rand(1.4, 3.6), ttl: rand(320, 620), drag: 0.999 });
      }
    }

    function cannon() {
      burst(0, H - 10, 70, 17, Math.PI / 3.2, -Math.PI / 3.1);
      burst(W, H - 10, 70, 17, Math.PI / 3.2, -Math.PI + Math.PI / 3.1);
      Sfx.whoosh();
    }

    function start() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    function loop(now) {
      const dt = Math.min(3, (now - last) / 16.667);
      last = now;
      ctx.clearRect(0, 0, W, H);

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.wobble += p.wobbleSpeed * dt;
        p.vy += p.g * dt;
        p.vx *= Math.pow(p.drag, dt);
        p.vy *= Math.pow(p.drag, dt);
        p.x += (p.vx + Math.sin(p.wobble) * 0.7) * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        p.life += dt;

        const fade = clamp01(1 - Math.max(0, p.life - p.ttl * 0.7) / (p.ttl * 0.3));
        if (p.life > p.ttl || p.y > H + 60) { parts.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "strip") {
          ctx.fillRect(-p.size * 0.9, -p.size * 0.14, p.size * 1.8, p.size * 0.28);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.68);
        }
        ctx.restore();
      }

      if (parts.length) raf = requestAnimationFrame(loop);
      else { raf = null; ctx.clearRect(0, 0, W, H); }
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && raf) { cancelAnimationFrame(raf); raf = null; }
      else if (!document.hidden && parts.length) start();
    });

    return { burst, rain, cannon, start,
      get size() { return parts.length; },
      get viewport() { return { W, H }; } };
  })();

  /* ------------------------------ balloons ----------------------------- */
  const Balloons = (() => {
    const field = $("#balloonField");
    if (!field || reduceMotion) return { spawnAll() {} };
    const live = new Set();

    function pop(el) {
      if (el.classList.contains("is-popped")) return;
      const r = el.getBoundingClientRect();
      Confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 26, 8);
      Sfx.pop();
      el.classList.add("is-popped");
      window.setTimeout(() => {
        live.delete(el);
        el.remove();
        window.setTimeout(() => field.appendChild(make(false)), rand(900, 2600));
      }, 320);
    }

    function make(initial) {
      const el = document.createElement("span");
      const size = rand(38, 84);
      const dur = rand(24, 42);
      el.className = "balloon";
      el.style.setProperty("--size", size + "px");
      el.style.setProperty("--tone", pick(PALETTE));
      el.style.setProperty("--dur", dur + "s");
      el.style.setProperty("--drift", rand(-90, 90) + "px");
      el.style.left = rand(-2, 98) + "vw";
      el.style.opacity = String(rand(0.5, 0.9));
      el.style.animationDelay = initial ? "-" + rand(0, dur).toFixed(1) + "s" : "0s";
      el.addEventListener("animationend", () => {
        if (el.classList.contains("is-popped")) return;
        live.delete(el);
        el.remove();
        field.appendChild(make(false));
      });
      live.add(el);
      return el;
    }

    function spawnAll() {
      const count = window.innerWidth < 700 ? 5 : 10;
      for (let i = 0; i < count; i++) field.appendChild(make(true));
    }

    // Balloons are painted behind the page content, so we hit-test them by hand:
    // clicking empty space where a balloon is floating pops it.
    document.addEventListener("click", (e) => {
      const blocked = e.target.closest(
        'a, button, input, textarea, label, img, svg, p, h1, h2, h3, li, article, figure, .memory, .wish-note, .gift-card, .cake, .day-card'
      );
      if (blocked) return;
      for (const el of Array.from(live)) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 4 && e.clientY <= r.bottom) {
          pop(el);
          return;
        }
      }
    });

    return { spawnAll };
  })();

  /* ------------------------------- intro ------------------------------- */
  const Intro = (() => {
    const el = $("#intro");
    const openBtn = $("#introOpen");
    let done = false;

    function dismiss() {
      if (done) return;
      done = true;
      el.classList.add("is-gone");
      document.body.classList.remove("is-locked");
      $("#topbar").classList.add("is-in");
      Sfx.ready();
      Sfx.whoosh();
      Confetti.rain(cfg.confettiOnOpen == null ? 130 : cfg.confettiOnOpen);
      window.setTimeout(() => Confetti.cannon(), 320);
      window.setTimeout(() => { el.remove(); }, 700);
      const first = $("#cake") ? $$(".hero__cta .btn")[0] : null;
      if (first) first.focus({ preventScroll: true });
    }

    if (el) {
      el.addEventListener("click", (e) => {
        if (e.target.closest("button") || e.target === el || e.target.closest(".intro__card")) dismiss();
      });
      document.addEventListener("keydown", (e) => {
        if (!done && (e.key === "Enter" || e.key === " " || e.key === "Escape")) dismiss();
      });
      window.setTimeout(() => openBtn && openBtn.focus({ preventScroll: true }), 400);
    } else {
      document.body.classList.remove("is-locked");
    }

    return { dismiss, get done() { return done; } };
  })();

  /* ------------------------------ content ------------------------------ */
  const name = cfg.name || "you";
  const party = cfg.birthday || { month: 1, day: 1, year: null };

  function nextOccurrence(from = new Date()) {
    const y = from.getFullYear();
    let d = new Date(y, party.month - 1, party.day, 0, 0, 0, 0);
    if (d.getTime() + 86399999 < from.getTime()) d = new Date(y + 1, party.month - 1, party.day);
    return d;
  }
  function isToday(date = new Date()) {
    return date.getMonth() === party.month - 1 && date.getDate() === party.day;
  }
  function computeAge() {
    if (!cfg.age) return null;
    return cfg.age;
  }

  const today = isToday();
  const target = nextOccurrence();

  document.title = today ? `Happy Birthday, ${name}! 🎂` : `Happy Birthday, ${name} 🎈`;

  function renderHero() {
    $("#heroName").textContent = name;
    const wave = $(".hero__wave");
    if (wave && cfg.emoji) wave.textContent = cfg.emoji;

    const age = computeAge();
    const ageBadge = $("#heroAge");
    if (age) { ageBadge.textContent = "turning " + age; ageBadge.hidden = false; }

    if (cfg.hero) {
      if (cfg.hero.subtitle) $("#heroSub").textContent = cfg.hero.subtitle;
      const badges = $("#heroBadges");
      (cfg.hero.badges || []).forEach((text, i) => {
        const s = document.createElement("span");
        s.textContent = text;
        s.style.animationDelay = 0.15 + i * 0.09 + "s";
        badges.appendChild(s);
      });
    }

    const eyebrow = $("#heroDate");
    const d = target;
    const dateStr = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    eyebrow.textContent = today ? `🎉 It's today — ${dateStr}` : `Next up — ${dateStr}`;

    $("#brandName").textContent = "Happy Birthday, " + name;
    $("#footerMeta").textContent = `${dateStr}${party.year ? " " + party.year : ""} • made for ${name}`;
  }

  function renderLetter() {
    const body = $("#letterBody");
    const letter = cfg.letter || {};
    (letter.paragraphs || []).forEach((p) => {
      const el = document.createElement("p");
      el.innerHTML = p;   // config is trusted, hand-written content
      body.appendChild(el);
    });
    $("#letterSign").textContent = letter.signature || "";
  }

  function renderDay() {
    const chip = $("#dayChip");
    const title = $("#dayTitle");
    if (today) {
      chip.textContent = "🎈 The big day";
      title.innerHTML = "It's happening <em>today</em>";
      $("#clockLabel").textContent = "Celebrating for";
      $("#clockNote").textContent = "Every second counts today.";
    } else {
      chip.textContent = "⏳ T-minus";
      title.innerHTML = `Counting down to <em>the big day</em>`;
      $("#clockLabel").textContent = "Time to go";
      $("#clockNote").textContent = "It'll be here before you know it.";
    }

    const d = target;
    $("#dateValue").textContent = `${d.getDate()} ${MONTHS[d.getMonth()]}${party.year ? " " + party.year : ""}`;
    $("#dateNote").textContent = `${DAYS[d.getDay()]} — marked in every calendar that matters.`;

    const count = cfg.candles || 5;
    $("#candlesLabel").textContent = "Blowable candles";
    $("#candlesValue").textContent = count + " 🕯️";
    $("#candlesNote").textContent = "One for every year of you.";

    tick();
    window.setInterval(tick, 1000);
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    const now = new Date();
    const value = $("#clockValue");
    if (today) {
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const secs = Math.floor((now - midnight) / 1000);
      const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
      value.textContent = `${pad(h)} : ${pad(m)} : ${pad(s)}`;
    } else {
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff / 86400000); diff -= days * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff - m * 60000) / 1000);
      value.textContent = `${days}d ${pad(h)} : ${pad(m)} : ${pad(s)}`;
    }
  }

  function renderTimeline() {
    const list = cfg.timeline;
    if (!list || !list.length) return;
    const wrap = $("#timeline");
    const ul = $("#timelineList");
    list.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<b>${item.time}</b> — ${item.label}`;
      ul.appendChild(li);
    });
    wrap.hidden = false;
  }

  function renderGallery() {
    const grid = $("#galleryGrid");
    (cfg.gallery || []).forEach((item, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "memory reveal";
      card.dataset.index = String(i);
      card.innerHTML = `
        <span class="memory__img">
          <img src="${item.src}" alt="${item.title || "Birthday memory " + (i + 1)}" loading="lazy" decoding="async" />
          <span class="memory__zoom" aria-hidden="true">🔍</span>
        </span>
        <span class="memory__meta">
          <span class="memory__title">${item.title || ""}</span>
          <span class="memory__caption">${item.caption || ""}</span>
        </span>`;
      card.addEventListener("click", () => Lightbox.open(i));
      grid.appendChild(card);
    });
  }

  /* ------------------------------ lightbox ----------------------------- */
  const Lightbox = (() => {
    const el = $("#lightbox");
    const img = $("#lightboxImg");
    const title = $("#lightboxTitle");
    const caption = $("#lightboxCaption");
    let index = 0;
    let lastFocus = null;

    function preload(i) {
      const list = cfg.gallery || [];
      const item = list[(i + list.length) % list.length];
      if (item && item.src) { const pre = new Image(); pre.src = item.src; }
    }

    function paint() {
      const list = cfg.gallery || [];
      const item = list[index];
      if (!item) return;
      img.src = item.src;
      img.alt = item.title || "Birthday memory";
      title.textContent = item.title || "";
      caption.textContent = item.caption || "";
      const counter = $("#lightboxCount");
      if (counter) counter.textContent = `${index + 1} / ${list.length}`;
      preload(index + 1);
      preload(index - 1);
    }

    function open(i) {
      index = i;
      lastFocus = document.activeElement;
      paint();
      el.hidden = false;
      document.body.classList.add("is-locked");
      $("#lightboxClose").focus({ preventScroll: true });
    }
    function close() {
      el.hidden = true;
      document.body.classList.remove("is-locked");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    function step(dir) {
      const total = (cfg.gallery || []).length;
      if (!total) return;
      index = (index + dir + total) % total;
      paint();
      if (img.animate) {
        img.animate([{ opacity: 0.2, transform: "scale(0.98)" }, { opacity: 1, transform: "none" }],
          { duration: 260, easing: "cubic-bezier(0.22,1,0.36,1)" });
      }
    }

    if (el) {
      $("#lightboxClose").addEventListener("click", close);
      $("#lightboxPrev").addEventListener("click", () => step(-1));
      $("#lightboxNext").addEventListener("click", () => step(1));
      el.addEventListener("click", (e) => { if (e.target === el) close(); });
      document.addEventListener("keydown", (e) => {
        if (el.hidden) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }
    return { open, close };
  })();

  /* -------------------------------- cake ------------------------------- */
  const Cake = (() => {
    const root = $("#cakeCake");
    const holder = $("#candles");
    const status = $("#cakeStatus");
    const bar = $("#cakeBar");
    const reward = $("#cakeReward");
    const smoke = $("#cakeSmoke");
    let total = 0;
    let out = 0;

    function build() {
      holder.innerHTML = "";
      total = Math.max(1, Math.min(9, cfg.candles || 5));
      out = 0;

      for (let i = 0; i < total; i++) {
        const c = document.createElement("button");
        c.type = "button";
        c.className = "candle";
        c.style.setProperty("--candle-tone", PALETTE[i % PALETTE.length]);
        c.style.height = randInt(52, 72) + "px";
        c.setAttribute("aria-label", `Blow out candle ${i + 1}`);
        c.innerHTML = `<span class="candle__flame" aria-hidden="true"></span><span class="candle__smoke" aria-hidden="true">💨</span>`;
        c.addEventListener("click", () => blow(c));
        holder.appendChild(c);
      }
      reward.hidden = true;
      root.classList.remove("is-celebrating");
      if (smoke) smoke.hidden = true;
      update();
    }

    function update() {
      const left = total - out;
      status.textContent = left === 0
        ? "Every candle is out. Wish locked in ✨"
        : `${left} of ${total} candle${left === 1 ? "" : "s"} still burning…`;
      bar.style.width = Math.round((out / total) * 100) + "%";
    }

    function blow(candle) {
      if (!candle || candle.classList.contains("is-out")) return;
      candle.classList.add("is-out");
      candle.disabled = true;
      out++;
      Sfx.puff();
      const r = candle.getBoundingClientRect();
      Confetti.burst(r.left + r.width / 2, r.top - 6, 12, 5.5, Math.PI * 0.9, -Math.PI / 2);
      update();
      if (out >= total) celebrate();
    }

    function celebrate() {
      const r = root.getBoundingClientRect();
      Confetti.burst(r.left + r.width / 2, r.top + 30, 70, 12);
      Confetti.rain(140);
      window.setTimeout(() => Confetti.cannon(), 260);
      root.classList.add("is-celebrating");
      if (smoke) { smoke.hidden = false; smoke.textContent = "poof 💨 wish sent"; }
      reward.hidden = false;
      Sfx.fanfare();
      window.setTimeout(() => Sfx.clap(), 420);
    }

    function logCandleBlow(amount) {
      // mic-driven blows nibble at the flames
      const lit = $$(".candle:not(.is-out)", holder);
      if (!lit.length) return;
      blow(lit[randInt(0, lit.length - 1)]);
    }

    return { build, blow, logCandleBlow, celebrate, get done() { return out >= total; } };
  })();

  /* ------------------------------ mic blow ----------------------------- */
  const Mic = (() => {
    const btn = $("#micBtn");
    const btnText = $("#micBtnText");
    const hint = $("#micHint");
    let stream = null, ctx = null, analyser = null, buf = null, raf = null;
    let blowTime = 0, lastTick = 0, running = false, meter = null;

    function fail(message) {
      hint.hidden = false;
      hint.textContent = message;
      btnText.textContent = "Use my breath";
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ctx && ctx.state !== "closed") ctx.close();
      stream = ctx = analyser = null;
      if (meter) { meter.remove(); meter = null; }
      btnText.textContent = "Use my breath";
      btn.setAttribute("aria-pressed", "false");
    }

    function loop(now) {
      if (!running) return;
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      if (meter) meter.firstElementChild.style.width = Math.round(clamp01(rms / 0.25) * 100) + "%";

      const dt = now - lastTick;
      lastTick = now;
      if (rms > 0.055) {
        blowTime += dt;
        if (blowTime > 260) {
          blowTime = 0;
          Cake.logCandleBlow();
        }
      } else {
        blowTime = Math.max(0, blowTime - dt * 0.6);
      }
      raf = requestAnimationFrame(loop);
    }

    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        fail("This browser won't share a microphone — just tap the candles instead. 👆");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
      } catch (err) {
        fail("No microphone access — no problem, tap the candles to blow them out. 👆");
        return;
      }
      Sfx.ready();
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      buf = new Float32Array(analyser.fftSize);

      hint.hidden = false;
      hint.innerHTML = "Now blow at your device — a good long puff. <span class='mic-level'><span></span></span>";
      meter = hint.querySelector(".mic-level");
      btnText.textContent = "Listening…";
      btn.setAttribute("aria-pressed", "true");
      running = true;
      lastTick = performance.now();
      raf = requestAnimationFrame(loop);
      window.setTimeout(() => { if (running && !Cake.done) hint.hidden = false; }, 100);
    }

    if (btn) {
      btn.addEventListener("click", () => {
        if (running) stop();
        else start();
      });
    }
    return { stop, get running() { return running; } };
  })();

  /* ------------------------------ wish wall ---------------------------- */
  const Wishes = (() => {
    const STICKERS = ["🎈", "🎂", "🥳", "💛", "✨", "🎁", "🌈", "🍰", "😂", "🫶", "⭐", "🎉"];
    const NOTES = ["#fff9c4", "#ffe0ec", "#d9f5ef", "#e6ecff", "#ffe9d1", "#f2e4ff"];
    const form = $("#wishForm");
    const wall = $("#wishWall");
    const empty = $("#wishEmpty");
    const picker = $("#emojiPicker");
    let chosen = "🎈";

    function build() {
      STICKERS.slice(0, 8).forEach((emoji, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = emoji;
        b.className = i === 0 ? "is-active" : "";
        b.setAttribute("aria-label", "Sticker " + emoji);
        b.addEventListener("click", () => {
          chosen = emoji;
          $$("button", picker).forEach((x) => x.classList.toggle("is-active", x === b));
        });
        picker.appendChild(b);
      });

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameVal = $("#wishName").value.trim();
        const textVal = $("#wishText").value.trim();
        if (!nameVal || !textVal) return;
        const list = store.get("wishes", []);
        list.push({ name: nameVal, text: textVal, emoji: chosen, at: Date.now() });
        store.set("wishes", list);
        $("#wishText").value = "";
        render();
        Sfx.pop();
        const r = wall.lastElementChild ? wall.lastElementChild.getBoundingClientRect() : null;
        if (r) Confetti.burst(r.left + r.width / 2, r.top + 20, 26, 7);
        note("Thanks! Your wish joined the wall. ✨");
      });
    }

    function note(message) {
      const toast = $("#shareToast");
      if (!toast) return;
      toast.textContent = message;
      toast.style.opacity = "1";
      window.clearTimeout(note.timer);
      note.timer = window.setTimeout(() => { toast.style.opacity = "0"; }, 3200);
    }

    function makeNote(item, index, deletable, onDelete) {
      const el = document.createElement("article");
      el.className = "wish-note";
      el.style.setProperty("--note", NOTES[index % NOTES.length]);
      el.style.setProperty("--tilt", rand(-1.6, 1.6).toFixed(2) + "deg");
      el.style.setProperty("--pin", PALETTE[index % PALETTE.length]);
      el.style.animationDelay = Math.min(index * 0.06, 0.5) + "s";

      const when = item.at ? new Date(item.at) : null;
      el.innerHTML = `
        <span class="wish-note__emoji" aria-hidden="true">${item.emoji || "🎈"}</span>
        <p class="wish-note__text"></p>
        <div class="wish-note__foot">
          <span class="wish-note__name"></span>
          <span class="wish-note__time">${when ? when.toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "pinned"}</span>
        </div>`;
      el.querySelector(".wish-note__text").textContent = item.text;
      el.querySelector(".wish-note__name").textContent = "— " + item.name;

      if (deletable) {
        const del = document.createElement("button");
        del.type = "button";
        del.className = "wish-note__del";
        del.setAttribute("aria-label", "Delete this wish");
        del.textContent = "🗑️";
        del.addEventListener("click", () => { el.remove(); onDelete(); });
        el.querySelector(".wish-note__foot").appendChild(del);
      }
      return el;
    }

    function render() {
      wall.innerHTML = "";
      const seeds = cfg.wishes || [];
      const mine = store.get("wishes", []);
      seeds.forEach((w, i) => wall.appendChild(makeNote(w, i, false)));
      mine.forEach((w, i) => {
        wall.appendChild(makeNote(w, seeds.length + i, true, () => {
          const list = store.get("wishes", []);
          list.splice(i, 1);
          store.set("wishes", list);
          render();
        }));
      });
      empty.hidden = seeds.length + mine.length > 0;
    }

    if (form) { build(); render(); }
    return { render, note };
  })();

  /* -------------------------------- gifts ------------------------------ */
  function renderGifts() {
    const grid = $("#giftGrid");
    (cfg.gifts || []).forEach((gift, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gift-card reveal";
      card.style.setProperty("--tone", PALETTE[(i * 2) % PALETTE.length]);
      card.setAttribute("aria-expanded", "false");
      card.innerHTML = `
        <span class="gift-card__face gift-card__face--front">
          <span class="gift-card__emoji" aria-hidden="true">🎁</span>
          <span class="gift-card__lead">${gift.lead || "Tap to open"}</span>
          <span class="gift-card__tap">open me</span>
        </span>
        <span class="gift-card__face gift-card__face--back">
          <span class="gift-card__emoji" aria-hidden="true">${gift.emoji || "🎁"}</span>
          <span class="gift-card__title">${gift.title || ""}</span>
          <span class="gift-card__text">${gift.text || ""}</span>
        </span>`;
      card.addEventListener("click", () => {
        const open = card.classList.toggle("is-open");
        card.setAttribute("aria-expanded", String(open));
        if (open) {
          const r = card.getBoundingClientRect();
          Confetti.burst(r.left + r.width / 2, r.top + r.height / 2, 34, 8);
          Sfx.pop();
        }
      });
      grid.appendChild(card);
    });
  }


  /* ------------------------------ garlands ----------------------------- */
  const Bunting = (() => {
    const SHAPES = {
      // simple triangle flag
      triangle: (w, h) => `0,0 ${w},0 ${w / 2},${h}`,
      // pennant with a notch cut out of the bottom
      pennant: (w, h) => `0,0 ${w},0 ${w},${h * 0.72} ${w / 2},${h * 0.44} 0,${h * 0.72}`
    };
    const KINDS = ["triangle", "pennant", "triangle"];

    function render(el, opts) {
      if (!el) return;
      const o = Object.assign({ sag: 30, y0: 6, w: 34, h: 40, gap: 12 }, opts);
      const width = Math.max(320, el.clientWidth || window.innerWidth);
      const height = el.clientHeight || 96;
      const flagW = o.w, flagH = o.h, span = flagW + o.gap;
      const count = Math.max(6, Math.round((width - 40) / span));
      const total = count * span;
      const startX = (width - total) / 2 + o.gap / 2;
      const midX = width / 2;
      const ctrlY = o.y0 + o.sag * 2;

      // quadratic bezier: start (0,y0) -> control (mid, ctrlY) -> end (width,y0)
      const pointAt = (t) => {
        const mt = 1 - t;
        return {
          x: mt * mt * 0 + 2 * mt * t * midX + t * t * width,
          y: mt * mt * o.y0 + 2 * mt * t * ctrlY + t * t * o.y0
        };
      };

      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("aria-hidden", "true");
      svg.style.width = "100%";
      svg.style.height = "100%";

      const string = document.createElementNS(ns, "path");
      string.setAttribute("class", "bunting__string");
      string.setAttribute("d", `M0,${o.y0} Q${midX},${ctrlY} ${width},${o.y0}`);
      svg.appendChild(string);

      for (let i = 0; i < count; i++) {
        const x = startX + i * span + flagW / 2;
        const t = Math.max(0, Math.min(1, x / width));
        const p = pointAt(t);
        const p2 = pointAt(Math.min(1, t + 0.01));
        const angle = Math.atan2(p2.y - p.y, p2.x - p.x) * (180 / Math.PI);

        // wrapper carries the placement (attribute), inner group carries the
        // sway (CSS transform) — the two never fight each other.
        const wrap = document.createElementNS(ns, "g");
        wrap.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);

        const sway = document.createElementNS(ns, "g");
        sway.setAttribute("class", "bunting__flag");
        sway.style.animationDelay = (-rand(0, 3.6)).toFixed(2) + "s";
        sway.style.animationDuration = rand(3, 4.6).toFixed(2) + "s";

        const poly = document.createElementNS(ns, "polygon");
        const kind = KINDS[i % KINDS.length];
        poly.setAttribute("points", SHAPES[kind](flagW, flagH));
        poly.setAttribute("fill", PALETTE[i % PALETTE.length]);
        poly.setAttribute("transform", `translate(${(-flagW / 2).toFixed(1)} 0)`);

        sway.appendChild(poly);
        wrap.appendChild(sway);
        svg.appendChild(wrap);
      }

      el.innerHTML = "";
      el.appendChild(svg);
    }

    let timer = null;
    function renderAll() {
      render($("#bunting"), { sag: 32, y0: 8, w: 46, h: 52, gap: 22 });
      render($("#buntingFooter"), { sag: 16, y0: 8, w: 38, h: 40, gap: 20 });
    }
    function wire() {
      renderAll();
      window.addEventListener("resize", () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(renderAll, 200);
      });
    }
    return { wire, renderAll };
  })();

  /* ------------------------------ sparkles ----------------------------- */
  const Sparkles = (() => {
    const field = $("#sparkleField");
    const GLYPHS = ["✨", "⭐", "💛", "🎈", "🌸", "💫", "🎀"];
    function spawn(count) {
      if (!field || reduceMotion) return;
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.className = "sparkle";
        s.textContent = pick(GLYPHS);
        s.style.left = rand(2, 96) + "vw";
        s.style.top = rand(4, 92) + "vh";
        s.style.setProperty("--s", randInt(11, 20) + "px");
        s.style.setProperty("--t", rand(7, 15).toFixed(1) + "s");
        s.style.setProperty("--d", (-rand(0, 12)).toFixed(1) + "s");
        field.appendChild(s);
      }
    }
    return { spawn };
  })();

  /* --------------------------- pointer niceties ------------------------ */
  const Pointer = (() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* --- sparkle trail + warm glow that follows the cursor --- */
    function wireTrail() {
      const canvas = $("#trail");
      const glow = $("#cursorGlow");
      if (!canvas || !fine || reduceMotion) return;
      const ctx = canvas.getContext && canvas.getContext("2d");
      if (!ctx) return;

      let dpr = 1, W = 0, H = 0, raf = null, last = 0;
      const bits = [];
      let gx = -999, gy = -999, tx = gx, ty = gy;

      function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      window.addEventListener("resize", resize);

      function loop(now) {
        const dt = Math.min(3, (now - last) / 16.667) || 1;
        last = now;
        ctx.clearRect(0, 0, W, H);

        for (let i = bits.length - 1; i >= 0; i--) {
          const b = bits[i];
          b.vy += 0.012 * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.rot += b.vrot * dt;
          b.life += dt;
          const fade = clamp01(1 - b.life / b.ttl);
          if (fade <= 0) { bits.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = fade * 0.85;
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rot);
          ctx.fillStyle = b.color;
          ctx.fillRect(-b.size / 2, -b.size / 6, b.size, b.size / 3);
          ctx.restore();
        }

        if (glow) {
          gx += (tx - gx) * 0.12 * dt;
          gy += (ty - gy) * 0.12 * dt;
          glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
        }

        if (bits.length) raf = requestAnimationFrame(loop);
        else {
          raf = null;
          ctx.clearRect(0, 0, W, H);
          if (glow) glow.classList.remove("is-on");
        }
      }

      function start() {
        if (raf) return;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }

      window.addEventListener("pointermove", (e) => {
        tx = e.clientX; ty = e.clientY;
        if (glow && !glow.classList.contains("is-on")) {
          gx = gx < -100 ? tx : gx;
          gy = gy < -100 ? ty : gy;
          glow.classList.add("is-on");
        }
        const n = e.movementX + e.movementY > 26 ? 3 : 1;
        for (let i = 0; i < n; i++) {
          bits.push({
            x: e.clientX + rand(-4, 4),
            y: e.clientY + rand(-4, 4),
            vx: rand(-0.7, 0.7), vy: rand(-0.5, 0.5),
            size: rand(4, 9), rot: rand(0, 6.28), vrot: rand(-0.2, 0.2),
            color: pick(PALETTE), life: 0, ttl: rand(26, 52)
          });
        }
        if (bits.length > 160) bits.splice(0, bits.length - 160);
        start();
      }, { passive: true });
    }

    /* --- pointer tilt on cards --- */
    function wireTilt() {
      if (!fine || reduceMotion) return;
      $$(".memory, .day-card, .gift-card").forEach((el) => {
        let raf = null, next = null;
        function apply() {
          raf = null;
          el.style.transform = next;
        }
        el.addEventListener("pointermove", (e) => {
          if (e.pointerType === "touch") return;
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.classList.add("tilt-active");
          next = `perspective(900px) rotateY(${(px * 8).toFixed(2)}deg) rotateX(${(-py * 8).toFixed(2)}deg) translateY(-6px) scale(1.015)`;
          if (!raf) raf = requestAnimationFrame(apply);
        });
        el.addEventListener("pointerleave", () => {
          if (raf) { cancelAnimationFrame(raf); raf = null; }
          el.style.transform = "";
          el.classList.remove("tilt-active");
        });
      });
    }

    /* --- ripple on buttons --- */
    function wireRipple() {
      document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn");
        if (!btn || reduceMotion) return;
        const r = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const span = document.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = size + "px";
        span.style.left = (e.clientX - r.left - size / 2) + "px";
        span.style.top = (e.clientY - r.top - size / 2) + "px";
        btn.appendChild(span);
        window.setTimeout(() => span.remove(), 650);
      });
    }

    return { wireTrail, wireTilt, wireRipple };
  })();

  /* ---------------------------- hero parallax -------------------------- */
  function wireParallax() {
    if (reduceMotion) return;
    const layer = $("#heroParallax");
    const bunting = $("#bunting");
    const cue = $(".hero__cue");
    if (!layer) return;
    let raf = null;
    function update() {
      raf = null;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.2) return;
      layer.style.transform = `translate3d(0, ${(y * 0.16).toFixed(1)}px, 0)`;
      layer.style.opacity = String(clamp01(1 - y / (window.innerHeight * 0.85)));
      if (bunting) bunting.style.transform = `translate3d(0, ${(y * 0.34).toFixed(1)}px, 0)`;
      if (cue) cue.style.opacity = String(clamp01(1 - y / 320));
    }
    window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ------------------------------- share ------------------------------- */
  function wireShare() {
    const shareBtn = $("#shareBtn");
    const toast = $("#shareToast");
    const confettiBtn = $("#confettiBtn");
    const more = $("#cakeMore");
    const applause = $("#applauseBtn");
    const relight = $("#relightBtn");
    const musicBtn = $("#musicBtn");
    const musicIcon = $("#musicIcon");
    const musicLabel = $("#musicLabel");
    const toTop = $("#toTop");

    function say(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.style.opacity = "1";
      window.clearTimeout(say.timer);
      say.timer = window.setTimeout(() => { toast.style.opacity = "0"; }, 3400);
    }

    if (confettiBtn) confettiBtn.addEventListener("click", () => { Confetti.cannon(); Confetti.burst(window.innerWidth / 2, window.innerHeight * 0.35, 50, 12); });
    if (more) more.addEventListener("click", () => { Confetti.cannon(); Confetti.rain(160); Sfx.whoosh(); });
    if (relight) relight.addEventListener("click", () => {
      Cake.build();
      Sfx.pop();
      $("#cakeStatus").textContent = "Fresh candles, fresh wishes — go on.";
    });
    if (applause) applause.addEventListener("click", () => {
      const r = applause.getBoundingClientRect();
      Confetti.burst(window.innerWidth / 2, r.top - 20, 60, 11);
      Sfx.clap();
      window.setTimeout(() => Sfx.clap(), 300);
    });

    if (shareBtn) shareBtn.addEventListener("click", async () => {
      const url = window.location.href;
      const data = { title: `Happy Birthday, ${name}! 🎂`, text: "A little something I made for you 🎈", url };
      try {
        if (navigator.share) { await navigator.share(data); return; }
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          say("Link copied — go paste it somewhere nice! 🔗");
          return;
        }
        throw new Error("no share");
      } catch (err) {
        if (err && err.name === "AbortError") return;
        say("Copy this page's address from the bar above. 🔗");
      }
    });

    if (musicBtn) musicBtn.addEventListener("click", () => {
      const playing = Tune.toggle();
      musicBtn.setAttribute("aria-pressed", String(playing));
      musicIcon.textContent = playing ? "🔊" : "🔈";
      if (musicLabel) musicLabel.textContent = playing ? "Pause the tune" : "Birthday tune";
    });

    if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  }

  /* ------------------------- scroll & reveal wiring -------------------- */
  function wireScroll() {
    const topbar = $("#topbar");
    const bar = $("#scrollBar");
    const toTop = $("#toTop");
    const links = $$(".topbar__nav a");
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);

    // scroll-in reveal — IO for timing, sweep for guarantee
    const pending = new Set($$(".reveal"));
    let io = null;

    function reveal(el) {
      if (!pending.has(el)) return;
      pending.delete(el);
      const siblings = $$(".reveal", el.parentElement);
      const i = Math.min(siblings.indexOf(el), 6);
      el.style.transitionDelay = (i > 0 ? i * 0.07 : 0) + "s";
      el.classList.add("is-in");
      if (io) io.unobserve(el);
    }

    // Anything whose top has crossed 92% of the viewport height is revealed —
    // covers elements in view *and* ones already scrolled past.
    function sweepReveals() {
      if (!pending.size) return;
      const limit = window.innerHeight * 0.92;
      pending.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < limit || r.bottom < 0) reveal(el);
      });
    }

    if (typeof window.IntersectionObserver === "function") {
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) reveal(entry.target); });
      }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
      pending.forEach((el) => io.observe(el));
    }
    sweepReveals();

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => { ticking = false; paintScroll(); });
    }

    function paintScroll() {
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (bar) bar.style.width = (y / max) * 100 + "%";
      if (topbar && (Intro.done || y > 40)) topbar.classList.add("is-in");
      if (toTop) toTop.hidden = y < 600;

      let active = null;
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.25) active = s.id;
      });
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + active));
      sweepReveals();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sweepReveals);
    onScroll();
    paintScroll();

    $$("[data-scroll]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = $(btn.dataset.scroll);
        if (!target) return;
        if (typeof target.scrollIntoView === "function") {
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        } else {
          window.location.hash = btn.dataset.scroll;
        }
      });
    });

  }

  /* --------------------------------- init ------------------------------ */
  function init() {
    renderHero();
    renderLetter();
    renderDay();
    renderTimeline();
    renderGallery();
    renderGifts();
    if (cfg.rewardText) $("#cakeRewardText").textContent = cfg.rewardText;
    Cake.build();
    wireShare();
    wireScroll();
    Balloons.spawnAll();
    Bunting.wire();
    Sparkles.spawn(window.innerWidth < 760 ? 0 : 10);
    Pointer.wireTrail();
    Pointer.wireTilt();
    Pointer.wireRipple();
    wireParallax();

    if (reduceMotion) Confetti.rain(24);

    // a soft welcome burst when the intro is still on screen
    window.setTimeout(() => { if (!Intro.done) Confetti.rain(60); }, 900);

    // clicking a flame with a keyboard should work too
    document.addEventListener("keydown", (e) => {
      if (e.key === "p" && e.altKey) Confetti.cannon();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
