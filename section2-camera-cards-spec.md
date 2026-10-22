# Section 2 Spec: Camera Entrance + Blog Cards (GSAP)

Second section of the photography portfolio, directly below the hero. Companion to `hero-animation-spec.md`.

---

## 0. Reference Rules (read first)

- GSAP is **already installed**. Do not reinstall it. Only register `ScrollTrigger`, which ships with the `gsap` package.
- The **animation components folder** (confirm the exact path, e.g. `/animation-components/`) is the source of truth. Read it first and reuse what is there.
- **Do not generate fake, look-alike, or "close enough" substitutes** for components or assets that exist. New assets (camera, card images) will be supplied. Use them as given. Never draw or fake them.
- If something is missing or unclear, **stop and ask**.

---

## 1. The Design

- **Camera:** a vintage rangefinder camera cut-out (transparent PNG). It hangs by its strap from the top of the section and sits at the **bottom-left**, overlapping the second card. It is **in front of** the cards.
- **Cards:** a row of **five** blog cards, each with a **red pill** label beneath. Cards 2 and 4 carry a slight tilt for rhythm.
- Background: white or very light off-white. Red accent matches the hero (`#b50d0d`, confirm against the design file).

### Layer order (back to front)

| z-index | Layer |
|---|---|
| 0 | Section background |
| 1 | Cards (image, pill, title) |
| 2 | Camera (overlaps cards 2 and 3) |

---

## 2. Concept: "The Camera Deals the Prints"

The camera grows out of the bottom-left corner. As it grows, the cards are "dealt out" from it, left to right, like prints coming out of a darkroom: each card rises, straightens into its final tilt, and **develops** from washed-out black and white into full color. The pill beneath each card draws itself in last.

One scroll-linked timeline controls everything, so it is cohesive and reverses cleanly when the user scrolls back up.

### Sequence (timeline units, scrubbed)

| Position | What happens |
|---|---|
| 0.0 to 1.0 | **Camera** scales from 0.3 to 1 (origin bottom-left), eases into place with a tiny settle |
| 0.25 to 1.6 | **Cards** rise 60px, rotate in from an extra 6 degrees, scale 0.94 to 1, develop from grayscale to color. Stagger 0.15 left to right |
| 0.6 to 1.9 | **Pills** draw in: `scaleX` 0 to 1 from the left edge |
| 0.8 to 2.0 | **Titles and dates** fade up 10px |

---

## 3. Layout (minimal, premium)

### Principles

- One grid. Equal card widths, one gutter size, real outer margins (no card touching the screen edge).
- Same aspect ratio for every card (3:4).
- Pills and titles share one baseline across all five cards.
- Quiet typography: small, with generous spacing. Let the photos carry it.

### Markup

```html
<section class="work" id="work">
  <img class="work-camera" src="/camera.png" alt="" />

  <div class="work-grid">
    <article class="card" data-tilt="0">
      <a href="#" class="card-link">
        <figure class="card-media"><img src="..." alt="..." /></figure>
        <span class="card-pill">Category</span>
        <h3 class="card-title">Post title</h3>
        <time class="card-date">Oct 2026</time>
      </a>
    </article>
    <!-- 5 cards. Use data-tilt="-1.2" and "1.4" on cards 2 and 4 -->
  </div>
</section>
```

### CSS

```css
.work {
  position: relative;
  padding: clamp(80px, 12vw, 160px) 0;
  background: #fff;
  overflow: hidden;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: clamp(16px, 2vw, 32px);
  max-width: 1320px;
  margin: 0 auto;
  padding-inline: clamp(20px, 4vw, 56px);
}

.card-link { display: block; color: inherit; text-decoration: none; }

.card-media {
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 2px;
  background: #d9d9d9;
  margin: 0;
}
.card-media img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.card-pill {
  display: inline-block;
  margin-top: 16px;
  padding: 6px 18px;
  border-radius: 999px;
  background: #b50d0d;
  color: #fff;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transform-origin: left center;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
}

.card-title { margin: 12px 0 2px; font-size: 15px; font-weight: 500; }
.card-date  { font-size: 12px; opacity: 0.55; }

/* Quiet hover: image zooms inside its frame, pill outlines */
@media (hover: hover) {
  .card-link:hover .card-media img { transform: scale(1.04); }
  .card-link:hover .card-pill {
    background: transparent; color: #b50d0d; box-shadow: inset 0 0 0 1px #b50d0d;
  }
}

.work-camera {
  position: absolute;
  z-index: 2;
  left: 8%;            /* match the design file */
  bottom: -6%;         /* match the design file */
  width: clamp(240px, 26vw, 420px);
  transform-origin: 0% 100%;   /* bottom-left corner */
  pointer-events: none;
  will-change: transform;
}
```

**Important:** the tilt on cards 2 and 4 is applied with GSAP (`rotation`), **not** CSS `transform`, so the two never fight. Match exact positions and sizes to the design file.

---

## 4. The Timeline

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function initWorkSection() {
  const cards = gsap.utils.toArray(".card");

  // Resting state: each card's final tilt comes from data-tilt
  cards.forEach((c) => gsap.set(c, { rotation: parseFloat(c.dataset.tilt) || 0 }));

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".work",
      start: "top 75%",
      end: "top 10%",
      scrub: 1,               // smooths the scrub
    },
    defaults: { ease: "power3.out" },
  });

  // 1. Camera grows from the bottom-left corner
  tl.fromTo(
    ".work-camera",
    { scale: 0.3, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 1, ease: "power2.out" },
    0
  );

  // 2. Cards are dealt out, developing as they land
  tl.from(
    ".card-media",
    {
      y: 60,
      scale: 0.94,
      rotation: (i) => (i % 2 === 0 ? -6 : 6),
      autoAlpha: 0,
      filter: "grayscale(1) brightness(1.35)",
      duration: 0.9,
      stagger: 0.15,
    },
    0.25
  );

  // 3. Pills draw in
  tl.from(
    ".card-pill",
    { scaleX: 0, autoAlpha: 0, duration: 0.5, stagger: 0.15 },
    0.6
  );

  // 4. Titles and dates
  tl.from(
    [".card-title", ".card-date"],
    { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.04 },
    0.8
  );

  return tl;
}
```

### Tuning notes

- **Slower or faster:** change the `end` value in `scrollTrigger`. A larger gap between `start` and `end` means a slower, more cinematic scrub.
- **Develop effect:** keep it to `grayscale` and `brightness`. Do not animate `blur` (expensive and muddy on five images).
- **Camera settle (optional):** after the grow, add a tiny pendulum: `rotation: -2` to `0` with `ease: "elastic.out(1, 0.4)"` and transform origin at the strap top. Needs the strap to be part of the asset (see section 6).

---

## 5. Responsive, Accessibility, Performance

```js
const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  initWorkSection();
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  // Final state, no scrub
  gsap.set([".work-camera", ".card-media", ".card-pill", ".card-title", ".card-date"], {
    clearProps: "all",
  });
});
```

- **Tablet and mobile (under about 900px):** switch the grid to 2 columns (or a horizontal scroll-snap row), scale the camera down, and shorten the scroll distance.
- Animate only `transform`, `opacity`, and the light `filter` shown above.
- `will-change: transform` only on the camera.
- In React, run this inside `useGSAP` with `scope` set to the section ref so cleanup is automatic and `ScrollTrigger` instances do not stack.
- Call `ScrollTrigger.refresh()` once images have loaded so start and end positions are accurate.

---

## 6. Assets Needed

| Asset | Notes |
|---|---|
| Camera cut-out | Transparent PNG or WebP. Ideally **two layers**: camera body, and the strap as a separate image (lets the strap stay attached to the top while the camera swings or grows) |
| 5 card images | 3:4 crops, compressed (WebP or AVIF), with alt text |
| Card copy | Category, title, and date for each of the five cards |

Until real assets arrive, use plain grey placeholders. **Do not generate or fake images.**

---

## 7. Acceptance Checklist

- [ ] Animation components folder was read first and reused
- [ ] No invented or look-alike substitutes for supplied assets
- [ ] Camera grows from the bottom-left corner and stays in front of the cards
- [ ] Cards align on one grid with equal widths and gutters, and real outer margins
- [ ] Pills and titles share a baseline
- [ ] Tilt on cards 2 and 4 is applied with GSAP, not CSS transform
- [ ] Entrance is scroll-linked and reverses cleanly on scroll up
- [ ] Reduced-motion users get the final state without animation
- [ ] Mobile layout works and the camera does not overflow the screen
- [ ] No layout shift or jank at 60fps
