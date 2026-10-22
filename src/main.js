import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { LETTERS, TARGET_WORD } from './letters.js';

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

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

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    playEntrance();
    initShelf();
    initWheel();
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(['.hero-bg', '.hero-portrait', '.px', '.nav'], { clearProps: 'all' });
    document.querySelector('.shelf')?.classList.add('is-in');
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
// 6. Camera Wheel Focus Ring (wheel-placement-spec.md Section 5B)
// Seamless repeating ridges draggable with GSAP Inertia
// ==========================================================================
function initWheel() {
  const ring = document.querySelector('.wheel-ring');
  const ridges = document.querySelector('.wheel-ridges');
  const wheel = document.querySelector('.wheel');
  if (!ring || !ridges) return;

  // Natural aspect ratio of ridges.png: 148 / 80
  const TILE_W = 148;
  const TILE_H = 80;

  let tile = (ridges.offsetHeight || 30) * (TILE_W / TILE_H);
  let wrap = gsap.utils.wrap(0, tile);

  function updateTile() {
    if (ridges.offsetHeight > 0) {
      tile = ridges.offsetHeight * (TILE_W / TILE_H);
      wrap = gsap.utils.wrap(0, tile);
    }
  }
  window.addEventListener('resize', updateTile);

  // Invisible proxy element tracks the drag physics and inertia
  const proxy = document.createElement('div');
  proxy.style.cssText = 'position: absolute; opacity: 0; pointer-events: none; z-index: -1;';
  document.body.appendChild(proxy);

  function update() {
    const curX = gsap.getProperty(proxy, 'x');
    ridges.style.backgroundPositionX = wrap(curX) + 'px';

    if (wheel) {
      const normVal = Math.round((((curX % 1000) + 1000) % 1000) / 10);
      wheel.setAttribute('aria-valuenow', String(normVal));
    }
  }

  Draggable.create(proxy, {
    trigger: [ring, wheel],
    type: 'x',
    inertia: true,
    resistance: 0.15,
    edgeResistance: 0,
    onDrag: update,
    onThrowUpdate: update,
  });

  // Keyboard accessibility: Left / Right arrow keys turn the wheel
  if (wheel) {
    wheel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const delta = e.key === 'ArrowRight' ? 30 : -30;
        const curX = gsap.getProperty(proxy, 'x') || 0;
        gsap.to(proxy, {
          x: curX + delta,
          duration: 0.35,
          ease: 'power2.out',
          onUpdate: update,
        });
      }
    });
  }
}

// ==========================================================================
// 7. Website Interactive Features
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

  // Gallery Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.35 });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Lightbox Modal
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg && lightboxClose) {
    galleryCards.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('.gallery-img');
        const title = card.querySelector('.gallery-title')?.innerText || '';
        const category = card.querySelector('.gallery-category')?.innerText || '';
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.innerHTML = `<strong>${title}</strong> &mdash; <span>${category}</span>`;
        lightbox.classList.add('active');
      });
    });

    const closeLightbox = () => lightbox.classList.remove('active');
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
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
