# MealBox360 — Mobile UI Design Specification

**Purpose:** UI-only implementation brief for the existing MealBox360 Expo / React Native application.  
**Visual references:** the two grocery-app screenshots supplied with this brief.  
**Supporting design reference:** the supplied `DESIGN.md` (Oracle Analysis).  
**Implementation boundary:** update the mobile interface, navigation presentation, reusable visual components and frontend-only interactions. Do not implement or redesign backend APIs, database schemas, authentication services, recommendation algorithms or grocery integrations in this task.

---

## 1. Design direction

MealBox360 should feel like a polished, modern food and pantry companion. Use the uploaded grocery-app screenshots as the primary visual reference:

- Deep forest-teal header areas with a soft curved lower edge.
- Bright, clean, almost-white content surfaces.
- Fresh lime-green for selected states and prominent actions.
- Rounded search fields, category tiles, food cards and quantity steppers.
- Real food photography or clear food illustrations as the main visual content.
- Horizontal category navigation and horizontally scrollable product / recipe rails.
- A compact floating-style bottom navigation bar with clear active state.
- Strong visual hierarchy, generous whitespace and short, scannable labels.

The app is **MealBox360**, not a grocery checkout clone. Translate the reference patterns into the existing product purpose:

- Grocery categories become pantry ingredient categories.
- Grocery product cards become ingredient cards with pantry quantity and stock status.
- Product detail becomes ingredient detail, with pantry quantity controls and recipe ideas.
- The shopping cart becomes a pantry action / pantry count indicator in this UI phase.
- Purchase, delivery, vendor comparison and checkout flows are not part of this UI task.
- Keep the already planned recipe recommendation experience central: “Cook Now” and “Almost There”.

### Design reference reconciliation

The supplied `DESIGN.md` describes an Oracle-inspired enterprise system: warm neutral surfaces, disciplined type hierarchy, a small spacing scale, restrained decoration and minimal elevation. Retain the useful foundations from it:

- A consistent spacing rhythm based around 8px increments.
- Clear type hierarchy with readable body text and compact captions.
- Muted neutral surfaces, thin dividers and uncluttered layouts.
- Consistent component variants rather than one-off styling.
- Avoid visual noise, excessive gradients and heavy shadows.

However, the **uploaded grocery screenshots take priority for the app's visual identity**. Adapt rather than copy Oracle-specific styling:

- Use forest teal and lime instead of Oracle charcoal / red / gold.
- Use a clean sans-serif such as Inter (or the project's existing sans font), not Georgia display serif.
- Use rounded mobile cards and pills as shown in the screenshots.
- A very subtle elevation is acceptable for floating navigation or overlays, but avoid heavy card shadows.
- Do not use Oracle red as a brand color and do not reproduce Oracle web mastheads or desktop page bands.

---

## 2. Visual design tokens

Use these as the shared source of truth. Define them in one theme file (for example `src/theme/tokens.ts` or the project's existing theme location). Do not scatter raw hex values through screen components.

### 2.1 Color palette

| Token | Value | Usage |
|---|---|---|
| `forest` | `#003B36` | Main header, dark top section, strong dark surfaces |
| `forestDeep` | `#002E2A` | Header depth / pressed dark surface |
| `forestSoft` | `#15564D` | Secondary dark-green accents, icon detail |
| `lime` | `#B9ED62` | Active tab, primary positive action, selected chip, quantity stepper |
| `limeSoft` | `#EAF7D5` | Selected backgrounds, low-emphasis success surfaces |
| `mint` | `#DDECE5` | Soft decorative band or secondary surface |
| `page` | `#F5F7F5` | Main app background |
| `surface` | `#FFFFFF` | Cards, search fields, sheets and content surfaces |
| `surfaceSoft` | `#FBFCFA` | Subtle secondary background |
| `ink` | `#102D29` | Primary text and headings |
| `muted` | `#74827D` | Supporting text, metadata, placeholders |
| `mutedLight` | `#A4AEA9` | Disabled / tertiary text |
| `border` | `#E5ECE7` | Card outlines and separators |
| `promo` | `#B84A27` | Optional warm promotional banner only; do not overuse |
| `warning` | `#D99A37` | Expiry / caution indicators |
| `danger` | `#C94B43` | Expired / destructive states and validation errors |
| `success` | `#347B54` | Confirmed positive status |

Rules:
- The dark forest header is the main brand signature.
- Lime is the strongest interaction accent; reserve it for selection and primary positive actions.
- Keep text contrast strong. Do not use lime text on white for small labels.
- Avoid introducing extra bright colors for decorative reasons.
- A warm promotional orange is allowed only for an occasional banner similar to reference image 1.

### 2.2 Typography

Use the current project font if it is already configured; otherwise use a clean sans-serif such as Inter. Do not add a font dependency unless necessary and compatible with the current Expo SDK.

| Role | Size | Weight | Usage |
|---|---:|---:|---|
| Screen title | 22–24 | 700 | Page title in dark header |
| Section heading | 18–20 | 700 | “Pantry categories”, “Cook now”, “You might need” |
| Card title | 14–16 | 600–700 | Ingredient or recipe name |
| Body | 14–16 | 400 | Descriptions and primary information |
| Label | 12–13 | 500–600 | Category names, status, tabs |
| Caption | 11–12 | 400 | Weight, prep time, secondary metadata |
| Price / metric emphasis | 19–22 | 700 | Only when real data is present; don't invent prices |

Typography rules:
- Use sentence case, concise labels and natural language.
- Use bold weight for headings rather than excessive font-size changes.
- Keep body line-height around 1.4–1.5.
- Do not use all-caps section headings.

### 2.3 Spacing

Retain the spacing discipline from the supplied `DESIGN.md`:

| Token | Value |
|---|---:|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 20px |
| `2xl` | 24px |
| `3xl` | 32px |
| `section` | 24–32px |
| `screenGutter` | 16–20px |

Use a consistent 16px horizontal screen gutter on normal phones. Use 12–16px between cards and 20–28px between major sections. Respect safe areas and do not let the bottom navigation cover scroll content.

### 2.4 Shape and elevation

| Element | Radius |
|---|---:|
| Search field / pill | 24–28px or fully rounded |
| Category tile | 12–16px |
| Ingredient / recipe card | 14–18px |
| Promo tile | 14–18px |
| Primary button | 14–18px |
| Quantity stepper | Fully rounded |
| Bottom navigation container | Fully rounded |
| Image frame | 12–16px |

- Cards should be white on a very light background with a subtle border.
- Do not add thick outlines.
- Avoid strong drop shadows. If required for the floating bottom bar, use a faint, low-blur shadow only.
- Use consistent icon stroke weight and size.

---

## 3. App navigation and information architecture

Build or adapt the frontend navigation to expose these primary destinations. Reuse the navigation library already installed in the project. Do not replace the app architecture just to match this document.

### Bottom navigation

Use a compact rounded bottom navigation bar inspired by the screenshots. It should sit above the device bottom safe area and remain visible on primary app screens.

Recommended tabs:

1. **Home** — overview, category shortcuts and recommendations.
2. **Pantry** — all saved ingredients and quantities.
3. **Discover** — recipe recommendations and browsing.
4. **Saved** — bookmarked recipes.
5. **History** — meals cooked recently.

If the current project has a four-tab navigation structure, keep four tabs and place History inside Profile or Pantry rather than forcing an unnecessary navigation rewrite. Use familiar line icons; active icon and/or small active background uses `limeSoft` / `lime`.

The cart icon in the reference is only a visual cue for a quick-access utility. In MealBox360, replace it with a pantry icon or pantry-item count. Do not add checkout/cart behavior in this UI-only phase.

### Screen list

Implement the three reference-led screens first, then style the core MealBox recipe screens so the whole app feels coherent:

- Home dashboard.
- Ingredient category / ingredient browser.
- Ingredient detail / add-to-pantry screen.
- Pantry inventory.
- Discover recipes / recommendations.
- Recipe detail.
- Saved recipes.
- Meal history.
- Profile / food preferences, only if the project already has or needs a destination for it.

For this assignment, prioritize visual implementation and navigation between screens. Use existing frontend state and existing API service methods where they already exist. Do not create or change backend endpoints.

---

## 4. Screen 1 — Home dashboard

**Visual reference:** first phone in reference image 2, plus the category overview in reference image 1.

### Layout from top to bottom

1. **Safe area and forest header**
   - Deep forest-teal background.
   - Include a small greeting such as “Good morning” and a stronger title such as “What's in your kitchen?”.
   - Optional location is not required; do not show a fake location.
   - Search pill near the top with a search icon and placeholder: “Search ingredients or recipes”.
   - A circular pantry shortcut on the right can show the pantry item count if available.
   - Shape the bottom of the header with a soft curved / wave-like edge, matching the reference. Use a lightweight React Native layout technique or an already-installed SVG package; do not add a heavy dependency just for the curve.

2. **Quick category shortcuts**
   - Horizontal row of 4–5 round pastel icon/image tiles overlapping or sitting just below the header edge.
   - Suggested categories: Vegetables, Fruits, Grains, Dairy, Protein.
   - Use short labels underneath.
   - Each item navigates to the ingredient browser with that category selected.

3. **Optional lifestyle / tip banner**
   - One broad rounded banner, with a concise message such as “Cook more with what you have” or “Use your fresh ingredients first”.
   - Use a restrained warm accent or pale mint background, not a large ad-like promotion.
   - CTA should lead to Discover or Pantry.
   - Do not show paid membership offers, delivery promises or made-up discounts.

4. **“You might need” / low-stock rail**
   - Section title with a small “See all” action.
   - Horizontal ingredient cards, each containing:
     - Food image or high-quality illustration.
     - Ingredient name.
     - Category or unit (e.g. “Vegetable”, “250 g”).
     - Pantry state such as “Running low”, “Not in pantry”, or “In pantry”.
     - Small add / quantity control.
   - This row should be driven by available frontend data. If the API data is unavailable during UI work, use clearly identified temporary mock objects in one file.
   - Do not show grocery prices or vendor names in this phase.

5. **“Cook now” recipe rail**
   - Section title and “See all”.
   - Horizontal recipe cards with food image, title, prep time, match status and a short label such as “All ingredients available”.
   - Visually prioritize ready-to-cook recipes.

6. **“Almost there” recipe rail**
   - Show recipes that require only 1–2 additional ingredients, consistent with existing product behavior.
   - Clearly list missing items, for example “Need: lemon, coriander”.
   - CTA: “View recipe” or “See what’s missing”.

7. **Bottom navigation**
   - Fixed above safe area, with selected Home state.
   - Ensure scroll content has enough bottom padding so the last card can scroll above it.

### Home screen behavior

- Search should navigate to or filter the existing search experience if one exists.
- Category tiles open the ingredient browser with a selected category.
- Add buttons update the existing pantry state through already available frontend/API calls. If the existing app does not support the action yet, provide a UI-only local state action and clearly mark the integration point in code.
- Recipe cards open Recipe Detail.
- “See all” opens the appropriate list screen.

---

## 5. Screen 2 — Ingredient category / browser

**Visual reference:** second phone in reference image 1, titled “Daily foods”.

### Header

- Deep forest-teal top section.
- Back button in a white circular button at top-left.
- Centered title, e.g. “Fresh ingredients” or the selected category name.
- Optional right-side pantry count icon.
- Horizontal scrollable category tabs below title: All, Fresh, Frozen, Grains, Dairy, Protein, Spices.
- Selected tab text uses lime; unselected tabs use a muted light tone.
- The header ends in the same soft curved lower edge as Home.

### Search

- Large white rounded search field below the header curve.
- Placeholder: “Search ingredients”.
- Search icon at left; clear icon appears when the field has text.

### Ingredient grid

- Two columns on standard phones; a horizontal rail may be used where it better matches the reference layout.
- Each card uses white background and medium rounded corners.
- Card content:
  - Large ingredient image near the top.
  - Name (one or two lines).
  - Category / unit metadata.
  - Pantry quantity or state.
  - Quantity stepper when already in pantry, or an Add button when absent.
- Maintain consistent image-box height so cards align.
- Use a clear empty-search state with a simple icon, short message and clear-search action.

### Quantity control

- A compact minus / value / plus stepper.
- Selected or active stepper uses pale lime surface and forest text.
- Minimum quantity is zero; a decrement to zero removes the ingredient from the pantry only if that matches the existing app's current behavior. If not, use the existing behavior and do not invent a different data rule.
- Display units accurately when supplied by data (g, kg, ml, L, pieces). Do not silently convert quantities in the UI.

---

## 6. Screen 3 — Ingredient detail

**Visual reference:** second phone in reference image 2, “Product Details”. Translate it into pantry ingredient details, not a commercial product checkout page.

### Header

- Deep forest-teal header with circular back button and centered title “Ingredient details”.
- Optional pantry shortcut / count on the right.
- Header follows the same curved lower edge system.

### Main content

1. Large, high-quality ingredient photograph in a spacious white image area.
2. Ingredient name as the main heading.
3. Category and unit / serving metadata underneath.
4. A favorite / bookmark affordance if ingredient favorites are supported by existing frontend state; otherwise do not add nonfunctional controls.
5. Pantry status row:
   - “In your pantry” plus quantity, or
   - “Not in pantry” with an add prompt.
6. Optional storage / freshness note only when data exists. Do not invent expiry dates or shelf-life claims.
7. Optional nutrition preview only if the project already supplies the information. Label per-100g / serving correctly; do not imply medical advice.
8. “Recipes with this ingredient” horizontal mini-card rail, linking into recipe detail.

### Sticky bottom action area

- Quantity stepper and a prominent lime action button.
- Button label changes according to state: “Add to pantry” when absent, “Update pantry” when already present.
- Keep the action area above the bottom safe area.
- Do not show a product price, supplier rating, delivery badge, satisfaction guarantee or “Add to cart” button. Those belong to the grocery-commerce product reference, not the present MealBox360 phase.

---

## 7. Screen 4 — Pantry inventory

Use the same design system, but make this screen efficient for daily use.

### Required visual elements

- Dark teal header with title “My Pantry”, item count and an add/search affordance.
- Optional top summary: total ingredient count and number of items running low, only if derived from actual state.
- Filter chips: All, Fresh, Grains, Dairy, Protein, Spices; optional “Running low” filter.
- Search field.
- Ingredient rows or compact cards with image, name, category, quantity and edit action.
- Low-stock and expiry states should be distinct but visually restrained (warning amber / danger red only when relevant).
- Empty state: friendly explanation and CTA “Add your first ingredient”.

### Interactions

- Add ingredient opens the existing ingredient browser or an existing add-item flow.
- Ingredient row opens ingredient detail.
- Quantity controls update the existing state/API call where available.
- Delete or remove action should use a confirmation dialog / action sheet if already supported by project conventions.
- Do not create backend logic for expiry tracking in this UI-only task; render expiry information only if already available.

---

## 8. Screen 5 — Discover recipes

This is the core MealBox360 value proposition. It should not look like a generic grocery store.

### Header and filter area

- Forest header with title “Discover recipes” and search field.
- Optional filter chips: Quick, Healthy choices, Vegetarian, High protein, Budget-friendly, etc. Only render filters supported by existing data or frontend filtering. These are lifestyle filters, not treatment recommendations.
- Time filter options may be presented as chips: Under 15 min, Under 30 min, Any time.

### Recommendation groups

- **Cook Now:** recipes with all required ingredients available. Show a strong “Ready to cook” label.
- **Almost There:** recipes missing one or two ingredients. Show missing ingredient names clearly.
- **Quick & Easy:** short-preparation recipes, based on known preparation-time data.
- **Use It First:** recipes that prioritize ingredients flagged as expiring soon, but only if expiry data already exists.

### Recipe card

- Large food image.
- Recipe title.
- Prep time, cuisine/category and difficulty only when known.
- Ingredient match indicator (e.g. 8/8 or 80%) based on existing recommendation data.
- Compact labels such as “Ready to cook” or “2 ingredients missing”.
- Save / bookmark affordance if saved state exists.

Do not claim that a recipe is clinically healthy or suitable for a medical condition. Use neutral language such as “balanced option”, “vegetable-rich” or “quick meal” only when recipe metadata supports it.

---

## 9. Screen 6 — Recipe detail

- Forest header with back button, centered title “Recipe details” and optional save icon.
- Large hero food image.
- Recipe name and concise description.
- Metadata strip: prep time, servings and difficulty (show only available fields).
- Ingredient checklist with availability state:
  - Available ingredients use a calm green check.
  - Missing ingredients are clearly highlighted and named.
- Main CTA for “Start cooking” or “Mark as cooked” only if the current frontend flow supports it. Do not add server-side meal logging.
- Cooking instructions shown as numbered steps with readable line spacing.
- Optional “You may also like” rail at bottom.
- The UI must make it obvious whether a recipe is fully cookable or requires extra items.

---

## 10. Screens 7–8 — Saved recipes and meal history

### Saved

- Title “Saved recipes”.
- Search/filter only if useful and supported.
- Same recipe cards as Discover for consistency.
- Friendly empty state with a route back to Discover.

### Meal history

- Title “Meal history”.
- Group entries by date (Today, Yesterday, earlier dates) if meal history data is available.
- Each row/card shows recipe name, image, date and meal type only when data exists.
- Empty state should explain that cooked recipes will appear here when logged.
- Do not fabricate historical meals or dates.

---

## 11. Reusable component inventory

Build reusable components rather than styling each screen independently. Follow existing project naming conventions; the following are conceptual names, not mandatory filenames.

- `AppHeader` — forest header, title, back / utility actions and curved lower edge.
- `SearchBar` — rounded white search field with leading icon and optional clear action.
- `CategoryShortcut` — pastel round image/icon plus label.
- `CategoryTabBar` — horizontal scroll tabs with lime selected state.
- `SectionHeading` — title and optional “See all” action.
- `PromoOrTipBanner` — one concise editorial message; no fake promotions.
- `IngredientCard` — image, name, unit, pantry status and add / quantity control.
- `IngredientGrid` — consistent two-column layout.
- `QuantityStepper` — minus / value / plus control.
- `RecipeCard` — image, title, prep time, match status and save action.
- `MatchStatusPill` — “Ready to cook” / “Almost there”.
- `PantryStatus` — “In pantry”, “Running low”, “Not in pantry”.
- `EmptyState` — icon / illustration, short message and action.
- `BottomTabBar` — rounded bottom navigation with active state.
- `ScreenContainer` — safe-area-aware scrollable page with bottom-tab spacing.

### Component rules

- Keep spacing, border radius, colors and typography token-driven.
- Components must receive data / callbacks through props; avoid hidden global state.
- Preserve TypeScript types where the project uses TypeScript.
- Use the project's existing icon package. If it already uses `@expo/vector-icons`, keep using it. Do not add another icon library unnecessarily.
- Keep components small and composable; avoid a single very large screen file.

---

## 12. Food imagery and visual assets

The references rely heavily on food imagery. Use this priority order:

1. Reuse assets already present in the project.
2. Reuse existing project image URLs / recipe image fields if they are already part of the frontend data model.
3. If no images exist, create a clearly organized local asset mapping for representative food images that can be added later. Use tasteful placeholder food illustrations or category icons as a temporary fallback.
4. If using remote static image URLs for the prototype, keep them in one mock-data file, use stable direct image URLs, provide a placeholder on failure and do not treat them as an API or rely on them for application logic.

Do not place large emoji as the only image treatment on every recipe card. Emoji can be used for small category icon fallbacks, but recipe and ingredient cards should be image-led when appropriate.

Use consistent image aspect ratios:

- Ingredient cards: square (1:1).
- Recipe cards: 4:3 or 1:1 depending on existing layout.
- Ingredient detail hero: large square or 4:3 image area.

Use `resizeMode="cover"` for card thumbnails and an appropriate contain/cover behavior for detail imagery. Always handle missing / failed images gracefully.

---

## 13. Interaction and UI states

Every visible control must have a sensible frontend behavior. Do not leave fake buttons that look active but do nothing.

### Required states

- Default, pressed and selected states for buttons / tabs.
- Search idle, typing, results and no-results.
- Ingredient absent from pantry, present in pantry and running low (if current data supports it).
- Quantity stepper minimum and positive values.
- Recipe ready-to-cook and missing-items states.
- Loading and error states for screens that already call APIs.
- Empty pantry, empty saved list and empty meal history.
- Disabled state for actions that cannot run.

### Motion

- Use short, subtle transitions (roughly 150–220ms) for selection and small state changes if the project already has an animation approach.
- Avoid large entrance animations, parallax or distracting effects.
- Do not add a new animation dependency for decorative motion.

### Modals and sheets

- Use a simple native-feeling confirmation dialog / bottom sheet for remove / destructive actions if such a pattern already exists.
- Keep modal surfaces white with restrained border / subtle elevation.

---

## 14. Expo / React Native implementation constraints

This task is for the existing Expo Go app. Keep it compatible with the repository's current Expo SDK and installed dependencies.

- Inspect the current `package.json`, navigation setup, `App.tsx` / route files, theme and component structure before editing.
- Do not upgrade Expo SDK, React Native or core dependencies as part of the visual task.
- Do not eject from Expo or switch to a different framework.
- Do not add native modules that cannot run in the current Expo Go workflow.
- Prefer `View`, `Text`, `Image`, `Pressable`, `ScrollView`, `FlatList`, `TextInput` and existing installed libraries.
- Use `SafeAreaView` / `react-native-safe-area-context` according to the existing project setup.
- Use `FlatList` for long lists and grids; use horizontal `FlatList` / `ScrollView` for category and recipe rails.
- Keep list item keys stable.
- Ensure Android status bar contrast and iOS safe-area spacing.
- Use `Platform` / `useWindowDimensions` only where layout genuinely needs adaptation.
- The app must remain testable by scanning the Expo Go QR code on a physical phone connected to the same network as the development machine.

### Responsiveness

- Target common phone widths around 360–430px first.
- Two-column ingredient grid should fit 360px width with 16px screen gutters and a 12px column gap.
- On very narrow phones, reduce card inner spacing before reducing text below readable sizes.
- On larger devices, keep content centered and avoid stretching cards excessively.
- No horizontal overflow except intentional horizontal rails / category tabs.

---

## 15. Data and integration boundary — UI only

The current MealBox360 project has a React Native / Expo frontend and a FastAPI backend. This specification is only for the UI layer.

- Preserve all current API URLs, service files, request / response shapes and backend behavior.
- Do not edit `backend/main.py`, backend requirements, database models or API routes.
- Do not add MongoDB, authentication or third-party API integration in this task.
- Do not implement recipe ranking / nutritional calculations / grocery comparisons.
- If an API already supplies pantry or recipe data, render it using the new components without changing the API contract.
- If the UI needs fields that are not yet available, use a small, clearly named local mock-data file for presentation only and label integration TODOs in code comments.
- Do not hardcode fake user location, grocery price, rating, delivery time, vendor, discount, nutrition value or expiry date.
- Do not add purchase / cart / payment functionality.
- Keep the UI data mapping layer separate so future backend fields can be connected without rewriting visual components.

---

## 16. Accessibility and quality

- All tappable controls should be at least approximately 44×44px where practical.
- Provide accessible labels for icon-only controls (back, search, add, remove, save, tabs).
- Maintain readable contrast for body text and selected states.
- Do not encode status using color alone; include text labels or icons.
- Ensure labels are not clipped and support dynamic text where practical.
- Use `numberOfLines` carefully; do not truncate core ingredient / recipe names without a way to view detail.
- Ensure bottom tabs do not overlap content and keyboard does not obscure search / inputs.
- Check Android and iOS layout, status bar, safe area and scrolling.

---

## 17. Explicitly out of scope for this UI task

Do **not** implement these features in this pass:

- Grocery price comparison across Zepto, Blinkit, Instamart or other services.
- Product catalogue, vendor selection, shopping cart, checkout or payment.
- New API endpoints, backend refactor or database migration.
- New authentication implementation.
- Barcode scanner, OCR, receipt scanning or camera flows.
- New AI / LLM recommendation logic.
- Medical or disease-specific dietary advice.
- IoT / sensor / hardware features.

The app is a lifestyle and meal-planning assistant. UI copy must not imply diagnosis, treatment or disease prevention.

---

## 18. Acceptance checklist

The UI work is complete when all of the following are true:

- [ ] The existing Expo app still starts using its current workflow.
- [ ] No backend files or API contracts were modified.
- [ ] The app has a consistent forest-teal / lime / white visual identity matching the supplied screenshots.
- [ ] Home screen includes a curved dark header, search, category shortcuts, “You might need”, “Cook now” and “Almost there” sections.
- [ ] Ingredient category screen includes a back header, horizontally scrollable category tabs, search and ingredient cards.
- [ ] Ingredient detail screen includes a large image, ingredient information, pantry status, quantity stepper and add/update action.
- [ ] Pantry, Discover, Recipe Detail, Saved and History screens use the same visual system and are navigable where the current app scope supports them.
- [ ] Bottom navigation is visible, accessible and does not cover content.
- [ ] Ingredient quantity controls and navigation work on the frontend.
- [ ] Empty, loading, error and no-search-results states are handled where relevant.
- [ ] No fake grocery prices, vendor ratings, delivery claims, discounts or invented nutrition data appear.
- [ ] The app has been checked on a physical device through Expo Go or an equivalent emulator.

---

## 19. Implementation order

1. Inspect the existing frontend, route structure, dependencies and current API integration.
2. Add / align theme tokens and reusable components.
3. Implement the shared forest header, search bar, category tabs, cards, quantity stepper and bottom navigation.
4. Restyle and connect the Home dashboard.
5. Implement Ingredient Browser and Ingredient Detail screens.
6. Restyle Pantry, Discover, Recipe Detail, Saved and History using existing state / API data.
7. Add empty / loading / error states and accessibility labels.
8. Run the existing lint / type checks (if configured), start Expo and fix UI regressions.
9. Report exactly which files were changed, which screens are complete and any remaining TODOs. Confirm that backend files and API contracts were left untouched.

---

## 20. Final visual test against the references

Before finishing, compare the running app side-by-side with the two supplied screenshots:

- Is the forest-teal header visually dominant without occupying too much screen height?
- Is the bottom header edge softly curved?
- Does the search field look like a white rounded pill?
- Are category shortcuts easy to scan and visually separated?
- Do ingredient cards show food imagery, compact names, quantity and a clear add / stepper control?
- Does the ingredient detail page have the same spacious, image-led hierarchy as the reference product page?
- Is lime used for active / positive actions rather than everywhere?
- Does the bottom navigation feel compact, floating and easy to tap?
- Does the UI still clearly communicate MealBox360's purpose: managing pantry ingredients and finding recipes to cook?

The result should feel recognizably inspired by the uploaded UI references while remaining unmistakably a MealBox360 pantry and recipe app.
