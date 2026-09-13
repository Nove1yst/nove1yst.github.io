window.addEventListener('DOMContentLoaded', async () => {
    marked.use({ mangle: false, headerIds: false });
    await Promise.all([
        Site.configure(),
        ...['profile', 'home', 'news', 'publications', 'experience', 'awards', 'friends'].map(Site.loadMarkdown),
    ]);
    // Hash targets can move while Markdown and the portrait are loading.
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
});
