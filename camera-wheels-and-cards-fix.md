# Change Request: Camera Wheels + Cards Flash Fix

This amends `camera-cards-section-spec.md` for the camera + project-cards section. Two changes:

- **Part A:** create camera parts (wheels) in code that rotate constantly.
- **Part B:** fix a bug: **the cards show when the page loads and then disappear.**

Everything else in `camera-cards-section-spec.md` stays exactly as it is. Where this file conflicts with it, **this file wins** (see section 1).

---

## 0. Paste This to Antigravity First

> Read `camera-wheels-and-cards-fix.md` fully, then apply two changes to the camera + cards section, and change nothing else.
>
> **A.** Create the camera wheels yourself, in code, as SVG (the owner explicitly asks you to build them). Put one wheel on each spot the design file marks, inside the camera layer so it moves with the camera. Each wheel rotates constantly and slowly. Use flat colors only, no gradients.
>
> **B.** Fix the bug where the project cards are visible when the page loads, then vanish. The cause and the exact fix are described in Part B. After the entrance has played, the cards must stay visible, and before it plays they must never be visible in their final position.
>
> Do not touch the card layout, the camera photo, the project photos, or the other sections. If anything is unclear, stop and ask.

---

## 1. What This Overrides

| In `camera-cards-section-spec.md` | Now |
|---|---|
| "The rotating part is supplied separately by the owner" | **Antigravity builds the wheels in code** (Part A). If the owner later supplies a custom image for a wheel, swap the SVG for that image in that wheel's slot |
| "Never draw or substitute assets" | **Relaxed for the wheels only**, by the owner's explicit instruction. The camera photo and the project photos must still be the supplied images. Never generate those |
| One rotating part (`.camera-part`) | **Several wheels** (`.camera-wheel`), each with its own size, speed, and direction |
| `setStart` re-runs on every `ScrollTrigger` refresh | **Removed.** This was the cause of the bug (Part B) |

---

# Part A: Create the Camera Wheels

## A1. What to Build

Small camera parts (dials, knobs, wheels) built as **inline SVG** and placed on the camera. Each one:

- is drawn straight on (a circle facing the viewer)
- has a **knurled (toothed) edge**, a tick ring, and a **small red index dot** at the top
- **rotates constantly** around its own center at a slow, steady speed

**Why the index dot and ticks matter:** a perfectly symmetrical wheel looks like it is standing still when it turns. The dot, ticks, and numerals are what make the rotation visible.

### Where they go

- **One wheel per spot the design file marks.** Take each wheel's position and size from the design file as a percentage of the camera image's box (`--px`, `--py`, `--pw`, the same method as the rest of the spec).
- **If the design file does not mark any wheel positions, stop and ask the owner where each one goes. Do not guess.**
- Wheels live **inside `.camera-stack`**, so the entrance, the click kick, and the mouse parallax carry them along.

### Two things to watch

1. **Perspective.** A flat, face-on wheel only looks right where the camera photo shows a face-on circular part, or as a separate component sitting beside the camera. Laid over a part the photo shows at an angle, it will look pasted on. Flag any spot where that happens.
2. **Duplicates.** If a wheel sits over something that already appears in the camera photo, that area of the photo must be cleaned or fully covered by the wheel. Otherwise the original shows through while the wheel turns.

---

## A2. The Wheel Component

One function draws every wheel. Sizes and counts change per wheel, but the style stays consistent.

```js
const NS = "http://www.w3.org/2000/svg";
const el = (name, attrs = {}) => {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};

// FLAT colors only. No gradients. Sample the real tones from the camera photo
// next to the wheel and pick the closest palette.
export const WHEEL_PALETTES = {
  chrome: { edge: "#8c8c8c", face: "#d9d9d9", mark: "#1f1f1f", hubRing: "#6b6b6b", hub: "#f2f2f2", accent: "#b50d0d" },
  black:  { edge: "#1f1f1f", face: "#3a3a3a", mark: "#ffffff", hubRing: "#1f1f1f", hub: "#d9d9d9", accent: "#b50d0d" },
};

export function createWheel({ teeth = 48, ticks = 60, numerals = [], palette = "chrome" } = {}) {
  const c = WHEEL_PALETTES[palette];
  const svg = el("svg", { viewBox: "-100 -100 200 200", "aria-hidden": "true", focusable: "false" });

  // 1. Knurled edge: alternating outer / inner radius forms the teeth
  const R1 = 99, R2 = 93;
  let d = "";
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 ? R2 : R1;
    const a = (i / (teeth * 2)) * Math.PI * 2;
    d += (i ? "L" : "M") + (Math.sin(a) * r).toFixed(2) + " " + (-Math.cos(a) * r).toFixed(2);
  }
  svg.appendChild(el("path", { d: d + "Z", fill: c.edge }));

  // 2. Face
  svg.appendChild(el("circle", { r: 88, fill: c.face }));

  // 3. Tick ring: a longer tick every 5th mark
  for (let i = 0; i < ticks; i++) {
    const major = i % 5 === 0;
    svg.appendChild(el("line", {
      x1: 0, y1: major ? -62 : -66, x2: 0, y2: -74,
      stroke: c.mark, "stroke-width": major ? 2 : 1,
      transform: `rotate(${(i / ticks) * 360})`,
    }));
  }

  // 4. Numerals (optional), set tangent to the ring so they turn with the wheel
  numerals.forEach((txt, i) => {
    const a = (i / numerals.length) * Math.PI * 2;
    const x = Math.sin(a) * 52, y = -Math.cos(a) * 52;
    const t = el("text", {
      x: x.toFixed(2), y: (y + 3.5).toFixed(2), "text-anchor": "middle",
      fill: c.mark, "font-size": 10, "font-family": "inherit",
      transform: `rotate(${(a * 180) / Math.PI} ${x.toFixed(2)} ${y.toFixed(2)})`,
    });
    t.textContent = txt;
    svg.appendChild(t);
  });

  // 5. Hub, with a screw slot
  svg.appendChild(el("circle", { r: 36, fill: c.hubRing }));
  svg.appendChild(el("circle", { r: 26, fill: c.hub }));
  svg.appendChild(el("rect", { x: -16, y: -2.5, width: 32, height: 5, fill: c.mark }));

  // 6. Red index dot: this is what makes the rotation readable
  svg.appendChild(el("circle", { cx: 0, cy: -81, r: 4, fill: c.accent }));

  return svg;
}
```

Guidelines for the look:

- **Flat fills only.** No gradients, no shadows, no blur. The site's whole language is flat color with hard edges.
- Match the palette to the part of the camera photo the wheel sits next to. Sample real tones. Do not pick colors by feel.
- Keep the detail restrained: it must sit comfortably next to a real photograph.

---

## A3. Markup and CSS

One slot per wheel, inside the camera stack. The values below are a **format example only. Positions and sizes come from the design file.**

```html
<div class="camera-stack">
  <img class="camera-img" src="/assets/camera/camera.png" alt="" />

  <div class="camera-wheel" data-speed="60" data-dir="1"  data-teeth="60" data-ticks="60"
       data-palette="chrome" data-numerals="1,2,4,8,15,30,60,125,250,500"
       style="--px: 0%; --py: 0%; --pw: 14%" aria-hidden="true"></div>

  <div class="camera-wheel" data-speed="36" data-dir="-1" data-teeth="36" data-ticks="40"
       data-palette="chrome"
       style="--px: 0%; --py: 0%; --pw: 9%" aria-hidden="true"></div>

  <div class="camera-wheel" data-speed="22" data-dir="1"  data-teeth="24" data-ticks="24"
       data-palette="black"
       style="--px: 0%; --py: 0%; --pw: 6%" aria-hidden="true"></div>
</div>
```

How the defaults work: bigger wheels turn **slower**, neighbors turn in **opposite directions**, and no two wheels share a speed, so the motion feels like a real mechanism. Adjust the count, sizes, speeds, and numerals to what the design file calls for. The shutter-speed numerals are a decorative default; drop them if the design shows none.

```css
.camera-wheel { position: absolute; left: var(--px); top: var(--py); width: var(--pw); aspect-ratio: 1; }
.camera-wheel svg { display: block; width: 100%; height: 100%; transform-origin: 50% 50%; }   /* spins around its true center */
```

---

## A4. Motion: Constant Rotation

Replaces the single-part `startSpin` from `camera-cards-section-spec.md`.

```js
import { createWheel } from "./createWheel";   // wherever the component lives

function buildWheels(root) {
  root.querySelectorAll(".camera-wheel").forEach((slot) => {
    const d = slot.dataset;
    slot.appendChild(createWheel({
      teeth: +d.teeth || 48,
      ticks: +d.ticks || 60,
      palette: d.palette || "chrome",
      numerals: d.numerals ? d.numerals.split(",") : [],
    }));
  });
}

// Inside initCameraCards(root):
buildWheels(root);
const wheels = gsap.utils.toArray(".camera-wheel svg", root);
let spins = [];

function startSpin() {
  spins = wheels.map((svg) => {
    const slot = svg.parentElement;
    const secs = +slot.dataset.speed || 40;     // seconds per full turn
    const dir  = +slot.dataset.dir   || 1;      // 1 clockwise, -1 counter-clockwise
    const t = gsap.to(svg, { rotation: 360 * dir, duration: secs, ease: "none", repeat: -1 });
    t.timeScale(0);
    gsap.to(t, { timeScale: 1, duration: 2.5, ease: "power2.in" });   // eases up from rest
    return t;
  });

  // Pause while the section is off screen, resume when it returns
  ScrollTrigger.create({
    trigger: root, start: "top bottom", end: "bottom top",
    onToggle: (self) => spins.forEach((t) => t.paused(!self.isActive)),
  });
}

// In the timeline, exactly as before: the wheels start turning at the click
tl.add(startSpin, 1.35);

// In the cleanup function returned by initCameraCards:
//   spins.forEach((t) => t.kill());
```

Rules:

- **Do not** include the wheels in the `clearProps` calls (`gsap.set([...], { clearProps: "all" })`). Clearing their transform would stop the rotation.
- Rotation animates `transform` only.
- **Reduced motion:** wheels are drawn but stay still.
- If a wheel is a different size or speed in the design file, the design file wins.

---

# Part B: Fix: Cards Show on Load, Then Disappear

## B1. What Is Happening

The project cards appear when the page loads, then vanish. Two causes, and the first is a mistake in the earlier spec:

1. **The start state is re-applied after the entrance has played.** The earlier spec re-ran `setStart` (which sends every card off-screen to the right) on every ScrollTrigger refresh. ScrollTrigger refreshes **by itself** when the page finishes loading and whenever the window is resized. So the sequence is: the entrance plays and the cards land, then a refresh fires, and `setStart` throws them back off-screen. They disappear and, because the trigger was `once: true`, they never come back.
2. **The start state can arrive after the first paint.** If the script sets the off-screen start position only after the page has painted (common in React with a plain `useEffect`), the cards are briefly visible in their final spot before they are moved away.

## B2. Fix 1: Never Reset After the Entrance Begins

```js
let started = false;

function setStart() {
  if (started) return;                // never reset once the entrance has begun
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
ScrollTrigger.addEventListener("refreshInit", setStart);   // keeps the start correct before the entrance only
root.classList.add("is-ready");

const tl = gsap.timeline({
  defaults: { ease: "power3.out" },
  scrollTrigger: { trigger: root, start: "top 60%", once: true },
  onStart() {
    started = true;                                          // from here on, nothing resets the cards
    ScrollTrigger.removeEventListener("refreshInit", setStart);
  },
  onComplete() { /* unchanged: clearProps, add "is-in", enable parallax */ },
});
```

Also make sure that **nothing else** re-applies the off-screen state later: no resize handler, no `matchMedia` re-run, no component re-render that calls the init again. The init runs **once**.

## B3. Fix 2: Hide the Cards From the First Paint

The cards must never be visible in their final position before the entrance plays. Hide them with CSS before any script runs, and show them only once the script has put them at their start position.

In the `<head>`, before the stylesheet (inline, tiny):

```html
<script>document.documentElement.classList.add("js");</script>
```

```css
/* Hidden from the very first paint, only when JavaScript is available */
.js .cc:not(.is-ready) .pcard,
.js .cc:not(.is-ready) .camera { visibility: hidden; }
```

- The init sets the start state (cards off-screen right) **and then** adds `is-ready`. Because the cards are already off-screen when they become visible, there is no flash.
- With JavaScript off, the `js` class never gets set, so the cards simply show in their final layout. Nothing breaks.
- In React, run the init in `useGSAP` (it runs before paint) or `useLayoutEffect`, **not** a plain `useEffect`. Run it once (empty dependency array). Clean up with `ctx.revert()` only when the component unmounts.
- React Strict Mode runs effects twice in development. Make sure the init is safe to run twice (it must not leave the cards stuck off-screen if the cleanup runs between the two runs).

## B4. Check That It Is Fixed

Test each of these and confirm the cards are **never visible in their final position before the entrance**, and **never disappear after it**:

- [ ] Reload with the page scrolled to the top
- [ ] Reload with the page scrolled down to or past the section (the browser restores the scroll position)
- [ ] Scroll slowly into the section; the entrance plays once
- [ ] After the entrance, resize the window both ways; the cards stay exactly where they are
- [ ] After the entrance, wait for late images to finish loading; the cards stay
- [ ] Throttle the network to "Slow 3G" and reload; there is no flash
- [ ] In development with React Strict Mode on; no flash and no stuck cards
- [ ] Hover still works afterwards (the `is-in` class is present)
- [ ] With reduced motion on, the cards simply appear in their final layout and stay

If any of these fails, add a temporary `console.log` inside `setStart` to see what is calling it, and report it to the owner.

---

# Part C: Acceptance Checklist

- [ ] The wheels are built in code as SVG, flat colors only, with knurled edge, tick ring, and red index dot
- [ ] One wheel per spot marked in the design file, at the marked position and size (or Antigravity stopped and asked)
- [ ] Wheels sit inside the camera layer and move with the camera (rise, click, parallax)
- [ ] Every wheel rotates constantly, around its true center, with no wobble; larger wheels turn slower; neighbors turn in opposite directions
- [ ] The wheels start turning at the camera's click, easing up from rest
- [ ] The wheels pause off screen and stay still for reduced-motion users
- [ ] No duplicate parts show through from the camera photo behind a wheel
- [ ] The cards never appear before the entrance and never vanish after it (all of section B4 passes)
- [ ] Nothing else changed: card layout, camera photo, project photos, other sections

---

# Part D: Open Items (ask the owner if not already answered)

1. **Where each wheel goes** (position and size from the design file) and how many there are
2. Which palette fits each wheel (chrome or black), or whether Antigravity should sample the colors from the photo
3. Whether the owner wants numerals on any wheel, and which ones
4. Whether the camera photo has the matching areas cleaned behind the wheels, or the wheels fully cover them
