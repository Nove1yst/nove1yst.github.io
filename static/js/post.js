const content_dir = 'contents/';
const blog_dir = 'contents/blog/';
const config_file = 'config.yml';

function getQueryParam(name) {
    const m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

window.addEventListener('DOMContentLoaded', () => {
    // Config
    fetch(content_dir + config_file)
        .then(r => r.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                const el = document.getElementById(key);
                if (el) el.innerHTML = yml[key];
            });
        })
        .catch(err => console.log(err));

    const slug = getQueryParam('post');
    const titleEl = document.getElementById('post-title');
    const dateEl = document.getElementById('post-date');
    const topEl = document.getElementById('post-top-title');
    const bodyEl = document.getElementById('post-md');

    if (!slug || !/^[A-Za-z0-9._-]+$/.test(slug)) {
        bodyEl.innerHTML = '<p><em>Invalid or missing post.</em></p>';
        return;
    }

    // Look up metadata
    fetch(blog_dir + 'posts.yml')
        .then(r => r.text())
        .then(text => {
            const posts = jsyaml.load(text) || [];
            const meta = posts.find(p => p.slug === slug);
            if (meta) {
                document.getElementById('title').textContent = meta.title;
                titleEl.textContent = meta.title;
                topEl.textContent = meta.title;
                dateEl.textContent = meta.date || '';
            }
        })
        .catch(err => console.log(err));

    // Mail list: stamp slug, show thanks if redirected back
    const slugField = document.getElementById('maillist-post-slug');
    if (slugField) slugField.value = slug;
    if (getQueryParam('subscribed') === '1') {
        const thanks = document.getElementById('maillist-thanks');
        if (thanks) thanks.style.display = 'block';
    }

    // Load markdown
    marked.use({ mangle: false, headerIds: false });
    fetch(blog_dir + slug + '.md')
        .then(r => {
            if (!r.ok) throw new Error('Post not found');
            return r.text();
        })
        .then(md => {
            bodyEl.innerHTML = marked.parse(md);
            if (window.MathJax && MathJax.typeset) MathJax.typeset();
        })
        .catch(err => {
            console.log(err);
            bodyEl.innerHTML = '<p><em>Post not found.</em></p>';
        });
});
