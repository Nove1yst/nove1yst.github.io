# Junran Wang's personal website

A static academic website with a 2000s street-racing interface: purple chrome branding, beveled panels, and a responsive profile / research layout. Hosted on GitHub Pages; no build step is needed.

## Local preview

From the repository root:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://localhost:8000>. Keep the terminal running while previewing; press `Ctrl+C` to stop. If an old stylesheet is cached, hard refresh with `Cmd+Shift+R` on macOS or `Ctrl+Shift+R` on Windows/Linux.

Serve the site over HTTP rather than opening `index.html` directly: the pages fetch their Markdown and YAML content.

## Edit content

| File | Content |
| --- | --- |
| `contents/profile.md` | Name, affiliation, location, contact buttons, and education in the profile card |
| `contents/home.md` | About Me and research interests |
| `contents/news.md` | News, newest first, grouped under month headings |
| `contents/publications.md` | Publication cards, author lists, images, venue badges, and links |
| `contents/experience.md` | Professional experience |
| `contents/awards.md` | Awards |
| `contents/friends.md` | Friend links |
| `contents/config.yml` | Site title and copyright |
| `contents/blog/posts.yml` | Blog titles, dates, summaries, and slugs |
| `contents/blog/<slug>.md` | Blog post content |

Publication venue classes are shared by conference: `venue-badge--icml`, `venue-badge--iclr`, and `venue-badge--arxiv`. Use `<strong>Spotlight</strong>` inside the venue label for emphasis.

The top-left navigation logo uses the original `static/assets/img/Nove1yst.png` artwork; there is no separate banner section. The portrait uses `static/assets/img/jwang.jpg`. Publications share one steel enclosure, with a thin, light outline around each paper card.

## Layout and behavior

- `static/css/main.css`: shared appearance and responsive layouts.
- `static/assets/textures/weathered-steel.jpg`: generated metal material for title plates, purple/silver fins, and reinforced frames; its generation prompt is in `static/assets/textures/README.md`.
- `static/js/site.js`: navigation, configuration, and Markdown loading helpers.
- `static/js/scripts.js`: homepage content loading.
- `static/js/blog.js` and `static/js/post.js`: blog listing and article loading.
- `index.html`, `blog.html`, and `post.html`: page structure.

The mobile navigation supports keyboard use and Escape to close. Links and controls have visible focus states, and reduced-motion preferences are respected. MathJax, Marked, and the YAML parser are served locally; web fonts use Google Fonts with system fallbacks.

## License

Based on the academic website template by Congrui Yin. The original template is distributed under the MIT license; see `LICENSE`.
