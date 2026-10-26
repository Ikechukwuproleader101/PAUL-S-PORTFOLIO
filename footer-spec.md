# Footer Spec: "Print Run" (GSAP)

The footer of the photography portfolio: a full-screen white and red end card with a giant pixel-style title and a barcode. Companion to the other section specs.

**The goal is an exact match to the supplied design. No redesign, no "improvements", no added elements. If it is not in the design, it does not go in the build.**

---

## 0. Paste This to Antigravity First

> Open `reference/footer.png`. It shows the footer: a full-screen section, white on top and red on the bottom, with a giant pixel-style title straddling the white/red split (each letter is a solid black layer plus a white outlined layer offset up and to the right), and, at the bottom center, a barcode with the word PHOTOGRAPHER widely letter-spaced beneath it.
>
> Build it **exactly** as designed. Take the title letters and the barcode from the exported assets in `assets/footer/` (vector exports from the design file). Do not retype, redraw, regenerate, or "fix" the title or the barcode. Use the exact characters shown in the design. Do not add links, text, or any element that is not in the design. If anything is unclear, stop and ask. Follow `footer-spec.md` in full, including the entrance pattern in section 9.

(Confirm both paths with the owner and replace them above if they differ.)

---

## 1. Rules

- **Exact match to the design file.** The screenshot is a layout reference. Measure final sizes from the original design file. The numbers below are estimates from a small screenshot (about plus or minus 10%).
- **The title's characters come from the design file.** They are not readable with certainty at screenshot size, so do not guess or retype them. Use the vector export. If the characters are unclear, ask the owner.
- **The barcode is a specific drawing.** Use the exported bars as supplied. Do not regenerate a barcode with a library, because the bars would differ from the design.
- GSAP is **already installed.** Do not reinstall it.
- The **animation components folder** is the source of truth. Check it first: the hero's pixel typeface and any existing helpers should be reused, not rebuilt.
- **No fake assets.** If an export is missing, stop and ask.

### Hard "do not" list

- No gradients, no blurs, no soft shadows. The only depth in this design is the hard offset of the white title layer, and that is part of the design
- No border radius
- No extra links, copyright lines, icons, or text (none appear in the design)
- No color changes
- Nothing the animation adds (the scanner line) may stay visible afterwards

---

## 2. The Design

A full-screen footer in two flat color zones:

- **Top (about 70%): white**, empty
- **Bottom (about 30%): red**, the same red as the hero

**The title:** three groups of large pixel-style letters in the hero's blocky typeface, running almost edge to edge. It **straddles the white/red split**: most of it sits on the white, and its lowest part dips into the red. Each letter is built from **two layers**:

1. a **solid black** layer at the back
2. a **white layer with a thin black outline** in front, shifted about 30px to the right and 10px up

Because the front layer is white with an outline, it reads on both the white and the red.

**The barcode:** centered near the bottom, black bars of varied widths on the red, with the word **PHOTOGRAPHER** beneath it in a thin monospaced face, black, with very wide letter-spacing (about the width of the barcode).

### Tokens (confirm against the design file)

| Token | Value | Use |
|---|---|---|
| `--red` | `#b50d0d` | Red zone (reuse the hero's red) |
| `--paper` | `#ffffff` | White zone, front title layer |
| `--ink` | `#000000` | Back title layer, outline, barcode, caption |

Caption typeface: a thin monospace. Take the exact font from the design file. If it is not specified, ask. Use `ui-monospace, monospace` only as a fallback.

---

## 3. Measurements (Estimates)

The frame is about 1440 x 1024. Everything is positioned **from the bottom** and in `vw`, so the composition scales with the width and stays anchored to the bottom, while extra screen height only adds white above. **Confirm every number in the design file.**

| Thing | At 1440 wide | Fluid |
|---|---|---|
| Footer height | 1024px | `min-height: max(100svh, 71.1vw)` |
| Red zone | bottom 304px | `height: 21.1vw` |
| Title block | x from 50 to 1355px. The back layer's bottom edge is 264px above the bottom. The block is about 194px tall | `left: 3.5vw`, `width: 90.6vw`, `bottom: 18.3vw` |
| Title vs the split | about 154px of the title sits over the white, about 40px over the red | follows from the above |
| White front layer offset | about 30px right and 10px up from the black layer | fixed in the export |
| Front layer outline | about 3px black | fixed in the export |
| Gaps between the three letter groups | about 110px each | fixed in the export |
| Barcode | x 352 to 1085 (733px wide), 75px tall, centered, its bottom edge 76px above the bottom | `width: 50.9vw` |
| Caption | 12 letters spread across about 700px, text about 40px tall, bottom edge about 34px above the bottom | `font-size: clamp(14px, 2.8vw, 40px)`, `letter-spacing: 0.85em` |

---

## 4. Assets Needed

| Asset | Notes |
|---|---|
| **Title (SVG)** | Exported from the design file as vector, **one group per letter, left to right**. Inside each letter: the black back shape and the white outlined front shape as separate paths. If only a flat export exists, ask for a layered one. If the hero's pixel typeface component can produce both layers exactly, it may be used instead after checking it matches the design |
| **Barcode (SVG)** | Exported from the design file, **one `<rect>` per bar**, so each bar can animate on its own |
| **Caption font** | The exact font from the design file |

---

## 5. Markup

```html
<footer class="foot" data-entrance="pending">
  <div class="foot-red"></div>

  <h2 class="foot-title" aria-label="[the exact title text from the design]">
    <svg viewBox="0 0 W H" aria-hidden="true">          <!-- viewBox from the export -->
      <g class="glyph">                                 <!-- one per letter, left to right -->
        <path class="back"  d="..." fill="#000" />
        <g class="front-shift">
          <path class="front" d="..." fill="#fff" stroke="#000" stroke-width="3" />
        </g>
      </g>
      <!-- ...all letters... -->
    </svg>
  </h2>

  <div class="foot-code">
    <svg class="barcode" viewBox="0 0 BW BH" aria-hidden="true">   <!-- viewBox from the export -->
      <rect class="bar" x="..." y="0" width="..." height="BH" fill="#000" />
      <!-- ...all bars... -->
      <rect class="scan" x="0" y="0" width="3" height="BH" fill="#fff" />   <!-- animation only -->
    </svg>
    <p class="foot-cap">PHOTOGRAPHER</p>
  </div>
</footer>
```

The exported viewBox and path data come from the design file. The values above are a format example only.

---

## 6. CSS

```css
.foot {
  --red: #b50d0d;
  --paper: #fff;
  --ink: #000;

  position: relative;
  overflow: hidden;
  background: var(--paper);
  min-height: max(100svh, 71.1vw);
}

/* ---------- Red zone ---------- */
.foot-red {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 21.1vw;
  background: var(--red);
  transform-origin: 50% 100%;
}

/* ---------- Title ---------- */
.foot-title {
  position: absolute;
  left: 3.5vw;
  width: 90.6vw;
  bottom: 18.3vw;
  margin: 0;
}
.foot-title svg { display: block; width: 100%; height: auto; overflow: visible; }

/* ---------- Barcode + caption ---------- */
.foot-code {
  position: absolute;
  left: 50%;
  bottom: 2.4vw;
  transform: translateX(-50%);
  width: 50.9vw;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.barcode { display: block; width: 100%; height: auto; overflow: visible; }
.scan    { visibility: hidden; }                       /* only visible during the scan */

.foot-cap {
  margin: 0.7vw 0 0;
  padding-left: 0.85em;                                /* balances the trailing letter-spacing */
  color: var(--ink);
  font-family: /* the exact font from the design */, ui-monospace, monospace;
  font-weight: 300;
  font-size: clamp(14px, 2.8vw, 40px);
  letter-spacing: 0.85em;
  line-height: 1;
  white-space: nowrap;
}

/* ---------- First paint: nothing flashes (only when JavaScript is available) ---------- */
.js .foot[data-entrance="pending"] .foot-red,
.js .foot[data-entrance="pending"] .foot-title,
.js .foot[data-entrance="pending"] .foot-code { visibility: hidden; }

/* ---------- Final lock: once landed, nothing can hide the footer again ---------- */
.foot[data-entrance="done"] .foot-red,
.foot[data-entrance="done"] .foot-title,
.foot[data-entrance="done"] .foot-code { visibility: visible !important; }
```

Also add this tiny script in the `<head>`, before the stylesheet:

```html
<script>document.documentElement.classList.add("js");</script>
```

Without JavaScript the footer simply shows in its final layout.

---

## 7. The Animation Flow: "Print Run"

The footer is "printed" like a label: the red ground rises, the title is stacked up row by row, the white layer lifts off the black layer (the same extrude idea as the card section), the barcode is printed bar by bar, the caption is typed, and a scanner reads the code once.

Plays **once** when about a third of the footer is on screen. About 4 seconds.

| Time | What happens |
|---|---|
| 0.0 to 0.8s | **Red ground:** the red zone rises from the bottom (`scaleY` 0 to 1) |
| 0.5 to 1.7s | **Title stacks up:** each letter grows from its baseline in 8 hard steps (like pixel rows being added), left to right, 0.07s apart. The white layer starts exactly on top of the black one |
| 1.3 to 2.4s | **Extrude:** each white outlined layer lifts off its black layer to its final offset (about 30 right, 10 up) with a small bounce, left to right |
| 2.0 to 2.9s | **Barcode prints:** bars grow up from the bottom, left to right |
| 2.5 to 3.2s | **Caption types in:** letters appear one at a time, 0.05s apart |
| 3.0 to 3.9s | **Scanner:** a thin white line sweeps once across the barcode, then disappears |

All motion is flat: no fades through gradients, no blur, no shadows.

### Code

```js
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

// Final offset of the white layer, from the design file (SVG units)
const FRONT_OFFSET = { x: 30, y: -10 };

export function initFooter() {
  const root = document.querySelector(".foot");
  if (!root || root.dataset.entrance === "done") return () => {};   // never re-run a finished footer

  const red    = root.querySelector(".foot-red");
  const glyphs = gsap.utils.toArray(".glyph", root);
  const fronts = gsap.utils.toArray(".front", root);
  const bars   = gsap.utils.toArray(".bar", root);
  const scan   = root.querySelector(".scan");
  const code   = root.querySelector(".foot-code");
  const vb     = root.querySelector(".barcode").viewBox.baseVal;
  const split  = SplitText.create(root.querySelector(".foot-cap"), { type: "chars" });
  const timers = [];
  let scanning = false;

  // ---- Start state: applied ONCE. No measuring, nothing re-runs on resize ----
  gsap.set(red,    { scaleY: 0 });
  gsap.set(glyphs, { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.set(fronts, { x: -FRONT_OFFSET.x, y: -FRONT_OFFSET.y });   // sits exactly on the black layer
  gsap.set(bars,   { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.set(split.chars, { autoAlpha: 0 });
  root.dataset.entrance = "ready";

  function runScan() {
    if (scanning) return;
    scanning = true;
    gsap.fromTo(scan,
      { x: 0, autoAlpha: 1 },
      { x: vb.width, duration: 0.9, ease: "power2.inOut",
        onComplete() { gsap.set(scan, { autoAlpha: 0 }); scanning = false; } });
  }

  function finish() {
    if (root.dataset.entrance === "done") return;
    tl.kill();
    gsap.set([red, glyphs, fronts, bars, scan], { clearProps: "all" });
    split.revert();
    root.dataset.entrance = "done";
    enableInteraction();
  }

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" }, onComplete: finish });

  tl.to(red,    { scaleY: 1, duration: 0.8, ease: "power4.inOut" }, 0)
    .to(glyphs, { scaleY: 1, duration: 0.6, ease: "steps(8)", stagger: 0.07 }, 0.5)
    .to(fronts, { x: 0, y: 0, duration: 0.6, ease: "back.out(2.2)", stagger: 0.07 }, 1.3)
    .to(bars,   { scaleY: 1, duration: 0.25, ease: "power2.out", stagger: { amount: 0.7 } }, 2.0)
    .to(split.chars, { autoAlpha: 1, duration: 0.01, stagger: 0.05 }, 2.5)
    .add(runScan, 3.0);

  function play() {
    if (root.dataset.entrance !== "ready") return;
    root.dataset.entrance = "playing";
    io.disconnect();
    tl.play();
    timers.push(setTimeout(finish, 7000));        // failsafe: the final layout always appears
  }

  // IntersectionObserver, not ScrollTrigger: nothing here re-runs on refresh or resize
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) play();
  }, { threshold: 0.35 });
  io.observe(root);

  // ---- After the entrance (section 8) ----
  function enableInteraction() {
    code.addEventListener("pointerenter", runScan);          // hover the barcode to scan it again

    if (!window.matchMedia("(hover: hover)").matches) return;
    const moves = fronts.map((f) => ({
      x: gsap.quickTo(f, "x", { duration: 0.8, ease: "power3" }),
      y: gsap.quickTo(f, "y", { duration: 0.8, ease: "power3" }),
    }));
    root.addEventListener("pointermove", (e) => {
      const nx = e.clientX / window.innerWidth  - 0.5;       // -0.5 to 0.5
      const ny = e.clientY / window.innerHeight - 0.5;
      moves.forEach((m) => { m.x(nx * 10); m.y(ny * 6); });  // the white layer drifts a few px
    });
  }

  return () => { io.disconnect(); timers.forEach(clearTimeout); tl.kill(); };   // cleanup
}

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  return initFooter();
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  document.querySelector(".foot").dataset.entrance = "done";   // final layout, no animation
});
```

---

## 8. Interaction (After the Entrance)

- **Pointer drift:** the white title layers shift a few pixels with the pointer, so the letters seem to hover above their black layer. Keep it **subtle** (about 10px horizontally and 6px vertically at most). Desktop only.
- **Barcode hover:** hovering the barcode runs the scanner line again. It cannot overlap itself.
- Nothing else is interactive. There are no links in this design. If the owner wants contact links, they will say so.

Optional and **off by default:** clicking the barcode scrolls back to the top of the page.

---

## 9. Entrance Pattern (Do Not Change This)

The camera section had a bug where its cards showed on load and then vanished. This footer is built so that cannot happen:

1. **First paint:** the footer parts are hidden by CSS (`data-entrance="pending"`) before any script runs.
2. **The start state is applied once**, then the state becomes `ready` and the parts are revealed from their start positions, so there is no flash.
3. **No `ScrollTrigger` refresh listeners and no re-applying the start state.** Nothing may call the start state again after `ready`.
4. **State lives in a DOM attribute** (`data-entrance`), not in a class that a framework could overwrite.
5. **Final lock:** once `done`, the CSS forces the footer visible.
6. **Failsafe:** the footer is forced to its final layout 7 seconds after the entrance starts, whatever happens.
7. **In React:** run `initFooter` in `useGSAP` or `useLayoutEffect` (before paint), once, and return its cleanup. It is safe under Strict Mode because a second run simply re-applies the start state before `playing`.

---

## 10. Responsive

No mobile design was supplied. Keep the same composition: because everything is positioned from the bottom in `vw`, it scales as one piece. On tall phone screens the extra height becomes more white above, which matches the design. Check that the caption stays on one line at 390px (reduce the `letter-spacing` to `0.6em` if it does not fit) and that the title does not exceed the screen width. Ask the owner before changing anything beyond that.

---

## 11. Accessibility

- The title is an image of text. Give the `h2` an `aria-label` with the exact title, and keep the SVG `aria-hidden`.
- The barcode is decorative (`aria-hidden`). The caption is real text.
- Reduced motion: the footer simply shows its final layout.

---

## 12. Acceptance Checklist

- [ ] The animation components folder was read first and reused
- [ ] Title and barcode come from the supplied vector exports, unmodified. The characters match the design exactly
- [ ] Overlaying the build on the design at 1440 wide: the red zone, the title (both layers), the barcode, and the caption land within 2px
- [ ] The title straddles the white/red split as in the design, and the white layer sits about 30px right and 10px up from the black layer
- [ ] No gradients, blurs, soft shadows, or extra elements. The scanner line is invisible at rest
- [ ] Entrance plays once: red rises, title stacks up, white layers extrude, barcode prints, caption types, scanner sweeps
- [ ] No flash of the final layout before it starts, and the footer never disappears afterwards (reload at the bottom of the page, reload at the top, resize after the entrance, slow network)
- [ ] After the entrance, the pointer drift and the barcode re-scan work
- [ ] Reduced-motion users see the final layout only
- [ ] The caption stays on one line and the composition scales at 390px
- [ ] No console errors, no new libraries installed

---

## 13. Open Items (ask the owner if not already answered)

1. The vector exports (title with two layers per letter, and the barcode with one rect per bar)
2. The exact title characters, and the exact caption font
3. Whether the large empty white area above the title is intentional, or the previous section is meant to continue into it
4. Whether any links or contact details should be added (none are in the design)
