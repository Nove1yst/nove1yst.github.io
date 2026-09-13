/* Shared navigation and content loading for the static site. */
window.Site = (() => {
    async function fetchText(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
        return response.text();
    }

    async function configure(pageTitle = '') {
        try {
            const config = jsyaml.load(await fetchText('contents/config.yml')) || {};
            Object.entries(config).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element && id !== 'title') element.innerHTML = value ?? '';
            });
            document.title = [pageTitle, config.title || 'Junran Wang'].filter(Boolean).join(' · ');
        } catch (error) {
            console.error(error);
        }
    }

    function showError(target, message, retry) {
        const note = document.createElement('p');
        note.className = 'notice';
        note.textContent = message;
        target.replaceChildren(note);
        target.setAttribute('aria-busy', 'false');
        if (retry) {
            const button = document.createElement('button');
            button.className = 'action-link retry-button';
            button.type = 'button';
            button.textContent = 'Try again';
            button.addEventListener('click', retry);
            target.append(button);
        }
    }

    async function loadMarkdown(name) {
        const target = document.getElementById(`${name}-md`);
        if (!target) return;
        target.setAttribute('aria-busy', 'true');
        try {
            target.innerHTML = marked.parse(await fetchText(`contents/${name}.md`));
        } catch (error) {
            console.error(error);
            showError(target, 'This section could not be loaded.', () => loadMarkdown(name));
        } finally {
            target.setAttribute('aria-busy', 'false');
        }
    }

    function setupNavigation() {
        const button = document.querySelector('.menu-toggle');
        const nav = document.getElementById('site-navigation');
        if (!button || !nav) return;
        function setOpen(open) {
            button.setAttribute('aria-expanded', String(open));
            nav.classList.toggle('is-open', open);
        }
        button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
        nav.addEventListener('click', event => {
            if (event.target.closest('a')) setOpen(false);
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                button.focus();
            }
        });
        window.matchMedia('(max-width: 900px)').addEventListener('change', () => setOpen(false));
        if (document.body.dataset.page === 'home') {
            function updateCurrent() {
                const section = window.location.hash || '#home';
                const target = ['#news', '#publications'].includes(section) ? section : '#home';
                nav.querySelectorAll('a').forEach(link => {
                    const selected = link.getAttribute('href') === target;
                    link.classList.toggle('is-active', selected);
                    if (selected) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                });
            }
            window.addEventListener('hashchange', updateCurrent);
            updateCurrent();
        }
    }

    setupNavigation();
    return { fetchText, configure, loadMarkdown, showError };
})();
