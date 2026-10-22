# Section 3 Spec: "Extrude" Cards + Button (GSAP)

Third section of the photography portfolio. Companion to `hero-animation-spec.md` and `section2-camera-cards-spec.md`.

**The goal is an exact match to the supplied design (the `Desktop - 3.png` frame, 1440 x 1024). No redesign, no "improvements", no added elements. If something is not in the design, it does not go in the build.**

---

## 0. Reference Rules (read first)

- GSAP is **already installed**. Do not reinstall it. Only register `ScrollTrigger`, which ships with the `gsap` package.
- The **animation components folder** (confirm the exact path, e.g. `/animation-components/`) is the source of truth for existing components, helpers, and easings. Read it first and reuse what is there.
- **Do not generate fake, look-alike, or "close enough" versions** of anything that exists or is supplied. Card photos and the button label will be supplied. Until then use the plain placeholders described below. Never generate images or invent copy.
- If the design file (Figma or PNG) and this document disagree on a measurement, **the design file wins**. Flag the difference.
- If anything is missing or unclear, **stop and ask**.

### Hard "do not" list

- No border radius anywhere (all corners are sharp)
- No gradients, no blurred shadows, no soft box-shadows, no outlines, no borders
- No extra headings, labels, icons, or decorative elements
- No color changes. Only the colors in section 1
- Do not center-align or add outer margins to the card row: it intentionally bleeds off the edges (section 2)

---

## 1. The Design

A solid red section containing, top to bottom:

1. An empty red band
2. A row of **four tall white cards**, each with a **hard dark offset shadow** on its right and bottom
3. A **centered grey button** with its own black hard offset shadow

This uses the same hard-offset shadow language as the pixel "PHOTOGRAPHER" text in the hero.

### Tokens

| Token | Value | Use |
|---|---|---|
| `--red` | `#b50d0d` | Section background (reuse the hero's red; confirm against the design file) |
| `--card` | `#ffffff` | Card face |
| `--card-shadow` | `#1f1f1f` | Card shadows |
| `--btn` | `#d9d9d9` | Button face |
| `--btn-shadow` | `#000000` | Button shadow |

Note the card shadows are a near-black dark grey, while the button shadow is pure black. Keep that difference.

---

## 2. Exact Measurements

Measured from the 1440 x 1024 frame. Build with the fluid values (vw) so it scales, and check the result at 1440 wide.

| Thing | At 1440 wide | Fluid value |
|---|---|---|
| Empty red band above cards | 220px | `15.3vw` |
| Card width | 345px | `24vw` |
| Card height | 473px | `aspect-ratio: 345 / 473` |
| Card shadow offset (right and down) | 25px | `--off: clamp(14px, 1.74vw, 25px)` |
| Space between cards | equals the shadow offset, so each card sits flush against the previous card's shadow | `gap: var(--off)` |
| Row left bleed | the first card starts about 23px **off the left edge** | `margin-left: -1.6vw` |
| Row right edge | the 4th card's shadow is **clipped by the viewport edge** (only about 3px of it shows) | section has `overflow: hidden` |
| Card bottom to button top | 144px | `10vw` |
| Button size | 534 x 98px | `width: min(37.1vw, 534px)`, `height: clamp(64px, 6.8vw, 98px)` |
| Button shadow offset | 10px right and down | `--boff: clamp(6px, 0.7vw, 10px)` |
| Space below the button shadow | about 79px | `padding-bottom: clamp(56px, 5.5vw, 80px)` |

Notes on the details that are easy to get wrong:

- The shadow is the card's rectangle moved right and down by the offset. That is why a small red notch appears under the bottom-left of each card, between one card's bottom shadow and the next. Do not "fix" it.
- The button is horizontally centered in the section. (The mock sits about 20px right of true center; center it and mention it if it matters.)
- The red band above the cards stays empty.

---

## 3. Markup

```html
<section class="shelf" id="shelf">
  <div class="shelf-row">

    <article class="xcard">
      <span class="xcard-shadow" aria-hidden="true"></span>
      <a class="xcard-face" href="#">
        <!-- <img src="..." alt="..." /> supplied later. Plain white until then -->
      </a>
    </article>
    <!-- 4 cards total -->

  </div>

  <a class="cta" href="#">
    <span class="cta-shadow" aria-hidden="true"></span>
    <span class="cta-face">
      <span class="cta-label"><!-- label text supplied from the design --></span>
    </span>
  </a>
</section>
```

Why two layers per card: the **shadow never moves** and the **face moves on top of it**. That one idea drives the whole animation using transforms only (no animated box-shadow).

---

## 4. CSS

```css
.shelf {
  --red: #b50d0d;
  --card: #fff;
  --card-shadow: #1f1f1f;
  --btn: #d9d9d9;
  --btn-shadow: #000;
  --off: clamp(14px, 1.74vw, 25px);
  --boff: clamp(6px, 0.7vw, 10px);

  position: relative;
  overflow: hidden;                         /* clips the 4th card's shadow */
  background: var(--red);
  padding: 15.3vw 0 clamp(56px, 5.5vw, 80px);
}

/* Row bleeds off the left edge; last shadow is clipped on the right */
.shelf-row {
  display: flex;
  gap: var(--off);
  margin-left: -1.6vw;
}

/* ---------- Card ---------- */
.xcard {
  position: relative;
  flex: 0 0 24vw;
  aspect-ratio: 345 / 473;
}
.xcard-shadow {
  position: absolute;
  inset: 0;
  background: var(--card-shadow);
  transform: translate(var(--off), var(--off));
}
.xcard-face {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  background: var(--card);
  overflow: hidden;
}
.xcard-face img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ---------- Button ---------- */
.cta {
  position: relative;
  display: block;
  width: min(37.1vw, 534px);
  height: clamp(64px, 6.8vw, 98px);
  margin: 10vw auto 0;
  text-decoration: none;
  color: #111;
}
.cta-shadow {
  position: absolute;
  inset: 0;
  background: var(--btn-shadow);
  transform: translate(var(--boff), var(--boff));
}
.cta-face {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--btn);
}

/* ---------- Pre-animation state (driven by CSS so it is responsive) ---------- */
.shelf:not(.is-in) .xcard,
.shelf:not(.is-in) .cta { visibility: hidden; }

/* Flat start: each face sits exactly on top of its shadow, hiding it */
.shelf:not(.is-in) .xcard-face { transform: translate(var(--off), var(--off)); }
.shelf:not(.is-in) .cta-face   { transform: translate(var(--boff), var(--boff)); }

/* ---------- Interaction (enabled only after the entrance finishes) ---------- */
.shelf.is-in .xcard-face,
.shelf.is-in .cta-face {
  transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
}
@media (hover: hover) {
  .shelf.is-in .xcard:hover .xcard-face,
  .shelf.is-in .xcard:focus-within .xcard-face { transform: translate(-8px, -8px); }  /* lifts further off its shadow */
  .shelf.is-in .cta:hover .cta-face { transform: translate(3px, 3px); }              /* leans toward its shadow */
}
.shelf.is-in .cta:active .cta-face { transform: translate(var(--boff), var(--boff)); } /* pressed flush, like a key */

.xcard-face:focus-visible,
.cta:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }

@media (prefers-reduced-motion: reduce) {
  .shelf * { transition: none !important; }
}
```

**Important:** do not put the CSS `transition` on the faces before the entrance finishes (hence `.is-in`). A CSS transition would smooth GSAP's per-frame updates and make the entrance lag.

---

## 5. The Animation: "Extrude"

Plays **once** when the section scrolls into view. Total about 2.3 seconds.

| Time | What happens |
|---|---|
| 0.0s | The four cards start **stacked on top of each other at the center of the screen**, flat (shadows hidden), 60px low |
| 0.0 to 1.2s | Cards **spread out** to their positions, left to right, 0.1s apart (`power3.inOut`) |
| 0.9 to 1.7s | As each card lands, its **face lifts up and left** off its fixed shadow, revealing the shadow with a small bounce (`back.out(2.2)`), 0.1s apart |
| 1.5 to 2.1s | The **button** slides up and fades in |
| 1.9 to 2.35s | The button face lifts off its shadow, the same bounce |

The only things that move are transforms (`x`, `y`) and visibility. The shadows never move.

### Code

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function initShelf() {
  const root = document.querySelector(".shelf");
  const cards = gsap.utils.toArray(".xcard", root);
  const faces = gsap.utils.toArray(".xcard-face", root);
  const cta = root.querySelector(".cta");
  const ctaFace = root.querySelector(".cta-face");

  function play() {
    // Stack point: the middle of the screen
    const stackX = window.innerWidth / 2;

    // 0. Stack the cards at the center, flat and a little low
    gsap.set(cards, {
      autoAlpha: 1,
      y: 60,
      zIndex: (i) => cards.length - i,
      x: (i, el) => stackX - (el.getBoundingClientRect().left + el.offsetWidth / 2),
    });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete() {
        // Hand control back to CSS so hover and press work normally
        gsap.set([cards, faces, cta, ctaFace], { clearProps: "transform,zIndex" });
        root.classList.add("is-in");
      },
    });

    // 1. Spread out, left to right
    tl.to(cards, {
      x: 0, y: 0,
      duration: 0.9,
      ease: "power3.inOut",
      stagger: { each: 0.1, from: "start" },
    }, 0);

    // 2. Extrude: each face lifts off its fixed shadow as its card lands
    tl.to(faces, {
      x: 0, y: 0,
      duration: 0.5,
      ease: "back.out(2.2)",
      stagger: 0.1,
    }, 0.9);

    // 3. Button arrives last, then extrudes the same way
    tl.fromTo(cta, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.5);
    tl.to(ctaFace, { x: 0, y: 0, duration: 0.45, ease: "back.out(2.2)" }, 1.9);
  }

  ScrollTrigger.create({
    trigger: root,
    start: "top 60%",
    once: true,
    onEnter: play,
  });
}

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  initShelf();
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  // Final state immediately, no animation
  document.querySelector(".shelf").classList.add("is-in");
});
```

### How the extrude works (so nobody "fixes" it)

The CSS pre-state moves each face onto its shadow, so the shadow is hidden. GSAP reads that starting position and animates the face to `x: 0, y: 0`. As the face moves up and left, the fixed shadow is revealed on the right and bottom. At the end, `clearProps` removes GSAP's inline transform and the CSS takes over with the face at its resting position, so there is no jump.

### Tuning notes

- **Slower or snappier:** adjust the three `duration` values and the `0.1` staggers, not the structure.
- **Bounce:** `back.out(2.2)` gives a small, confident overshoot. Lower it toward `1.4` for calmer, raise it for punchier.
- **Start point:** `top 60%` means it plays once the top of the section is 60% down the screen.

---

## 6. Interaction

- **Card hover or keyboard focus:** the face lifts a further 8px up and left. The shadow stays, so more of it shows. The hover area is the card's fixed box, so there is no flicker.
- **Button hover:** the face leans 3px toward its shadow.
- **Button press:** the face sits flush on its shadow, like a mechanical key, and releases when let go.

Hover styles apply only on devices that support hover. Keyboard focus gets the same lift as hover plus a visible focus outline.

---

## 7. Responsive

No mobile design was supplied. Keep exactly the same visual language and use this default, and ask before going beyond it:

```css
@media (max-width: 900px) {
  .shelf { --off: 12px; --boff: 6px; padding-top: 22vw; }

  .shelf-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
    margin-left: 0;
    padding-inline: 20px;
  }
  .xcard { flex: none; width: auto; }

  .cta { width: calc(100% - 40px); height: 72px; margin-top: 56px; }
}
```

The stack point and measurements are calculated when the animation plays, so they adapt to the layout.

---

## 8. Assets and Content Needed

| Item | Notes |
|---|---|
| 4 card images | 345:473 crop (about 0.73 aspect), full-bleed inside each face, compressed (WebP or AVIF), with alt text |
| Card links | Destination for each card |
| Button label and link | Label text comes from the design. Do not invent it |

Until real assets arrive: cards stay plain white, and the button label stays empty. **Do not generate or fake images or copy.**

---

## 9. Acceptance Checklist

- [ ] Animation components folder was read first and reused
- [ ] No invented or look-alike substitutes for supplied assets or copy
- [ ] At 1440 wide, overlaying the build on the design PNG matches within 2px: band, card edges, shadows, button
- [ ] Row bleeds off the left edge, and the 4th card's shadow is clipped at the right edge
- [ ] Shadow offsets are 25px (cards) and 10px (button) at 1440 wide
- [ ] Card shadows are `#1f1f1f`, button shadow is pure black, no other shadow colors
- [ ] No border radius, gradients, blurs, outlines, or extra elements
- [ ] Entrance plays once: stack, spread, extrude, then the button
- [ ] No flash of unstyled content before the animation starts
- [ ] After the entrance, hover and press work without a jump
- [ ] Reduced-motion users get the final state immediately
- [ ] Mobile fallback works and the shadows are still visible
- [ ] Smooth at 60fps (transform and visibility only)
