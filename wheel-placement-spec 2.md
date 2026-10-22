# Wheel + Calibration Scale Spec

Add the **camera wheel** (lens) on the black band, and make the **calibration scale** on that band respond when the wheel is dragged: the tick marks and numbers slide toward the edges, are cut off there, and new ones come in from the other side, like a real lens calibration ring.

---

## 0. Paste This to Antigravity First

> Open `reference/wheel-scale-location.png`. It shows where the hero meets the card row: a full-width black band carrying a calibration scale (tick marks with numbers, white end caps at both edges) with the camera wheel (a black lens) in the horizontal center.
>
> Add **only** the wheel, using the image(s) in `assets/wheel/` exactly as supplied. Then make the scale respond to dragging the wheel: ticks and numbers slide sideways, are hidden (hard-clipped) at the end caps, and reappear from the opposite side. If the scale already exists in the code, reuse it as is and only wire the motion. If it does not exist, build it exactly from the design file.
>
> Do not draw, trace, or substitute the wheel image, do not use the lens in the screenshot, and do not invent numbers, fonts, or spacing. Do not change, restyle, or move anything else. If anything is unclear, stop and ask. Follow `wheel-placement-spec.md` in full.

(Confirm both paths with the owner and replace them above if they differ.)

---

## 1. Rules

- **Scope:** the wheel, plus motion for the scale. Nothing else changes: hero, portrait, pixel "PHOTOGRAPHER" text, nav, the band's look, and the card row all stay exactly as they are.
- **Use the supplied wheel image exactly as given.** Never generate, redraw, trace, or approximate it. If it is missing, stop and ask.
- **The scale's look comes from the design file:** tick spacing, tick heights, numbers, font, sizes, colors. Never invent or "tidy" them.
- GSAP is **already installed.** Do not reinstall it. Register only the plugins in section 6.
- The **animation components folder** is the source of truth for existing helpers. Check it first.
- The screenshot is a **location reference**. Measure final sizes from the original design file; the numbers below are sanity checks only.
- Ignore the blue rectangle and the "Desktop" label in screenshots. They are design-tool marks, not part of the site.
- **No gradients, no fades, no blur.** Anything leaving the scale is cut off by a hard clip at the end caps.

---

## 2. How to Find the Spot

1. **Open the screenshot.** Top to bottom: the bottom of the hero (red background, the portrait's shoulders, the pixel "PHOTOGRAPHER" text), then a **full-width black band** carrying the scale, then a short red gap, then the white card row.
2. **Find the wheel.** It is the black lens in the **horizontal center, on the band**. Its top is about level with the band's top, and its lower part hangs below the band onto the red area.
3. **Find the black band in the code.** Search the existing markup and styles for the full-width black strip between the hero and the card row. That is the anchor. Do not create a second band.
4. **Check whether the scale already exists** (tick marks, numbers, end caps). If yes, reuse it. If no, build it from the design file.
5. **Attach the wheel to the band's wrapper**, so it keeps its place at every screen size.

If there is more than one black strip, or you cannot tell which is the band, stop and ask.

---

## 3. Layers on the Band

Back to front:

| Layer | Notes |
|---|---|
| Black band | Existing. Full width |
| Scale viewport | The window between the two white end caps. **`overflow: hidden`**. This is what hides the numbers at the edges |
| Scale track | The long strip of ticks and numbers that slides inside the viewport |
| End caps | The white vertical bars at both edges, above the track so the track appears to disappear behind them |
| Wheel | Centered on the band, above everything |

```html
<div class="band-wrap">                    <!-- existing band wrapper -->
  <div class="scale-viewport">
    <div class="scale-track">
      <!-- ticks and numbers, exactly as in the design -->
    </div>
  </div>
  <span class="cap cap--left"></span>
  <span class="cap cap--right"></span>

  <div class="wheel">
    <img class="wheel-body" src="/assets/wheel/body.png" alt="" />
    <div class="wheel-ring" tabindex="0" aria-label="Turn the ring to move the scale">
      <div class="wheel-ridges"></div>
    </div>
  </div>
</div>
```

Use the class names that already exist in the project. The names above are placeholders.

```css
.band-wrap { position: relative; overflow: visible; }        /* the wheel hangs below the band */

.scale-viewport { position: relative; overflow: hidden; }    /* hard clip, no fade */
.scale-track    { display: flex; width: max-content; will-change: transform; }

.wheel {
  position: absolute;
  left: 50%;
  top: 0;                                 /* level with the band's top; match the design */
  transform: translateX(-50%);
  width: clamp(160px, 20vw, 290px);       /* about 290px at 1440; confirm in the design file */
  z-index: 3;
}
.wheel-ring   { position: absolute; /* position and size over the ridged area, from the design */ cursor: grab; touch-action: pan-y; overflow: hidden; }
.wheel-ring:active { cursor: grabbing; }
.wheel-ridges { width: 100%; height: 100%; background: url("/assets/wheel/ridges.png") repeat-x; background-size: auto 100%; }
```

`touch-action: pan-y` lets people still scroll the page with a vertical swipe on touch screens.

Placement estimates at 1440 wide (from a small screenshot, about plus or minus 10%, so confirm in the design file): wheel about 290px wide and 130px tall, centered, black band about 85px tall.

---

## 4. Check the Wheel Asset First

Open the supplied image(s) and look at what they are. **Do not guess.**

| What you find | What to do |
|---|---|
| **Side view of a lens with a ridged ring, layers supplied** (body + seamless ridge strip) | Use as given. This is the best case |
| **Side view, one flat image, no layers** | Ask the owner for layered assets. **Do not fake the ridges** |
| **A round, front-facing wheel** | Rotate it with Draggable `type: "rotation"` instead of sliding ridges, and drive the scale from the rotation (1 degree = a fixed number of pixels of scale movement). Ask the owner before choosing the ratio |

**Drag direction:** the lens is turned on its side in the design, so the ridges likely run vertically and the drag is **horizontal** (left and right), matching the scale's direction. Check the real image.

---

## 5. How It Behaves

One drag drives both things, so they can never go out of sync:

1. **Drag the ridges.** The ridges slide, and the scale track slides in the **same direction**.
2. **Edges hide.** Ticks and numbers that reach an end cap are cut off by the viewport clip. No fade.
3. **Loop (default).** New ticks and numbers enter from the opposite end. The same set of numbers from the design repeats endlessly.
4. **Release.** The wheel keeps gliding briefly (momentum), then **snaps to the nearest tick** with a small settle. At rest, a tick (or the designed starting number) sits exactly under the center of the lens.
5. **No extra UI.** Do not add a readout or a pointer unless the design has one.

### Mode: loop (default) or range

| Mode | Behavior |
|---|---|
| `"loop"` (default) | Endless. The designed set of numbers repeats, like a continuous ruler |
| `"range"` | Real ends. The first and last number can reach the lens center and the drag stops there with light resistance, like a focus scale with a near and far limit |

The owner has not confirmed which they want. **Build `loop`, with the mode as a single constant so it can be switched.**

---

## 6. Code

```js
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
gsap.registerPlugin(Draggable, InertiaPlugin);
```

Momentum needs InertiaPlugin, included in recent versions of the `gsap` package (3.13 and later). On an older version Draggable still works, just without the glide.

### 6A. Build the track for looping

One **period** is one full set of ticks and numbers exactly as in the design (for example everything visible across the scale once). For seamless looping, the track holds that period **repeated enough times** to always cover the viewport plus one extra period.

```js
const MODE = "loop";              // "loop" | "range"
const TICK = 24;                  // px between two ticks. Read it from the design, do not guess
const TICKS_PER_PERIOD = 40;      // number of ticks in one full set. From the design
const PERIOD = TICK * TICKS_PER_PERIOD;
const RIDGE_TILE = 120;           // rendered width of ONE repeat of the ridge strip, in px
const RIDGE_RATIO = 1;            // how far the ridges move per px of drag. Tune by feel

function buildTrack(track, viewportWidth, periodHTML) {
  const copies = Math.ceil(viewportWidth / PERIOD) + 2;
  track.innerHTML = periodHTML.repeat(copies);   // same ticks and numbers, repeated
}
```

If the scale already exists in the code, do **not** rebuild its markup. Duplicate the existing period's nodes (with `cloneNode`) instead, and mark the clones `aria-hidden="true"`.

### 6B. Drag drives everything

```js
function initWheelScale() {
  const viewport = document.querySelector(".scale-viewport");
  const track    = document.querySelector(".scale-track");
  const ring     = document.querySelector(".wheel-ring");
  const ridges   = document.querySelector(".wheel-ridges");

  const V = viewport.offsetWidth;
  // Phase offset so a tick sits exactly under the lens at rest (x = 0)
  const q = (TICK - ((V / 2) % TICK)) % TICK;

  const wrapScale = gsap.utils.wrap(-PERIOD, 0);
  const wrapRidge = gsap.utils.wrap(0, RIDGE_TILE);

  function render(x) {
    ridges.style.backgroundPositionX = wrapRidge(x * RIDGE_RATIO) + "px";
    gsap.set(track, { x: (MODE === "loop" ? wrapScale(x) : x) - q });
  }

  const proxy = document.createElement("div");   // invisible, tracks the drag

  const config = {
    trigger: ring,
    type: "x",
    inertia: true,
    snap: (v) => Math.round(v / TICK) * TICK,    // settle on the nearest tick
    onDrag:        function () { render(this.x); },
    onThrowUpdate: function () { render(this.x); },
  };

  if (MODE === "range") {
    const rangeWidth = (TICKS_PER_PERIOD - 1) * TICK;   // first tick to last tick
    config.bounds = { minX: -rangeWidth, maxX: 0 };
    config.edgeResistance = 0.85;
  }

  const drag = Draggable.create(proxy, config)[0];
  render(0);

  // Optional keyboard support: arrow keys move one tick
  ring.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    gsap.to(proxy, {
      x: "+=" + dir * TICK,
      duration: 0.3,
      ease: "power2.out",
      onUpdate() { drag.update(); render(drag.x); },
    });
  });

  return () => { drag.kill(); };    // cleanup
}
```

Notes:

- In `range` mode the track holds **one** period only (no repeats), and the first number sits under the lens at `x = 0`.
- Keep the feel **gentle and weighty**, like a real ring. Do not multiply the drag distance.
- Recompute `V`, `q`, and the number of copies on resize (debounce it), and rebuild the cleanup and init together.
- Only `transform` is animated on the track. The ridges use `background-position` on a small area, which is fine.
- The wheel must not block clicks on anything it overlaps. Only the ring needs pointer events.
- Optional and **off by default**: a tiny one-time hint nudge after load. Add it only if the owner asks.

### Reduced motion

```js
const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  const cleanup = initWheelScale();
  return cleanup;
});
// Reduced motion: wheel and scale stay static in place
```

---

## 7. Responsive

- Define `TICK`, the wheel width, and the band height with the same fluid units as the design, and read `TICK` from the real rendered tick gap rather than a hard-coded number.
- On phones: the wheel stays centered and scales down proportionally, fewer ticks are visible at once, and the behavior is identical.
- Check at 1440px and about 390px.

---

## 8. Verify Before Finishing

- [ ] Only the wheel was added and the scale was wired. Nothing else was changed
- [ ] Wheel image comes from the supplied directory, unmodified
- [ ] Wheel is horizontally centered; its top is level with the band's top; the lower part hangs onto the red area and is not clipped
- [ ] Overlaying the build on the screenshot and the design file: wheel, ticks, numbers, and end caps land in the same places at the same scale
- [ ] Dragging the ridges slides the scale in the same direction, in sync
- [ ] Ticks and numbers are cut off cleanly at the end caps (no fade) and re-enter from the other side without a visible seam
- [ ] After release it glides briefly, then settles with a tick under the center of the lens
- [ ] No numbers, spacing, or fonts were invented; they match the design file
- [ ] Mouse and touch both work; a vertical swipe still scrolls the page on mobile
- [ ] Reduced-motion users see the wheel and scale static
- [ ] No console errors, no new libraries installed, no layout shift

---

## 9. Open Items (ask the owner if not already answered)

1. The exact directory of the wheel image(s), and whether the ridge strip is a separate layer
2. Loop or range. Default is loop; switch with the `MODE` constant
3. The exact numbers, tick spacing, and which ticks are labeled (all come from the design file)
4. Whether the scale already exists in the code or needs to be built
