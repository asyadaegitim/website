/* Asya’da Eğitim — tactile campus slider V3
 * Native horizontal trackpad/touch scrolling; mouse drag + accessible controls.
 * A gentle timer stops after user interaction and respects reduced motion.
 */
(() => {
  const carousel = document.getElementById('edition-hero-slider');
  if (!carousel) return;
  const viewport = carousel.querySelector('.ae3-viewport');
  const track = carousel.querySelector('.ae3-track');
  const slides = [...carousel.querySelectorAll('.ae3-slide')];
  const tabs = [...carousel.querySelectorAll('[data-slide-to]')];
  const counter = carousel.querySelector('#edition-slide-counter');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!viewport || !track || slides.length !== tabs.length || !slides.length) return;

  let current = 0, timer = null, userInteracted = false, pointer = null, scrollJob = 0;
  let suppressClick = false;

  function targetX(i) {
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    return Math.max(0, Math.min(max, slides[i].offsetLeft - track.offsetLeft));
  }
  function nearest() {
    let chosen = 0, distance = Infinity;
    slides.forEach((slide, i) => {
      const d = Math.abs(targetX(i) - viewport.scrollLeft);
      if (d < distance) { chosen = i; distance = d; }
    });
    return chosen;
  }
  function sync(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      const link = slide.querySelector('a');
      if (link) link.tabIndex = active ? 0 : -1;
    });
    tabs.forEach((tab, i) => {
      const active = i === current;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    if (counter) counter.textContent = String(current + 1).padStart(2, '0') + ' — ' + String(slides.length).padStart(2, '0');
  }
  function stop(permanent = false) {
    if (timer) window.clearInterval(timer);
    timer = null;
    if (permanent) userInteracted = true;
  }
  function go(index, manual = false, immediate = false) {
    if (manual) stop(true);
    const wrapped = ((index % slides.length) + slides.length) % slides.length;
    sync(wrapped);
    viewport.scrollTo({left: targetX(wrapped), behavior: immediate || reducedMotion.matches ? 'instant' : 'smooth'});
  }
  function start() {
    if (timer || userInteracted || document.hidden || reducedMotion.matches) return;
    timer = window.setInterval(() => go(current + 1), 9000);
  }

  carousel.querySelector('[data-slide-direction="prev"]')?.addEventListener('click', () => go(current - 1, true));
  carousel.querySelector('[data-slide-direction="next"]')?.addEventListener('click', () => go(current + 1, true));
  tabs.forEach((tab, i) => tab.addEventListener('click', () => go(i, true)));

  viewport.addEventListener('scroll', () => {
    if (scrollJob) cancelAnimationFrame(scrollJob);
    scrollJob = requestAnimationFrame(() => { scrollJob = 0; sync(nearest()); });
  }, {passive:true});

  // Mouse/pen drag; leave touch to native momentum and CSS scroll-snap.
  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    pointer = { id:e.pointerId, x:e.clientX, scroll:viewport.scrollLeft, moved:false };
    suppressClick = false;
    stop(true);
    // Capture only after movement so ordinary photo-link clicks remain native.
  });
  viewport.addEventListener('pointermove', e => {
    if (!pointer || pointer.id !== e.pointerId) return;
    const dx = e.clientX - pointer.x;
    if (Math.abs(dx) > 6) {
      if (!pointer.moved) {
        pointer.moved = true;
        viewport.setPointerCapture(e.pointerId);
      }
      suppressClick = true;
      viewport.classList.add('dragging');
      viewport.scrollLeft = pointer.scroll - dx;
    }
  });
  function release(e) {
    if (!pointer || pointer.id !== e.pointerId) return;
    const moved = pointer.moved;
    pointer = null;
    viewport.classList.remove('dragging');
    if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
    if (moved) {
      go(nearest(), true);
      // Keep click suppression until the pointer-generated click has been handled.
      window.setTimeout(() => { suppressClick = false; }, 250);
    }
  }
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  viewport.addEventListener('click', e => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; return; }
    const link = e.target.closest('.ae3-slide-link');
    if (!link) return;
    const slide = link.closest('.ae3-slide');
    const i = slides.indexOf(slide);
    if (i !== current) { e.preventDefault(); go(i, true); }
  }, true);

  viewport.addEventListener('touchstart', () => stop(true), {passive:true});
  viewport.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > 2) stop(true); // Trackpad scroll uses the native scroll container.
  }, {passive:true});
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      go(current + (e.key === 'ArrowRight' ? 1 : -1), true);
    }
  });
  carousel.addEventListener('pointerenter', () => stop());
  carousel.addEventListener('pointerleave', start);
  carousel.addEventListener('focusin', () => stop());
  carousel.addEventListener('focusout', e => { if (!carousel.contains(e.relatedTarget)) start(); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  reducedMotion.addEventListener?.('change', () => reducedMotion.matches ? stop() : start());
  window.addEventListener('resize', () => {
    if (scrollJob) cancelAnimationFrame(scrollJob);
    viewport.scrollTo({left: targetX(current), behavior:'instant'});
  }, {passive:true});

  sync(0);
  viewport.scrollTo({left:0,behavior:'instant'});
  start();
})();
