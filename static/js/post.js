window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('post');
    const body = document.getElementById('post-md');
    const title = document.getElementById('post-title');
    const date = document.getElementById('post-date');
    const maillist = document.getElementById('maillist');

    if (!slug || !/^[A-Za-z0-9._-]+$/.test(slug)) {
        Site.configure('Post not found');
        title.textContent = 'Post not found';
        Site.showError(body, 'This article link is invalid. Choose a note from the blog.');
        return;
    }

    async function loadPost() {
        body.setAttribute('aria-busy', 'true');
        try {
            const posts = jsyaml.load(await Site.fetchText('contents/blog/posts.yml')) || [];
            const meta = posts.find(post => post.slug === slug);
            if (!meta) {
                Site.configure('Post not found');
                title.textContent = 'Post not found';
                Site.showError(body, 'This article could not be found. Choose a note from the blog.');
                return;
            }
            await Site.configure(meta.title);
            title.textContent = meta.title;
            const dateText = meta.date instanceof Date ? meta.date.toISOString().slice(0, 10) : String(meta.date || '');
            date.textContent = dateText;
            date.dateTime = dateText;
            marked.use({ mangle: false, headerIds: false });
            body.innerHTML = marked.parse(await Site.fetchText(`contents/blog/${slug}.md`));
            const firstHeading = body.querySelector('h1');
            if (firstHeading && firstHeading.textContent === meta.title) firstHeading.remove();
            body.querySelectorAll('table').forEach(table => {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-scroll';
                wrapper.tabIndex = 0;
                wrapper.setAttribute('role', 'region');
                wrapper.setAttribute('aria-label', 'Article table, scroll horizontally if needed');
                table.replaceWith(wrapper);
                wrapper.append(table);
            });
            document.getElementById('maillist-post-slug').value = slug;
            maillist.hidden = false;
            document.getElementById('maillist-thanks').hidden = params.get('subscribed') !== '1';
            if (window.MathJax?.startup?.promise) {
                await MathJax.startup.promise;
                await MathJax.typesetPromise([body]);
            }
        } catch (error) {
            console.error(error);
            Site.showError(body, 'This article could not be loaded.', loadPost);
        } finally {
            body.setAttribute('aria-busy', 'false');
        }
    }
    loadPost();
});
