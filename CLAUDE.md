# Working on this project

A static Meta Quest 2 landing page: `index.html`, `css/style.css`, `js/main.js`, plus fonts,
icons and images. No build step, no dependencies, no framework. Opening `index.html` in a
browser is the whole "run" story.

Written in English to match the README and the commit history. Code comments in
`css/style.css` and `js/main.js` are in Russian — follow whichever convention the file you
are editing already uses.

## Verifying changes — read this before you test anything

**Do not verify through the in-app browser preview pane.** It renders this project's
`file://` pages as static snapshots and gives false negatives with no console error. The
concrete symptom seen twice: clicking play buttons in feature tabs 3-6 silently does
nothing, `document.activeElement` and event handlers behave as if the JavaScript never ran,
and the console is clean. The same code passes in a real browser. A subagent was very nearly
sent back to fix working code because of this.

Verify with Playwright against a local HTTP server instead. Playwright blocks the `file:`
protocol, so the server is not optional. Write this to a scratch directory (not into the
repo) and run it in the background:

```js
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\AnnaTolstoukhova\\Desktop\\Projects\\oculus';
const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(root, urlPath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + filePath); return; }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}).listen(8791, () => console.log('listening on 8791'));
```

Then point Playwright at `http://localhost:8791/index.html`. `Cache-Control: no-store` means
no cache-busting query string is needed.

Two more things about this:

- Snippets that wait out timed phases must be passed to `browser_evaluate` as
  `async () => { … }`. A plain function will not await and returns nothing useful.
- Playwright writes a `.playwright-mcp/` directory **into the repository**. There is no
  `.gitignore`. Delete it before committing.

If you ever do load the page over `file://`, note that it caches CSS and images
aggressively: a changed query string on the HTML does not refresh them. Reassign
`link.href = 'css/style.css?b=' + Date.now()` or the image `src` to force a reload, or you
will measure stale values and report a false result.

## Line endings are CRLF

Every tracked file uses CRLF. Editors and `sed` routinely write LF, which rewrites every
line and turns a 30-line diff into a whole-file diff. This has happened repeatedly.

After editing, check:

```bash
git diff --stat
```

If a file's changed-line count is close to its total line count, fix it before committing:

```bash
sed -i 's/\r$//; s/$/\r/' <file>
```

`git show` piped through bash displays LF because `core.autocrlf=true`. That is a display
artifact, not a defect — check the working-tree bytes if unsure.

## Conventions

- **No dependencies, no build step.** Do not add `package.json`, a bundler, or a library.
  The README states this as a property of the project.
- **No test runner exists.** Verification is browser DOM assertions with expected values, as
  above. Do not introduce a test framework out of habit.
- **Colours go through CSS custom properties.** Palette: `--grey-color`, `--white-color`,
  `--light-grey-color`, `--black-color`. Theme roles, overridden under
  `@media (prefers-color-scheme: dark)`: `--bg-color`, `--text-color`, `--heading-color`,
  `--line-color`. Gradients: `--gradient`, `--back-gradient`. The one literal in use is the
  brand magenta `#BC10D8`. Hairlines, borders and outlines are in `px` by established
  practice — that is not a violation.
- **Text over the always-light photos is pinned, not themed.** `.top` and `.metaverse__inner`
  sit on photos that stay light in both colour schemes, so text over them must not follow
  `--text-color` or it turns light-on-light in dark mode. Both places pin their colour with
  an explanatory comment; keep that pattern.
- **Sizing is in `rem`** with `html { font-size: 62.5% }`, so `1rem` equals `10px`.
- **Class names follow a BEM-like convention.**
- **Commit messages are in English.**

## Things that look like bugs but are deliberate

- `.video-modal::backdrop` uses a literal `rgba(7, 7, 7, .7)` instead of a variable.
  `::backdrop` did not inherit custom properties until Chrome 122, while the project's stated
  support floor is Chrome 37+ / Firefox 98+ / Safari 15.4+. A variable there would compute to
  an invalid colour and fall back to transparent — no dimming at all — across most of that
  window. There is a comment in the file saying so.
- `.video-modal__inner` exists so the dialog itself carries `padding: 0`. Backdrop clicks are
  detected with `event.target === videoModal`; if the dialog held the padding, clicking that
  ring inside the modal would close it.
- The metaverse progress bar is deliberately **not** wrapped in `prefers-reduced-motion`,
  while the button's pulse is. The bar communicates state; hiding it would leave those users
  with no feedback.

## Design docs

Specs and implementation plans for the interactive features live in
`docs/superpowers/specs/` and `docs/superpowers/plans/`. If you are changing the video modal
or the metaverse GO button, read the relevant spec first — several decisions that look
arbitrary are argued there.

## Still inert

"BUY NOW", the cart counter, and the newsletter form's submission. The form validates the
email and submits, but nothing receives it. The README's Scope section is kept accurate —
update it when that changes.
