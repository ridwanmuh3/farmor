# Farmor Design System

## Overview

Farmor is a light, farm-fresh marketplace design system for agriculture, plantation, and livestock sellers and buyers. The palette is green-led on a soft off-white surface: green drives every primary action, lime and amber carry accents, and the light background keeps text readable for the 16–65 audience. Every rule below is implemented in `apps/mobile/src/presentation/theme/tokens.css`; that file is the source of truth.

---

## Colors

- **Primary** (#5B8C2A): Brand, borders, focus rings
- **Primary Strong** (#4A751F): Button and active-chip fill; white text (5.4:1)
- **Primary Dark** (#3B5C14): Text and icons on light surfaces (5.2–5.4:1), deep brand gradients
- **Primary Text** (#4A751F): Green text and links on white/card surfaces
- **Primary Soft** (#E5F0A0): Selection, soft badges
- **Lime** (#B5C76A): Secondary accent (dots, promo badge)
- **Lime Soft** (#DBEAA0): Soft lime fills
- **Surface** (#F7FBF2): App background
- **Card** (#FFFFFF): Card and control background
- **Text** (#1A1A1A): Body and headings
- **Muted** (#666666): Secondary text
- **Muted 2** (#9CA3AF): Disabled and placeholder
- **Line** (#E5E7EB): Borders and dividers
- **Success** (#15803D): Completed, online, correct
- **Success Soft** (#F0FDF4): Success backgrounds
- **Warning** (#B45309): Almost due, reminders
- **Warning Soft** (#FFFBEB): Warning backgrounds
- **Error** (#DC2626): Missed tasks, incorrect, destructive
- **Info** (#1D4ED8): Tips, hints
- **Info Soft** (#EFF6FF): Info backgrounds
- **On Primary** (#FFFFFF): Text and icons on primary fill
- **Heart on Dark** (#FCA5A5): Saved-heart icon over dark photo scrims

Do not use pure black or pure white as a page background; the surface is always #F7FBF2.

---

## Typography

- **Font**: Inter Variable (self-hosted via `@fontsource-variable/inter`, latin subset, weight axis only, 48 KB). Fallback: `-apple-system`, `Segoe UI`, Roboto, sans-serif.

The scale is named by role, so the same role never differs between screens. Text floor is 12px.

- **display**: 24px, 700, line height 1.15 — screen titles
- **title-screen**: 20px, 700, line height 1.25 — screen titles with a back action
- **title-hero**: 22px, 700, line height 1.25 — screen titles without a back action
- **title**: 16px, 700, line height 1.25 — section titles
- **body**: 15px, 400, line height 1.55 — product names, body text
- **label**: 13px, 600, line height 1.25 — form labels, chips
- **meta**: 12px, 500, line height 1.45 — seller, city, unit, rating
- **input**: 16px, 400, line height 1.25 — form fields (16px prevents iOS Safari zoom-on-focus)
- **tab-label**: 11px, 600, line height 1.2 — bottom tab labels

Line heights are per role: display 1.15, tight 1.25 (titles, controls), meta 1.45, body 1.55.

---

## Spacing

Base unit: 4px. Named by role so the same role never drifts between screens.

- **space-1** (4px): inside one group — rows that are a single unit
- **space-2** (8px): between sibling elements
- **space-3** (12px): between distinct groups
- **space-4** (16px): between cards / sections
- **space-5** (20px): screen padding
- **space-6** (24px): gap between large blocks
- **space-7** (32px): auth screens — top and bottom padding

Rhythm comes from tight-vs-loose contrast, not one uniform value. Do not flatten it.

### Layout rules

- **Screen padding**: 20px horizontal. Content sits in `.ff-screen`.
- **Card padding**: 16px. A card used as a list container sets padding to 0 and pads each row 14px 16px.
- **Grid**: two columns, gap 12px. Column width `minmax(0, 1fr)` so columns stay equal; cards set `min-width: 0`.
- **Row**: `display: flex`, `align-items: center`, `justify-content: space-between`, gap 12px.
- **Stack**: `display: flex`, `flex-direction: column`, gap 12px.
- **Screen top**: 16px on standard screens, 24px on centered/receipt screens, 32–40px on auth screens.
- **Screen bottom**: leave `.ff-safe-bottom` — 88px plus `env(safe-area-inset-bottom)` — so the fixed tab bar never covers content.
- **Section gap**: 16px between cards, 12px between rows inside a card.
- **Chip row**: horizontal scroll, gap 8px, 4px side padding for the focus ring.
- **Tap targets**: minimum 44px (`.ff-touch`). Visual glyph may be smaller — e.g. a 34px circle inside a 44px hit area.

## Border Radius

- **radius-input** (12px): Inputs, buttons, chips
- **radius-card** (20px): Cards, modals
- **radius-pill** (999px): Chips, badges, achievement pills
- **radius-circle** (50%): Avatars, round icon buttons

## Elevation

Shadows, not glows. Both are subtle and green-tinted.

- **shadow**: `0 10px 12px rgba(91, 140, 42, 0.15)` — primary buttons

Cards do not use shadows; they sit on the surface with a 1px border.

---

## Components

### Buttons

- **Primary (`.ff-btn`)**: Full width, 52px minimum height, 12px radius, green (#4A751F) fill, white text, 16px/700, green shadow. Disabled: #E5E7EB fill, muted text, no shadow, `not-allowed`.
- **Ghost (`.ff-btn-ghost`)**: White fill, primary-dark (#3B5C14) text, 2px primary border, no shadow. Used for secondary actions.

### Chips

Pill-shaped, 8px 16px padding, 44px minimum height, 13px/600. Default: white fill, 1px border, body text.

- **Active** (`aria-pressed="true"`): primary-strong (#4A751F) fill and border, white text.
- **Disabled**: #E5E7EB fill and border, muted text, `not-allowed`.

### Badges (`.ff-badge`)

Inline-flex, 10px radius, 5px 10px padding, 12px/600, no wrap. Tones:

- **soft**: #E5F0A0 fill, #3B5C14 text
- **solid**: #4A751F fill, #FFFFFF text
- **amber**: #FFFBEB fill, #B45309 text
- **info**: #EFF6FF fill, #1D4ED8 text

Order-status badges use the same shape with status colors (success/warning/error/neutral).

### Cards (`.ff-card`)

White background, 1px #E5E7EB border, 20px radius, 16px padding, `min-width: 0`. No shadow.

### Inputs (`.ff-input`)

White background, 1px #E5E7EB border, 12px radius, 14px 16px padding, 16px text, 1.25 line height. Focus: 2px primary outline at -1px offset. Placeholder uses muted.

- **Labels** (`.ff-label`): 13px/600 in muted, 4px bottom margin.
- **Helper / error text**: 12–13px; error uses the error color.
- **Selects**: reuse `.ff-input`.
- **Checkboxes**: native, 20px, `accentColor` primary, 44px minimum row height.

### Lists

Card container with padding 0; each row is 14px 16px with 1px dividers. Rows use `.ff-row` for the leading/trailing split.

### Divider (`.ff-divider`)

1px #E5E7EB, 12px vertical margin.

### Thumbnails (`.ff-thumb`)

16px radius, `object-fit: cover`, line-colored background. Product cards use 14px radius.

### Qty Stepper

Two `.ff-chip` buttons (− / +) at 44px minimum, value centered at 24px, 600 weight.

### Empty State (`.ff-empty`)

Centered, 48px 24px padding, muted, body line height.

### Confirmation (`Confirm` / `ConfirmBtn`)

Any action that is hard to undo — rejecting an order, signing out, confirming
receipt, clearing the cart — goes through `ConfirmBtn`. The first tap reveals an
inline `.ff-card` with a danger border, a one-line consequence, then Batal and a
confirm button. No modal: an overlay blocks the screen and the Cancel target for
older users, and inline keeps the action in place instead of moving it.

`Confirm` renders `role="alertdialog"` so screen readers announce it on reveal.

### Utilities

- **`.ff-touch`**: 44px minimum hit area for small glyph controls.
- **`.ff-num`**: `font-variant-numeric: tabular-nums` for prices and ratings.
- **`.ff-sr`**: visually hidden, for `role="status"` announcements (add-to-cart, save confirmations).

---

## Do's and Don'ts

1. **Do** use green (#4A751F) for primary call-to-action buttons; it is the only primary action color.
2. **Do** keep text large and readable — minimum 14px body, 12px metadata.
3. **Do** keep every tap target at least 44px (`.ff-touch`).
4. **Do** keep the light surface (#F7FBF2); never use pure white or pure black as a page background.
5. **Do** use `font-variant-numeric: tabular-nums` (`.ff-num`) for prices and ratings that stack in a column.
6. **Do** verify text against its background for at least 4.5:1 contrast.
7. **Don't** use error red (#DC2626) for anything other than truly irreversible actions.
8. **Don't** ship a button that does nothing. If a capability is not built yet, either remove the control or have it state plainly that the feature is unavailable.
9. **Don't** show a number the app cannot actually compute — a fake distance, a hardcoded status, a promo that does not exist. Show what is known, or nothing.
10. **Don't** introduce a shadow on cards; the border defines the surface.
11. **Don't** use one uniform gap everywhere; alternate tight and loose to create rhythm.
12. **Don't** add fonts or colors outside this system; extend the tokens in `tokens.css` instead.
