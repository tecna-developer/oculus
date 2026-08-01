# Metaverse GO Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the metaverse block's GO button play a fake loading sequence ending in "Coming soon", then return to rest — and make the button reliably clickable, which it currently is not.

**Architecture:** A state class on `.metaverse__inner` selects the state. The progress bar is a CSS animation on a pseudo-element; JavaScript advances the state on `animationend` rather than on a timer covering the whole chain. The button's existing infinite `scaleRight` animation, which collapses it to `scale(0)` every cycle, is replaced.

**Tech Stack:** Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework.

## Global Constraints

- **No dependencies and no build step.** `README.md` states this as a property of the project. Do not add `package.json`, a bundler, or any library.
- **No test runner exists.** There is no `package.json` and no test framework. Verification is done by loading the page in a browser and asserting against the DOM. Each task gives the exact snippet and expected output. Do not add a test framework.
- **Do NOT verify through the in-app browser preview pane.** It renders this project's `file://` pages as static snapshots and produces false negatives with no console error — click handlers on later tab panels silently do nothing there. Verify with the Playwright MCP tools against `http://localhost:8791/index.html`. Playwright blocks the `file:` protocol, so a static server is required; start it with:
  ```bash
  node "C:/Users/ANNATO~1/AppData/Local/Temp/claude/C--Users-AnnaTolstoukhova-Desktop-Projects-oculus/1e75f46d-9439-4fe8-bf60-7a367c66025d/scratchpad/serve.js"
  ```
  It serves the project root on port 8791 with `Cache-Control: no-store`, so no cache-busting query string is needed.
- **Playwright writes a `.playwright-mcp/` directory into the repository.** This project has no `.gitignore`. Delete that directory before committing.
- **Line endings are CRLF.** Every tracked file uses CRLF. Editors and `sed` often write LF, which rewrites every line. After editing, check `git diff --stat`; if a file's changed-line count is near its total, run `sed -i 's/\r$//; s/$/\r/' <file>` before committing. Note that `git show` piped through bash displays LF because `core.autocrlf=true` — that is a display artifact, not a defect; check working-tree bytes if unsure.
- **Colours go through variables.** Palette: `--grey-color`, `--white-color`, `--light-grey-color`, `--black-color`. Theme roles overridden under `@media (prefers-color-scheme: dark)`: `--bg-color`, `--text-color`, `--heading-color`, `--line-color`. Gradients: `--gradient`, `--back-gradient`. The one literal in use is the brand magenta `#BC10D8`.
- **The metaverse block's background photo is always light pink**, in both colour schemes. Text and outlines drawn over it must therefore NOT follow `--text-color`; they are pinned, the same way `.top` pins `color: var(--grey-color)` with an explanatory comment.
- **Sizing is in `rem`** with `html { font-size: 62.5% }`, so `1rem` equals `10px`.
- **Class names follow the existing BEM-like convention.**
- **Commit messages are in English.**

---

### Task 1: Status element, progress bar, and a clickable button

Delivers the markup and all styles. No behaviour yet — verifiable on its own by toggling the state class from the console.

**Files:**
- Modify: `index.html:249` — the single-line `.metaverse__inner` div
- Modify: `css/style.css:529-556` — the `.metaverse__btn` rule and the `@keyframes scaleRight` block that follows it
- Test: none; browser DOM assertions in Step 5

**Interfaces:**
- Consumes: nothing
- Produces: `.metaverse__status` (a `<p role="status">`, empty at rest) and the state class `metaverse__inner--loading`, which Task 2 adds and removes on `.metaverse__inner`. The progress bar animation is named `metaverseProgress` and runs on `.metaverse__status::after`; Task 2 listens for its `animationend` on `.metaverse__status`.

- [ ] **Step 1: Replace the metaverse markup**

`index.html:249` is currently one line:

```html
               <div class="metaverse__inner"><button class="metaverse__btn">GO</button></div>
```

Replace it with:

```html
                <div class="metaverse__inner">
                    <p class="metaverse__status" role="status"></p>
                    <button class="metaverse__btn" type="button" aria-label="Enter the metaverse">GO</button>
                </div>
```

`role="status"` carries an implicit `aria-live="polite"`, so Task 2's text changes are announced without interrupting the user. The paragraph is empty at rest so it stays silent until there is something to say. `type="button"` stops the default `submit`.

- [ ] **Step 2: Replace the button rule and its animation**

`css/style.css:529-556` currently holds `.metaverse__btn` followed by `@keyframes scaleRight`. Replace that whole span with:

```css
.metaverse__btn {
    background: var(--back-gradient);
    color: var(--white-color);
    text-transform: uppercase;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    position: absolute;
    bottom: 8rem;
    right: 0;
    left: 0;
    margin: 0 auto;
}

.metaverse__btn:disabled {
    cursor: default;
}

.metaverse__btn:focus-visible {
    outline: 2px solid #BC10D8;
    outline-offset: 4px;
}

/* Пульсация не опускается ниже полного размера: прежняя scaleRight уводила
   кнопку в scale(0), и в начале каждого цикла по ней нельзя было попасть */
@media (prefers-reduced-motion: no-preference) {
    .metaverse__btn:not(:disabled) {
        animation: metaversePulse 2s ease-in-out infinite;
    }
}

@keyframes metaversePulse {
    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.15);
    }
}
```

`scaleRight` is deleted, not kept: `grep -n scaleRight css/style.css` shows it used only by this one rule.

The pulse is scoped to `:not(:disabled)` so the button holds still while the sequence runs.

- [ ] **Step 3: Add the status and progress bar styles**

Append after the block from Step 2:

```css
.metaverse__status {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 14rem;
    width: min(80%, 32rem);
    margin: 0 auto;
    min-height: 2.4rem;
    /* Фото блока всегда светло-розовое, поэтому текст не следует за темой */
    color: var(--black-color);
    font-size: 1.6rem;
    text-transform: uppercase;
}

.metaverse__status::after {
    content: '';
    display: block;
    width: 100%;
    height: 4px;
    margin-top: 1rem;
    background-image: var(--back-gradient);
    transform: scaleX(0);
    transform-origin: left center;
}

.metaverse__inner--loading .metaverse__status::after {
    animation: metaverseProgress 2s linear forwards;
}

@keyframes metaverseProgress {
    from {
        transform: scaleX(0);
    }

    to {
        transform: scaleX(1);
    }
}
```

The bar is a pseudo-element because it carries no meaning of its own — the announcement is the status text. It animates `transform`, not `width`, so the browser can composite it.

`min-height` on the status keeps the block from shifting when the text appears and disappears.

The progress fill is deliberately NOT wrapped in `prefers-reduced-motion`. It communicates state rather than decorating; removing it would leave those users with no feedback at all.

- [ ] **Step 4: Start the server and load the page**

```bash
node "C:/Users/ANNATO~1/AppData/Local/Temp/claude/C--Users-AnnaTolstoukhova-Desktop-Projects-oculus/1e75f46d-9439-4fe8-bf60-7a367c66025d/scratchpad/serve.js"
```

Then navigate Playwright to `http://localhost:8791/index.html`.

- [ ] **Step 5: Verify the styles**

Run in the browser:

Pass this to Playwright's `browser_evaluate` as a function:

```js
() => {
  const inner = document.querySelector('.metaverse__inner');
  const st = document.querySelector('.metaverse__status');
  const btn = document.querySelector('.metaverse__btn');
  const bar = () => getComputedStyle(st, '::after');
  const keyframeNames = [...document.styleSheets[0].cssRules]
    .filter(r => r instanceof CSSKeyframesRule).map(r => r.name);

  const out = {
    statusExists: !!st,
    statusRole: st.getAttribute('role'),
    statusEmpty: st.textContent === '',
    btnType: btn.type,
    btnLabel: btn.getAttribute('aria-label'),
    barAtRest: bar().transform,
    scaleRightGone: !keyframeNames.includes('scaleRight'),
    pulseDefined: keyframeNames.includes('metaversePulse')
  };

  inner.classList.add('metaverse__inner--loading');
  out.barAnimating = bar().animationName + ' ' + bar().animationDuration;
  inner.classList.remove('metaverse__inner--loading');

  return JSON.stringify(out, null, 1);
}
```

Expected: `statusExists` `true`, `statusRole` `"status"`, `statusEmpty` `true`, `btnType` `"button"`, `btnLabel` `"Enter the metaverse"`, `barAtRest` a matrix with x-scale 0 (`matrix(0, 0, 0, 1, 0, 0)`), `scaleRightGone` `true`, `pulseDefined` `true`, `barAnimating` `"metaverseProgress 2s"`.

- [ ] **Step 6: Verify the button is never smaller than its resting size**

The whole point of replacing `scaleRight`. Sample the button's width across a full pulse cycle:

Pass this to `browser_evaluate` as an async function — it samples across time, so it must
await:

```js
async () => {
  const btn = document.querySelector('.metaverse__btn');
  const widths = [];
  const t0 = performance.now();
  await new Promise(res => {
    const tick = () => {
      widths.push(btn.getBoundingClientRect().width);
      if (performance.now() - t0 < 2200) requestAnimationFrame(tick); else res();
    };
    tick();
  });
  return JSON.stringify({
    samples: widths.length,
    min: Math.min(...widths),
    max: Math.max(...widths)
  });
}
```

Expected: `min` is at least 50 (the resting width — never below it) and `max` is about 57.5 (50 × 1.15). A `min` near 0 means the old animation is still applied and the fix did not land.

- [ ] **Step 7: Check the diff size, clean up, then commit**

```bash
git diff --stat
```

If `index.html` or `css/style.css` shows a change count close to its total line count, fix the line endings:

```bash
sed -i 's/\r$//; s/$/\r/' index.html css/style.css
```

Delete the Playwright scratch directory if it appeared:

```bash
rm -rf .playwright-mcp
```

Then:

```bash
git add index.html css/style.css
git commit -m "Add metaverse status element and make the GO button clickable"
```

---

### Task 2: The loading sequence

Wires the button through loading → done → idle.

**Files:**
- Modify: `js/main.js` — append after the video modal close handlers, currently ending at line 81
- Test: none; browser DOM assertions in Step 3

**Interfaces:**
- Consumes: `.metaverse__inner`, `.metaverse__status`, `.metaverse__btn` and the `metaverse__inner--loading` class from Task 1; the `metaverseProgress` animation, whose `animationend` fires on `.metaverse__status` because it runs on that element's `::after`
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Add the sequence**

Append to `js/main.js`:

```js

/* Кнопка GO в метаверс-блоке */

const metaverseInner = document.querySelector('.metaverse__inner');
const metaverseStatus = document.querySelector('.metaverse__status');
const metaverseBtn = document.querySelector('.metaverse__btn');

const METAVERSE_DONE_MS = 2000;

metaverseBtn.addEventListener('click', () => {
    metaverseBtn.disabled = true;
    metaverseStatus.textContent = 'Entering the metaverse…';
    metaverseInner.classList.add('metaverse__inner--loading');
});

/* Полоса — псевдоэлемент .metaverse__status::after, поэтому animationend
   приходит на сам абзац. Слушаем его, а не общий таймер: в фоновой вкладке
   браузер придерживает таймеры, и состояние разошлось бы с картинкой */
metaverseStatus.addEventListener('animationend', (e) => {
    if (e.animationName !== 'metaverseProgress') return;

    metaverseInner.classList.remove('metaverse__inner--loading');
    metaverseStatus.textContent = 'Coming soon';

    setTimeout(() => {
        metaverseStatus.textContent = '';
        metaverseBtn.disabled = false;
    }, METAVERSE_DONE_MS);
});
```

The `animationName` check keeps the listener correct rather than incidentally correct: it fires only for the progress bar, not for any animation added to that element later.

No guard against clicking during the sequence is written — the button carries `disabled`, and the browser does not dispatch click events on disabled buttons.

- [ ] **Step 2: Reload the page**

Reload `http://localhost:8791/index.html` in Playwright. The server sends `Cache-Control: no-store`, so no query string is needed.

- [ ] **Step 3: Verify the full cycle**

Pass this to `browser_evaluate` as an async function — it waits out the two 2s phases:

```js
async () => {
  const inner = document.querySelector('.metaverse__inner');
  const st = document.querySelector('.metaverse__status');
  const btn = document.querySelector('.metaverse__btn');
  const snap = () => ({
    text: st.textContent,
    loading: inner.classList.contains('metaverse__inner--loading'),
    disabled: btn.disabled
  });
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const out = { idle: snap() };
  btn.click();
  out.justClicked = snap();
  await wait(2300);
  out.afterBar = snap();
  await wait(2200);
  out.backToIdle = snap();
  btn.click();
  out.clickableAgain = snap();
  return JSON.stringify(out, null, 1);
}
```

Expected:

```
idle:          text ""                          loading false  disabled false
justClicked:   text "Entering the metaverse…"   loading true   disabled true
afterBar:      text "Coming soon"               loading false  disabled true
backToIdle:    text ""                          loading false  disabled false
clickableAgain:text "Entering the metaverse…"   loading true   disabled true
```

`clickableAgain` is the important one — it proves the cycle resets rather than running once.

- [ ] **Step 4: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`, reload, and confirm two things: the button does not pulse (sample its width as in Task 1 Step 6 — `min` and `max` should both be 50), and clicking still runs the full sequence to "Coming soon" and back. The progress fill is intentionally exempt from the preference.

- [ ] **Step 5: Verify both colour schemes and the console**

Emulate light and dark. The status text is pinned to `--black-color` in both, because the photo behind it is always light pink. Confirm the console has no errors; a `helvetica.woff2` decode warning and a `favicon.ico` 404 are pre-existing and unrelated.

- [ ] **Step 6: Check the diff size, clean up, then commit**

```bash
git diff --stat
```

If `js/main.js` shows a change count near its total (~81 lines before this change), run:

```bash
sed -i 's/\r$//; s/$/\r/' js/main.js
```

```bash
rm -rf .playwright-mcp
git add js/main.js
git commit -m "Run a loading sequence from the metaverse GO button"
```

---

## Coverage against the spec

| Spec requirement | Task |
|---|---|
| Four states, idle → loading → done → idle | 2 |
| Loading and done both exactly 2000ms | 1 (bar animation), 2 (`METAVERSE_DONE_MS`) |
| Duration set once in CSS; JS learns the end from `animationend` | 1, 2 |
| Button disabled during loading and done | 2 |
| `role="status"` announcing both messages | 1 (element), 2 (text changes) |
| `type="button"` and an accessible name | 1 |
| Progress bar as a pseudo-element | 1 |
| Bar hidden outside the loading state | 1 (`scaleX(0)` at rest) |
| `scaleRight` replaced; button never below full size | 1, verified in Step 6 |
| Pulse under `prefers-reduced-motion: no-preference` | 1, verified in 2 Step 4 |
| Progress fill NOT under that guard | 1, verified in 2 Step 4 |
| No error handling needed | 2 (no I/O; disabled attribute covers repeat clicks) |
| Light and dark schemes | 2 Step 5 |

Nothing in the spec is left uncovered.

## Noted, deliberately not changed

`css/style.css:517` and `:520` both declare `min-height: 50rem` on `.metaverse__inner` — a duplicate. It is harmless, predates this work, and sits outside the rules these tasks touch, so it is left alone rather than folded into an unrelated cleanup.
