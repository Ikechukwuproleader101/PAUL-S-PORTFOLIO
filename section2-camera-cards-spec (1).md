# Section 2 Spec: "The Shutter Click" (GSAP)

Second section of the photography portfolio, directly below the hero. This replaces the earlier "dealt prints" direction. Companion to `hero-animation-spec.md`.

**Visual rules for this section: flat colors only. No gradients. No box-shadows. Separation comes from whitespace and 1px hairlines.**

---

## 0. Reference Rules (read first)

- GSAP is **already installed**. Do not reinstall it. Only register `ScrollTrigger`, which ships with the `gsap` package.
- The **animation components folder** (confirm the exact path, e.g. `/animation-components/`) is the source of truth. Read it first and reuse what is there.
- **Do not generate fake, look-alike, or "close enough" substitutes** for components or assets that exist. New assets (camera, card images) will be supplied. Use them as given. Never draw or fake them.
- If something is missing or unclear, **stop and ask**.

---

## 1. The Design

- **Camera:** a vintage rangefinder cut-out (transparent PNG) hanging by its strap from the top of the section, anchored at the **bottom-left**, overlapping the second card. It sits **in front of** the cards.
- **Cards:** five blog cards in one row, each with a red pill beneath. Cards 2 and 4 carry a slight tilt.
- **Tokens:**

| Token | Value | Use |
|---|---|---|
| `--ink` | `#111111` | Curtains, text |
| `--red` | `#b50d0d` | Pills only (confirm against the design file) |
| `--paper` | `#f4f3ef` | Section background |
| `--print` | `#ffffff` | Print border around each photo |
| `--hair` | `rgba(17,17,17,0.14)` | 1px hairlines |

### Layer order (back to front)

| z-index | Layer |
|---|---|
| 0 | Section background |
| 1 | Cards |
| 2 | Camera |
| 3 | Flash overlay |

---

## 2. Concept: The Shutter Click

A rangefinder has a cloth shutter curtain that slides across to expose the film. Each card starts covered by a solid ink-black curtain. The camera grows from the corner, then **clicks**, and the curtains slide away one after another, exposing each photo.

### Two parts

**Part A: Camera grows (scroll-scrubbed).** Tied to scroll position, so it moves with the user and reverses when they scroll back.

**Part B: The click (plays once, reverses on scroll-up).** Triggered when Part A finishes.

### Sequence

| Time | What happens |
|---|---|
| Part A | Camera scales from 0.3 to 1 with the origin at the bottom-left corner |
| 0.00s | **Click:** the camera image kicks (scale 1.02 and back, about 0.16s) |
| 0.00 to 0.25s | **Flash:** flat white overlay blinks to about 70% and back out |
| 0.05s | Cards appear (under the flash), covered by their black curtains, rising 40px |
| 0.15s onward | **Exposure:** each curtain slides away left to right (`scaleX` to 0 with origin at the right edge), 0.12s apart. The photo inside settles from 1.15x to 1x |
| 0.50s onward | Index number, title, and date slide up out of a mask line |
| 0.60s onward | Red pill draws in (`scaleX` 0 to 1 from the left edge) |

Total after the click: about 2 seconds.

---

## 3. Layout: More Space, More Polish

### Principles

- Generous section padding. The row should breathe: lots of empty space above and below.
- One grid, equal card widths, wide gutters, real outer margins (nothing touches the screen edge).
- **Staggered vertical offsets** (0, 48, 16, 64, 0 px) for an editorial rhythm. Cards 2 and 4 keep a slight tilt.
- Each card is a **print**: white border inside a 1px hairline outline.
- Small, quiet type: index number, title, date. One baseline per row of text across all cards.

### Markup

```html
<section class="work" id="work">
  <div class="work-camera">
    <img src="/camera.png" alt="" />
  </div>
  <div class="work-flash" aria-hidden="true"></div>

  <div class="work-grid">
    <article class="card" data-tilt="0">
      <a class="card-link" href="#">
        <div class="card-print">
          <div class="card-photo">
            <div class="card-zoom"><img src="..." alt="..." /></div>
            <span class="card-curtain" aria-hidden="true"></span>
          </div>
        </div>

        <div class="card-meta">
          <span class="card-index"><span>01</span></span>
          <span class="card-pill">Category</span>
        </div>
        <h3 class="card-title"><span>Post title</span></h3>
        <time class="card-date"><span>Oct 2026</span></time>
      </a>
    </article>
    <!-- 5 cards. data-tilt="-1.2" on card 2, data-tilt="1.4" on card 4 -->
  </div>
</section>
```

The extra `.card-zoom` wrapper exists so the hover zoom (CSS) never fights the settle animation (GSAP) on the `img`.

### CSS

```css
:root {
  --ink: #111;
  --red: #b50d0d;
  --paper: #f4f3ef;
  --print: #fff;
  --hair: rgba(17, 17, 17, 0.14);
}

.work {
  position: relative;
  overflow: hidden;
  background: var(--paper);
  padding: clamp(120px, 16vw, 240px) 0;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: clamp(24px, 3vw, 48px);
  max-width: 1360px;
  margin: 0 auto;
  padding-inline: clamp(24px, 5vw, 72px);
  align-items: start;
}
.card:nth-child(2) { margin-top: 48px; }
.card:nth-child(3) { margin-top: 16px; }
.card:nth-child(4) { margin-top: 64px; }

.card-link { display: block; color: var(--ink); text-decoration: none; }

/* The print */
.card-print {
  background: var(--print);
  padding: 10px;
  outline: 1px solid var(--hair);
}
.card-photo {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #d9d9d9;
}
.card-zoom { width: 100%; height: 100%; transition: transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1); }
.card-zoom img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* The shutter curtain: solid ink, covers the photo until the click */
.card-curtain {
  position: absolute; inset: 0;
  background: var(--ink);
  transform-origin: 100% 50%;
  z-index: 2;
}

/* Meta row */
.card-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; }
.card-index { font-size: 12px; font-variant-numeric: tabular-nums; letter-spacing: 0.08em; opacity: 0.6; }
.card-pill {
  padding: 6px 16px; border-radius: 999px;
  background: var(--red); color: #fff;
  font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
  transform-origin: left center;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
}
.card-title { margin: 14px 0 2px; font-size: 15px; font-weight: 500; line-height: 1.3; }
.card-date  { font-size: 12px; opacity: 0.55; }

/* Mask lines for the slide-up text */
.card-index, .card-title, .card-date { display: block; overflow: hidden; }
.card-index > span, .card-title > span, .card-date > span { display: inline-block; }
.card-meta .card-index { display: inline-block; }

/* Quiet hover */
@media (hover: hover) {
  .card-link:hover .card-zoom { transform: scale(1.03); }
  .card-link:hover .card-pill { background: transparent; color: var(--red); box-shadow: inset 0 0 0 1px var(--red); }
}

/* Camera */
.work-camera {
  position: absolute; z-index: 2;
  left: 8%;            /* match the design file */
  bottom: -6%;         /* match the design file */
  width: clamp(240px, 26vw, 420px);
  transform-origin: 0% 100%;     /* bottom-left corner */
  pointer-events: none;
  will-change: transform;
}
.work-camera img { display: block; width: 100%; transform-origin: 0% 100%; }

/* Flash: flat white */
.work-flash { position: absolute; inset: 0; z-index: 3; background: #fff; opacity: 0; visibility: hidden; pointer-events: none; }
```

Match exact positions, sizes, and offsets to the design file. The tilt on cards 2 and 4 is applied by GSAP (`rotation`), never CSS `transform`.

---

## 4. The Timeline

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function initWorkSection() {
  const cards = gsap.utils.toArray(".card");

  // Resting state
  gsap.set(cards, { autoAlpha: 0 });
  cards.forEach((c) => gsap.set(c, { rotation: parseFloat(c.dataset.tilt) || 0 }));

  // ---------- Part A: camera grows (scroll-scrubbed) ----------
  gsap.timeline({
    scrollTrigger: {
      trigger: ".work",
      start: "top 80%",
      end: "top 35%",
      scrub: 1,
    },
  }).fromTo(
    ".work-camera",
    { scale: 0.3, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, ease: "power2.out" }
  );

  // ---------- Part B: the click (plays, reverses on scroll-up) ----------
  const click = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  click
    // camera kick (on the img, so it never fights the scrubbed scale on the wrapper)
    .to(".work-camera img", { scale: 1.02, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0)

    // flat white flash
    .to(".work-flash", { autoAlpha: 0.7, duration: 0.05, ease: "none" }, 0)
    .to(".work-flash", { autoAlpha: 0, duration: 0.2, ease: "power2.out" }, 0.05)

    // cards appear under the flash, covered by their curtains
    .to(cards, { autoAlpha: 1, duration: 0.01, ease: "none" }, 0.05)
    .from(cards, { y: 40, duration: 0.9, stagger: 0.12 }, 0.05)

    // exposure: curtains slide away left to right
    .to(".card-curtain", { scaleX: 0, duration: 0.8, ease: "power4.inOut", stagger: 0.12 }, 0.15)
    .fromTo(".card-zoom img", { scale: 1.15 }, { scale: 1, duration: 1.1, stagger: 0.12 }, 0.15)

    // text slides up out of masks
    .from(
      [".card-index > span", ".card-title > span", ".card-date > span"],
      { yPercent: 110, duration: 0.6, stagger: 0.04 },
      0.5
    )

    // pills draw in
    .from(".card-pill", { scaleX: 0, autoAlpha: 0, duration: 0.5, stagger: 0.12 }, 0.6);

  ScrollTrigger.create({
    trigger: ".work",
    start: "top 35%",              // where Part A ends
    animation: click,
    toggleActions: "play none none reverse",
  });
}
```

### Tuning notes

- **Slower or more cinematic:** increase the gap between `start` and `end` in Part A.
- **Curtain feel:** `power4.inOut` gives a smooth cloth-like slide. For a snappier mechanical feel use `power2.inOut` with a shorter duration.
- **Flash:** keep it short and subtle (about 0.25s total). If it feels harsh, lower the peak from 0.7 to 0.5.
- **Optional pendulum:** if the strap is a separate asset, let the camera swing with a small `rotation` from the strap's top point after the click.

---

## 5. Responsive, Accessibility, Performance

```js
const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  initWorkSection();
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  // Final state, no animation
  gsap.set(".card-curtain", { display: "none" });
  gsap.set([".work-camera", ".card"], { clearProps: "all", autoAlpha: 1 });
});
```

- **Under about 900px:** use a 2-column grid, reduce the vertical offsets to 0 to 24px, scale the camera down, and shorten the Part A scroll range.
- Animate only `transform`, `opacity`, and `visibility`. No gradients, no box-shadows, no blur.
- `will-change: transform` only on the camera wrapper.
- In React, run this inside `useGSAP` with `scope` set to the section ref so cleanup is automatic and triggers do not stack.
- Call `ScrollTrigger.refresh()` after images load so start and end positions are accurate.
- Keep real `alt` text on all card images, and keep the links keyboard focusable. Visible focus outline on `.card-link:focus-visible`.

---

## 6. Assets Needed

| Asset | Notes |
|---|---|
| Camera cut-out | Transparent PNG or WebP. Ideally two layers: camera body and strap separate, so the strap can stay attached at the top while the camera grows or swings. A single image also works; the strap will scale with the camera |
| 5 card images | 3:4 crops, compressed (WebP or AVIF) |
| Card copy | Category, title, and date for each card |

Until real assets arrive, use plain flat grey placeholders. **Do not generate or fake images.**

---

## 7. Acceptance Checklist

- [ ] Animation components folder was read first and reused
- [ ] No invented or look-alike substitutes for supplied assets
- [ ] No gradients and no box-shadows anywhere in the section
- [ ] Camera grows from the bottom-left corner and stays in front of the cards
- [ ] The click (kick, flash) fires once the camera finishes growing
- [ ] Curtains slide away left to right, 0.12s apart, with the photo settling inside
- [ ] Cards sit on one grid with staggered offsets, print borders, and real outer margins
- [ ] Tilt on cards 2 and 4 is applied with GSAP, not CSS transform
- [ ] Hover zoom and the settle animation do not conflict
- [ ] Reverses cleanly on scroll-up
- [ ] Reduced-motion users get the final state without animation
- [ ] Mobile layout works and the camera does not overflow the screen
- [ ] No layout shift or jank at 60fps
