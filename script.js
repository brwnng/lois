(() => {
  const inner = document.getElementById("footer-marquee-inner");
  if (!inner) return;

  const baseHex =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--banner-base")
      .trim() || "#3A1212";

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));

  function hexToHsl(hex) {
    let h = hex.replace("#", "").trim();
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let H = 0,
      S = 0;
    const L = (max + min) / 2;
    const d = max - min;

    if (d !== 0) {
      S = d / (1 - Math.abs(2 * L - 1));
      switch (max) {
        case r:
          H = ((g - b) / d) % 6;
          break;
        case g:
          H = (b - r) / d + 2;
          break;
        case b:
          H = (r - g) / d + 4;
          break;
      }
      H *= 60;
      if (H < 0) H += 360;
    }
    return { h: H, s: S * 100, l: L * 100 };
  }

  const base = hexToHsl(baseHex);

  function buildSequence() {
    const seq = [];
    let total = 0;
    let count = 56;

    while (total < window.innerWidth * 1.6) {
      seq.length = 0;
      total = 0;

      for (let i = 0; i < count; i++) {
        const w = randi(24, 140);
        total += w;

        const hue = clamp(base.h + rand(-8, 10), 0, 45);
        const sat = clamp(base.s + rand(-10, 10), 18, 65);
        const lit = clamp(base.l + rand(-5, 6), 6, 22);
        const a = rand(0.82, 0.98);

        seq.push({ w, hue, sat, lit, a });
      }

      if (total < window.innerWidth * 1.6) count += 10;
      else break;
    }

    return seq;
  }

  let pairs = [];

  function hsla({ hue, sat, lit, a }) {
    return `hsla(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${lit.toFixed(1)}%, ${a.toFixed(3)})`;
  }

  function rebuild() {
    inner.innerHTML = "";
    pairs = [];

    const seq = buildSequence();

    for (let run = 0; run < 2; run++) {
      for (let i = 0; i < seq.length; i++) {
        const item = seq[i];
        const el = document.createElement("div");
        el.className = "banner-block";
        el.style.width = item.w + "px";
        el.style.backgroundColor = hsla(item);
        inner.appendChild(el);

        if (run === 0) pairs[i] = [el, null];
        else pairs[i][1] = el;
      }
    }
  }

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  function mutateOne(i) {
    const [a, b] = pairs[i];
    if (!a || !b) return;

    const w = randi(24, 140);
    const hue = clamp(base.h + rand(-8, 10), 0, 45);
    const sat = clamp(base.s + rand(-10, 10), 18, 65);
    const lit = clamp(base.l + rand(-5, 6), 6, 22);
    const alp = rand(0.82, 0.98);

    const next = { w, hue, sat, lit, a: alp };

    a.style.width = next.w + "px";
    b.style.width = next.w + "px";
    a.style.backgroundColor = hsla(next);
    b.style.backgroundColor = hsla(next);
  }

  function startMorphing() {
    if (reduceMotion) return;

    const tick = () => {
      const n = randi(3, 7);
      for (let k = 0; k < n; k++) {
        mutateOne(randi(0, pairs.length - 1));
      }
    };

    tick();
    setInterval(tick, 3800);
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => rebuild(), 150);
  });

  rebuild();
  startMorphing();
})();
