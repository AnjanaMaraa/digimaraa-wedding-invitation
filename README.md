# Palaniakash &amp; Bharu — Digital Wedding Invitation

A premium, mobile-first digital wedding invitation built with **HTML5, CSS3 and
vanilla JavaScript only**. No framework, no build step, no dependencies.

Open `index.html` in a browser and the site works.

---

## File structure

```
/
├── index.html              All markup (13 sections, semantic + accessible)
├── css/
│   └── style.css           Design system, components, responsive rules
├── js/
│   └── script.js           All interactions (plain ES5-compatible JS)
├── assets/
│   ├── images/
│   │   ├── mangalyam.jpeg  Couple story photo (supplied by the couple)
│   │   └── garland.jpeg    Venue photo (supplied by the couple)
│   └── icons/              Reserved — icons are inline SVG (see below)
└── README.md
```

Icons are **inline SVG** (`<symbol>` sprite at the top of `index.html`), so no
icon font or SVG file is required. Decorative hero art (chandelier, lanterns,
floral sprigs) is also inline SVG, which keeps the DOM small and crisp on all
screen densities.

---

## 1. Replacing the hero image (one URL only)

The hero background is controlled by a single CSS custom property at the top of
`css/style.css`:

```css
:root {
  /* ↓↓↓ REPLACE THIS ONE URL ↓↓↓ */
  --hero-image: url("https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1800&q=70");
  --hero-position: center 42%;
}
```

* Replace the value inside `url("...")` — nothing else needs to change.
* The layout, overlays, vignette and framing are all CSS, so any image works.
* Recommended: portrait-friendly source (e.g. 1800 × 2400 or wider), 9:16-ish
  framing, plum/violet background, gold decor, pink & white flowers.
* `--hero-position` controls the crop (`center`, `top`, `center 30%`, …) on
  small screens where the source is cropped hard.
* To ship the final image locally, drop it in `assets/images/` (for example
  `hero.jpg`) and use:

```css
--hero-image: url("../assets/images/hero.jpg");
```

The image is **never** embedded as a base64 string and never duplicated in
another file.

### Current images

**Supplied by the couple (self-hosted, in the repo):**

| Where | File | Size | Notes |
| --- | --- | --- | --- |
| Couple story / welcome section | `assets/images/mangalyam.jpeg` | 90 KB | 683 × 1058 (portrait). Lazy-loaded. `.frame--portrait` uses this exact ratio, so the photo is never cropped. |
| Venue & location | `assets/images/garland.jpeg` | 122 KB | 736 × 1308 (9:16 portrait). Lazy-loaded. `.frame--tall` uses this exact ratio, so the photo is never cropped. The frame is capped at `28rem` wide so a 9:16 image does not dominate the section. |
| Hero background | `assets/images/` → see below | — | Currently still a remote stock placeholder |

**Stock placeholders (Unsplash, free-to-use licence — replace before launch):**

| Where | Placeholder URL | File |
| --- | --- | --- |
| Hero background (CSS variable) | `images.unsplash.com/photo-1519225421980-715cb0215aed` | `css/style.css` |
| Open Graph / Twitter share image | `images.unsplash.com/photo-1519225421980-715cb0215aed` | `index.html` |

> There is currently no Unsplash photo in the page body — only the hero
> background and the social share image remain as stock placeholders.

### Frame ratio classes

Frames use `object-fit: cover`, so the CSS ratio must match the photo's real
ratio or the photo gets cropped. Add a class per ratio rather than stretching:

| Class | Ratio | Use for |
| --- | --- | --- |
| `.frame` | 3 / 2 | landscape photos |
| `.frame--portrait` | 683 / 1058 | the couple story photo |
| `.frame--tall` | 736 / 1308 | 9:16 phone-format photos |

Content images are lazy-loaded with `decoding="async"` and explicit
`width`/`height`, so there is no layout shift. If an image ever fails to load,
`script.js` adds `.is-missing` to its frame and the CSS falls back to a
plum/gold gradient instead of showing a broken-image icon.

### Adding more of your own photos

1. Drop the file into `assets/images/`.
2. Read its true pixel dimensions (needed for `width`/`height` and to pick the
   right frame ratio so nothing is cropped).
3. Point the `<img src>` at it and update `alt` with a real description of what
   the photo shows.

---

## 2. Configuration (top of `js/script.js`)

```js
// Ceremony: 30 November 2026, 10:00 AM, in the event's local time.
var WEDDING_DATE = { year: 2026, month: 10, day: 30, hour: 10, minute: 0, second: 0 };
var WEDDING_UTC_OFFSET_HOURS = 5.5;   // 5.5 = IST. Use 0 for UTC.

// "Get Directions" button target — any Google Maps search URL.
var venueMapUrl = 'https://www.google.com/maps/search/?api=1&query=The+Grand+Palace+Hall%2C+Abc+road%2C+xyz+city%2C+123456';

// RSVP backend. Empty string = local demo mode (no data leaves the browser).
var RSVP_ENDPOINT = '';
```

* **Countdown** is calculated in JavaScript from `WEDDING_DATE` using
  `Date.UTC(...) - offset` so the ceremony time is treated as the *event's local
  time*, not the visitor's. When the timer reaches zero the grid is replaced by
  “Today is the day!”.
* **RSVP** — with `RSVP_ENDPOINT = ''` the form validates in the browser and
  shows a local confirmation; the on-screen note states plainly that nothing is
  sent to a server. Set `RSVP_ENDPOINT` to a URL and the same payload
  (`{ name, attendance, wishes }`) is `POST`ed as JSON with `fetch()`.
  Never put API keys or secrets in frontend JavaScript.

---

## 3. Design system

Tokens live in `:root` (`css/style.css`):

| Token | Value | Use |
| --- | --- | --- |
| `--color-violet` | `#3A263F` | Primary plum, headings, dark sections |
| `--color-violet-dark` | `#24172A` | Footer, gradient depth |
| `--color-gold` | `#D4AF37` | Rules, borders, ornaments |
| `--color-gold-soft` | `#E8C978` | Gold on dark backgrounds |
| `--color-pink` | `#F6D6DE` | Pastel floral accents |
| `--color-hot-pink` | `#E94F83` | Hearts, highlights |
| `--color-rose` | `#B86A7A` | Muted rose secondary text |
| `--color-white` | `#FFFDF9` | Type on plum |
| `--color-text` | `#352A34` | Body copy |

**Fonts (3 families, Google Fonts):** `Great Vibes` (names & script),
`Cormorant Garamond` (editorial body), `Montserrat` (small-caps labels).

Reusable classes: `.section`, `.container`, `.section-title`,
`.section-subtitle`, `.gold-divider`, `.floral-card`, `.event-card`,
`.timeline`, `.timeline-item`, `.primary-button`, `.secondary-button`,
`.icon-button`, `.modal`, `.form-group`, `.input`, `.footer`.

---

## 4. Sections

1. Hero · 2. Wedding introduction · 3. Couple story / welcome ·
4. Pre-wedding events · 5. Wedding day + countdown · 6. Reception ·
7. Venue & location · 8. Transportation · 9. Accommodation ·
10. Dress code · 11. Gift note · 12. RSVP · 13. Closing blessing ·
14. Footer credit

---

## 5. Responsive behaviour

Mobile-first. Verified breakpoints: **320, 375, 390, 412, 430, 768, 820, 1024,
1280, 1440, 1920 px**.

* Hero uses `100svh` (with a `100vh` fallback) and clamps name size to viewport
  width, so names stay dominant from 320 px to 1920 px.
* Wedding-day timeline is **vertical on mobile**, horizontal from 768 px.
* Cards collapse to a single column; the nav becomes a slide-down panel below
  992 px with an `aria-expanded` toggle and Escape-to-close.
* Decorative art scales with `clamp()`; no horizontal overflow at any width
  (`overflow-x: hidden` on `body` as a safety net).

---

## 6. Accessibility

* Semantic landmarks, one `h1`, ordered heading hierarchy, skip link.
* Every field has a real `<label>` / `<legend>`; errors use `role="alert"` and
  `aria-describedby`; invalid fields get `aria-invalid`.
* Radio choices are visually hidden inputs inside real `<label>`s with visible
  focus rings.
* Modal uses `role="dialog"`, `aria-modal`, focus trap, Escape and backdrop
  close, and returns focus to the trigger.
* `aria-current="true"` marks the active nav item.
* Decorative art and the icon sprite are `aria-hidden`; meaningful images have
  alt text.
* `prefers-reduced-motion: reduce` is honoured (and re-evaluated live): entrance
  animations, the drifting hero image, particles and sparkles are disabled and
  transitions are minimised.

## 7. Performance notes

* No libraries, no animation library, no web fonts beyond 3 families.
* Only **14** particle elements exist in total, created in JS.
* Decorative gradients/textures are pure CSS — no image assets.
* Hero image is a CSS background (no extra DOM node, no layout shift);
  below-the-fold images are lazy-loaded and sized.
* JS is ~9 KB unminified and deferred.

## 8. QA checklist

- [x] No framework, no build process, `index.html` works directly
- [x] CSS and JS load from relative paths (`css/style.css`, `js/script.js`)
- [x] No console errors, no 404s (inline SVG favicon, no missing asset requests)
- [x] No horizontal scrolling at any tested width
- [x] Hero correct on mobile and desktop
- [x] Hero image replaceable via a single CSS variable
- [x] All dates, times, venue, transport, hotel and discount code match the brief
- [x] Copy-code button uses the Clipboard API (with a legacy fallback)
- [x] RSVP validates name (required, ≥ 2 chars) and attendance (required);
      wishes optional
- [x] RSVP never claims a server submission in demo mode
- [x] Shuttle modal, smooth scrolling, countdown, reduced motion, keyboard
      navigation all working
- [x] Footer credit links to https://digimaraa.com
- [x] No Lorem Ipsum, no unused dependencies

---

## Credits

Invitation design &amp; implementation for **Palaniakash &amp; Bharu**.

**Create your own invitation now — [DigiMaraa Technologies](https://digimaraa.com)**

Stock photography placeholders are from Unsplash (free-to-use licence) and must
be replaced with the couple's own final imagery before publishing.
