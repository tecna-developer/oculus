# Play Button Video Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the six play buttons open a working modal that names the feature it was opened from and shows a placeholder in place of a video.

**Architecture:** One native `<dialog>` lives at the end of `<body>` and is reused by all six buttons; its title is filled in on open from the panel that owns the clicked button. The browser supplies focus trapping, `Esc`, the backdrop, and focus return, so the JavaScript only handles opening, the close button, and backdrop clicks.

**Tech Stack:** Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework.

## Global Constraints

- **No dependencies and no build step.** `README.md` states this as a property of the project. Do not add `package.json`, a bundler, or any library.
- **No test runner exists.** There is no `package.json` and no test framework. Verification in this project is done by loading `index.html` in a browser and asserting against the DOM. Each task below gives the exact snippet to run in the browser console and the exact expected output. Do not introduce a test framework to satisfy a habit — that would violate the constraint above.
- **Line endings are CRLF.** Every tracked file uses CRLF. Editors and `sed` often write LF, which rewrites every line and turns a 30-line diff into a whole-file diff. After editing, check with `git diff --stat`; if the count is near the file's total line count, run `sed -i 's/\r$//; s/$/\r/' <file>` before committing.
- **Colours go through variables.** The palette is fixed (`--grey-color`, `--white-color`, `--light-grey-color`, `--black-color`) and the theme-dependent roles are `--bg-color`, `--text-color`, `--heading-color`, `--line-color`, overridden in `@media (prefers-color-scheme: dark)`. New colours must use these so both schemes work. The one literal in use across the file is the brand magenta `#BC10D8`.
- **Sizing is in `rem`** with `html { font-size: 62.5% }`, so `1rem` equals `10px`.
- **Class names follow the existing BEM-like convention**, e.g. `.video-modal__title`.
- **Commit messages are in English**, matching the existing history.

---

### Task 1: Dialog markup, styles, and button labels

Delivers a styled dialog that exists in the DOM and is closed by default, plus accessible names on the six play buttons. No behaviour yet — this task is verifiable on its own by opening the dialog manually from the console.

**Files:**
- Modify: `index.html` — six `<button class="video__btn">` at lines 90, 106, 122, 138, 154, 170; new dialog inserted between `</footer>` (line 338) and `<script src="js/main.js">` (line 339)
- Modify: `css/style.css` — append after the last rule, currently ending at line 1005
- Test: none; browser DOM assertions in Step 4

**Interfaces:**
- Consumes: nothing
- Produces: `#videoModal` — a `<dialog>` carrying `.video-modal`, containing `.video-modal__title` (an `<h2>` with `id="videoModalTitle"`, empty until opened), `.video-modal__stage`, and `.video-modal__close`. Task 2 sets the title's `textContent` and calls `showModal()`; Task 3 wires `.video-modal__close`.

- [ ] **Step 1: Add the dialog markup**

Insert between `</footer>` and the `<script>` tag in `index.html`:

```html
    <dialog class="video-modal" id="videoModal" aria-labelledby="videoModalTitle">
        <div class="video-modal__inner">
            <h2 class="video-modal__title" id="videoModalTitle"></h2>
            <div class="video-modal__stage">Video coming soon</div>
            <button class="video-modal__close" type="button" aria-label="Close">&times;</button>
        </div>
    </dialog>
```

The `.video-modal__inner` wrapper is deliberate and is a refinement on the sketch in the spec. Backdrop clicks are detected in Task 3 by `event.target === videoModal`. If the dialog carried the padding itself, clicking that padding ring would also match and close the dialog. Moving all padding onto the wrapper makes the dialog's own box exactly the content area, so only true backdrop clicks match.

- [ ] **Step 2: Add an accessible name to each play button**

Each of the six buttons currently reads `<button class="video__btn">` and contains only `<img src="icons/play.svg" alt="">`, so it has no accessible name. Change all six to:

```html
                                <button class="video__btn" type="button" aria-label="Watch the video">
```

`type="button"` is added because these buttons will sit near a form on the page; the default `type` is `submit`.

All six get the same label. Only one tab panel is visible at a time and hidden panels are `display: none`, so exactly one of these buttons is in the accessibility tree at any moment — the label does not need to name the feature.

- [ ] **Step 3: Add the styles**

Append to `css/style.css`:

```css
/* Модалка с видео */
.video-modal {
    /* Сброс * { margin: 0 } перебивает браузерное dialog { margin: auto },
       поэтому центрируем явно */
    margin: auto;
    width: min(90vw, 60rem);
    padding: 0;
    border: 1px solid #BC10D8;
    background-color: var(--bg-color);
    color: var(--text-color);
}

.video-modal::backdrop {
    background-color: rgba(7, 7, 7, .7);
}

.video-modal__inner {
    position: relative;
    padding: 2rem;
}

.video-modal__title {
    color: var(--heading-color);
    font-size: 2.4rem;
    font-weight: 400;
    margin-bottom: 1.5rem;
    padding-inline-end: 4rem;
}

.video-modal__stage {
    display: flex;
    align-items: center;
    justify-content: end;
    flex-direction: column;
    aspect-ratio: 16 / 9;
    padding: 1rem;
    background-image: url('../images/video_cover.jpg');
    background-position: center;
    background-size: cover;
    color: var(--white-color);
    font-size: 1.3rem;
    text-transform: uppercase;
}

.video-modal__close {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 3rem;
    height: 3rem;
    font-size: 3rem;
    line-height: 1;
    color: var(--heading-color);
    transition: color .3s ease;
}

.video-modal__close:hover {
    color: #BC10D8;
}
```

- [ ] **Step 4: Verify in the browser**

Open `index.html` in a browser. If it was already open, hard-reload — this project's `file://` caching serves stale CSS otherwise, and a plain reload will not pick up the new rules.

Run in the console:

```js
const m = document.querySelector('#videoModal');
JSON.stringify({
  тег: m.tagName,
  открыт: m.open,
  видим: getComputedStyle(m).display,
  заголовокПуст: m.querySelector('.video-modal__title').textContent === '',
  меткиКнопок: [...document.querySelectorAll('.video__btn')].map(b => b.getAttribute('aria-label')),
  типыКнопок: [...document.querySelectorAll('.video__btn')].map(b => b.type)
}, null, 1);
```

Expected: `тег` is `"DIALOG"`, `открыт` is `false`, `видим` is `"none"`, `заголовокПуст` is `true`, `меткиКнопок` is six copies of `"Watch the video"`, `типыКнопок` is six copies of `"button"`.

Then open it by hand to check the styling:

```js
document.querySelector('.video-modal__title').textContent = 'Test title';
document.querySelector('#videoModal').showModal();
```

Expected: the dialog is centred horizontally and vertically, the page behind it is dimmed, the title reads "Test title", the stage shows the video cover image with "Video coming soon" over it, and a `×` sits in the top-right corner without overlapping the title.

Close it again with `document.querySelector('#videoModal').close()`.

- [ ] **Step 5: Check the diff size, then commit**

```bash
git diff --stat
```

If `index.html` or `css/style.css` shows a change count close to its total line count, the line endings were rewritten. Fix before committing:

```bash
sed -i 's/\r$//; s/$/\r/' index.html css/style.css
```

Then:

```bash
git add index.html css/style.css
git commit -m "Add the video modal markup and styles"
```

---

### Task 2: Opening the modal

Wires the six play buttons so each opens the dialog with its own feature name as the title.

**Files:**
- Modify: `js/main.js` — append after the tab keyboard handler, currently ending at line 56
- Test: none; browser DOM assertions in Step 3

**Interfaces:**
- Consumes: `#videoModal` and `.video-modal__title` from Task 1; the existing `.features__tab__content-item` panels, each of which contains exactly one `.tab__content--title`
- Produces: `videoModal` and `videoModalTitle` as module-level `const`s that Task 3 reuses for its close handlers

- [ ] **Step 1: Add the open handler**

Append to `js/main.js`:

```js

/* Модалка с видео */

const videoModal = document.querySelector('#videoModal');
const videoModalTitle = videoModal.querySelector('.video-modal__title');

document.querySelectorAll('.video__btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (typeof videoModal.showModal !== 'function') return;

        const panel = btn.closest('.features__tab__content-item');
        videoModalTitle.textContent = panel.querySelector('.tab__content--title').textContent;
        videoModal.showModal();
    });
});
```

The `showModal` check keeps a browser without `<dialog>` support at the current behaviour — the button does nothing — instead of throwing a `TypeError` on every click.

The panel and title lookups are deliberately undefended. Every play button sits inside a panel that has a title; if that stops being true the markup is broken, and a silent guard would hide the breakage rather than surface it.

- [ ] **Step 2: Reload the page**

Hard-reload so the new `main.js` is picked up rather than the cached copy.

- [ ] **Step 3: Verify every button opens with the right title**

Run in the console:

```js
const tabs = [...document.querySelectorAll('.tab__btn')];
const modal = document.querySelector('#videoModal');
const out = [];
for (let i = 0; i < 6; i++) {
  tabs[i].click();
  document.querySelector('.features__tab__content-item:not(.hidden) .video__btn').click();
  out.push((i + 1) + ': open=' + modal.open + ' title="' + modal.querySelector('.video-modal__title').textContent + '"');
  modal.close();
}
JSON.stringify(out, null, 1);
```

Expected, exactly:

```
1: open=true title="Graphics"
2: open=true title="Intuitive controls"
3: open=true title="Powerful processor"
4: open=true title="Set up your play area"
5: open=true title="Guardian activity"
6: open=true title="Headset casting"
```

Check the console shows no errors.

- [ ] **Step 4: Check the diff size, then commit**

```bash
git diff --stat
```

If `js/main.js` shows a change count close to its total line count, fix the line endings:

```bash
sed -i 's/\r$//; s/$/\r/' js/main.js
```

Then:

```bash
git add js/main.js
git commit -m "Open the video modal from each play button"
```

---

### Task 3: Closing the modal

Adds the close button and backdrop-click handlers, and confirms the behaviours the browser provides for free.

**Files:**
- Modify: `js/main.js` — append after the open handler added in Task 2
- Test: none; browser DOM assertions in Step 3

**Interfaces:**
- Consumes: `videoModal` from Task 2, and `.video-modal__close` from Task 1
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Add the close handlers**

Append to `js/main.js`:

```js

videoModal.querySelector('.video-modal__close').addEventListener('click', () => {
    videoModal.close();
});

/* Клик по затемнению: цель события — сам <dialog>, а не его содержимое,
   которое целиком лежит в .video-modal__inner */
videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) videoModal.close();
});
```

- [ ] **Step 2: Reload the page**

Hard-reload so the new `main.js` is picked up.

- [ ] **Step 3: Verify all three ways of closing, plus focus return**

Run in the console:

```js
const modal = document.querySelector('#videoModal');
const btn = document.querySelector('.features__tab__content-item:not(.hidden) .video__btn');
const out = {};

/* Фокус ставим явно: программный .click() элемент не фокусирует, поэтому
   без этой строки браузеру некуда возвращать фокус и проверка ниже
   провалится даже на рабочей модалке */
btn.focus();
btn.click();
out.открылась = modal.open;

modal.querySelector('.video-modal__close').click();
out.закрылаКнопкой = !modal.open;
out.фокусВернулся = document.activeElement === btn;

btn.click();
modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
out.закрылаЗатемнением = !modal.open;

btn.click();
modal.querySelector('.video-modal__stage').dispatchEvent(new MouseEvent('click', { bubbles: true }));
out.кликВнутриНеЗакрывает = modal.open;
modal.close();

JSON.stringify(out, null, 1);
```

Expected: every value is `true`.

- [ ] **Step 4: Verify `Esc` by hand**

`Esc` is handled by the browser and cannot be simulated with a synthetic event — `dispatchEvent` does not trigger the native dialog dismissal. Click a play button, press `Esc`, and confirm the dialog closes and focus lands back on the play button.

- [ ] **Step 5: Verify both colour schemes**

Open the dialog in light mode and in dark mode. Expected: in light mode the dialog background is white with dark text; in dark mode it is `#070707` with `#CACAD6` text. The title, the `×`, and the backdrop stay readable in both.

- [ ] **Step 6: Check the diff size, then commit**

```bash
git diff --stat
```

If `js/main.js` shows a change count close to its total line count, fix the line endings:

```bash
sed -i 's/\r$//; s/$/\r/' js/main.js
```

Then:

```bash
git add js/main.js
git commit -m "Close the video modal by button, backdrop and Esc"
```

---

## Coverage against the spec

| Spec requirement | Task |
|---|---|
| Modal opens with placeholder, no real video | 1 (stage markup and styles) |
| Native `<dialog>` with `showModal()` | 1, 2 |
| One dialog reused by all six buttons | 1, 2 |
| Title taken from the panel's `.tab__content--title` | 2 |
| `aria-label` on the play buttons | 1 |
| Close by button | 3 |
| Close by `Esc` | 3 (browser-supplied, verified in Step 4) |
| Close by backdrop click | 3 |
| Focus returns to the opening button | 3 (browser-supplied, verified in Step 3) |
| Guard when `showModal` is unavailable | 2 |
| Panel and title lookups left undefended | 2 |
| Palette variables, both schemes | 1, verified in 3 |
| `video_cover.jpg` reused for the stage | 1 |

`prefers-reduced-motion` is not covered by any task: the spec makes it conditional on adding an open/close animation, and this plan adds none. If an animation is added later, it needs the media query.
