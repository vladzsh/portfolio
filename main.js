// === RENDER DATA ===
function renderProjects(projects) {
  document.querySelector('.project-list').innerHTML = projects.map(p => `
    <a href="${p.url}" class="project-item stagger-item" target="_blank" rel="noopener">
      <div class="project-info">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
      </div>
    </a>
  `).join('');
}

function renderExperience(experience) {
  document.querySelector('.timeline').innerHTML = experience.map(e => `
    <div class="timeline-item stagger-item">
      <div class="timeline-dot"></div>
      <div class="timeline-date">${e.date}</div>
      <div class="timeline-role">${e.role}</div>
      <div class="timeline-company">${e.company}</div>
      <div class="timeline-desc">${e.description}</div>
    </div>
  `).join('');
}

// === TYPED EFFECT ===
const subtitle = document.querySelector('.hero-subtitle');
const subtitleText = subtitle ? subtitle.textContent.trim() : '';

function typeText(el, text, speed) {
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.classList.add('typed-cursor');
  cursor.textContent = '_';
  el.appendChild(cursor);
  let i = 0;
  (function type() {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      setTimeout(type, speed);
    }
  })();
}

// Hook typed effect into reveal observer
const heroContainer = document.querySelector('.hero .reveal');
if (heroContainer) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        typeText(subtitle, subtitleText, 50);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 }).observe(heroContainer);
}

// === ACTIVE NAV ON SCROLL ===
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');
let sectionCache = [];

function cacheSectionPositions() {
  sectionCache = Array.from(sections).map(s => ({
    id: s.getAttribute('id'),
    top: s.offsetTop,
    bottom: s.offsetTop + s.offsetHeight
  }));
}

function updateActiveNav() {
  const scrollY = window.scrollY + 120;
  const atBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 50);

  let currentId = '';
  if (atBottom && sectionCache.length) {
    currentId = sectionCache[sectionCache.length - 1].id;
  } else {
    for (const s of sectionCache) {
      if (scrollY >= s.top && scrollY < s.bottom) {
        currentId = s.id;
        break;
      }
    }
  }

  navItems.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
  });
}

cacheSectionPositions();
window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', cacheSectionPositions, { passive: true });

// === INIT ===
renderProjects(DATA.projects);
renderExperience(DATA.experience);
initStaggerReveal('.project-list, .timeline');
updateActiveNav();
