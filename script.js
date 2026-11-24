(() => {
  const hero = document.getElementById('hero');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parallax: mountains and sun drift with the pointer, or slowly on their own
  const setPx = v => hero.style.setProperty('--px', v);
  let moved = false, t = 0;
  hero.addEventListener('pointermove', e => { moved = true; setPx((e.clientX / innerWidth - 0.5) * -80); });
  hero.addEventListener('pointerleave', () => moved = false);
  (function drift() {
    if (!moved && !reduce) { t += 0.008; setPx(Math.sin(t) * 40); }
    requestAnimationFrame(drift);
  })();

  // Hero: letter-by-letter title, glowing dust and stars, sunset as you scroll
  const title = document.querySelector('.name'); let n = 0;
  title.setAttribute('aria-label', 'Landscape & Light');
  title.querySelectorAll('span, em').forEach(el => {
    const txt = el.textContent; el.textContent = '';
    [...txt].forEach(c => { const i = document.createElement('i'); i.textContent = c === ' ' ? '\u00a0' : c; i.setAttribute('aria-hidden', 'true'); i.style.setProperty('--i', n++); el.appendChild(i); });
  });
  const cv = document.querySelector('.dust'), cx = cv.getContext('2d'); let W, H, dark = 0;
  const fit = () => { W = cv.width = hero.clientWidth; H = cv.height = hero.clientHeight; };
  fit(); addEventListener('resize', fit);
  const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 2.2 + .6, v: Math.random() * .0005 + .0002, s: Math.random() * 6 }));
  const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random() * .6, r: Math.random() * 1.3 + .3, s: Math.random() * 6 }));
  const draw = ts => {
    cx.clearRect(0, 0, W, H); cx.shadowBlur = 0; cx.fillStyle = '#fff';
    stars.forEach(s => { cx.globalAlpha = dark * (.4 + .6 * Math.abs(Math.sin(ts / 900 + s.s))); cx.beginPath(); cx.arc(s.x * W, s.y * H, s.r, 0, 6.3); cx.fill(); });
    cx.fillStyle = '#FFECBE'; cx.shadowBlur = 14; cx.shadowColor = '#FFD58A';
    dust.forEach(p => {
      p.y -= p.v; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
      cx.globalAlpha = .25 + .5 * Math.abs(Math.sin(ts / 1200 + p.s));
      cx.beginPath(); cx.arc(p.x * W + Math.sin(ts / 2000 + p.s) * 14, p.y * H, p.r, 0, 6.3); cx.fill();
    });
    if (!reduce) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  addEventListener('scroll', () => {
    dark = Math.min(1, scrollY / (innerHeight * .8));
    hero.style.setProperty('--dark', dark); hero.style.setProperty('--sink', dark * 170);
  }, { passive: true });

  // Scroll reveal and count-up numbers
  const countUp = el => {
    const end = +el.dataset.count; let n = 0;
    const step = () => { n += Math.max(1, Math.ceil(end / 40)); el.textContent = Math.min(n, end); if (n < end) requestAnimationFrame(step); };
    step();
  };
  const io = new IntersectionObserver(list => list.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    en.target.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(en.target);
  }), { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Mobile menu
  const burger = document.querySelector('.burger'), links = document.querySelector('.links');
  const setMenu = o => { burger.setAttribute('aria-expanded', o); links.classList.toggle('open', o); };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Form check (front-end only, nothing is sent)
  const form = document.getElementById('form'), note = document.getElementById('note');
  form.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    form.querySelectorAll('input, textarea').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    note.textContent = ok ? 'Thanks! Your enquiry is ready to send. (Demo form)' : 'Please fill in every field with a valid email.';
    if (ok) form.reset();
  });

  // If photo.jpg is missing, the credit badge falls back to initials
  const pic = document.querySelector('.avatar img');
  if (pic) pic.addEventListener('error', () => pic.remove());
})();
