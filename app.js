'use strict';

document.documentElement.classList.add('js');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

// Content remains visible when JavaScript is unavailable or reduced motion is requested.
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07 });
  reveals.forEach(element => revealObserver.observe(element));
} else {
  reveals.forEach(element => element.classList.add('is-visible'));
}

const menu = {
  obedove: [
    ['Polední polévka', '65 Kč', 'Denní polévka podle ranní nabídky kuchyně', '0,3 l · Alergeny doplníme'],
    ['Kuřecí stehno na paprice', '189 Kč', 'Jasmínová rýže, petrželový olej, zakysaná smetana', '150 g · Alergeny: 7'],
    ['Těstoviny s pestem', '179 Kč', 'Domácí pesto, pečená cherry rajčata, parmazán', '300 g · Alergeny: 1, 3, 7, 8'],
    ['Vepřová pečeně', '199 Kč', 'Šťouchané brambory, dušené zelí, cibulová omáčka', '180 g · Alergeny: 7, 9'],
    ['Zeleninové kari', '169 Kč', 'Kokosové mléko, basmati rýže, koriandr', '300 g · Alergeny: 9'],
    ['Malý dezert dne', '59 Kč', 'Sladká tečka k polednímu menu', '1 porce · Alergeny doplníme']
  ],
  hlavni: [
    ['Hovězí steak', '349 Kč', 'Krémové těstoviny, bylinky, pečivo', '200 g · Alergeny: 1, 3, 7'],
    ['Burger Na Rynku', '269 Kč', 'Hovězí maso, čedar, cibulová marmeláda, hranolky', '180 g · Alergeny: 1, 3, 7, 10, 11'],
    ['Pomalu tažená líčka', '289 Kč', 'Červené víno, bramborové pyré, kořenová zelenina', '200 g · Alergeny: 7, 9, 12'],
    ['Houbové risotto', '239 Kč', 'Lesní houby, parmazán, tymián', '300 g · Alergeny: 7, 9, 12']
  ],
  male: [
    ['Hovězí tatarák', '229 Kč', 'Ručně krájené maso, topinky, česnek', '100 g · Alergeny: 1, 3, 10'],
    ['Silný hovězí vývar', '69 Kč', 'Kořenová zelenina, domácí nudle', '0,3 l · Alergeny: 1, 3, 9'],
    ['Nakládaný hermelín', '119 Kč', 'Cibule, feferonky, čerstvý chléb', '120 g · Alergeny: 1, 7'],
    ['Hranolky s dipem', '89 Kč', 'Křupavé hranolky, domácí bylinkový dip', '150 g · Alergeny: 3, 7, 10']
  ],
  sladke: [
    ['Čokoládový fondant', '129 Kč', 'Tekutý střed, vanilková zmrzlina', '100 g · Alergeny: 1, 3, 7'],
    ['Jablečný štrúdl', '99 Kč', 'Skořice, vlašské ořechy, šlehačka', '150 g · Alergeny: 1, 3, 7, 8'],
    ['Tvarohový cheesecake', '119 Kč', 'Máslový korpus, lesní ovoce', '120 g · Alergeny: 1, 3, 7']
  ]
};

// Working dishes and prices only; the final kitchen menu will replace these.
menu.hlavni.push(
  ['Svíčková na smetaně', '249 Kč', 'Hovězí maso, domácí houskový knedlík, brusinky', '180 g · Alergeny: 1, 3, 7, 9, 10'],
  ['Kachna se zelím', '289 Kč', 'Konfitované stehno, červené zelí, bramborový knedlík', '350 g · Alergeny: 1, 3, 12'],
  ['Kuřecí supreme', '259 Kč', 'Pečené kuře s kůží, máslová bramborová kaše, šťáva', '200 g · Alergeny: 7, 9'],
  ['Smažený řízek', '229 Kč', 'Vepřová kotleta, vídeňský bramborový salát, citron', '180 g · Alergeny: 1, 3, 7, 10'],
  ['Candát na másle', '329 Kč', 'Pečené brambory, sezónní zelenina, citronové máslo', '180 g · Alergeny: 4, 7'],
  ['Gnocchi s dýní', '229 Kč', 'Pečená dýně, šalvěj, hnědé máslo, parmazán', '300 g · Alergeny: 1, 3, 7'],
  ['Žebra z pece', '299 Kč', 'Pomalu pečená vepřová žebra, coleslaw, čerstvý chléb', '400 g · Alergeny: 1, 3, 7, 9, 10'],
  ['Pečený květák', '219 Kč', 'Cizrnové pyré, bylinkový olej, tahini a granátové jablko', '300 g · Alergeny: 11']
);
menu.male.push(
  ['Bramboračka s houbami', '79 Kč', 'Lesní houby, brambory, majoránka, čerstvý chléb', '0,3 l · Alergeny: 1, 7, 9'],
  ['Burrata s rajčaty', '189 Kč', 'Smetanová burrata, barevná rajčata, bazalka, kváskový chléb', '150 g · Alergeny: 1, 7'],
  ['Křupavé krokety', '139 Kč', 'Bramborové krokety s čedarem, pažitkový dip', '180 g · Alergeny: 1, 3, 7'],
  ['Paštika s brusinkami', '149 Kč', 'Domácí kuřecí paštika, brusinkový rozvar, opečená brioška', '100 g · Alergeny: 1, 3, 7, 12']
);
menu.sladke.push(
  ['Lívance s borůvkami', '139 Kč', 'Nadýchané lívance, borůvkový rozvar, zakysaná smetana', '180 g · Alergeny: 1, 3, 7'],
  ['Crème brûlée', '119 Kč', 'Vanilkový krém pod křupavou karamelovou krustou', '120 g · Alergeny: 3, 7'],
  ['Pohár se slaným karamelem', '109 Kč', 'Vanilková zmrzlina, domácí karamel, pražené ořechy', '150 g · Alergeny: 3, 7, 8']
);

function renderMenu(category) {
    document.querySelectorAll('[data-category]').forEach(item => {
      const selected = item.dataset.category === category;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    const articles = menu[category].map(([name, price, description, detail]) => {
      const article = document.createElement('article');
      article.className = 'menu-item';
      const top = document.createElement('div');
      top.className = 'dish-top';
      const heading = document.createElement('h3');
      heading.textContent = name;
      const cost = document.createElement('span');
      cost.textContent = price;
      top.append(heading, cost);
      const text = document.createElement('p');
      text.textContent = description;
      const small = document.createElement('small');
      small.textContent = detail;
      article.append(top, text, small);
      return article;
    });
    document.querySelector('#menu-list').replaceChildren(...articles);
}

let menuListAnimation;
document.querySelectorAll('[data-category]').forEach(button => {
  button.addEventListener('click', () => {
    renderMenu(button.dataset.category);
    const list = document.querySelector('#menu-list');
    if (!motionPreference.matches && typeof list.animate === 'function') {
      menuListAnimation?.cancel();
      menuListAnimation = list.animate([
        { opacity: .25, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  });
});
renderMenu('hlavni');
window.selectMenuCategory = renderMenu;

const carousel = document.querySelector('.carousel');
const track = carousel.querySelector('.carousel-track');
const slides = [...carousel.querySelectorAll('.slide')];
const dots = [...carousel.querySelectorAll('.slide-dot')];
const autoplayButton = carousel.querySelector('.autoplay-toggle');
const captions = [
  ['Steak & krémové těstoviny', 'Malá ochutnávka z naší kuchyně.'],
  ['Za dveřmi naší kuchyně', 'Pohled tam, kde vznikají dobré chutě.']
];
let slideIndex = 0;
let manualPause = motionPreference.matches;
let carouselVisible = false;
let timer;

function showSlide(index, announce = true) {
  slideIndex = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  slides.forEach((slide, i) => {
    slide.inert = i !== slideIndex;
    slide.setAttribute('aria-hidden', String(i !== slideIndex));
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('is-current', i === slideIndex);
    if (i === slideIndex) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  carousel.querySelector('.dish-name').textContent = captions[slideIndex][0];
  carousel.querySelector('.dish-detail').textContent = captions[slideIndex][1];
  if (announce) document.querySelector('#carousel-status').textContent = `Fotografie ${slideIndex + 1} ze ${slides.length}: ${captions[slideIndex][0]}`;
}

function updateAutoplay() {
  clearInterval(timer);
  const paused = manualPause || motionPreference.matches;
  autoplayButton.setAttribute('aria-pressed', String(paused));
  autoplayButton.setAttribute('aria-label', paused ? 'Spustit střídání fotografií' : 'Pozastavit střídání fotografií');
  autoplayButton.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
  if (!paused && carouselVisible && !document.hidden && !carousel.matches(':focus-within')) {
    timer = setInterval(() => showSlide(slideIndex + 1, false), 6500);
  }
}

carousel.querySelector('.previous').addEventListener('click', () => { showSlide(slideIndex - 1); updateAutoplay(); });
carousel.querySelector('.next').addEventListener('click', () => { showSlide(slideIndex + 1); updateAutoplay(); });
dots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); updateAutoplay(); }));
autoplayButton.addEventListener('click', () => { manualPause = !manualPause; updateAutoplay(); });
carousel.addEventListener('focusin', () => clearInterval(timer));
carousel.addEventListener('focusout', () => requestAnimationFrame(updateAutoplay));
carousel.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showSlide(slideIndex + (event.key === 'ArrowRight' ? 1 : -1));
    updateAutoplay();
  }
});
let swipeStart;
carousel.querySelector('.carousel-viewport').addEventListener('pointerdown', event => {
  if (!event.target.closest('button') && event.isPrimary) swipeStart = { x: event.clientX, y: event.clientY };
});
window.addEventListener('pointerup', event => {
  if (!swipeStart) return;
  const deltaX = event.clientX - swipeStart.x;
  const deltaY = event.clientY - swipeStart.y;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
    showSlide(slideIndex + (deltaX < 0 ? 1 : -1));
    updateAutoplay();
  }
  swipeStart = null;
});
window.addEventListener('pointercancel', () => { swipeStart = null; });
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { carouselVisible = entries[0].isIntersecting; updateAutoplay(); }, { threshold: 0.2 }).observe(carousel);
} else { carouselVisible = true; }
document.addEventListener('visibilitychange', updateAutoplay);
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) reveals.forEach(element => element.classList.add('is-visible'));
  updateAutoplay();
});
updateAutoplay();

// This form deliberately has no network calls, analytics or persistent storage.
const bookingForm = document.querySelector('#booking-form');
document.querySelector('.booking-submit').disabled = false;
const dateInput = document.querySelector('#booking-date');
const result = document.querySelector('#booking-result');
const todayInPrague = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
dateInput.min = todayInPrague;
dateInput.value = todayInPrague;

bookingForm.addEventListener('input', () => { result.hidden = true; });
bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  const data = new FormData(bookingForm);
  const date = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(`${data.get('date')}T12:00:00`));
  const guests = Number(data.get('guests'));
  const label = guests === 1 ? 'host' : guests < 5 ? 'hosté' : 'hostů';
  const title = document.createElement('strong');
  title.textContent = 'Takhle by to vypadalo.';
  const summary = document.createElement('p');
  summary.textContent = `${date} v ${data.get('time')} · ${guests} ${label}`;
  const notice = document.createElement('small');
  notice.textContent = 'Tohle je jen náhled rezervace. Žádný stůl nebyl rezervován a restaurace nedostala žádnou zprávu.';
  result.replaceChildren(title, summary, notice);
  result.hidden = false;
  result.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'nearest' });
});
