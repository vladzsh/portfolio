// === RENDER POST ===
const slug = new URLSearchParams(window.location.search).get('slug');
const post = DATA.blog.find(p => p.slug === slug);
const container = document.querySelector('.post-content');

if (!post) {
  container.innerHTML = '<h1 class="post-title">Post not found</h1><p>The post you\'re looking for doesn\'t exist.</p>';
  document.title = 'Not Found — Vladyslav Zhuravel';
} else {
  document.title = `${post.title} — Vladyslav Zhuravel`;
  container.innerHTML = `
    <h1 class="post-title">${post.title}</h1>
    <div class="post-date">${post.date}</div>
    <div class="post-body">${post.body}</div>
  `;
}
