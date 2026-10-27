# Antigravity Task: Make the Existing Website Responsive on Mobile

## Goal

Update the existing website so its **mobile layout preserves the same
visual arrangement and design identity as the current laptop/desktop
version** as closely as the screen allows.

The desktop page is the source of truth. Mobile responsiveness should
adapt sizing and spacing intelligently---not redesign the page, reorder
content arbitrarily, or introduce a new visual style.

Inspect the real project and implement changes directly in the existing
codebase.

## Primary requirement: preserve the composition

The page uses a deliberate composition of large white rectangular panels
on a deep red background, hard black outlines/offset edges, and a camera
image positioned toward the lower-left. Preserve the same relationships
between these elements at mobile sizes.

-   Keep the same panel order and visual reading order.
-   Preserve intentional overlaps, alignment, asymmetry, and layered
    black edges.
-   Keep the red background, white surfaces, black outlines/shadows,
    imagery, typography, and existing content.
-   Keep the camera image associated with the same part of the
    composition.
-   Do not turn the design into a generic stack of cards.
-   Do not hide important panels or imagery just to make the page fit.
-   Do not add new sections, content, colors, gradients, decorative
    effects, or UI elements.
-   Do not change desktop styling unnecessarily. The existing desktop
    view must remain visually consistent.

**"Same arrangement" means the same overall composition and relative
placement, adapted proportionally to fit the smaller viewport. It does
not mean forcing desktop pixel dimensions onto a phone and making the
user zoom out.**

## Step 1 --- Inspect before editing

1.  Inspect the project structure, page/component responsible for this
    section, CSS files, asset paths, and existing breakpoints.
2.  Preview the current page at desktop size and identify its actual
    layout rules.
3.  Determine whether the composition uses CSS Grid, Flexbox, absolute
    positioning, fixed pixel sizes, transforms, or a combination.
4.  Identify the camera image and how its crop, position, and overflow
    are controlled.
5.  Check whether GSAP animations already target the panels or image.
    Preserve those animations and ensure responsive changes do not break
    their selectors, transforms, or timing.
6.  Make the smallest reliable set of changes. Do not rewrite unrelated
    components or replace the project's styling approach without a clear
    technical reason.

## Step 2 --- Establish responsive behavior

### Desktop and laptop

-   Preserve the current desktop arrangement, dimensions, spacing,
    overlaps, and image placement.
-   Avoid regressions at existing desktop breakpoints.
-   Do not make desktop layout decisions based on a mobile-only fix.

### Tablet

-   Keep the composition recognizable and in the same reading order.
-   Reduce dimensions and gaps proportionally where needed.
-   Use the available viewport without accidentally clipping important
    content.
-   Only change the number of columns or relative positioning if the
    original layout genuinely cannot fit at that width.

### Mobile

-   Retain the key desktop relationships: same panels in the same order,
    same red field, same hard black offsets, and the camera image in its
    corresponding position.
-   Scale the composition down as a coordinated system where practical,
    rather than independently shrinking elements until they no longer
    align.
-   Preserve relative panel proportions and spacing.
-   Keep panel edges crisp and black offsets attached to the correct
    white surfaces.
-   Preserve intentional overlaps, but prevent accidental collisions
    that obscure important details.
-   Keep the camera image proportional and recognizable. Do not stretch
    it.
-   Ensure essential content remains visible and legible.
-   Avoid unintended horizontal page scrolling. If the design
    intentionally clips a composition, scope clipping to that visual
    section rather than the entire document.
-   Respect mobile safe areas where relevant.
-   Do not set a fixed page width that forces phones to render a
    desktop-sized page.

## Step 3 --- Choose the correct layout technique

Do not blindly replace all existing positioning. Inspect the
implementation and choose the least disruptive technique.

-   If the panels form a coordinated composition, consider a shared
    wrapper that scales with the viewport while keeping internal
    proportions stable.
-   Use CSS Grid or Flexbox for relationships that should reflow
    naturally.
-   Use absolute positioning only for elements that intentionally
    overlap or are anchored within a defined composition.
-   Prefer responsive units such as `%`, `vw`, `rem`, `clamp()`, and
    grid fractions where appropriate. Keep fixed values for details that
    should remain visually constant, such as thin borders.
-   Use `aspect-ratio` for images or panels whose proportions must
    remain consistent.
-   Use `max-width: 100%` and appropriate sizing constraints to prevent
    media overflowing its container.
-   Avoid applying `transform: scale()` to the entire page or `body` as
    a shortcut. If a scaled composition wrapper is necessary, scope it
    only to the section and verify that text, interactions, and layout
    height still work correctly.
-   Avoid hardcoding mobile coordinates for every element if a shared
    responsive layout can preserve relationships more reliably.
-   Do not use JavaScript to calculate responsive positions unless the
    existing implementation truly requires it. Prefer CSS media queries
    and fluid sizing.

## Step 4 --- Preserve image and overflow behavior

-   Keep the original image asset and existing `object-position` unless
    inspection shows a real mobile-specific cropping problem.
-   Use `object-fit: contain` or `cover` only according to the intended
    visual treatment; do not change the image's appearance arbitrarily.
-   Ensure the camera image does not unexpectedly cover panels or
    disappear below a clipped container on mobile.
-   Check parent containers for `overflow: hidden`, fixed heights, and
    positioned children that may cut off the composition.
-   If clipping is part of the intended design, preserve it locally and
    deliberately. Do not introduce document-wide overflow hacks.
-   Prevent important content from being cut off by a fixed-height
    section on small devices.

## Step 5 --- Maintain existing GSAP animation behavior

GSAP is already installed in this project.

-   Keep existing animations and timeline behavior unless a specific
    responsive bug requires a targeted fix.
-   Do not add a new animation library or redesign the motion.
-   Ensure animations work after responsive layout changes and do not
    animate toward stale desktop coordinates.
-   Prefer animating opacity, transforms, and suitable reveal properties
    instead of layout dimensions.
-   If an animation sets transforms, ensure it does not override
    responsive CSS positioning or cause mobile overflow.
-   Test the initial state, animated state, and final settled state at
    mobile and desktop widths.
-   Respect `prefers-reduced-motion` if the current implementation
    supports entrance animation.

## Step 6 --- Test these viewport sizes

Use browser responsive mode or equivalent real viewport testing. These
are test targets, not separate design specifications.

  Device category   Viewport target
  ----------------- -----------------
  Small phone       320 × 640
  Common phone      375 × 812
  Large phone       430 × 932
  Tablet            768 × 1024
  Laptop            1366 × 768
  Desktop           1440 × 900

Also check an intermediate width to catch breakpoints that only work at
exact test sizes.

At each viewport, verify:

-   The composition remains in the intended order.
-   Panels and black offset edges remain aligned.
-   The camera image remains proportional and appropriately positioned.
-   No unintended horizontal scrollbar appears.
-   No important panel, image, or content is unintentionally clipped.
-   No overlapping elements are caused by stale fixed coordinates.
-   Text remains readable where present.
-   GSAP animations complete without jumps or layout shifts.
-   The desktop view still matches the original.

## Step 7 --- Implementation and quality rules

-   Follow the existing framework and code conventions.
-   Reuse existing components, assets, CSS variables, and design tokens.
-   Add focused media queries at appropriate existing breakpoints.
-   Avoid duplicate or contradictory CSS declarations.
-   Do not add dependencies.
-   Do not remove existing features or content.
-   Do not claim responsiveness is complete without testing the actual
    page at multiple widths.
-   If a particular part of the composition cannot retain its exact
    desktop arrangement on a narrow phone, preserve its visual
    relationships and explain the trade-off rather than inventing a
    redesign.

## Acceptance criteria

-   [ ] Desktop appearance remains consistent with the current website.
-   [ ] Mobile retains the same visual identity and composition as
    desktop.
-   [ ] Panel order and relative relationships remain consistent.
-   [ ] White panels, black offsets, red background, and camera image
    are preserved.
-   [ ] The composition scales or adapts without arbitrary redesign.
-   [ ] No important content is hidden or accidentally clipped.
-   [ ] No unwanted horizontal scrolling occurs.
-   [ ] Existing GSAP animations still work at responsive widths.
-   [ ] Layout is tested on small phone, common phone, large phone,
    tablet, and desktop viewports.
-   [ ] No console errors or unrelated regressions are introduced.

## Final instruction to Antigravity

Implement the responsive changes directly in the current project. Do not
return only advice or a standalone demo.

After implementation, provide a concise report listing: 1. Files
changed. 2. How the mobile and tablet layout behaves. 3. How the desktop
appearance was preserved. 4. Viewport sizes tested and any remaining
limitations.

**Priority order: preserve the existing design, maintain the composition
on mobile, prevent overflow/clipping, and keep the implementation
maintainable.**
