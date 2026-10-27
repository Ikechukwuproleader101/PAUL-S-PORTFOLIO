# Antigravity Build Brief --- Premium GSAP Animation for the Existing Hero Section

## Objective

Build the supplied website section as a faithful implementation of the
reference screenshot, then add restrained, premium-feeling motion with
the already-installed **GSAP** library.

This is an implementation brief, not a redesign. Treat the screenshot
and the existing project as the source of truth.

## Non-negotiable visual constraints

-   **Do not redesign the section.** Preserve the current composition,
    proportions, placement, spacing, red background, white rectangular
    panels, black offset edges/shadows, and the camera image at the
    lower-left.
-   Keep the existing visual language intentionally stark and geometric.
    Do not add gradients, glows, rounded cards, decorative icons, extra
    text, new colors, or extra UI elements.
-   Do not change the existing copy, typography, assets, image crop,
    panel order, or layout unless a technical correction is necessary to
    match the screenshot.
-   Reuse the existing camera image asset and existing project
    components/styles. Do not replace the image with a generated or
    stock image.
-   Do not introduce another animation library. **GSAP is already
    installed**; use the existing dependency.
-   Do not animate layout in a way that changes the final screenshot
    composition. Every animated element must settle at its exact
    intended position.
-   Avoid a generic "landing page reveal" that makes every object fly in
    dramatically. Motion should feel deliberate, editorial, and
    architectural.

## First: inspect the project

Before writing code:

1.  Inspect the project structure, package file, entry point, existing
    section component, styling system, and image assets.
2.  Identify the exact component that renders this section and how it is
    mounted.
3.  Check whether GSAP is already imported or used elsewhere. Reuse
    existing patterns where practical.
4.  Identify whether the white panels and their black offsets are
    separate elements, borders, pseudo-elements, or shadows. Preserve
    their current rendering method unless it prevents reliable
    animation.
5.  Locate the existing camera image. Keep its current source and object
    positioning.
6.  Make the smallest possible changes. Do not replace the project
    setup, rewrite unrelated components, or add dependencies.

If the current code already matches the screenshot, leave its styling
alone and add animation around it.

## Visual structure to preserve

Use the supplied screenshot as the visual acceptance reference. The
composition contains:

-   A solid deep red field filling the section.
-   Multiple large, sharp-cornered white rectangular panels distributed
    across the upper and middle portions.
-   Thin black outlines and hard black offset edges/shadows that create
    a layered, cut-paper / architectural-block effect.
-   A large camera/product photograph entering from the lower-left and
    partially extending beyond the visible section area.
-   Deliberately asymmetric panel sizes and gaps. These are part of the
    design, not a layout problem to "correct."

Keep the hard edges hard. Do not soften the shadows or convert the
layout into a standard card grid.

## Animation direction: "Architectural assembly"

The section should feel as though its graphic panels are being carefully
assembled into place, followed by the camera photograph becoming the
visual anchor. The motion is quiet and precise: short distances,
staggered timing, crisp easing, and no bounce.

### Phase 1 --- Red canvas

-   The red background is already present on page load.
-   Keep it static; do not fade the whole section from black or animate
    its color.
-   The background should be immediately visible so the page retains its
    strong identity.

### Phase 2 --- Panel reveal

Animate the white panels as a coordinated sequence rather than all at
once.

-   Reveal each panel with a subtle **clip-path or scale reveal** from
    its own top-left edge, depending on which technique best preserves
    its sharp rectangular edges in the current implementation.
-   Prefer animating `clip-path: inset(...)` from a fully inset state to
    `inset(0)` if the browser and current structure support it cleanly.
    This keeps the panel's final dimensions fixed and avoids layout
    shifts.
-   If clip-path would interfere with the black offset edges, animate
    the white surface and black offset layer together inside a wrapper,
    or use a short `scaleX`/`scaleY` reveal with `transform-origin`
    carefully set.
-   Keep the reveal restrained: approximately **0.45--0.7 seconds per
    panel**, with a **0.06--0.11 second stagger**.
-   Use an appropriate GSAP ease such as `power2.out` or `power3.out`.
    No elastic, bounce, or overshoot easing.
-   Sequence the panels in a readable path: upper-left, upper-middle,
    upper-right, then the large left-middle panel, central narrow
    panels, and right-side panel. Adapt the order to the actual DOM and
    geometry rather than changing the layout.
-   The black offset edges should remain visually attached to their
    corresponding white panels throughout the reveal. They must not
    appear to drift independently.

### Phase 3 --- Camera image entrance

The camera photo is the visual anchor, so let it arrive after the main
panel structure begins to form.

-   Animate the existing image from a small offset below its final
    position (around **18--28 px**) and from slightly reduced opacity to
    full opacity.
-   Optional: begin at `scale: 0.985` and settle at `scale: 1`, using
    the image's existing transform context. Keep the scale change almost
    imperceptible; preserve the original crop and framing.
-   Duration: approximately **0.7--0.9 seconds**.
-   Start it after most panels have begun appearing, not after an
    unnecessarily long pause.
-   Use a smooth `power2.out` or `power3.out` ease.
-   Do not rotate, tilt, swing, or bounce the camera image.
-   Do not apply a filter, color treatment, artificial glow, or parallax
    that changes the photograph's appearance.

### Phase 4 --- Final settle

-   Allow the composition to finish cleanly and then remain still.
-   No continuous floating, pulsing, looping, random motion,
    cursor-following effects, or perpetual parallax.
-   The premium effect should come from timing and restraint, not from
    adding more movement.

## Suggested timing map

Use this as a starting point, then tune it to the real DOM and the
screenshot.

  -------------------------------------------------------------------------
  Element/group                  Start             Duration Motion
  --------------- -------------------- -------------------- ---------------
  Upper-left                    0.00 s               0.55 s Sharp inset
  panel                                                     reveal

  Upper-middle                  0.07 s               0.58 s Sharp inset
  panel                                                     reveal

  Upper-right                   0.14 s               0.55 s Sharp inset
  panel                                                     reveal

  Large                         0.20 s               0.65 s Sharp inset
  left-middle                                               reveal
  panel                                                     

  Central panels         0.27 s onward         0.50--0.60 s Staggered
                                                            reveal

  Right-side                    0.32 s               0.65 s Sharp inset
  panel                                                     reveal

  Camera image            0.48--0.60 s               0.80 s Opacity +
                                                            18--28 px
                                                            upward settle
  -------------------------------------------------------------------------

These are approximate timings, not hard requirements. Use a **single
GSAP timeline** so the sequence is easy to understand and tune. Use
labels if they make the timeline clearer.

## Implementation requirements

### GSAP and lifecycle

-   Use `gsap.timeline()` for the intro sequence.
-   In React, initialize the timeline inside `useLayoutEffect` or the
    project's established GSAP hook pattern. Use `gsap.context()` scoped
    to the section root and revert/clean it up on unmount to prevent
    duplicate animations during React Strict Mode or route changes.
-   If the project is not React, use the framework's existing lifecycle
    conventions and clean up any GSAP context/timeline correctly.
-   Scope selectors to the section root. Do not use broad selectors that
    could animate unrelated panels elsewhere on the site.
-   Prefer stable classes or `data-` attributes such as
    `data-hero-panel` and `data-hero-image`; do not rely on fragile
    `nth-child` selectors if the project structure can provide
    descriptive hooks.
-   Avoid hardcoding a second set of layout coordinates in JavaScript.
    Animate the elements in their existing layout.
-   Do not use GSAP to calculate or rewrite the panel positions. CSS
    remains responsible for layout; GSAP is responsible only for
    presentation over time.

### Initial state and no-flash loading

-   Prevent the panels from briefly appearing in their fully visible
    state before the entrance animation starts, but do not leave the
    content hidden if JavaScript fails.
-   Use a progressive-enhancement strategy: only apply the hidden/reveal
    initial state when the animation is ready to run. If appropriate for
    the framework, add an animation-ready class after the component
    mounts and scope the hidden state to that class.
-   If the project already has a page-loading or entrance-animation
    system, integrate with it rather than creating a competing system.
-   Do not leave elements invisible when the timeline is interrupted or
    GSAP fails to initialize.

### Responsive behavior

-   Preserve the existing responsive layout and breakpoints.
-   The animation must not introduce horizontal scrolling, content
    jumps, or overflow outside the section that was not present before.
-   Test desktop and mobile/tablet widths. If the screenshot represents
    a desktop-only layout, retain its desktop composition while
    respecting the site's existing mobile layout.
-   If the panels rearrange at a breakpoint, keep the reveal order
    sensible for the resulting visual order.
-   Do not add a new mobile design or hide panels just to simplify
    animation.

### Accessibility and performance

-   Respect `prefers-reduced-motion: reduce`. When reduced motion is
    enabled, show the final layout immediately or use a minimal
    opacity-only transition.
-   Animate transform, opacity, and clip-path where suitable; do not
    animate panel width, height, margins, or positional layout
    properties unless absolutely necessary.
-   Do not add scroll-trigger behavior unless the existing section is
    explicitly designed to animate on scroll. The default should be a
    one-time entrance when the section first mounts or enters view,
    consistent with the existing page behavior.
-   If the section is far below the fold, use the project's existing
    scroll-trigger conventions or a small, well-cleaned-up
    `IntersectionObserver`; do not add a new scroll library.
-   Avoid excessive `will-change`. Add it only if profiling shows it is
    useful, and remove it after the animation where practical.
-   Ensure the section remains usable if the user navigates away during
    the animation.

## Suggested markup hooks

Adapt these names to the actual project; do not restructure the DOM just
to match the example.

-   Section root: `data-hero-section`
-   Each animated white panel wrapper: `data-hero-panel`
-   Camera image or image wrapper: `data-hero-image`

Animate the wrapper containing the white surface and its black offset
treatment when possible, so both layers move/reveal as one unit.

## Acceptance checklist

Before considering the work complete:

-   [ ] The final static composition matches the supplied screenshot.
-   [ ] Red background, panel dimensions and placement, black
    outlines/offsets, image asset, crop, and overlap are unchanged.
-   [ ] No new copy, icons, colors, gradients, glows, or decorative
    elements have been introduced.
-   [ ] Panels reveal in a restrained, coordinated sequence with crisp
    edges.
-   [ ] Black offset layers remain aligned with the white panels.
-   [ ] The camera image enters smoothly without rotation or noticeable
    crop changes.
-   [ ] The sequence runs once and then rests.
-   [ ] No visible flash, layout shift, or unwanted scrollbar is
    introduced.
-   [ ] Reduced-motion preferences are respected.
-   [ ] React/framework cleanup is correct; no duplicate timelines or
    console errors.
-   [ ] Existing project behavior outside this section is unchanged.

## Final instruction

Implement the animation in the existing codebase. Do not return only a
mockup, explanation, or isolated demo. After implementation, report:

1.  Which files were changed.
2.  How the GSAP timeline works.
3.  What was done to preserve the screenshot's design.
4.  Which viewport sizes and reduced-motion behavior were tested.
5.  Any remaining issues or assumptions.

**Priority order:** visual fidelity first, animation quality second,
code simplicity third. If a motion idea conflicts with the reference
design, preserve the design and simplify the motion.
