'use strict';

(() => {
  const section = document.querySelector('#menu');
  const dialog = document.createElement('dialog');
  if (!section || typeof dialog.showModal !== 'function') return;

  const menuLink = document.querySelector('.main-nav > a[href="#o-nas"]');
  if (menuLink) {
    menuLink.setAttribute('href', '#menu');
    menuLink.dataset.menuCategory = 'obedove';
    menuLink.textContent = 'Obědy';
  }
  const filters = section.querySelector('.menu-filters');
  if (filters && !filters.querySelector('[data-category="obedove"]')) {
    const lunchButton = document.createElement('button');
    lunchButton.type = 'button';
    lunchButton.dataset.category = 'obedove';
    lunchButton.setAttribute('aria-pressed', 'false');
    lunchButton.textContent = 'Obědové menu';
    filters.prepend(lunchButton);
  }

  dialog.className = 'menu-dialog';
  dialog.setAttribute('aria-labelledby', 'menu-title');
  const handle = document.createElement('div');
  handle.className = 'menu-drag-handle';
  handle.setAttribute('aria-hidden', 'true');
  section.prepend(handle);
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'menu-close';
  closeButton.textContent = 'Zavřít ×';
  const scroller = document.createElement('div');
  scroller.className = 'menu-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('aria-label', 'Jídla – posouvejte pro prohlížení');
  scroller.append(section.querySelector('#menu-list'), section.querySelector('.menu-footnote'));
  filters.after(scroller);
  const hint = document.createElement('p');
  hint.className = 'menu-pull-hint';
  hint.setAttribute('role', 'status');
  section.append(closeButton, hint);
  document.body.append(dialog);

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const easing = 'cubic-bezier(.22,1,.36,1)';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let placeholder, previousFocus, panelAnimation, momentum, gesture, wheelExit;
  let pageY = 0, previousY = window.scrollY;
  let armed = true, closing = false, frame = false;
  let dragY = 0, distance = 0, wheelPull = 0, wheelDirection = 0, lastWheel = 0;
  const dismissDistance = () => clamp(window.innerHeight * .29, 190, 260);

  function stopMomentum() {
    if (momentum !== undefined) cancelAnimationFrame(momentum);
    momentum = undefined;
  }
  function updateHint() {
    hint.textContent = distance >= dismissDistance() ? 'Pusťte pro zavření'
      : distance > 20 ? 'Delší swipe zavře okno'
      : 'Listujte jídly. Výrazným swipem zavřete okno.';
  }
  function setDrag(offset, travelled = 0) {
    dragY = offset;
    distance = travelled;
    const ratio = clamp(Math.abs(offset) / window.innerHeight, 0, 1);
    dialog.style.setProperty('--sheet-y', offset + 'px');
    dialog.style.setProperty('--sheet-scale', String(1 - ratio * .055));
    dialog.style.setProperty('--backdrop-alpha', String(.26 * (1 - ratio)));
    section.style.setProperty('--pull', String(clamp(travelled / dismissDistance(), 0, 1)));
    updateHint();
  }
  function resetDrag() {
    gesture = undefined;
    wheelPull = 0;
    dialog.classList.remove('is-dragging');
    setDrag(0);
  }

  function openMenu() {
    if (dialog.open) return;
    stopMomentum();
    pageY = window.scrollY;
    previousFocus = document.activeElement;
    placeholder = document.createElement('div');
    placeholder.className = 'menu-placeholder';
    placeholder.style.height = section.offsetHeight + 'px';
    // Preserve the real page visually underneath the floating card.
    if (typeof section.cloneNode === 'function') {
      const preview = section.cloneNode(true);
      preview.removeAttribute('id');
      preview.querySelectorAll('[id]').forEach(item => item.removeAttribute('id'));
      preview.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
      preview.inert = true;
      preview.setAttribute('aria-hidden', 'true');
      placeholder.append(preview);
    }
    section.before(placeholder);
    dialog.append(section);
    section.classList.add('menu-expanded');
    section.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
    document.body.style.top = '-' + pageY + 'px';
    document.body.classList.add('menu-is-open');
    dialog.showModal();
    scroller.scrollTop = 0;
    resetDrag();
    closeButton.focus({ preventScroll: true });
    if (!motion.matches && typeof dialog.animate === 'function') {
      panelAnimation = dialog.animate([
        { opacity: 0, transform: 'translate3d(0,36px,0) scale(.96)' },
        { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }
      ], { duration: 560, easing });
      panelAnimation.finished.then(() => {}, () => {});
    }
  }

  function closeMenu(exitDirection = 1) {
    if (!dialog.open || closing) return;
    closing = true;
    stopMomentum();
    clearTimeout(wheelExit);
    panelAnimation?.cancel();
    gesture = undefined;
    armed = false;
    const menuY = pageY + placeholder.getBoundingClientRect().top;
    const target = exitDirection > 0 ? document.querySelector('#rezervace') : section;
    const destination = exitDirection > 0 ? pageY + target.getBoundingClientRect().top
      : menuY - window.innerHeight * .7;
    document.body.classList.remove('menu-is-open');
    document.body.style.top = '';
    window.scrollTo({ top: Math.max(0, destination), behavior: 'instant' });
    if (exitDirection > 0) target.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
    const finish = () => {
      dialog.close();
      placeholder.replaceWith(section);
      section.classList.remove('menu-expanded');
      const corrected = exitDirection > 0 ? window.scrollY + target.getBoundingClientRect().top
        : menuY - window.innerHeight * .7;
      window.scrollTo({ top: Math.max(0, corrected), behavior: 'instant' });
      previousY = window.scrollY;
      if (exitDirection > 0) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      } else if (previousFocus && previousFocus !== document.body) {
        previousFocus.focus({ preventScroll: true });
      }
      resetDrag();
      closing = false;
    };
    if (!motion.matches && typeof dialog.animate === 'function') {
      const end = (exitDirection > 0 ? -1 : 1) * (window.innerHeight + 100);
      const scale = 1 - clamp(Math.abs(dragY) / window.innerHeight, 0, 1) * .055;
      panelAnimation = dialog.animate([
        { opacity: 1, transform: 'translate3d(0,' + dragY + 'px,0) scale(' + scale + ')' },
        { opacity: .15, transform: 'translate3d(0,' + end + 'px,0) scale(.94)' }
      ], { duration: 380, easing: 'cubic-bezier(.32,0,.52,1)', fill: 'forwards' });
      panelAnimation.finished.then(() => { panelAnimation.cancel(); finish(); }, finish);
    } else finish();
  }

  function beginGesture(x, y, target, mouse = false) {
    if (!dialog.open || closing || target.closest?.('button,a,input,select,textarea,.menu-filters')) return false;
    stopMomentum();
    panelAnimation?.cancel();
    resetDrag();
    const inList = Boolean(target.closest?.('.menu-scroll'));
    if (mouse && inList) return false; // Keep text selection; mouse users drag the header.
    gesture = { startX: x, startY: y, lastY: y, previous: 0, lastTime: Date.now(),
      velocity: 0, inList, activation: undefined, mouse };
    return true;
  }
  function moveGesture(x, y, event) {
    if (!gesture || closing) return;
    const dy = y - gesture.startY, dx = x - gesture.startX;
    if (Math.abs(dy) < 5 && Math.abs(dx) < 5) return;
    if (Math.abs(dx) > Math.abs(dy) * 1.3) { resetDrag(); return; }
    if (event.cancelable) event.preventDefault();
    if (gesture.activation === undefined) {
      const outwardEdge = dy > 0 ? scroller.scrollTop <= 1
        : scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      gesture.activation = gesture.inList && !outwardEdge ? Math.min(120, window.innerHeight * .16) : 0;
    }
    // Small gestures scroll dishes. A long swipe transfers its excess travel
    // to the whole card, without requiring the beginning/end of the list.
    const limit = gesture.activation;
    const consumed = clamp(dy, -limit, limit);
    const previousConsumed = clamp(gesture.previous, -limit, limit);
    if (gesture.inList) scroller.scrollTop -= consumed - previousConsumed;
    const now = Date.now(), elapsed = Math.max(8, now - gesture.lastTime);
    gesture.velocity = gesture.velocity * .45 + ((y - gesture.lastY) / elapsed) * .55;
    gesture.lastTime = now;
    gesture.lastY = y;
    gesture.previous = dy;
    dialog.classList.add('is-dragging');
    setDrag(Math.sign(dy) * Math.max(0, Math.abs(dy) - limit) * .9, Math.abs(dy));
  }
  function coast(velocity) {
    if (motion.matches || Math.abs(velocity) < .12) return;
    let previousTime = Date.now();
    const step = () => {
      const now = Date.now(), dt = clamp(now - previousTime, 1, 32);
      previousTime = now;
      const before = scroller.scrollTop;
      scroller.scrollTop -= velocity * dt;
      velocity *= Math.exp(-dt / 180);
      if (dialog.open && !closing && Math.abs(velocity) > .025 && scroller.scrollTop !== before) {
        momentum = requestAnimationFrame(step);
      } else momentum = undefined;
    };
    momentum = requestAnimationFrame(step);
  }
  function endGesture(cancelled = false) {
    if (!gesture) return;
    const velocity = gesture.velocity, listGesture = gesture.inList;
    const movedCard = Math.abs(dragY) > 1;
    const exit = dragY < 0 ? 1 : -1;
    if (!cancelled && movedCard && distance >= dismissDistance()) { closeMenu(exit); return; }
    resetDrag(); // Spring the whole card home, not merely its list.
    if (!cancelled && listGesture && !movedCard) coast(velocity);
  }

  section.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) { stopMomentum(); resetDrag(); return; }
    const point = event.touches[0];
    beginGesture(point.clientX, point.clientY, event.target);
  }, { passive: true });
  section.addEventListener('touchmove', event => {
    if (event.touches.length !== 1) { endGesture(true); return; }
    const point = event.touches[0];
    moveGesture(point.clientX, point.clientY, event);
  }, { passive: false });
  section.addEventListener('touchend', () => endGesture());
  section.addEventListener('touchcancel', () => endGesture(true));
  section.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if (beginGesture(event.clientX, event.clientY, event.target, true)) {
      event.preventDefault();
      section.setPointerCapture?.(event.pointerId);
    }
  });
  section.addEventListener('pointermove', event => {
    if (gesture?.mouse) moveGesture(event.clientX, event.clientY, event);
  });
  section.addEventListener('pointerup', event => {
    if (gesture?.mouse) { endGesture(); section.releasePointerCapture?.(event.pointerId); }
  });
  section.addEventListener('pointercancel', () => { if (gesture?.mouse) endGesture(true); });

  // Native wheel scrolling stays available; only repeated edge overscroll
  // moves the card. Touch inertia is intentionally never a dismiss gesture.
  scroller.addEventListener('wheel', event => {
    if (closing || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const now = Date.now();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientHeight : 1);
    const nextDirection = Math.sign(delta);
    const atEdge = nextDirection < 0 ? scroller.scrollTop <= 1
      : scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if (!atEdge || !delta) { resetDrag(); return; }
    if (now - lastWheel > 220 || wheelDirection !== nextDirection) wheelPull = 0;
    lastWheel = now;
    wheelDirection = nextDirection;
    wheelPull += Math.min(65, Math.abs(delta));
    event.preventDefault();
    dialog.classList.add('is-dragging');
    setDrag(-nextDirection * wheelPull * .65, wheelPull);
    clearTimeout(wheelExit);
    wheelExit = setTimeout(() => {
      if (distance >= dismissDistance()) closeMenu(wheelDirection);
      else resetDrag();
    }, 180);
  }, { passive: false });
  scroller.addEventListener('scroll', () => { if (!gesture && !distance) updateHint(); }, { passive: true });

  section.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    stopMomentum();
    window.selectMenuCategory?.(button.dataset.category);
    scroller.scrollTop = 0;
    resetDrag();
  }));
  closeButton.addEventListener('click', () => closeMenu(1));
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeMenu(1); });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom)) closeMenu(1);
  });
  document.querySelectorAll('a[href="#menu"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    if (link.dataset.menuCategory) window.selectMenuCategory?.(link.dataset.menuCategory);
    openMenu();
  }));
  window.addEventListener('scroll', () => {
    if (frame || dialog.open) return;
    frame = true;
    requestAnimationFrame(() => {
      frame = false;
      const y = window.scrollY, rect = section.getBoundingClientRect();
      const line = Math.min(100, window.innerHeight * .16);
      if (!armed && (rect.top > window.innerHeight * .6 || rect.bottom < 0)) armed = true;
      if (armed && y > previousY && rect.top <= line && rect.bottom > window.innerHeight * .4) openMenu();
      previousY = y;
    });
  }, { passive: true });
  if (window.location.hash === '#menu') openMenu();
})();
