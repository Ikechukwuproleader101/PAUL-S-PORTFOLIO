# About Section Spec: "GET TO KNOW ME" (GSAP)

Fourth section of the photography portfolio. Companion to `hero-animation-spec.md`, `section2-camera-cards-spec.md`, `section3-extrude-cards-spec.md`, and `wheel-placement-spec.md`.

**The goal is an exact match to the supplied design. No redesign, no "improvements", no added elements. If it is not in the design, it does not go in the build.**

---

## 0. Paste This to Antigravity First

> Open `reference/about-section.png`. It shows the "GET TO KNOW ME" about section: a white section with a red label and a paragraph on the left, and on the right a slightly tilted card with a dark vertical text strip on its left edge and a red portrait area, running off the right edge of the screen.
>
> Build this section **exactly** as shown. Use the portrait image from `assets/about/` as supplied. Use the paragraph copy from the design file word for word. Do not rewrite, correct, shorten, or extend the copy, and do not draw, trace, or generate any image. Ignore the blue selection outline and the "Desktop" label in the screenshot (design-tool marks), and the thin red strip at the very top (that is the previous section). If anything is unclear, stop and ask. Follow `about-section-spec.md` in full.

(Confirm both paths with the owner and replace them above if they differ.)

---

## 1. Rules

- **Exact match to the design file.** The screenshot is a location and layout reference. Measure final sizes from the original design file; the numbers below are estimates from a small screenshot (about plus or minus 10%).
- **Copy is final.** Use the owner's paragraph exactly as written, including spelling and punctuation. If you spot what look like typos, list them in your reply to the owner, but **do not change them**.
- **The screenshot shows only part of the paragraph** (it stops mid-sentence). Do not invent the rest. Use the full text from the design file, or ask the owner for it.
- GSAP is **already installed.** Do not reinstall it. Register only the plugins needed.
- The **animation components folder** is the source of truth for existing helpers. Check it first.
- **No fake assets.** The portrait comes from the supplied directory. Never generate, redraw, or substitute it.

### Hard "do not" list

- No border radius on the label or the card (all corners are sharp)
- No gradients, no shadows, no blurs, no outlines, no borders (none appear in the design)
- No extra headings, buttons, icons, or decorative elements
- No color changes. Only the colors in section 2
- Do not crop the card to fit. It intentionally runs off the right edge

---

## 2. The Design

A **white** section, two sides:

**Left:** a red label reading **GET TO KNOW ME** (white, bold, uppercase), then a left-aligned paragraph beneath it.

**Right:** a card, **tilted slightly clockwise**, made of two parts:

1. A **dark vertical strip** along the card's left edge, carrying two words of small grey text running along its length
2. A **red portrait area** (the hero's red) holding a cut-out portrait of a person in sunglasses and a striped polo shirt, bottom-aligned and cropped by the card's bottom edge

The card **bleeds off the right edge** of the screen.

### Tokens (confirm against the design file)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#ffffff` | Section background |
| `--red` | `#b50d0d` | Label background, portrait area (reuse the hero's red) |
| `--ink` | `#111111` | Paragraph text |
| `--strip` | `#1f1f1f` | Dark strip (same dark as the card shadows in section 3, if the design file confirms) |
| `--strip-text` | mid grey (take from design) | Text on the strip |

Typeface: the same clean sans as the nav (it looks like Inter). Label is bold and uppercase; paragraph is regular.

---

## 3. Layout and Measurements

Estimated from the screenshot, which appears to show the full width of the frame (about 1440 wide at roughly a third of its size). **Confirm every number in the design file.**

| Thing | Estimate at 1440 wide | Fluid |
|---|---|---|
| Label: left edge | about 136px | `9.5vw` |
| Label: size | about 480 x 83px | `width: 33vw`, `height: 5.8vw` |
| Label: text | white, bold, uppercase, about 38px | `clamp(18px, 2.7vw, 40px)` |
| Gap, label bottom to paragraph top | about 55px | `3.8vw` |
| Paragraph: width | about 480px (same as the label) | `33vw` |
| Paragraph: size | about 34px, line-height about 1.3 | `clamp(16px, 2.4vw, 34px)` |
| Paragraph alignment | left, same left edge as the label | |
| Card: left edge of the dark strip | about 60% across the section | `left: 60vw` |
| Dark strip: width | about 90px | `6.2vw` |
| Card: height | about 620px | `43vw` |
| Card: tilt | about 4 degrees clockwise (the right side sits lower) | `--tilt: 4deg` |
| Card: right edge | runs past the screen edge and is clipped | section `overflow: hidden` |
| Top of the label to the top of the card | the card starts slightly above the label's top, near the same level | |

Details that are easy to get wrong:

- The whole card (strip + red portrait area) tilts as **one piece**.
- The strip text runs **along the strip, rotated**. Two words, one after the other, separated by a gap. Check in the design whether it reads top to bottom or bottom to top, and copy the **exact words, spelling, and capitalization** from the design (the screenshot shows two words, one capitalized and one lowercase).
- The portrait is **cropped by the bottom of the card**, not floating inside it.
- The thin red strip at the very top of the screenshot belongs to the previous section.

---

## 4. Markup

```html
<section class="about">
  <div class="about-copy">
    <h2 class="about-label"><span class="about-label-text">Get to know me</span></h2>
    <p class="about-text"><!-- full paragraph from the design file, unchanged --></p>
  </div>

  <div class="about-card">
    <div class="about-strip">
      <span class="about-strip-text"><!-- the two words, exactly as in the design --></span>
    </div>
    <div class="about-photo">
      <img src="/assets/about/portrait.png" alt="" />   <!-- alt text supplied by the owner -->
    </div>
  </div>
</section>
```

Use the class names already in the project where they exist.

---

## 5. CSS

```css
.about {
  --paper: #fff;
  --red: #b50d0d;
  --ink: #111;
  --strip: #1f1f1f;
  --strip-text: #6b6b6b;   /* take the real grey from the design file */
  --tilt: 4deg;

  position: relative;
  overflow: hidden;                 /* clips the card at the right edge */
  background: var(--paper);
  padding: 7vw 0;                   /* match the design's vertical spacing */
  min-height: 62vw;                 /* match the design's section height */
}

/* ---------- Left: label + paragraph ---------- */
.about-copy {
  position: relative;
  z-index: 1;
  margin-left: 9.5vw;
  width: 33vw;
}
.about-label {
  margin: 0;
  display: flex;
  align-items: center;
  width: 100%;
  height: 5.8vw;
  padding-inline: 1.6vw;
  background: var(--red);
  color: #fff;
  font-weight: 700;
  font-size: clamp(18px, 2.7vw, 40px);
  letter-spacing: 0.01em;
  text-transform: uppercase;
  overflow: hidden;                 /* masks the text for the entrance animation */
}
.about-label-text { display: inline-block; }

.about-text {
  margin: 3.8vw 0 0;
  color: var(--ink);
  font-size: clamp(16px, 2.4vw, 34px);
  line-height: 1.3;
  text-align: left;
}

/* ---------- Right: the tilted card ---------- */
.about-card {
  position: absolute;
  left: 60vw;
  top: 4vw;                         /* match the design */
  display: flex;
  width: 52vw;                      /* wide enough to run past the right edge */
  height: 43vw;
  transform: rotate(var(--tilt));
  transform-origin: 0% 50%;
}
.about-strip {
  position: relative;
  flex: 0 0 6.2vw;
  background: var(--strip);
  display: flex;
  align-items: center;
  justify-content: center;
}
.about-strip-text {
  writing-mode: vertical-rl;        /* runs along the strip */
  /* add: transform: rotate(180deg); if the design reads bottom to top */
  color: var(--strip-text);
  font-size: clamp(10px, 1.6vw, 24px);
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.about-photo {
  position: relative;
  flex: 1;
  background: var(--red);
  overflow: hidden;
}
.about-photo img {
  position: absolute;
  bottom: 0;                        /* bottom-aligned, cropped by the card's edge */
  left: 50%;                        /* confirm horizontal placement in the design */
  height: 88%;                      /* confirm in the design */
  width: auto;
  transform: translateX(-50%);
}
```

If the supplied image is a **flattened picture** (red background included) instead of a transparent cut-out, fill the whole `.about-photo` with it (`object-fit: cover`) and remove the red background. Check the asset first. Do not guess.

---

## 6. Animation (proposed, in the site's style)

Flat colors, hard edges, no fades through gradients. Plays **once** when the section scrolls into view. About 2 seconds. The look is unchanged: the animation only gets elements into their exact final positions from the design.

| Time | What happens |
|---|---|
| 0.0 to 0.6s | **Label:** the red block wipes in from the left (`scaleX` 0 to 1, origin left) |
| 0.3 to 0.8s | **Label text** slides up out of its mask |
| 0.45s onward | **Paragraph:** lines slide up out of masks, one after another, 0.06s apart |
| 0.2 to 1.3s | **Card:** swings in from the right. It starts 30vw off to the right and tilted 10 degrees more, then lands on its final tilt with a small overshoot |
| 1.0 to 1.8s | **Strip text:** revealed along the strip with a clip-path wipe |

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);

function initAbout() {
  const root = document.querySelector(".about");

  // Split the paragraph into masked lines (SplitText ships free with GSAP 3.13 and later;
  // on older versions, wrap the lines by hand)
  const split = SplitText.create(root.querySelector(".about-text"), {
    type: "lines",
    mask: "lines",
  });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: root, start: "top 65%", once: true },
  });

  tl.from(".about-label", { scaleX: 0, transformOrigin: "0% 50%", duration: 0.6, ease: "power4.inOut" }, 0)
    .from(".about-label-text", { yPercent: 110, duration: 0.5 }, 0.3)
    .from(split.lines, { yPercent: 110, duration: 0.8, stagger: 0.06 }, 0.45)
    .from(".about-card", {
      x: "30vw",
      rotation: 14,                  // lands on the CSS tilt (4deg); starts 10deg further over
      duration: 1.1,
      ease: "back.out(1.4)",
    }, 0.2)
    .from(".about-strip-text", {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 0.8,
      ease: "power2.inOut",
    }, 1.0);

  return () => { split.revert(); tl.kill(); };   // cleanup
}

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  return initAbout();
});
// Reduced motion: everything simply shows in its final state
```

Notes:

- GSAP reads the CSS tilt on `.about-card` as the end state, so the card finishes exactly on the design's angle. If the angle in the design file differs from 4 degrees, change `--tilt` and the `rotation` start value together (start = tilt + 10).
- The paragraph is split into lines for the animation. If the layout changes on resize, revert and re-split (debounce it).
- Only `transform` and `clip-path` are animated. No opacity fades are needed.
- Optional, **off by default:** a very slight parallax on the portrait while scrolling. Add it only if the owner asks.

---

## 7. Responsive

No mobile design was supplied. Keep the same look and use this default, and ask before going further:

```css
@media (max-width: 900px) {
  .about { padding: 12vw 0 16vw; min-height: 0; }

  .about-copy { margin-inline: 6vw; width: auto; }
  .about-label { height: 14vw; padding-inline: 4vw; font-size: clamp(16px, 5vw, 24px); }
  .about-text  { margin-top: 6vw; font-size: clamp(16px, 4.4vw, 22px); }

  .about-card {
    position: relative;
    left: 14vw;                 /* still runs past the right edge */
    top: 0;
    margin-top: 14vw;
    width: 100vw;
    height: 88vw;
  }
  .about-strip { flex-basis: 12vw; }
}
```

---

## 8. Accessibility

- The label is a real heading (`h2`) styled as a label, and the paragraph is real text, never an image.
- Portrait `alt` text comes from the owner. Do not invent a description of the person.
- If the words on the strip repeat a name shown elsewhere, mark them `aria-hidden="true"`. If they are the only place the name appears, keep them readable.
- Keep the text contrast: white on the red label, dark ink on white.

---

## 9. Acceptance Checklist

- [ ] The animation components folder was read first and reused
- [ ] Copy is word for word from the design file, uncorrected, and the missing end of the paragraph was **not** invented
- [ ] The portrait comes from the supplied directory, unmodified
- [ ] Overlaying the build on the design file at 1440 wide: label, paragraph, card, strip, and portrait land within 2px
- [ ] The card (strip + red area) tilts as one piece, to the design's angle, and runs off the right edge
- [ ] Strip text matches the design: the exact words, orientation, size, and grey
- [ ] No border radius, gradients, shadows, blurs, outlines, or extra elements
- [ ] Entrance plays once and ends exactly on the design's final layout
- [ ] Reduced-motion users see the final state without animation
- [ ] Mobile fallback works and nothing overflows sideways except the intended card bleed
- [ ] No console errors, no new libraries installed
