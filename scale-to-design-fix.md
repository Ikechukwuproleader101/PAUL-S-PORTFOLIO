# Scale-to-Design Fix: Make the Whole Site Look Right at 100% Zoom

The whole site was built while the browser preview was set to **75% zoom**. At the default **100% zoom** it looks too large. This file tells Antigravity how to make every size scale correctly with the screen, following the web design, so the site looks the same at 100% as it was meant to look.

This is a site-wide change. It touches sizes, not layout, colors, copy, or animation design.

---

## 0. Paste This to Antigravity First

> Read `scale-to-design-fix.md` fully. The site was built and previewed at 75% browser zoom, so at the default 100% zoom it looks too large. Fix this site-wide by making every size proportional to the viewport width, using one scale unit based on the 1440px design width (section 3). Convert every fixed pixel size (fonts, paddings, gaps, offsets, widths, heights, GSAP pixel distances) to that unit, remove the pixel caps that stop things from scaling, and size sections by the design's frame height instead of `100vh`.
>
> Do **not** change layouts, colors, copy, images, or the animation design, and do **not** use `zoom`, `transform: scale()` on the page, or any other global hack. From now on, preview at **100% zoom**. When you finish, report every file you changed, how many values you converted, and any value you left in pixels with the reason. If anything is unclear, stop and ask.

---

## 1. Why This Happens

At 75% zoom the browser pretends the window is wider: a window that is 1440 pixels wide shows as 1920 "CSS pixels". Sizes written in `vw` (a percentage of the screen width) look the same at any zoom, but sizes written in `px` look **25% smaller** at 75% zoom.

The site mixes both. At 75% zoom the two kinds happened to look balanced. At 100% zoom the `px` parts (text, padding, offsets, capped sizes) are suddenly 33% bigger next to the `vw` parts, so everything looks "a little large".

The fix is not to change the zoom. It is to make **every** size follow the screen width in the same way, so the page looks the same at any zoom level and any screen width.

---

## 2. The Target

The site should look like **the web design frames (1440px wide), scaled to the screen width.**

- On a screen that is 1440 CSS pixels wide at 100% zoom, the site matches the design frames exactly, pixel for pixel.
- On a wider or narrower screen, the whole page scales up or down as one piece. Proportions, line breaks, and spacing stay identical.
- Browser zoom (75%, 100%, 125%) no longer changes how the page is proportioned.

---

## 3. The One Scale Unit

Add this once, at the top of the global stylesheet:

```css
:root {
  --design-w: 1440;                                   /* the width of the design frames */
  --k: 1;                                             /* global tuning knob (1 = exactly the design) */
  --s: calc(var(--k) * 100vw / var(--design-w));      /* ONE design pixel, as a real length */
}
```

Now any size taken from the design becomes `calc(N * var(--s))`, where `N` is the size **in design pixels** (as measured in the design file at 1440 wide).

| Design value | Write it as |
|---|---|
| `25px` shadow offset | `calc(25 * var(--s))` |
| `34px` font size | `calc(34 * var(--s))` |
| `534px` button width | `calc(534 * var(--s))` |
| `-10px` hover shift | `calc(-10 * var(--s))` |
| `24vw` (already proportional) | leave as it is: `24vw` is the same as `345 * --s` |

Values already written in `vw` are **already correct** (`1vw` equals `14.4` design pixels). Leave them alone.

Notes:

- `100vw` includes the scrollbar on some systems (about 15px). That is a difference of about 1%. Accept it. Do not try to compensate for it.
- Never size a section with `width: 100vw`. Use `100%`, which avoids a sideways scrollbar.
- `--k` is the single knob for taste. If the owner later wants everything slightly smaller or larger than the design, change `--k` (for example `0.9`), and **nothing else**.

---

## 4. What to Do, Step by Step

### Step A: Record a baseline (before changing anything)

Open the site at 75% and at 100% zoom. For these elements, note the on-screen size: the hero title height, a card width in the third section, the body paragraph font size, and the footer title height. Put the numbers in your reply, so the owner can see the before and after.

### Step B: Find every fixed size

Search the whole project (styles, components, and scripts):

```bash
grep -rnE "[0-9.]+(px|rem|em)" src --include=*.css --include=*.scss --include=*.tsx --include=*.jsx --include=*.js --include=*.ts
grep -rnE "clamp\(|min\(|max\(" src --include=*.css --include=*.scss --include=*.tsx --include=*.jsx
grep -rnE "100vh|100svh|100dvh|min-height|max-width" src
```

If the project uses Tailwind, also search for arbitrary values such as `w-[345px]`, `text-[34px]`, and for the spacing utilities (`p-4`, `gap-6`, and so on).

### Step C: Convert styles

1. **Fonts, paddings, margins, gaps, widths, heights, offsets, border widths of 2px or more, outline offsets:** convert from `Npx` to `calc(N * var(--s))`.
2. **`clamp(min, vw, max)` and `min()` / `max()` with pixel caps:** the pixel cap is exactly what stops things from scaling, so **remove it**. Replace the whole thing with `calc(N * var(--s))`, where `N` is the design size.
   Example: `clamp(14px, 1.74vw, 25px)` becomes `calc(25 * var(--s))`.
3. **Containers with `max-width` in pixels** (for example `max-width: 1320px`): replace with `calc(1320 * var(--s))`, or remove it if the design has no such limit.
4. **Section heights:** do **not** size content with `100vh`. Size each section by its design frame height: `height` or `min-height: calc(FRAME_H * var(--s))` (for example `calc(1024 * var(--s))` for a 1440 x 1024 frame). The footer is the one exception, which already uses `max(100svh, 71.1vw)`.
5. **Hairlines stay as they are:** `1px` borders and `1px` lines must remain `1px`.
6. **Text floor:** to keep text readable on small desktop windows, wrap text sizes like this: `font-size: max(calc(34 * var(--s)), 12px)`. Use a floor only for text. Phones are covered by the mobile rules below.
7. **Media queries stay in pixels.** The mobile breakpoint (`@media (max-width: 900px)`) is about the real viewport width and must not change.
8. **Do not touch** colors, copy, images, `aspect-ratio` values, SVG `viewBox` numbers (they scale on their own), or `em` / `%` values that are relative to something already scaled.

### Step D: If the project uses `rem` or Tailwind

A lot of `rem`-based code (and every default Tailwind spacing and font size) follows the root font size. Make the root font size follow the scale, so all of it scales at once:

```css
html { font-size: calc(16 * var(--s)); }              /* 1rem = 16 design px, scaled */

@media (max-width: 900px) {
  html { font-size: 16px; }                           /* phones: normal rem; the mobile rules use vw */
}
```

Then `rem`-based values need no change on desktop. Arbitrary pixel values in Tailwind classes still need converting, for example `w-[calc(345*var(--s))]`.

### Step E: Convert the script values

Any pixel number inside GSAP or other scripts is also a fixed size. Convert it.

```js
// One design pixel in real pixels, for scripts
export const S = () => window.innerWidth / 1440;

// Before: gsap.from(el, { y: 60 })
// After (either way works):
gsap.from(el, { y: () => 60 * S() });
gsap.from(el, { y: "4.17vw" });              // 60 / 14.4 = 4.17vw
```

Convert: entrance distances (`y: 40`, `y: 60`, `x: 30`), the stack and throw offsets, mouse-parallax amounts (such as `16`, `10`, `12`, `8`), hover shifts written in JavaScript, and any measured pixel thresholds. Distances already written in `vw`, `vh`, or `%` are fine (for example `x: "100vw"`).

Things that are already correct and need no change: SVG user units (they scale with the SVG), values read from the DOM at run time (for example the real tick gap), and `ScrollTrigger` positions written as percentages.

### Step F: Things that must not be used

- `zoom` on `html` or `body`
- `transform: scale()` on the whole page or a global wrapper
- `meta viewport` tricks such as `initial-scale=0.75` (that only affects phones)
- A script that sets font sizes on resize
- Any "just for desktop" pixel override that undoes the scaling

These break measurements, GSAP, and hover areas, and they only hide the problem.

### Step G: Preview at 100% from now on

The preview must stay at 100% zoom. If a different zoom is needed to see more of the page, resize the window or use the responsive-size controls instead.

---

## 5. Known Places to Convert (Not a Complete List)

Search the project to find the rest. These come from the section specs written so far:

| Area | Values to convert |
|---|---|
| Hero | Nav font sizes and paddings, anything in pixels around the portrait and the pixel title |
| Second section | Card gap `clamp(24px, 3vw, 48px)`, print border `10px`, pill padding and `11px` type, title `15px`, date `12px`, hover shifts |
| Extrude cards section | `--off: clamp(14px, 1.74vw, 25px)` becomes `calc(25 * var(--s))`, `--boff` becomes `calc(10 * var(--s))`, button `min(37.1vw, 534px)` and its height `clamp(64px, 6.8vw, 98px)`, hover `-8px`, `3px`, `max-width` of the row |
| About section | Label `clamp(18px, 2.7vw, 40px)`, paragraph `clamp(16px, 2.4vw, 34px)`, paddings |
| Camera + cards section | Focus bracket `3px` borders and sizes, hover `-10px`, parallax amounts in the script, GSAP `y` / `x` values, the lens ring width |
| Wheel on the black band | Wheel width `clamp(160px, 20vw, 290px)`, drag distances, `TICK` (read it from the DOM, never hard-code it) |
| Footer | Caption `clamp(14px, 2.8vw, 40px)`, the `10px` and `6px` parallax amounts, `FRONT_OFFSET` is in SVG units (leave it) |

---

## 6. How to Verify (All Must Pass)

Use the browser's responsive tool, and **also** change the real browser zoom.

**Test matrix:** screen widths of 1280, 1440, 1536, 1920, and 2560 CSS pixels at 100% zoom, and the same window at 75%, 100%, and 125% browser zoom.

- [ ] **At 1440 wide and 100% zoom,** every section matches its design frame. Overlay each section on its design image: edges land within 2px
- [ ] **Proportions are identical at every width.** Take a screenshot at 1440 and one at 1920, scale the second down to 1440 wide, and compare: differences are under 1 to 2% (only scrollbar rounding)
- [ ] **Line breaks are identical.** The about paragraph wraps into the same lines at every width, and the footer caption stays on one line
- [ ] **Zoom does not change the look.** At 75%, 100%, and 125% browser zoom the page looks the same in proportion
- [ ] **No sideways scrollbar** at any width
- [ ] **Animations are unchanged** in feel and distance relative to the layout (an element still travels the same fraction of the screen)
- [ ] **The mobile layout (under 900px) is unchanged**
- [ ] **Baseline report:** the before and after sizes from Step A are included in the reply

---

## 7. Acceptance Checklist

- [ ] `--design-w`, `--k`, and `--s` exist once, in the global stylesheet
- [ ] No fixed pixel size remains for fonts, paddings, gaps, offsets, or widths, except 1px hairlines, media-query breakpoints, the 12px text floor, and values listed in the reply with a reason
- [ ] Every `clamp()` / `min()` that capped growth with pixels has been replaced
- [ ] Content sections use the design frame height, not `100vh` (footer excepted)
- [ ] All GSAP and script pixel distances are scaled with `S()` or `vw`
- [ ] No `zoom`, no page-level `transform: scale()`, no viewport hacks
- [ ] Layout, colors, copy, images, and animation design are unchanged
- [ ] The preview was done at 100% zoom, and the verification matrix passed

---

## 8. Open Items (ask the owner if not already answered)

1. **The target look.** The default is to match the design frames exactly (`--k: 1`). If the owner wants it slightly smaller or larger than the design, change `--k` only
2. **Very wide screens.** By default the page keeps scaling up forever. If the owner wants scaling to stop above a certain width (for example 2200px), change `--s` to `calc(var(--k) * min(100vw, 2200px) / var(--design-w))` and center the page
3. **Minimum text size on phones**, if the owner wants something other than the 12px floor
4. **The owner's usual screen width**, which helps confirm the check at the width they actually use
