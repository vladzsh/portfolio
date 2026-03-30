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
  toggle.innerHTML = isDark ? '\u2600' : '\u263E';
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
