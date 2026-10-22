import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../menu-focus.js', import.meta.url), 'utf8');
let y = 0, clock = 1000, nextId = 0;
const frames = new Map(), timers = new Map();
class Element {
  constructor(tag = '') {
    this.tag = tag; this.handlers = {}; this.dataset = {}; this.children = [];
    this.style = { setProperty(name, value) { this[name] = value; } };
    const classes = new Set();
    this.classList = { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) };
    this.position = 0; this.clientHeight = 400; this.scrollHeight = 2400; this.offsetHeight = 1000;
    this.open = false;
  }
  get scrollTop() { return this.position; }
  set scrollTop(value) { this.position = Math.max(0, Math.min(this.scrollHeight - this.clientHeight, value)); }
  addEventListener(type, fn) { (this.handlers[type] ??= []).push(fn); }
  fire(type, data = {}) {
    const event = { target: this, cancelable: true, preventDefault() { this.prevented = true; }, ...data };
    (this.handlers[type] ?? []).forEach(fn => fn(event)); return event;
  }
  setAttribute(name, value) { this[name] = value; }
  removeAttribute(name) { delete this[name]; }
  querySelectorAll() { return []; }
  querySelector() { return null; }
  closest(selector) { return selector === '.menu-scroll' && this.listTarget ? this : null; }
  append(...items) { this.children.push(...items); }
  prepend(...items) { this.children.unshift(...items); }
  before() {}
  after() {}
  replaceWith() {}
  focus() {}
  showModal() { this.open = true; }
  close() { this.open = false; }
  getBoundingClientRect() { return { top: 1200 - y, bottom: 2200 - y, left: 12, right: 378 }; }
}
const section = new Element(), filters = new Element(), list = new Element(), footnote = new Element();
const category = new Element(); category.dataset.category = 'hlavni';
filters.append(category);
section.querySelector = selector => ({ '#menu-list': list, '.menu-footnote': footnote, '.menu-filters': filters })[selector];
section.querySelectorAll = selector => selector === '[data-category]' ? filters.children : [];
const link = new Element(), lunchLink = new Element(), reservation = new Element(), body = new Element();
reservation.getBoundingClientRect = () => ({ top: 2200 - y });
const created = [], selected = [];
const document = {
  body, activeElement: body,
  querySelector: selector => selector === '#menu' ? section : selector === '#rezervace' ? reservation : lunchLink,
  querySelectorAll: () => [link, lunchLink],
  createElement: tag => { const item = new Element(tag); created.push(item); return item; }
};
const window = new Element();
Object.defineProperty(window, 'scrollY', { get: () => y });
window.innerHeight = 800; window.innerWidth = 390; window.location = { hash: '' };
const motion = { matches: true };
window.matchMedia = () => motion;
window.selectMenuCategory = key => selected.push(key);
window.scrollTo = options => { y = options.top; };
class TestDate extends Date { static now() { return clock; } }
const tick = (ms = 16) => { clock += ms; const work = [...frames.values()]; frames.clear(); work.forEach(fn => fn(clock)); };
const flushTimers = () => { const work = [...timers.values()]; timers.clear(); work.forEach(fn => fn()); };
vm.runInNewContext(source, { document, window, Date: TestDate,
  requestAnimationFrame: fn => { const id = ++nextId; frames.set(id, fn); return id; },
  cancelAnimationFrame: id => frames.delete(id),
  setTimeout: fn => { const id = ++nextId; timers.set(id, fn); return id; },
  clearTimeout: id => timers.delete(id) });
const dialog = created.find(item => item.tag === 'dialog');
const scroller = created.find(item => item.className === 'menu-scroll');
const close = created.find(item => item.className === 'menu-close');
const handle = created.find(item => item.className === 'menu-drag-handle');
const hint = created.find(item => item.className === 'menu-pull-hint');
const foodTarget = new Element(); foodTarget.listTarget = true;
const start = (position, target = foodTarget) => section.fire('touchstart', { target, touches: [{ clientX: 100, clientY: position }] });
const move = position => { clock += 24; return section.fire('touchmove', { touches: [{ clientX: 100, clientY: position }] }); };
const end = () => section.fire('touchend');
const open = () => link.fire('click');

y = 1120; window.fire('scroll'); tick();
assert.ok(dialog.open, 'Scrolling to menu opens the floating sheet');
assert.ok(body.classList.contains('menu-is-open'));
scroller.scrollTop = 900;
start(500); move(430);
assert.equal(scroller.scrollTop, 970, 'Small swipe scrolls the food list');
assert.equal(dialog.style['--sheet-y'], '0px', 'Small swipe in the list does not move the card');
end(); assert.ok(dialog.open);

scroller.scrollTop = 900;
start(500); move(320);
assert.equal(scroller.scrollTop, 1020);
assert.ok(parseFloat(dialog.style['--sheet-y']) < 0, 'Medium swipe moves the whole card in the finger direction');
end();
assert.ok(dialog.open, 'Medium swipe must spring back rather than close');
assert.equal(dialog.style['--sheet-y'], '0px');
assert.equal(dialog.classList.contains('is-dragging'), false);

scroller.scrollTop = 900;
start(500); move(200);
assert.ok(scroller.scrollTop < scroller.scrollHeight - scroller.clientHeight, 'Dismissal must not require the bottom of the list');
assert.match(hint.textContent, /Pusťte/);
end();
assert.equal(dialog.open, false, 'Strong upward swipe closes from mid-list');
assert.equal(y, 2200);
window.fire('scroll'); tick(); assert.equal(dialog.open, false, 'No automatic reopen after dismissal');

open(); scroller.scrollTop = 900;
start(250); move(550);
assert.ok(parseFloat(dialog.style['--sheet-y']) > 0);
end(); assert.equal(dialog.open, false, 'Strong downward swipe closes from mid-list');
assert.equal(y, 640);

open(); scroller.scrollTop = 900;
start(500); move(200); move(430); end();
assert.ok(dialog.open, 'Pulling back before release cancels dismissal');
start(500); move(200); section.fire('touchcancel'); end();
assert.ok(dialog.open, 'Cancelled gesture never dismisses');
start(500); move(200);
section.fire('touchmove', { touches: [{ clientX: 80, clientY: 100 }, { clientX: 130, clientY: 140 }] });
end(); assert.ok(dialog.open, 'Pinch/multitouch cancels card dragging');

scroller.scrollTop = 0;
start(300); move(360); end();
assert.ok(dialog.open, 'Small overscroll at an edge springs back');
scroller.scrollTop = 900; category.fire('click');
assert.equal(scroller.scrollTop, 0);
assert.equal(selected.at(-1), 'hlavni');
close.fire('click'); assert.equal(dialog.open, false);
lunchLink.fire('click');
assert.equal(selected.at(-1), 'obedove', 'Obědy still selects the lunch category');
assert.ok(dialog.open);
dialog.fire('cancel'); assert.equal(dialog.open, false);

open(); scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight;
for (let i = 0; i < 4; i++) scroller.fire('wheel', { deltaX: 0, deltaY: 65, deltaMode: 0 });
flushTimers(); assert.equal(dialog.open, false, 'Deliberate wheel edge overscroll dismisses');

open();
section.fire('pointerdown', { target: handle, pointerType: 'mouse', button: 0, clientX: 100, clientY: 100 });
section.fire('pointermove', { pointerType: 'mouse', clientX: 100, clientY: 390 });
section.fire('pointerup', { pointerType: 'mouse' });
assert.equal(dialog.open, false, 'The handle is draggable with a mouse too');

const animations = [];
dialog.animate = (frames, options) => {
  let complete;
  const animation = { frames, options, cancelled: false,
    finished: { then(fn) { complete = fn; } }, cancel() { this.cancelled = true; },
    complete() { complete?.(); } };
  animations.push(animation); return animation;
};
motion.matches = false;
open(); assert.equal(animations[0].options.duration, 560);
scroller.scrollTop = 900;
start(500); move(200); end();
assert.ok(dialog.open, 'Closing card stays visible until its fly-out completes');
assert.match(animations[1].frames[0].transform, /-162/);
assert.match(animations[1].frames[1].transform, /-900/);
close.fire('click'); assert.equal(animations.length, 2, 'No overlapping close animations');
animations[1].complete(); assert.equal(dialog.open, false);
assert.equal(body.classList.contains('menu-is-open'), false);

open(); scroller.scrollTop = 900;
start(500); move(450); end();
for (let i = 0; i < 100; i++) tick();
assert.ok(dialog.open, 'Momentum after a short swipe never dismisses the sheet');
assert.ok(scroller.scrollTop > 950, 'Short swipes keep smooth inertial list scrolling');
close.fire('click'); animations.at(-1).complete();

motion.matches = true;
const count = animations.length;
open(); close.fire('click');
assert.equal(animations.length, count, 'Reduced motion skips panel animations');
assert.equal(dialog.open, false);
console.log('PASS: floating sheet, short-swipe scrolling, whole-card tracking and spring-back, strong mid-list swipes in both directions, reversal, pinch/cancel, mouse dragging, wheel exit and lunch navigation.');
console.log('PASS: directional fly-out, close lifecycle, inertial reading without accidental dismissal and reduced-motion fallback.');
