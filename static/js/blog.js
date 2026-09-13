window.addEventListener('DOMContentLoaded', () => {
    Site.configure('Blog');
    const list = document.getElementById('blog-list');
    const formatDate = value => value instanceof Date ? value.toISOString().slice(0, 10) : String(value || '');

    async function loadPosts() {
        list.setAttribute('aria-busy', 'true');
        try {
            const posts = jsyaml.load(await Site.fetchText('contents/blog/posts.yml')) || [];
            posts.sort((a, b) => formatDate(b.date).localeCompare(formatDate(a.date)));
            list.replaceChildren();
            if (!posts.length) {
                list.textContent = 'No posts yet.';
            }
            posts.forEach(post => {
                const card = document.createElement('article');
                card.className = 'blog-card';
                const content = document.createElement('div');
                content.className = 'blog-card-content';
                card.append(content);
                const date = document.createElement('time');
                date.className = 'eyebrow';
                // YAML can parse unquoted dates as Date objects.
                const dateText = formatDate(post.date);
                date.dateTime = dateText;
                date.textContent = dateText;
                const heading = document.createElement('h2');
                const titleLink = document.createElement('a');
                titleLink.href = `post.html?post=${encodeURIComponent(post.slug)}`;
                titleLink.textContent = post.title;
                heading.append(titleLink);
                content.append(date, heading);
                if (post.summary) {
                    const summary = document.createElement('p');
                    summary.textContent = post.summary;
                    content.append(summary);
                }
                const readLink = document.createElement('a');
                readLink.href = titleLink.getAttribute('href');
                readLink.className = 'action-link';
                readLink.textContent = 'Read note ↗';
                readLink.setAttribute('aria-label', `Read ${post.title}`);
                content.append(readLink);
                list.append(card);
            });
        } catch (error) {
            console.error(error);
            Site.showError(list, 'The posts could not be loaded.', loadPosts);
        } finally {
            list.setAttribute('aria-busy', 'false');
        }
    }
    loadPosts();
});
