/* Asya’da Eğitim / Hero V2
 * No framework, no analytics, no new assets: five real campus photos.
 * Auto progression is intentionally slow; any direct interaction pauses it.
 */
(() => {
  const root = document.getElementById('edition-hero-slider');
  if (!root) return;

  const slides = [...root.querySelectorAll('.edition-slide')];
  const tabs = [...root.querySelectorAll('[data-slide-to]')];
  const counter = root.querySelector('#edition-slide-counter');
  const previous = root.querySelector('[data-slide-direction="prev"]');
  const next = root.querySelector('[data-slide-direction="next"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!slides.length || slides.length !== tabs.length) return;

  let current = 0;
  let timer = null;
  let interacted = false;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    tabs.forEach((tab, i) => {
      const active = i === current;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    if (counter) counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  }

  function pause(permanent = false) {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
    if (permanent) interacted = true;
  }

  function play() {
    if (timer !== null || interacted || reducedMotion.matches || document.hidden) return;
    timer = window.setInterval(() => show(current + 1), 8500);
  }

  function select(index) {
    pause(true); // Never wrest control away after the visitor chooses a slide.
    show(index);
  }

  previous?.addEventListener('click', () => select(current - 1));
  next?.addEventListener('click', () => select(current + 1));
  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      select(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  root.addEventListener('pointerenter', () => pause());
  root.addEventListener('pointerleave', play);
  root.addEventListener('focusin', () => pause());
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) play();
  });
  root.addEventListener('touchstart', () => pause(true), {passive: true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else play();
  });
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) pause();
    else play();
  });

  show(0);
  play();
})();
