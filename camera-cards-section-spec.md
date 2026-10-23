# Camera + Project Cards Section Spec (GSAP)

Fifth section of the photography portfolio: a large vintage camera on the left and a loose pile of overlapping project-photo cards on the right. Companion to the other section specs.

> **Later changes:** see `camera-wheels-and-cards-fix.md` (camera wheels built in code, and a fix for the cards that flash on load and then vanish). Where it conflicts with this file, it wins.

**The goal is an exact match to the supplied design. No redesign, no "improvements", no added elements. The animation only gets everything into its exact final position from the design.**

---

## 0. Paste This to Antigravity First

> Open `reference/camera-cards-section.png`. It shows a white section with a large camera on the left (cropped by the left and bottom edges, lens pointing up) and, on the right, a loose pile of about fourteen overlapping rectangular cards of different sizes. Each card will hold a photo from one of the owner's projects.
>
> Build the section **exactly** as designed: use the camera image from `assets/camera/` as supplied, and take every card's position, size, and stacking order from the design file (each card is its own layer). Do not tidy the pile into a grid, do not change sizes or overlaps, do not draw or generate any image, and do not add anything that is not in the design. The one extra layer is the rotating camera part (`assets/camera/part.png`, created and supplied separately by the owner): place it exactly where the design file puts it (ask if it is not marked) and rotate it slowly and continuously, as described in the spec. Ignore the blue selection line and the "Desktop" label in the screenshot (design-tool marks). If anything is unclear, stop and ask. Follow `camera-cards-section-spec.md` in full.

(Confirm both paths with the owner and replace them above if they differ.)

---

## 1. Rules

- **Exact match to the design file.** The screenshot is a layout reference. Measure final sizes and positions from the original design file. The numbers below are estimates from a small screenshot (about plus or minus 10%).
- **Card positions, sizes, and stacking order come from the design file**, layer by layer. The pile is intentionally loose and overlapping. Never regularize it.
- **No fake assets.** The camera and the project photos come from the supplied directories. Where a photo is not available yet, keep the flat grey placeholder shown in the design. Never generate or substitute images.
- GSAP is **already installed.** Do not reinstall it. Register only the plugins needed.
- The **animation components folder** is the source of truth for existing helpers. Check it first.

### Hard "do not" list

- No border radius on cards, no gradients, no shadows, no blurs
- No extra headings, labels, captions, or decorative elements in the final state (the supplied rotating camera part is the only exception)
- No color changes
- Nothing added by the animation may remain after it finishes (the focus brackets are removed)

---

## 2. The Design

A **white** section, split into two halves:

**Left: the camera.** A large vintage rangefinder camera (lens hood reading "Summarex 8.5 cm", a focus scale with distance markings, the camera body with the brand name at the bottom). It is **cropped by the left edge and the bottom edge**, the lens points up, and there is white space above the lens hood.

**The rotating part:** one extra layer, created separately by the owner and supplied as its own image. It sits on top of the camera at the spot the design file marks (a position and size relative to the camera image) and turns slowly and continuously around its own center. It is decorative (`aria-hidden`).

**Right: the card pile.** About **14 rectangular cards** of varied sizes, overlapping like prints scattered on a table, all upright (no tilt in the design). Cards are flat grey placeholders (`#d9d9d9`); one already shows a photo. The pile sits in the right half and keeps a small margin from the right edge.

### Tokens (confirm against the design file)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#ffffff` | Section background |
| `--card-bg` | `#d9d9d9` | Card placeholder fill |
| `--ink` | `#111111` | Focus brackets (animation only) |

The placeholder cards appear to have a very thin darker edge. Check the design file: if it is a real 1px stroke, keep it as a hairline; if not, no stroke.

---

## 3. Measurements (Estimates)

The screenshot shows the full frame at roughly a third of its size (the frame is about 1440 wide and 1050 tall). **Confirm everything in the design file.**

| Thing | Estimate at 1440 wide | Fluid |
|---|---|---|
| Section height | about 1050px | `min-height: 72.7vw` |
| Camera: width (body) | about 850px | `59vw` |
| Camera: position | flush to the left edge, cropped by the bottom edge; the top of the lens hood sits about 125px below the section top | `left: 0`, `bottom` cropped, hood top at about `8.7vw` |
| Lens hood box (for the focus brackets) | about 450 x 230px, starting about 10px from the left, about 125px from the top | `31vw x 16vw` |
| Rotating part: position and size | **from the design file**, as a percentage of the camera image's box | `--px`, `--py`, `--pw` (see section 4) |
| Card pile: left edge | about 595px | `41.3vw` |
| Card pile: size | about 765 x 620px | `53vw x 43vw` (aspect about 765 / 620) |
| Card pile: top | about 300px from the section top | `21vw` |
| Right margin of the pile | about 78px | `5.4vw` |

The camera and the pile do **not** overlap each other in the design.

### Layer order (back to front)

| z-index | Layer |
|---|---|
| 0 | Section background |
| 1 | Camera, with the rotating part on top of it |
| 2 to n | Cards, in the exact stacking order from the design file |
| top | Focus brackets (animation only, removed afterwards) |

---

## 4. The Card Pile: Data-Driven

Every card is described by a small record taken **from the design file**: its position and size as a **percentage of the pile's bounding box**, and its stacking order. Percentages keep the pile exact at every screen size.

```html
<div class="cluster">
  <!-- One <a> per card, in back-to-front order -->
  <a class="pcard" href="/projects/..." style="--l:0%; --t:20%; --w:30%; --h:28%; --z:1" data-z="1">
    <span class="pcard-face">
      <img src="/assets/projects/..." alt="..." />   <!-- supplied photo. Omit until available -->
    </span>
  </a>
  <!-- ... about 14 cards ... -->
</div>
```

**The values above are a format example only. Replace every value with measurements from the design file.** (A good method: select the pile in the design tool, read each card's x, y, width, and height, subtract the pile's own x and y, then divide by the pile's width and height.)

```css
.cc { --paper: #fff; --card-bg: #d9d9d9; --ink: #111;
  position: relative; overflow: hidden; background: var(--paper); min-height: 72.7vw; }

/* ---------- Camera ---------- */
.camera       { position: absolute; left: 0; bottom: 0; width: 59vw; z-index: 1; }   /* parallax layer */
.camera-rise  { transform-origin: 0% 100%; }                                         /* entrance layer */
.camera-stack { position: relative; transform-origin: 0% 100%; }                     /* camera + rotating part move as one */
.camera-img   { display: block; width: 100%; height: auto; }
.camera-part  { position: absolute; left: var(--px); top: var(--py); width: var(--pw); aspect-ratio: 1; }   /* from the design file */
.camera-part-img { display: block; width: 100%; height: 100%; transform-origin: 50% 50%; }          /* spins around its true center */

/* ---------- Card pile ---------- */
.cluster {
  position: absolute;
  left: 41.3vw; top: 21vw;
  width: 53vw; aspect-ratio: 765 / 620;
  z-index: 2;
}
.pcard {
  position: absolute;
  left: var(--l); top: var(--t); width: var(--w); height: var(--h);
  z-index: var(--z);
  display: block;
}
.pcard-face { display: block; width: 100%; height: 100%; background: var(--card-bg); overflow: hidden; }
.pcard-face img { display: block; width: 100%; height: 100%; object-fit: cover; }

/* ---------- Focus brackets (animation only) ---------- */
.af { position: absolute; z-index: 5; left: .7vw; top: 8.7vw; width: 31vw; height: 16vw;
      pointer-events: none; visibility: hidden; }
.af i { position: absolute; width: 1.9vw; height: 1.9vw; border: 3px solid var(--ink); }
.af i:nth-child(1) { left: 0;  top: 0;    border-right: 0; border-bottom: 0; }
.af i:nth-child(2) { right: 0; top: 0;    border-left: 0;  border-bottom: 0; }
.af i:nth-child(3) { left: 0;  bottom: 0; border-right: 0; border-top: 0; }
.af i:nth-child(4) { right: 0; bottom: 0; border-left: 0;  border-top: 0; }
.cc.is-in .af { display: none; }                      /* nothing extra stays in the final layout */

/* ---------- Pre-animation: no flash before the script runs ---------- */
.cc:not(.is-ready) .pcard,
.cc:not(.is-ready) .camera { visibility: hidden; }
```

If the supplied camera image is a **JPG or a photo on a white background** instead of a transparent PNG, add `mix-blend-mode: multiply` to `.camera-img` so the white disappears against the white section. A transparent PNG is better. Check the asset first, do not guess.

Markup for the camera:

```html
<div class="camera">
  <div class="camera-rise">
    <div class="camera-stack">
      <img class="camera-img" src="/assets/camera/camera.png" alt="" />

      <!-- Rotating part: supplied separately by the owner.
           The values below are a format example only. Take them from the design file. -->
      <div class="camera-part" style="--px: 0%; --py: 0%; --pw: 10%" aria-hidden="true">
        <img class="camera-part-img" src="/assets/camera/part.png" alt="" />
      </div>
    </div>
  </div>
</div>

<div class="af" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
```

Four layers on the camera, one per job, so the animations never fight each other: `camera` (mouse parallax), `camera-rise` (the entrance), `camera-stack` (the click kick, so the image and the rotating part move together), and `camera-part-img` (the continuous rotation). The `--px`, `--py`, and `--pw` values are the part's left, top, and width as a percentage of the camera image, measured from the design file.

---

## 5. The Animation: "Take the Shot, Throw the Prints"

Plays **once** when the section scrolls into view. About 3.3 seconds. The camera takes the shot, and the photos land on the table.

| Time | What happens |
|---|---|
| 0.0 to 1.2s | **Camera rises** into the frame from below, with a slight rotation settling to 0 |
| 0.9 to 1.35s | **Focus brackets** appear large around the lens hood and snap in tight (hard ease) |
| 1.35s | **The click:** a 1% kick on the camera. The **rotating part** starts turning from rest, eases up to a slow steady speed over 2.5s, and keeps turning for as long as the section is on screen |
| 1.35 to 2.2s | **Cards are thrown in** from beyond the right edge, back to front, 0.06s apart. Each rotates up to 10 degrees on the way and straightens as it lands, shrinking from 1.08 to 1 for a light "thud" |
| 1.8s | Brackets disappear |
| 2.0 to 3.3s | **Photos are exposed:** each card's photo is revealed with a hard wipe from the bottom up over its grey placeholder, one after another |

Everything is flat. No fades through gradients, no blur, no shadows.

### Code

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function initCameraCards() {
  const root   = document.querySelector(".cc");
  const rise   = root.querySelector(".camera-rise");
  const stack  = root.querySelector(".camera-stack");
  const part   = root.querySelector(".camera-part-img");   // absent until the owner supplies it
  const af     = root.querySelector(".af");
  const cards  = gsap.utils.toArray(".pcard", root)
                   .sort((a, b) => (+a.dataset.z) - (+b.dataset.z));   // back to front
  const photos = cards.map((c) => c.querySelector("img")).filter(Boolean);

  // Starting state. Re-run on refresh so the cards always start beyond the right edge
  let started = false;
  function setStart() {
    if (started) return;   // never reset the cards once the entrance has begun
    gsap.set(rise, { yPercent: 28, rotation: -3 });
    gsap.set(cards, {
      x: (i, el) => window.innerWidth - el.getBoundingClientRect().left + 60,
      rotation: () => gsap.utils.random(-10, 10),
      scale: 1.08,
    });
    gsap.set(photos, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(af, { autoAlpha: 0 });
  }
  setStart();
  ScrollTrigger.addEventListener("refreshInit", setStart);
  root.classList.add("is-ready");

  // Rotating camera part: one slow turn every SPIN_SECONDS, starting from rest
  const SPIN_SECONDS = 30;          // slower is better than faster. Tune by feel
  let spin;
  function startSpin() {
    if (!part) return;
    spin = gsap.to(part, { rotation: "+=360", duration: SPIN_SECONDS, ease: "none", repeat: -1 });
    spin.timeScale(0);
    gsap.to(spin, { timeScale: 1, duration: 2.5, ease: "power2.in" });   // eases up to speed

    // Pause while the section is off screen, resume when it returns
    ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => spin.paused(!self.isActive),
    });
  }

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: root, start: "top 60%", once: true },
    onStart() {
      started = true;
      ScrollTrigger.removeEventListener("refreshInit", setStart);   // otherwise a later refresh sends the cards back off screen
    },
    onComplete() {
      // Hand control back to CSS so hover works normally
      gsap.set([rise, stack, cards, photos, af], { clearProps: "all" });   // not the rotating part
      root.classList.add("is-in");
      enableParallax(root);
    },
  });

  // 1. Camera rises
  tl.to(rise, { yPercent: 0, rotation: 0, duration: 1.2, ease: "power4.out" }, 0);

  // 2. Focus brackets lock onto the lens hood
  tl.fromTo(af, { scale: 1.8, autoAlpha: 0 },
                { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power4.inOut" }, 0.9);

  // 3. The click, which also starts the rotating part turning
  tl.to(stack, { scale: 1.01, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }, 1.35);
  tl.add(startSpin, 1.35);
  tl.to(af, { autoAlpha: 0, duration: 0.15, ease: "none" }, 1.8);

  // 4. Cards are thrown in, back to front
  tl.to(cards, { x: 0, rotation: 0, scale: 1, duration: 0.8, ease: "power4.out",
                 stagger: 0.06 }, 1.35);

  // 5. Photos are exposed with a hard wipe
  tl.to(photos, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.inOut",
                  stagger: 0.06 }, 2.0);

  return () => { if (spin) spin.kill(); };   // cleanup
}

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  return initCameraCards();      // returns a cleanup function
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  // Final state immediately
  const root = document.querySelector(".cc");
  root.classList.add("is-ready", "is-in");
});
```

### The rotating part (keeps turning slowly)

- **Starts at the click** (1.35s) from a standstill, and eases up to its steady speed over 2.5s, so it never jerks into motion.
- **Speed:** one full turn about every 30 seconds, at a constant speed (`ease: "none"`), clockwise. Slow and calm. If it draws the eye away from the cards, make it slower.
- **Pivot:** the exact center of the supplied image. This only works if the image is a square with the part centered (see the asset brief in section 8).
- **It travels with the camera:** because it sits inside the camera layers, the rise, the click kick, and the mouse parallax all apply to it too.
- **Pauses when the section is off screen** and resumes when it returns.
- **Reduced motion:** the part stays still.
- Only `transform` is animated.

A flat image only looks convincing when it spins if the part faces the viewer in the camera photo (a circle seen straight on). If the part is seen at an angle, do not rotate a flat image. Ask the owner about another approach.

### Mouse parallax (after the entrance, desktop only)

```js
function enableParallax(root) {
  if (!window.matchMedia("(hover: hover)").matches) return;

  const camera  = root.querySelector(".camera");
  const cluster = root.querySelector(".cluster");

  const cx = gsap.quickTo(camera,  "x", { duration: 0.8, ease: "power3" });
  const cy = gsap.quickTo(camera,  "y", { duration: 0.8, ease: "power3" });
  const kx = gsap.quickTo(cluster, "x", { duration: 0.8, ease: "power3" });
  const ky = gsap.quickTo(cluster, "y", { duration: 0.8, ease: "power3" });

  root.addEventListener("pointermove", (e) => {
    const nx = e.clientX / window.innerWidth  - 0.5;   // -0.5 to 0.5
    const ny = e.clientY / window.innerHeight - 0.5;
    cx(nx * 16);  cy(ny * 10);        // camera: a few pixels
    kx(nx * -12); ky(ny * -8);        // pile: the opposite way, for depth
  });
}
```

Keep it **subtle**. If a visitor notices the parallax consciously, it is too strong.

---

## 6. Interaction: Cards

Each card is a **link to its project** (destinations supplied by the owner). The hover and focus effect is enabled only after the entrance finishes, so it never fights the animation.

```css
.cc.is-in .pcard-face { transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1); }

@media (hover: hover) {
  .cc.is-in .pcard:hover { z-index: 99; }                              /* comes to the front */
  .cc.is-in .pcard:hover .pcard-face { transform: translate(-10px, -10px); }  /* slides up and left */
}
.cc.is-in .pcard:focus-visible { z-index: 99; outline: 2px solid var(--ink); outline-offset: 4px; }
.cc.is-in .pcard:focus-visible .pcard-face { transform: translate(-10px, -10px); }

@media (prefers-reduced-motion: reduce) { .cc * { transition: none !important; } }
```

Why the card is two layers: the outer `.pcard` never moves (so the hover area is stable and there is no flicker), while the inner `.pcard-face` does the sliding.

---

## 7. Responsive

No mobile design was supplied. Keep the same look and use this default, and ask before going further:

```css
@media (max-width: 900px) {
  .cc { min-height: 0; padding-bottom: 12vw; }

  .camera  { position: relative; width: 92vw; margin-top: 8vw; }
  .cluster { position: relative; left: auto; top: auto; width: 90vw; margin: 6vw auto 0; }
  .af      { left: 1vw; top: 12vw; width: 56vw; height: 28vw; }
}
```

The pile uses percentages, so it keeps its exact arrangement at any size. Disable the mouse parallax on touch devices (the `hover: hover` check already does).

---

## 8. Assets and Content Needed

| Item | Notes |
|---|---|
| Camera image | Transparent PNG or WebP preferred. If it is a photo on white, use the `multiply` fallback in section 4. Ideally also supply the **lens hood as a separate layer**, which would allow a telescoping hood in a later pass |
| Rotating camera part | Created separately by the owner as its own image. See the asset brief below |
| Project photos | One per card (about 14), compressed (WebP or AVIF), cropped to each card's shape, with alt text |
| Card links | A destination for each card |
| Card layout data | Taken from the design file, per card (section 4) |

Until photos arrive, cards stay flat grey. **Do not generate or fake images.**

### Asset brief: the rotating part

- Transparent PNG or WebP, at 2x resolution or higher
- **Square canvas with the part exactly centered**, so it spins around its true center
- **Seen straight on** (a circle facing the viewer), so a flat rotation looks real
- Lighting, color, and sharpness match the camera photo. No baked-in drop shadow unless the camera photo has one
- If the part is a copy of something that already appears in the camera photo, the camera image needs that area **cleaned or blank behind it**, otherwise the original shows through while the new part turns. Supply a camera image with the part removed, or place the part exactly over the original
- Any markings on the part will be visible as it turns. That is intended. Never mirror or alter them

---

## 9. Acceptance Checklist

- [ ] The animation components folder was read first and reused
- [ ] No invented or look-alike substitutes for supplied assets
- [ ] Overlaying the build on the design file at 1440 wide: camera, every card's position, size, and overlap land within 2px
- [ ] The pile has the right number of cards, the right stacking order, and was **not** tidied into a grid
- [ ] The camera is cropped by the left and bottom edges, and there is white space above the lens hood
- [ ] The rotating part sits exactly where the design file marks it, at the right size, using the supplied image only
- [ ] It turns around its own center with no wobble, slowly and continuously, starting from rest at the click
- [ ] It pauses off screen, stays still for reduced-motion users, and moves with the camera (rise, click, parallax)
- [ ] No border radius, gradients, shadows, or blurs. The focus brackets are gone after the animation
- [ ] Entrance plays once: camera rises, brackets lock, click, cards thrown in, photos exposed
- [ ] No flash of the final layout before the animation starts
- [ ] After the entrance, hover brings a card to the front and slides it up and left without flicker
- [ ] Cards are real links, keyboard focusable, with a visible focus outline
- [ ] Reduced-motion users get the final state without animation
- [ ] Mouse parallax is subtle and disabled on touch devices
- [ ] Mobile fallback works with no sideways overflow
- [ ] No console errors, no new libraries installed

---

## 10. Open Items (ask the owner if not already answered)

1. Whether clicking a card should open that project's page (assumed yes, with the link supplied per card)
2. Whether the camera image is a transparent PNG or a photo on a white background, and whether the lens hood can be supplied as a separate layer
3. The destination and alt text for each card, and which photo goes in which card
4. Which part of the camera the rotating part is, where it sits (position and size from the design file), and whether it is seen straight on
5. Whether the camera image has that area cleaned behind the part, or the part is placed exactly over the original
