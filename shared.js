// === NAV SCROLL EFFECT ===
const nav = document.querySelector('.nav');

function getNavScrollThreshold() {
  return window.innerWidth <= 768 ? 20 : 300;
}

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > getNavScrollThreshold());
  navLinks.classList.remove('active');
}, { passive: true });

// === MOBILE MENU ===
const hamburger = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('active'));
});

// === SCROLL REVEAL ===
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// === STAGGER REVEAL ===
function initStaggerReveal(selector) {
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stagger-item').forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 240);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(selector).forEach(el => staggerObserver.observe(el));
}

// === DOT ACCENT ===
const dotAccent = document.querySelector('.dot-accent');
let fadeTimer = null;
let dotActive = false;

document.addEventListener('mousemove', (e) => {
  dotAccent.style.setProperty('--mx', e.clientX + 'px');
  dotAccent.style.setProperty('--my', e.clientY + 'px');
  if (!dotActive) {
    dotAccent.classList.add('active');
    dotActive = true;
  }
  clearTimeout(fadeTimer);
  fadeTimer = setTimeout(() => {
    dotAccent.classList.remove('active');
    dotActive = false;
  }, 1500);
}, { passive: true });

document.addEventListener('mouseleave', () => {
  dotAccent.classList.remove('active');
  dotActive = false;
}, { passive: true });


// === THEME TOGGLE ===
const toggle = document.querySelector('.theme-toggle');
const logo = document.querySelector('.nav-logo-img');

function updateToggleIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  toggle.innerHTML = isDark
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  if (logo) logo.src = isDark ? 'img/logo-white.svg' : 'img/logo-black.svg';
}

toggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  updateToggleIcon();
});

updateToggleIcon();
