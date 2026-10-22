// Offline structural and interaction checks; no browser or network required.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { previewHost, phoneAddresses } from './preview-config.mjs';

assert.equal(previewHost, '0.0.0.0');
assert.deepEqual(phoneAddresses({
  loopback: [{ family: 'IPv4', internal: true, address: '127.0.0.1' }],
  wifi: [{ family: 'IPv4', internal: false, address: '192.168.1.20' }, { family: 'IPv6', internal: false, address: '::1' }],
  vpn: [{ family: 4, internal: false, address: '10.0.0.2' }],
  public: [{ family: 'IPv4', internal: false, address: '203.0.113.1' }]
}), ['http://192.168.1.20:4173/', 'http://10.0.0.2:4173/']);
assert.deepEqual(phoneAddresses({}), []);
console.log('PASS: LAN binding, phone addresses, IPv6/loopback/public address filtering.');

const root = fileURLToPath(new URL('../', import.meta.url));
const html = readFileSync(path.join(root, 'index.html'), 'utf8');
const css = readFileSync(path.join(root, 'styles.css'), 'utf8');
const source = readFileSync(path.join(root, 'app.js'), 'utf8');
assert.match(css, /html,\.menu-scroll\{scrollbar-width:none/);
assert.match(css, /\.menu-scroll::-webkit-scrollbar\{display:none/);
assert.match(css, /\.menu-expanded \.menu-scroll\{[^}]*overflow-y:auto/);
assert.doesNotMatch(css, /\.menu-expanded \.reveal\{[^}]*!important/);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'HTML IDs must be unique');
for (const [, reference] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  if (reference.startsWith('#')) assert.ok(ids.includes(reference.slice(1)), `Missing anchor: ${reference}`);
  else assert.ok(existsSync(path.join(root, reference)), `Missing file: ${reference}`);
}
for (const [, asset] of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) {
  assert.ok(existsSync(path.join(root, asset)), `Missing CSS asset: ${asset}`);
}
assert.match(html, /lang="cs"/);
assert.match(html, /name="viewport"/);
assert.match(source, /obedove/);
assert.match(html, /class="table-setting"[^>]*>\s*<img src="assets\/nav-cutlery\.png"/);
assert.ok((html.match(/class="heading-fork"/g) ?? []).length >= 2);
assert.match(html, /class="heading-fork" src="assets\/about-fork\.png"/);
const cutlery = readFileSync(path.join(root, 'assets/nav-cutlery.png'));
assert.equal(cutlery.readUInt32BE(16), 1005);
assert.equal(cutlery.readUInt32BE(20), 420);
assert.doesNotMatch(source, /\bfetch\(|XMLHttpRequest|localStorage|sessionStorage/);
console.log('PASS: local assets, unique IDs, all anchors, Czech language, no network or storage.');

class Element {
  constructor() {
    this.handlers = {};
    this.attributes = {};
    this.dataset = {};
    this.style = {};
    this.children = [];
    this.hidden = true;
    this.value = '';
    this.textContent = '';
    const values = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => values.add(name)),
      toggle: (name, active) => active ? values.add(name) : values.delete(name),
      contains: name => values.has(name)
    };
  }
  addEventListener(name, fn) { (this.handlers[name] ??= []).push(fn); }
  trigger(name, event = {}) { for (const fn of this.handlers[name] ?? []) fn({ target: this, preventDefault() {}, ...event }); }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  get firstElementChild() { return this.children[0]; }
  matches() { return false; }
  scrollIntoView() {}
}

function makeApp(reduced = false) {
  const elements = Object.fromEntries(['.carousel', '.booking-submit', '#menu-list', '#carousel-status', '#booking-form', '#booking-date', '#booking-time', '#booking-guests', '#booking-result'].map(key => [key, new Element()]));
  const carouselParts = Object.fromEntries(['.carousel-track', '.autoplay-toggle', '.previous', '.next', '.carousel-viewport', '.dish-name', '.dish-detail'].map(key => [key, new Element()]));
  const slides = [new Element(), new Element()];
  const dots = [new Element(), new Element()];
  const buttons = ['hlavni', 'male', 'sladke'].map(category => { const e = new Element(); e.dataset.category = category; return e; });
  const reveals = [new Element(), new Element()];
  const carousel = elements['.carousel'];
  carousel.querySelector = key => carouselParts[key];
  carousel.querySelectorAll = key => key === '.slide' ? slides : dots;
  carouselParts['.autoplay-toggle'].append(new Element());
  elements['#booking-form'].reportValidity = () => true;
  elements['#booking-time'].value = '18:30';
  elements['#booking-guests'].value = '2';
  const document = new Element();
  document.documentElement = new Element();
  document.hidden = false;
  document.querySelector = key => elements[key];
  document.querySelectorAll = key => key === '.reveal' ? reveals : buttons;
  document.createElement = () => new Element();
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { this.target = target; }
    unobserve() {}
  }
  const preference = { matches: reduced, addEventListener() {} };
  const window = new Element();
  window.matchMedia = () => preference;
  window.IntersectionObserver = Observer;
  let timer;
  const context = vm.createContext({
    window, document, IntersectionObserver: Observer, Intl, Date, console,
    setInterval: fn => { timer = fn; return 1; },
    clearInterval: () => { timer = undefined; },
    requestAnimationFrame: fn => fn(),
    FormData: class { get(name) { return elements[`#booking-${name}`].value; } }
  });
  vm.runInContext(source, context);
  return { elements, carouselParts, slides, dots, buttons, reveals, observers, preference, document, timer: () => timer };
}

const app = makeApp();
assert.equal(app.elements['#menu-list'].children.length, 12, 'Full main course list renders on initial load');
app.buttons[1].trigger('click');
assert.equal(app.elements['#menu-list'].children.length, 8);
assert.equal(app.elements['#menu-list'].children[0].children[0].children[0].textContent, 'Hovězí tatarák');
assert.equal(app.buttons[1].attributes['aria-pressed'], 'true');
app.buttons[2].trigger('click');
assert.equal(app.elements['#menu-list'].children.length, 6);
app.buttons[0].trigger('click');
assert.equal(app.elements['#menu-list'].children.length, 12);
console.log('PASS: all three menu categories and selected-state accessibility.');

app.carouselParts['.next'].trigger('click');
assert.equal(app.carouselParts['.carousel-track'].style.transform, 'translateX(-100%)');
assert.equal(app.slides[0].inert, true);
assert.equal(app.slides[1].inert, false);
app.carouselParts['.next'].trigger('click');
assert.equal(app.carouselParts['.carousel-track'].style.transform, 'translateX(-0%)');
app.elements['.carousel'].trigger('keydown', { key: 'ArrowLeft' });
assert.equal(app.dots[1].attributes['aria-current'], 'true');
app.dots[0].trigger('click');
assert.equal(app.dots[0].attributes['aria-current'], 'true');
app.observers.find(item => item.target === app.elements['.carousel']).callback([{ isIntersecting: true }]);
assert.equal(typeof app.timer(), 'function');
app.timer()();
assert.equal(app.dots[1].attributes['aria-current'], 'true');
app.carouselParts['.autoplay-toggle'].trigger('click');
assert.equal(app.timer(), undefined);
assert.equal(app.carouselParts['.autoplay-toggle'].attributes['aria-pressed'], 'true');
console.log('PASS: carousel wrapping, keyboard, dots, autoplay, pause and inactive slides.');

assert.match(app.elements['#booking-date'].min, /^\d{4}-\d{2}-\d{2}$/);
app.elements['#booking-form'].trigger('submit');
const result = app.elements['#booking-result'];
assert.equal(result.hidden, false);
assert.match(result.children[1].textContent, /18:30 · 2 hosté/);
assert.match(result.children[2].textContent, /Žádný stůl nebyl rezervován/);
app.elements['#booking-form'].trigger('input');
assert.equal(result.hidden, true);
app.elements['#booking-form'].reportValidity = () => false;
app.elements['#booking-form'].trigger('submit');
assert.equal(result.hidden, true);
console.log('PASS: date, reservation summary, explicit demo notice, edit reset and validation.');

const reduced = makeApp(true);
assert.ok(reduced.reveals.every(element => element.classList.contains('is-visible')));
reduced.observers[0].callback([{ isIntersecting: true }]);
assert.equal(reduced.timer(), undefined);
assert.equal(reduced.carouselParts['.autoplay-toggle'].attributes['aria-pressed'], 'true');
console.log('PASS: reduced-motion content visibility and no automatic animation.');
console.log('All offline checks passed. Browser layout verification is separate.');
