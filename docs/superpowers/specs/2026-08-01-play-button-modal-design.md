# Play button video modal — design

Date: 2026-08-01
Status: approved, ready for implementation

## Problem

Each of the six product feature tabs shows a video thumbnail with a play button and the
caption "Watch the video". The button has no click handler, so nothing happens. It also has
no accessible name: it contains a single `<img alt="">`, so a screen reader announces an
unlabelled button.

The repository contains no video files and references no external video URL.

## Decision

The button opens a modal that is fully functional but shows a placeholder in place of a
real video. The mechanics are real; the footage is not.

This was chosen over embedding YouTube (needs a URL, pulls in a third-party script and
cookies) and over shipping a local MP4 (needs a file, and video is heavy for a repository
served from GitHub Pages).

## Approach

Use the native `<dialog>` element with `showModal()`.

The browser supplies focus trapping, `Esc` to close, the `::backdrop` pseudo-element,
inertness of the page behind the dialog, and returning focus to the element that opened it.
A hand-rolled `<div>` overlay would need all of that written by hand — roughly 60 lines
instead of 15, each an opportunity to get accessibility wrong.

Support: Chrome 37+, Firefox 98+, Safari 15.4+.

## Markup

One dialog for the whole page, appended at the end of `<body>`. Its title is filled in when
it opens, so six near-identical dialogs are not needed.

```html
<dialog class="video-modal" id="videoModal" aria-labelledby="videoModalTitle">
    <h2 class="video-modal__title" id="videoModalTitle"></h2>
    <div class="video-modal__stage">Video coming soon</div>
    <button class="video-modal__close" type="button" aria-label="Close">×</button>
</dialog>
```

Each of the six play buttons gains `aria-label="Watch the video"`, fixing the missing
accessible name.

## Behaviour

The dialog title comes from the panel that owns the clicked button. Every panel already has
a `.tab__content--title` carrying the feature name, so the strings are not duplicated into
`data-` attributes.

```js
const panel = btn.closest('.features__tab__content-item');
title.textContent = panel.querySelector('.tab__content--title').textContent;
modal.showModal();
```

Closing works three ways:

1. the close button, calling `modal.close()`
2. `Esc`, handled by the browser
3. a click on the backdrop, detected by `event.target === modal` — clicks on the dialog's
   children do not match, so only the surrounding area closes it

Focus returns to the play button that opened the dialog. The browser does this; no code.

## Error handling

If `showModal` is unavailable, the click handler returns instead of throwing. The button
then does nothing, which is the current behaviour, rather than logging a `TypeError`.

The lookups for the panel and its title are structural — every play button sits inside a
panel that has a title — so they are not defended against. If that stops being true the
markup itself is broken, and a silent guard would hide it.

## Styling

The dialog uses the existing palette variables (`--bg-color`, `--text-color`,
`--heading-color`), so both colour schemes work without theme-specific rules.

`::backdrop` gets a translucent dark wash. The placeholder stage reuses
`images/video_cover.jpg` as a background with the caption over it, so it reads as a frame
rather than an empty box.

Any open/close animation is wrapped in `prefers-reduced-motion: no-preference`.

## Verification

- open from each of the six play buttons; the title matches that tab's feature
- close via button, `Esc`, and backdrop click
- clicking inside the dialog does not close it
- focus returns to the opening button
- light and dark schemes
- console clean

## Out of scope

Real video content, per-tab footage, autoplay, and analytics. The "BUY NOW", cart, GO and
newsletter submit controls remain inert; they are separate work.
