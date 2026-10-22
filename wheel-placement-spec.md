# Wheel Placement Spec: add ONLY the camera wheel

Everything in the reference screenshot is **already built**, except the camera wheel (the lens). This task is to add that one element in the right place, using the wheel image from the supplied directory, and make it draggable.

---

## 0. Paste This to Antigravity First

> Open `reference/wheel-location.png` (the screenshot). It shows the part of the site where the hero meets the card row. Everything in it already exists in the code except the camera wheel (the black lens sitting in the middle of the black horizontal band).
>
> Your job: add **only** the wheel, in exactly that spot. Find the existing black band in the code and place the wheel on it, horizontally centered. Use the wheel image(s) from `assets/wheel/` as they are. Do not draw, trace, regenerate, or substitute the image, and do not use the lens shown in the screenshot (it is only a preview of the position).
>
> Do not change, restyle, rebuild, or move anything else. If the black band, the placement, or the image format is unclear, stop and ask before writing code. Follow `wheel-placement-spec.md` in full.

(Confirm both paths with the owner: the screenshot location and the wheel image directory. Replace the paths above and below if they differ.)

---

## 1. Rules

- **Scope: one new element.** No edits to the hero, the portrait, the pixel "PHOTOGRAPHER" text, the nav, the black band's own styling, or the card row. Add the wheel and its styles/script only.
- **Use the supplied wheel image exactly as given.** Never generate, redraw, trace, or approximate it. If it is missing, stop and ask.
- GSAP is **already installed.** Do not reinstall it. Register only the plugins needed (section 5).
- The **animation components folder** is the source of truth for any existing helpers or patterns. Check it before writing new utilities.
- The screenshot is a **location reference**, not a pixel-exact spec. Measure final sizes from the original design file (Figma or full-resolution PNG), and use the numbers in section 3 only as a sanity check.
- Ignore the blue rectangle and the "Desktop" label in the screenshot. They are design-tool selection marks, not part of the site.

---

## 2. How to Find the Spot

Work through these steps in order:

1. **Open the screenshot.** From top to bottom it shows: the bottom of the hero (red background, the portrait's shoulders, the large pixel "PHOTOGRAPHER" text), then a **full-width solid black horizontal band**, then a short red gap, then the **white card row** with black dividers.
2. **Find the wheel in the screenshot.** It is a black, lens-shaped object sitting **in the horizontal center of the page, on top of the black band**. Its upper part overlaps the band (it blends into it), and its lower part hangs **below the band onto the red area**.
3. **Find the black band in the code.** Search the existing markup and styles for the full-width black strip that sits between the hero and the card row. This is the anchor. Do not create a new band.
4. **Attach the wheel to the band's wrapper.** The wheel is positioned relative to the band, not to the page, so it keeps its place at every screen size.
5. **Compare against the screenshot** (section 6) before finishing.

If there is more than one black strip or you are not certain which is the band, stop and ask.

---

## 3. Placement Details

Estimated from a small screenshot (the crop is about 491px wide, roughly a third of a 1440px design). Treat as approximate (about plus or minus 10%) and confirm against the design file.

| Thing | Estimate at 1440 wide |
|---|---|
| Horizontal position | **Centered** on the page (`left: 50%`, shifted back by half its own width) |
| Wheel width | about 290px (about 20vw) |
| Wheel height | about 130px (follows the image's aspect ratio) |
| Black band | full width, solid black, about 85px tall |
| Vertical position | the wheel's **top edge is level with the band's top edge**. About a third of the wheel hangs **below** the band's bottom edge |
| Layer order | wheel is **above** the band and the red background. It never covers the card row below |

```css
/* The band's wrapper must allow overflow so the hanging part is not clipped */
.band-wrap { position: relative; overflow: visible; }

.wheel {
  position: absolute;
  left: 50%;
  top: 0;                                /* level with the band's top edge; adjust to match the design */
  transform: translateX(-50%);
  width: clamp(160px, 20vw, 290px);
  z-index: 2;
}
```

Use the class and wrapper names that already exist in the project. The names above are placeholders.

---

## 4. Check the Asset First, Then Pick the Interaction

Open the supplied wheel image(s) and look at what they are. **Do not guess.**

| What you find | Interaction |
|---|---|
| **A round, front-facing wheel** (a circle you could spin) | **Rotation:** dragging spins the wheel around its center (section 5A) |
| **A side view of a lens with a ridged ring** (like the preview in the screenshot) | **Ridge scroll:** the ridges slide and loop as you drag, while the lens body stays still (section 5B) |
| **Layers supplied separately** (lens body + a seamless ridge strip) | Use them as given for 5B. This is the best case |
| **One flat image of a side-view lens, no layers** | Ask the owner for layered assets. Do **not** fake the ridges by drawing them |

**Drag direction for the ridge scroll:** the ridges slide in the direction they are stacked. In the screenshot the lens is turned on its side, so the ridges likely run vertically and should slide **left and right**. Check the actual image: if the ridges are horizontal lines, drag up and down instead.

---

## 5. Interaction Code

Both use GSAP's Draggable. Momentum (the ring keeps turning after release) needs InertiaPlugin, which is included in the `gsap` package in recent versions (3.13 and later). If the installed version is older, Draggable still works, just without the momentum.

```js
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
gsap.registerPlugin(Draggable, InertiaPlugin);
```

### 5A. Round wheel: rotation

```js
Draggable.create(".wheel-rotor", {
  type: "rotation",
  inertia: true,
  // optional: snap to small steps for a "click" feel
  // snap: (v) => Math.round(v / 15) * 15,
});
```

### 5B. Side-view lens: ridge scroll

The ridges are a seamless strip that repeats. Dragging moves the strip and wraps it, so it loops forever.

```html
<div class="wheel">
  <img class="wheel-body" src="/assets/wheel/body.png" alt="" />
  <div class="wheel-ring">
    <div class="wheel-ridges"></div>   <!-- repeat-x background using the supplied ridge strip -->
  </div>
</div>
```

```css
.wheel-ring   { position: absolute; /* position and size over the ridged area, from the design */ cursor: grab; touch-action: none; overflow: hidden; }
.wheel-ring:active { cursor: grabbing; }
.wheel-ridges { width: 100%; height: 100%; background: url("/assets/wheel/ridges.png") repeat-x; background-size: auto 100%; }
```

```js
function initWheel() {
  const ring = document.querySelector(".wheel-ring");
  const ridges = document.querySelector(".wheel-ridges");

  // Width of ONE repeat of the ridge strip, in rendered pixels
  const tile = ridges.offsetHeight * (TILE_W / TILE_H);   // TILE_W / TILE_H: the strip image's natural size
  const wrap = gsap.utils.wrap(0, tile);

  // Invisible proxy tracks the drag; the ridges follow it
  const proxy = document.createElement("div");

  function update() {
    ridges.style.backgroundPositionX = wrap(this.x) + "px";
  }

  Draggable.create(proxy, {
    trigger: ring,
    type: "x",            // use "y" instead if the ridges are horizontal lines
    inertia: true,
    onDrag: update,
    onThrowUpdate: update,
  });
}
```

Notes:

- Keep the drag **gentle and weighty**, like a real focus ring. Do not multiply the movement.
- `cursor: grab` and `grabbing` give the "you can hold this" cue. Draggable handles touch and mouse.
- Make sure the wheel does **not block clicks** on anything it overlaps (the nav, the cards). It only needs pointer events on the ring itself.
- Optional, off by default: a tiny one-time hint nudge (a short back-and-forth of about 20px a couple of seconds after load) so visitors realize it can be dragged. Add it only if the owner asks.

### Reduced motion

```js
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => { initWheel(); });
// Reduced motion: leave the wheel static in place (still visible, just not draggable)
```

---

## 6. Verify Before Finishing

- [ ] Only the wheel was added. No other element, style, or file was changed
- [ ] The wheel image comes from the supplied directory, unmodified
- [ ] Wheel is horizontally centered on the page
- [ ] Wheel's top is level with the black band's top; the lower part hangs onto the red area
- [ ] The hanging part is not clipped, and the wheel never overlaps the card row
- [ ] Overlay your build on the screenshot (and on the full design file): the wheel lands in the same spot, at the same scale
- [ ] Dragging feels smooth and weighty, loops without a visible seam, and keeps turning briefly after release
- [ ] Works on touch and mouse, and does not hijack page scrolling on mobile
- [ ] Checked at 1440px and a phone width (about 390px): still centered and proportional
- [ ] Reduced-motion users see the wheel static
- [ ] No console errors, and no extra libraries were installed

---

## 7. Open Items (ask the owner if not already answered)

1. The exact directory of the wheel image(s), and whether the ridges are supplied as a separate layer
2. What the wheel should do beyond looking good. Default: playful only (drag to spin). It can later be wired to control something, such as scrolling the cards or focusing a photo, but do not add that unless asked
