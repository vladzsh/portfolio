// === RENDER BLOG LIST ===
document.querySelector('.blog-list').innerHTML = DATA.blog.map(post => `
  <a href="post.html?slug=${post.slug}" class="blog-item stagger-item">
    <div class="blog-info">
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
    </div>
    <span class="blog-date">${post.date}</span>
  </a>
`).join('');

initStaggerReveal('.blog-list');
