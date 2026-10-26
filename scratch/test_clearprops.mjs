import { gsap } from 'gsap';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<div class="pcard" style="--l: 10%; --w: 20%; left: var(--l);"></div>');
global.window = dom.window;
global.document = dom.window.document;

const el = document.querySelector('.pcard');
console.log('1. Initial style:', el.getAttribute('style'));
gsap.set(el, { x: 50, scale: 1.08 });
console.log('2. After gsap.set x:', el.getAttribute('style'));
gsap.set(el, { clearProps: 'all' });
console.log('3. After clearProps all:', el.getAttribute('style'));
