# Metaverse GO button — design

Date: 2026-08-01
Status: approved, ready for implementation

## Problem

The metaverse block contains a single control:

```html
<div class="metaverse__inner"><button class="metaverse__btn">GO</button></div>
```

It has no click handler, so nothing happens. It has no `type`, so it defaults to `submit`.
Its only accessible name is the word "GO", which says nothing about where it goes.

The block's background image reads "METAVERSE LOADING…". There is no metaverse page in the
project, and the nav's METAVERSE link points at `#`.

Separately, the button is hard to click. `animation: scaleRight 2s linear infinite` runs it
from `scale(0)` to `scale(1.5, 1.3)` forever, so at the start of every two-second cycle the
button collapses to nothing. A control that periodically has zero area cannot reliably be
hit with a pointer.

## Decision

Clicking GO plays out a fake loading sequence ending in a "coming soon" message, then
returns to the resting state. This leans into what the background image already says rather
than inventing a destination that does not exist.

Chosen over opening a modal (the page already got one for the play buttons; a second would
be repetitive) and over scrolling to another section (which would make "GO" mean something
unrelated to the metaverse).

## States

Four, in a cycle:

| State | Duration | Button | Status text |
|---|---|---|---|
| idle | — | enabled, reads GO | empty |
| loading | 2s | disabled | "Entering the metaverse…" |
| done | 2s | disabled | "Coming soon" |
| idle | — | enabled, reads GO | empty |

Both durations are exactly 2000ms. The loading duration is set once, in CSS, as the progress
bar's `animation-duration`; JavaScript learns when it ends from `animationend` and never
hardcodes a matching number. The done duration is the one timeout in the feature.

The button is disabled while loading and done, so repeat clicks cannot restart the sequence
from the middle.

The loading → done transition is driven by the progress bar's `animationend` event, not by a
`setTimeout` covering the whole chain. Background tabs throttle timers, which would drift the
state out of sync with what is on screen; `animationend` fires when the animation actually
finishes. The done → idle step is a plain timeout, since nothing is animating then and a
drift there is harmless.

## Approach

CSS drives the motion, JavaScript drives the state.

A class on the block selects the state; the progress bar's width is a CSS animation; JS
listens for `animationend` and advances. This keeps the movement in CSS, matching how the
rest of the site animates, and holds the JS to roughly twenty lines.

Rejected: incrementing a percentage in `setInterval` (reimplements in JS what CSS does
natively, and needs its own teardown), and a JS-free `:target`/checkbox trick (cannot return
to the resting state, and abuses the semantics).

## Markup

```html
<div class="metaverse__inner">
    <p class="metaverse__status" role="status"></p>
    <button class="metaverse__btn" type="button" aria-label="Enter the metaverse">GO</button>
</div>
```

`role="status"` gives an implicit `aria-live="polite"`, so a screen reader announces both the
loading text and "Coming soon" without interrupting whatever the user is doing. The status
paragraph is empty at rest, which keeps it silent until there is something to say.

`type="button"` stops the default `submit` behaviour.

## The progress bar

A pseudo-element on the status paragraph rather than another element in the markup — it
carries no meaning of its own, and the announcement is the status text.

Its width animates from 0 to 100% over the loading duration. It is invisible outside the
loading state.

## Fixing the existing animation

`scaleRight` is replaced. The button must never drop below its full size, or it cannot be
clicked. The replacement pulses gently above the resting size.

The pulse is wrapped in `@media (prefers-reduced-motion: no-preference)`, so it does not run
for users who asked for less motion.

The progress bar fill is NOT wrapped in that guard. It communicates state rather than
decorating, and removing it would leave those users with no feedback at all. Its duration
stays the same for everyone.

## Error handling

None required: no I/O, no external calls, nothing that can fail. The sequence is a fixed
local state machine.

If the same element is somehow clicked while already loading, the disabled attribute
prevents it; no additional guard is written for a case the browser already blocks.

## Verification

- click GO: status announces the loading text, the bar fills, the button is disabled
- at the end: status reads "Coming soon", bar hidden
- after the pause: back to GO, button enabled, status empty, and it can be clicked again
- the button is never smaller than its resting size at any point in its idle animation
- with reduced motion set: the pulse does not run, the loading sequence still works
- `role="status"` region is present and updated, not replaced
- light and dark schemes
- console clean

## Out of scope

A real metaverse destination. The nav's METAVERSE link stays as it is. The "BUY NOW", cart
and newsletter controls remain inert; they are separate work.
