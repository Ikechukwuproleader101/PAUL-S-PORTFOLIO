import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { SplitText } from 'gsap/SplitText';
import { LETTERS, TARGET_WORD } from './letters.js';
import { createWheel } from './createWheel.js';

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, SplitText);

let masterTimeline = null;
let idleTween = null;
let parallaxCleanup = null;

// ==========================================================================
// 1. Pixel Text Builder
// Builds the 47-column pixel grid for both the white and shadow layers
// ==========================================================================
function buildPixelLayer(container, word, letters, layerType) {
  container.innerHTML = '';
  const frag = document.createDocumentFragment();

  [...word].forEach((char, index) => {
    const grid = letters[char];
    if (!grid) return;

    // Letter element
    const letterEl = document.createElement('div');
    letterEl.className = 'px-letter';
    letterEl.dataset.char = char;

    grid.forEach((row) => {
      [...row].forEach((cell) => {
        const px = document.createElement('i');
        const isFilled = cell === '1';
        px.className = isFilled ? `px px--${layerType}` : 'px px--empty';
        letterEl.appendChild(px);
      });
    });

    frag.appendChild(letterEl);

    // Spacer between letters (except after the last letter)
    if (index < word.length - 1) {
      const spacer = document.createElement('div');
      spacer.className = 'px-spacer';
      frag.appendChild(spacer);
    }
  });

  container.appendChild(frag);
}

// ==========================================================================
// 2. Entrance Animation Timeline (GSAP)
// Matches hero-animation-spec.md Section 6 & tuning notes
// ==========================================================================
function playEntrance() {
  // If an animation is already running, kill and clean up
  if (masterTimeline) {
    masterTimeline.kill();
  }
  if (idleTween) {
    idleTween.kill();
    idleTween = null;
  }
  if (parallaxCleanup) {
    parallaxCleanup();
    parallaxCleanup = null;
  }

  // Reset transforms and opacities to clean starting state
  gsap.set('.hero-bg', { clipPath: 'inset(0% 0% 0% 0%)' });
  gsap.set('.hero-portrait', { clearProps: 'transform,opacity,visibility' });
  gsap.set('.px:not(.px--empty)', { clearProps: 'transform,opacity,visibility' });
  gsap.set('.nav', { clearProps: 'transform,opacity,visibility' });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      startIdleAndParallax();
    }
  });

  masterTimeline = tl;

  // Step 1: Background wipe in (clip-path reveal)
  tl.from('.hero-bg', {
    clipPath: 'inset(0% 0% 100% 0%)',
    duration: 0.8,
    ease: 'power4.inOut',
  });

  // Step 2: Portrait rises up slightly and scales down from 1.08 to 1
  tl.from(
    '.hero-portrait',
    {
      yPercent: 12,
      scale: 1.08,
      autoAlpha: 0,
      duration: 1.2,
      ease: 'power3.out',
    },
    0.5
  );

  // Step 3: White pixels pop in scattered randomly across the word
  tl.from(
    '.px--white:not(.px--empty)',
    {
      scale: 0,
      autoAlpha: 0,
      duration: 0.3,
      ease: 'back.out(2)',
      stagger: {
        amount: 1.2,
        from: 'random',
      },
    },
    1.1
  );

  // Step 3b: Black shadow blocks pop in right after (offset by 0.15s)
  tl.from(
    '.px--shadow:not(.px--empty)',
    {
      scale: 0,
      autoAlpha: 0,
      duration: 0.3,
      ease: 'back.out(2)',
      stagger: {
        amount: 1.2,
        from: 'random',
      },
    },
    1.25
  );

  // Step 4: Nav bar slides down from above and fades in
  tl.from(
    '.nav',
    {
      yPercent: -100,
      autoAlpha: 0,
      duration: 0.6,
      ease: 'power3.out',
    },
    2.4
  );

  return tl;
}

// ==========================================================================
// 3. Idle Float and Subtle Mouse Parallax
// Matches hero-animation-spec.md Section 7
// ==========================================================================
function startIdleAndParallax() {
  const portrait = document.querySelector('.hero-portrait');
  if (!portrait) return;

  // 7.1 Idle float: gentle bobbing
  idleTween = gsap.to(portrait, {
    y: -8,
    duration: 3,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });

  // 7.2 Mouse parallax: subtle horizontal and slight tilt (desktop only)
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (!isTouchDevice && window.innerWidth > 768) {
    const moveX = gsap.quickTo(portrait, 'x', { duration: 0.8, ease: 'power3' });
    const moveRot = gsap.quickTo(portrait, 'rotation', { duration: 0.8, ease: 'power3' });

    const handleMouseMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5; // -0.5 to 0.5
      moveX(nx * 20);
      moveRot(nx * 1.5);
    };

    window.addEventListener('mousemove', handleMouseMove);

    parallaxCleanup = () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }
}

// ==========================================================================
// 4. Loading Gate & Initializer
// Matches hero-animation-spec.md Section 8 & 10
// ==========================================================================
async function init() {
  const portraitImg = document.querySelector('.hero-portrait');
  const heroEl = document.querySelector('.hero');
  const shadowLayer = document.querySelector('.px-layer--shadow');
  const whiteLayer = document.querySelector('.px-layer--white');

  // Build the pixel text DOM
  if (shadowLayer && whiteLayer) {
    buildPixelLayer(shadowLayer, TARGET_WORD, LETTERS, 'shadow');
    buildPixelLayer(whiteLayer, TARGET_WORD, LETTERS, 'white');
  }

  // Wait for fonts and portrait image to decode
  try {
    await Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      portraitImg && portraitImg.decode ? portraitImg.decode().catch(() => {}) : Promise.resolve(),
    ]);
  } catch (err) {
    console.warn('Pre-decode warning:', err);
  }

  // Reveal hero container
  if (heroEl) {
    heroEl.classList.remove('is-loading');
  }

  // Setup matchMedia for reduced motion and animations
  const mm = gsap.matchMedia();

  let wheelScaleCleanup = null;
  let aboutCleanup = null;
  let cameraCardsCleanup = null;
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    playEntrance();
    initShelf();
    wheelScaleCleanup = initWheelScale();
    aboutCleanup = initAbout();
    cameraCardsCleanup = initCameraCards();
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    if (wheelScaleCleanup) wheelScaleCleanup();
    if (aboutCleanup) aboutCleanup();
    if (cameraCardsCleanup) cameraCardsCleanup();
    gsap.set(['.hero-bg', '.hero-portrait', '.px', '.nav'], { clearProps: 'all' });
    document.querySelector('.shelf')?.classList.add('is-in');
    gsap.set(['.about-label', '.about-label-text', '.about-card', '.about-strip-text'], { clearProps: 'all' });
    const cameraRoot = document.querySelector('.cc');
    if (cameraRoot) {
      buildWheels(cameraRoot);
      cameraRoot.classList.add('is-ready', 'is-in');
    }
    // Reduced motion: wheel and scale stay static in place
    const viewport = document.querySelector('.scale-viewport');
    const track = document.querySelector('.scale-track');
    if (viewport && track) {
      buildTrack(track, viewport.offsetWidth);
      const q = (TICK - ((viewport.offsetWidth / 2) % TICK)) % TICK;
      gsap.set(track, { x: -q });
    }
  });

  // Replay Button handlers
  const replayBtns = document.querySelectorAll('.btn-replay, #replay-hero-btn');
  replayBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playEntrance();
    });
  });

  // Setup Website Interactions (Filters, Lightbox, Mobile Nav, Form)
  setupWebsiteInteractions();

  // Refresh ScrollTrigger calculations once all images and elements have decoded
  ScrollTrigger.refresh();
}

// ==========================================================================
// 5. Section 2: "Extrude" Cards + Button (GSAP)
// Matches Desktop - 3.png & section3-extrude-cards-spec.md
// ==========================================================================
function initShelf() {
  const root = document.querySelector('.shelf');
  if (!root) return;
  const cards = gsap.utils.toArray('.xcard', root);
  const faces = gsap.utils.toArray('.xcard-face', root);
  const cta = root.querySelector('.cta');
  const ctaFace = root.querySelector('.cta-face');

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
      defaults: { ease: 'power3.out' },
      onComplete() {
        // Hand control back to CSS so hover and press work normally
        gsap.set([cards, faces, cta, ctaFace], { clearProps: 'transform,zIndex' });
        root.classList.add('is-in');
      },
    });

    // 1. Spread out, left to right
    tl.to(
      cards,
      {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: 'power3.inOut',
        stagger: { each: 0.1, from: 'start' },
      },
      0
    );

    // 2. Extrude: each face lifts off its fixed shadow as its card lands
    tl.to(
      faces,
      {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'back.out(2.2)',
        stagger: 0.1,
      },
      0.9
    );

    // 3. Button arrives last, then extrudes the same way
    tl.fromTo(cta, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.5);
    tl.to(ctaFace, { x: 0, y: 0, duration: 0.45, ease: 'back.out(2.2)' }, 1.9);
  }

  ScrollTrigger.create({
    trigger: root,
    start: 'top 60%',
    once: true,
    onEnter: play,
  });
}

// ==========================================================================
// 6. Camera Wheel + Calibration Scale (wheel-placement-spec 2.md)
// Dragging the wheel slides the ridges AND the calibration scale in sync
// ==========================================================================
const MODE = 'loop';              // 'loop' | 'range'
const TICK = 24;                  // px between two ticks. Read from design
const TICKS_PER_PERIOD = 24;      // 6 major intervals * 4 ticks = 24 ticks (0, 15, 30, 45, 60, 75)
const PERIOD = TICK * TICKS_PER_PERIOD;
const RIDGE_TILE = 148;           // rendered width of ONE repeat of the ridge strip in px
const RIDGE_RATIO = 1;            // how far ridges move per px of drag

function buildTrack(track, viewportWidth) {
  const steps = [
    { num: 0, pos: 'top' },
    { num: 15, pos: 'bottom' },
    { num: 30, pos: 'top' },
    { num: 45, pos: 'bottom' },
    { num: 60, pos: 'top' },
    { num: 75, pos: 'bottom' },
  ];

  let periodHTML = '';
  steps.forEach((step) => {
    // 1 Major tick with number
    periodHTML += `
      <div class="scale-tick-unit is-major is-${step.pos}">
        <span class="scale-num scale-num--${step.pos}">${step.num}</span>
        <div class="scale-bar"></div>
      </div>
    `;
    // 3 Minor ticks
    for (let i = 0; i < 3; i++) {
      periodHTML += `
        <div class="scale-tick-unit is-minor">
          <div class="scale-bar"></div>
        </div>
      `;
    }
  });

  if (MODE === 'range') {
    track.innerHTML = periodHTML;
  } else {
    const copies = Math.ceil(viewportWidth / PERIOD) + 2;
    track.innerHTML = periodHTML.repeat(copies);
  }
}

function initWheelScale() {
  const viewport = document.querySelector('.scale-viewport');
  const track    = document.querySelector('.scale-track');
  const ring     = document.querySelector('.wheel-ring');
  const ridges   = document.querySelector('.wheel-ridges');
  const wheel    = document.querySelector('.wheel');

  if (!viewport || !track || !ring || !ridges) return () => {};

  const V = viewport.offsetWidth || window.innerWidth;
  buildTrack(track, V);

  // Phase offset so a tick sits exactly under the lens at rest (x = 0)
  const q = (TICK - ((V / 2) % TICK)) % TICK;

  const wrapScale = gsap.utils.wrap(-PERIOD, 0);
  const wrapRidge = gsap.utils.wrap(0, RIDGE_TILE);

  function render(x) {
    ridges.style.backgroundPositionX = wrapRidge(x * RIDGE_RATIO) + 'px';
    gsap.set(track, { x: (MODE === 'loop' ? wrapScale(x) : x) - q });
    if (wheel) {
      const normVal = Math.round((((x % 1000) + 1000) % 1000) / 10);
      wheel.setAttribute('aria-valuenow', String(normVal));
    }
  }

  const proxy = document.createElement('div');
  proxy.style.cssText = 'position: absolute; opacity: 0; pointer-events: none; z-index: -1;';
  document.body.appendChild(proxy);

  const config = {
    trigger: [ring, wheel],
    type: 'x',
    inertia: true,
    snap: (v) => Math.round(v / TICK) * TICK,    // settle on the nearest tick
    onDrag: function () { render(this.x); },
    onThrowUpdate: function () { render(this.x); },
  };

  if (MODE === 'range') {
    const rangeWidth = (TICKS_PER_PERIOD - 1) * TICK;
    config.bounds = { minX: -rangeWidth, maxX: 0 };
    config.edgeResistance = 0.85;
  }

  const drag = Draggable.create(proxy, config)[0];
  render(0);

  // Keyboard support: arrow keys move one tick
  function onKeyDown(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    gsap.to(proxy, {
      x: '+=' + dir * TICK,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate() {
        drag.update();
        render(drag.x);
      },
    });
  }

  ring.addEventListener('keydown', onKeyDown);
  if (wheel) wheel.addEventListener('keydown', onKeyDown);

  // Resize handler
  function onResize() {
    const newV = viewport.offsetWidth || window.innerWidth;
    buildTrack(track, newV);
    const newQ = (TICK - ((newV / 2) % TICK)) % TICK;
    gsap.set(track, { x: (MODE === 'loop' ? wrapScale(drag.x) : drag.x) - newQ });
  }
  window.addEventListener('resize', onResize);

  return () => {
    drag.kill();
    proxy.remove();
    ring.removeEventListener('keydown', onKeyDown);
    if (wheel) wheel.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
  };
}

// ==========================================================================
// 6. About Section: "GET TO KNOW ME" Animation (about-section-spec.md)
// ==========================================================================
function initAbout() {
  const root = document.querySelector('.about');
  if (!root) return () => {};

  const aboutText = root.querySelector('.about-text');
  if (!aboutText) return () => {};

  // Split paragraph into masked lines
  const split = SplitText.create(aboutText, {
    type: 'lines',
    mask: 'lines',
  });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: root, start: 'top 65%', once: true },
  });

  tl.from('.about-label', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'power4.inOut' }, 0)
    .from('.about-label-text', { yPercent: 110, duration: 0.5 }, 0.3)
    .from(split.lines, { yPercent: 110, duration: 0.8, stagger: 0.06 }, 0.45)
    .from('.about-card', {
      x: '30vw',
      rotation: 14,                  // lands on CSS tilt (4deg); starts 10deg further over
      duration: 1.1,
      ease: 'back.out(1.4)',
    }, 0.2)
    .from('.about-strip-text', {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.8,
      ease: 'power2.inOut',
    }, 1.0);

  // Resize handler to re-split text on width changes
  let resizeTimer = null;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      split.revert();
      split.split();
    }, 250);
  };
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    split.revert();
    tl.kill();
  };
}

// ==========================================================================
// 7. Camera + Project Cards Section (camera-cards-section-spec.md & camera-wheels-and-cards-fix.md)
// "Take the Shot, Throw the Prints", Rotating SVG Wheels & Flash Fix
// Matches Screenshot 2026-10-22 164755.png
// ==========================================================================
function buildWheels(root) {
  root.querySelectorAll('.camera-wheel').forEach((slot) => {
    slot.innerHTML = '';
    const d = slot.dataset;
    slot.appendChild(createWheel({
      teeth: +d.teeth || 48,
      ticks: +d.ticks || 60,
      palette: d.palette || 'chrome',
      numerals: d.numerals ? d.numerals.split(',') : [],
    }));
  });
}

function initCameraCards() {
  const root = document.querySelector('.cc');
  if (!root) return () => {};

  buildWheels(root);
  const wheels = gsap.utils.toArray('.camera-wheel svg', root);
  let spins = [];

  const rise   = root.querySelector('.camera-rise');
  const stack  = root.querySelector('.camera-stack');
  const af     = root.querySelector('.af');
  const cards  = gsap.utils.toArray('.pcard', root)
    .sort((a, b) => (+a.dataset.z) - (+b.dataset.z)); // back to front order
  const photos = cards.map((c) => c.querySelector('img')).filter(Boolean);

  let started = false;

  // Starting state: cards start beyond right edge, camera offset below
  function setStart() {
    if (started) return; // Never reset once entrance has begun (Fix Part B2)
    gsap.set(rise, { yPercent: 28, rotation: -3 });
    gsap.set(cards, {
      x: (i, el) => {
        const curX = gsap.getProperty(el, 'x') || 0;
        const naturalLeft = el.getBoundingClientRect().left - curX;
        return window.innerWidth - naturalLeft + 60;
      },
      rotation: () => gsap.utils.random(-10, 10),
      scale: 1.08,
    });
    gsap.set(photos, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(af, { autoAlpha: 0 });
  }

  setStart();
  root.classList.add('is-ready');

  // Rotating camera wheels: continuous slow spin, starting from rest at shutter click
  function startSpin() {
    spins = wheels.map((svg) => {
      const slot = svg.parentElement;
      const secs = +slot.dataset.speed || 40; // seconds per full turn
      const dir  = +slot.dataset.dir   || 1;  // 1 clockwise, -1 counter-clockwise
      const t = gsap.to(svg, { rotation: 360 * dir, duration: secs, ease: 'none', repeat: -1 });
      t.timeScale(0);
      gsap.to(t, { timeScale: 1, duration: 2.5, ease: 'power2.in' }); // eases up from rest
      return t;
    });

    // Pause while section is off screen, resume when it returns
    ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => spins.forEach((t) => t.paused(!self.isActive)),
    });
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: root, start: 'top 60%', once: true },
    onStart() {
      started = true; // Lock cards in place: nothing resets them
    },
    onComplete() {
      // Clear ONLY transform and clipPath so inline CSS variables (--l, --t, --w, --h, --z) remain intact!
      // DO NOT clear 'all' as it wipes out card dimensions and causes them to vanish.
      gsap.set([rise, stack], { clearProps: 'transform' });
      gsap.set(cards, { clearProps: 'transform' });
      gsap.set(photos, { clearProps: 'clipPath' });
      gsap.set(af, { autoAlpha: 0 });
      root.classList.add('is-in');
      enableCameraParallax(root);
    },
  });

  // 1. Camera rises into frame
  tl.to(rise, { yPercent: 0, rotation: 0, duration: 1.2, ease: 'power4.out' }, 0);

  // 2. Focus brackets lock onto the lens hood
  tl.fromTo(af, { scale: 1.8, autoAlpha: 0 },
                { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'power4.inOut' }, 0.9);

  // 3. The click, which kicks the camera and starts the wheels turning
  tl.to(stack, { scale: 1.01, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.35);
  tl.add(startSpin, 1.35);
  tl.to(af, { autoAlpha: 0, duration: 0.15, ease: 'none' }, 1.8);

  // 4. Cards are thrown in, back to front
  tl.to(cards, {
    x: 0,
    rotation: 0,
    scale: 1,
    duration: 0.8,
    ease: 'power4.out',
    stagger: 0.06,
  }, 1.35);

  // 5. Photos are exposed with a hard wipe
  tl.to(photos, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: 0.5,
    ease: 'power2.inOut',
    stagger: 0.06,
  }, 2.0);

  return () => {
    spins.forEach((t) => t.kill());
    tl.kill();
  };
}

// Subtle mouse parallax (desktop hover only)
function enableCameraParallax(root) {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const camera = root.querySelector('.camera');
  const cluster = root.querySelector('.cluster');
  if (!camera || !cluster) return;

  const cx = gsap.quickTo(camera, 'x', { duration: 0.8, ease: 'power3' });
  const cy = gsap.quickTo(camera, 'y', { duration: 0.8, ease: 'power3' });
  const kx = gsap.quickTo(cluster, 'x', { duration: 0.8, ease: 'power3' });
  const ky = gsap.quickTo(cluster, 'y', { duration: 0.8, ease: 'power3' });

  root.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    cx(nx * 16); cy(ny * 10);
    kx(nx * -12); ky(ny * -8);
  });
}

// ==========================================================================
// 8. Website Interactive Features
// ==========================================================================
function setupWebsiteInteractions() {
  // Mobile Nav Toggle
  const mobileToggle = document.querySelector('.nav-mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }


  // Contact Form Submission Mock
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.btn-submit');
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Transmission Received ✓';
      submitBtn.style.backgroundColor = '#16a34a';
      setTimeout(() => {
        contactForm.reset();
        submitBtn.innerText = originalText;
        submitBtn.style.backgroundColor = '';
      }, 3500);
    });
  }

  // Back to Top button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// Start everything when DOM is parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
