# Oculus

A responsive landing page for the Meta Quest 2 VR headset, built as a learning project
around CSS Grid and CSS animations. No frameworks, no build step — plain HTML, CSS and
vanilla JavaScript.

**Live demo:** https://tecna-developer.github.io/oculus/

![Oculus landing page](og-image.png)

## Highlights

- **CSS Grid throughout** — the navbar, the feature tabs, the games row, the "In the box"
  mosaic and the accessories row are each laid out with Grid rather than floats or
  positioning.
- **Responsive down to 320px** across seven breakpoints (1140, 990, 880, 820, 768, 568,
  420px), including a slide-in burger menu on narrow screens.
- **Dark theme** driven by `prefers-color-scheme`. Custom properties are split into a fixed
  palette and semantic roles (`--bg-color`, `--text-color`, `--heading-color`,
  `--line-color`), so switching themes means overriding four variables rather than hunting
  down individual rules.
- **CSS animations** — `slideFromRight` drifts the oversized "oculus" watermark across the
  hero, `scaleRight` pulses the metaverse call-to-action.
- **Accessible tabs** — a proper `tablist` / `tab` / `tabpanel` structure with
  `aria-selected`, roving `tabindex`, and arrow / `Home` / `End` keyboard navigation.
- **Gradient text and borders** via `background-clip: text` and `border-image`.
- **Self-hosted Helvetica** in woff2 with `font-display: swap`.

## Running it

The page has no dependencies, so opening the file directly works:

```bash
git clone https://github.com/tecna-developer/oculus.git
```

Then open `index.html` in a browser.

Fonts and images load fine over `file://`, but if you would rather serve it over HTTP:

```bash
python -m http.server 8000
```

## Structure

```
index.html        markup for the whole page
css/style.css     all styles: variables, layout, animations, media queries
js/main.js        burger menu toggle and the tab switcher
fonts/            Helvetica woff2 (regular and bold)
icons/            UI icons (logo, cart, play, social)
images/           product photography and section backgrounds
```

Class names follow a BEM-like convention. Sizing is in `rem` with `html { font-size: 62.5% }`,
so `1rem` equals 10px.

## Scope

This is a front-end exercise, so the page is presentation only — there is no backend behind
it. The newsletter form validates the email and submits, but nothing receives it; the
"BUY NOW", cart, play and metaverse buttons are styled targets without handlers. Only the
first feature tab has real copy — panels 2 through 6 currently repeat it as placeholder
content.
