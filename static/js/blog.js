const content_dir = 'contents/';
const blog_dir = 'contents/blog/';
const config_file = 'config.yml';

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

window.addEventListener('DOMContentLoaded', () => {
    // Site-wide config (title, copyright, etc.)
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

    // Blog post listing
    fetch(blog_dir + 'posts.yml')
        .then(r => r.text())
        .then(text => {
            const posts = jsyaml.load(text) || [];
            posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
            const html = ['<table>'];
            posts.forEach(p => {
                const slug = encodeURIComponent(p.slug);
                html.push(`
  <tr>
    <td style="vertical-align: top; padding-bottom: 14px;">
      <p style="margin-bottom: 1px;">
        <strong><a href="post.html?post=${slug}">${escapeHtml(p.title)}</a></strong>
      </p>
      <p style="margin-top: 1px; margin-bottom: 1px;">
        <em>${escapeHtml(p.date || '')}</em>
      </p>
      ${p.summary ? `<p style="margin-top: 1px; margin-bottom: 1px;">${escapeHtml(p.summary)}</p>` : ''}
    </td>
  </tr>`);
            });
            html.push('</table>');
            const list = document.getElementById('blog-list');
            if (posts.length === 0) {
                list.innerHTML = '<p><em>No posts yet.</em></p>';
            } else {
                list.innerHTML = html.join('');
            }
        })
        .catch(err => {
            console.log(err);
            document.getElementById('blog-list').innerHTML = '<p><em>Failed to load posts.</em></p>';
        });
});
