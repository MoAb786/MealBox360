# Mealbox Design System
> Extracted from reference UI · Grocery/Food App aesthetic · Natural, warm, organic

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#F0EDE4` | App background (warm off-white) |
| `--color-surface` | `#FAFAF5` | Card / panel surface |
| `--color-surface-alt` | `#EBEBE6` | Nutrition chips, muted backgrounds |
| `--color-primary` | `#4A6B3A` | Primary buttons, icons, borders, links |
| `--color-primary-dark` | `#3A5530` | Button hover / pressed state |
| `--color-accent` | `#E8C132` | Discount badge, price highlight, star rating |
| `--color-accent-dark` | `#C9A820` | Accent hover state |
| `--color-text-primary` | `#1C1C1A` | Headlines, bold labels |
| `--color-text-secondary` | `#6B6B65` | Body text, captions, sub-labels |
| `--color-text-muted` | `#9E9E96` | Strikethrough price, disabled text |
| `--color-divider` | `#DDDDD5` | Horizontal rules, card separators |
| `--color-shadow` | `rgba(60,60,40,0.10)` | Card drop shadow |

---

## Typography

**Font Family:** `'DM Sans', 'Inter', sans-serif`
- DM Sans is preferred — friendly, rounded, food-brand appropriate
- Fall back to Inter, then system sans-serif

| Scale Token | Size | Weight | Usage |
|---|---|---|---|
| `--text-xs` | 11px | 400 | Nutrition unit labels, tiny captions |
| `--text-sm` | 13px | 400 | Body copy, description text |
| `--text-base` | 15px | 400 | Default UI text |
| `--text-md` | 17px | 600 | Section headers (e.g. "Description") |
| `--text-lg` | 22px | 700 | Product/item title |
| `--text-xl` | 28px | 700 | Price display |
| `--text-2xl` | 32px | 800 | Hero numerics |

**Line height:** 1.5 for body, 1.2 for headings  
**Letter spacing:** Normal for body; `-0.3px` for large headings

---

## Spacing & Layout

| Token | Value | Notes |
|---|---|---|
| `--space-xs` | 4px | Inline gaps, icon-to-text gaps |
| `--space-sm` | 8px | Chip internal padding |
| `--space-md` | 16px | Section padding, card inner padding |
| `--space-lg` | 24px | Between major sections |
| `--space-xl` | 32px | Top/bottom of page padding |

**Max content width:** `420px` (mobile-first; centers on wider screens)  
**Horizontal page padding:** `20px` left + right  
**Alignment:** Content is **left-aligned** by default; product name and star rating are **centered**

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Nutrition chips, small tags |
| `--radius-md` | `12px` | Quantity buttons, badge pills |
| `--radius-lg` | `18px` | Product image card |
| `--radius-xl` | `28px` | Full-width CTA button |
| `--radius-full` | `999px` | Pill badges (discount tag) |

---

## Component Patterns

### Top Navigation Bar
- Left: `←` back chevron + bold page title (e.g. "Product" → "Mealbox")
- Right: cart icon + bell icon, both in `--color-primary`
- Bottom border: 1px `--color-divider`
- Height: `56px`; content vertically centered

### Product / Item Image Card
- Background: `--color-surface`
- Border radius: `--radius-lg`
- Padding: `16px`
- Discount badge: top-left, `--color-accent` background, white or near-black text, `--radius-full`, bold `font-weight: 700`
- Rating row: top-right, star icon `--color-accent`, rating text in `--color-text-primary`, rating count in `--color-text-secondary`, heart icon outlined in `--color-primary`

### Item Title
- Centered, `--text-lg`, `font-weight: 700`, `--color-text-primary`
- Margin top: `--space-md` from image card

### Nutrition Chips (4-column grid)
- Grid: `display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px`
- Each chip: `background: --color-surface-alt`, `border-radius: --radius-sm`, `padding: 10px 6px`, centered text
- Top line: bold number `--text-md`
- Bottom line: label `--text-xs`, `--color-text-secondary`

### Section Header (e.g. "Description", "Nutrition value per 100g")
- `--text-md`, `font-weight: 700`, `--color-text-primary`
- Margin bottom: `--space-xs`

### Description / Body Text
- `--text-sm`, `--color-text-secondary`, `line-height: 1.6`
- Max 2 short paragraphs before a "Show more" link

### Price Row
```
[ PRICE BADGE ]   [ − ]  [ QTY ]  [ + ]
```
- Price badge: `--color-accent` background, large bold text `--text-xl`, `border-radius: --radius-sm`
- Strikethrough original price: `--text-sm`, `--color-text-muted`, `text-decoration: line-through`
- Quantity buttons: `--color-primary` background, white text, `--radius-sm`, `40px × 40px`
- Quantity display: `--color-surface-alt` background, `--text-md`, `font-weight: 700`, `40px × 40px`, `--radius-sm`
- All three quantity elements spaced with `--space-sm` gap

### Total Row
- Right-aligned
- Label: `--text-base`, `--color-text-secondary`, `"Total:"`
- Amount: `--text-xl`, `font-weight: 700`, `--color-text-primary`
- Top border: 1px `--color-divider`

### Primary CTA Button ("Add to Cart" / "Find Recipes")
- Full width, `height: 56px`
- Border: `2px solid --color-primary`
- Background: transparent (outlined style) **or** `--color-primary` (filled)
- Text: `--text-md`, `font-weight: 600`, `--color-primary` (outlined) or white (filled)
- Border radius: `--radius-xl`
- Pressed state: `background: --color-primary`, text white

---

## Iconography

- **Style:** Outlined / stroke-based, 2px stroke weight
- **Color:** `--color-primary` for nav icons; `--color-accent` for star/rating
- **Size:** `24px` for nav bar; `16px` for inline/label icons
- **Recommended library:** Lucide Icons (open-source, matches the stroke weight)

---

## Shadows & Elevation

```css
/* Card elevation (main content card) */
box-shadow: 0 4px 20px var(--color-shadow);

/* Button pressed / active */
box-shadow: 0 2px 8px rgba(74,107,58,0.25);
```

---

## Dividers

- Horizontal rule between major sections: `1px solid --color-divider`
- No decorative dividers — only used to separate interactive zones (price row, CTA)

---

## Motion & Interaction

- Keep animations minimal and purposeful
- Button press: `transform: scale(0.97)`, `transition: 100ms ease`
- Quantity counter change: `transition: opacity 80ms ease`
- No auto-playing animations or scroll effects

---

## Dark Mode Note

This design system is **light-mode first**. If dark mode is needed:
- Swap `--color-bg` → `#1E1E18`
- Swap `--color-surface` → `#2A2A22`
- Keep `--color-primary` and `--color-accent` as-is (they hold well on dark)
- Swap text tokens to near-white accordingly

---

## CSS Custom Properties (Ready to Paste)

```css
:root {
  /* Colors */
  --color-bg:            #F0EDE4;
  --color-surface:       #FAFAF5;
  --color-surface-alt:   #EBEBE6;
  --color-primary:       #4A6B3A;
  --color-primary-dark:  #3A5530;
  --color-accent:        #E8C132;
  --color-accent-dark:   #C9A820;
  --color-text-primary:  #1C1C1A;
  --color-text-secondary:#6B6B65;
  --color-text-muted:    #9E9E96;
  --color-divider:       #DDDDD5;
  --color-shadow:        rgba(60,60,40,0.10);

  /* Typography */
  --font-family: 'DM Sans', 'Inter', sans-serif;
  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 15px;
  --text-md:   17px;
  --text-lg:   22px;
  --text-xl:   28px;
  --text-2xl:  32px;

  /* Spacing */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;

  /* Radius */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   18px;
  --radius-xl:   28px;
  --radius-full: 999px;
}
```

---

## Design Prompt (for AI-Assisted UI Updates)

Use the block below as a prompt when passing this design system + the reference image to an AI tool for UI generation or refactoring:

```
You are updating the UI of "Mealbox" — a mobile app where users enter ingredients 
they have at home (vegetables, spices, dairy, etc.) and receive recipe suggestions.

Refer to:
1. The attached reference image (grocery product-detail screen) for visual tone, 
   spacing, and component style.
2. The Mealbox design system document (mealbox-design-system.md) for all exact 
   tokens: colors, type scale, radii, spacing, and component patterns.

Design rules:
- Use the warm off-white background (#F0EDE4) and forest-green primary (#4A6B3A)
  as the dominant palette.
- Use the golden accent (#E8C132) sparingly: badges, highlights, active states.
- Typography: DM Sans, sentence case throughout, no ALL-CAPS labels.
- Corners: always rounded per the radius tokens; nothing sharp.
- Buttons: full-width pill shape for primary CTAs, square-rounded for controls.
- Layout: mobile-first, max 420px content width, 20px horizontal padding.
- Icons: Lucide outlined style, 24px nav / 16px inline.
- Ingredient chips should mirror the "Nutrition chip" 4-col grid pattern.
- Recipe cards should use the surface card pattern with a badge and image.
- Keep motion minimal: only action-response transitions (tap feedback, etc.).
- Tone of copy: friendly, direct, food-positive (e.g. "What's in your kitchen?" 
  not "Enter ingredients").
```
