# Design System Document: The Architect’s Ledger

## 1. Overview & Creative North Star: "The Financial Sanctuary"
This design system moves away from the aggressive, high-friction aesthetics of traditional trading apps toward a "Financial Sanctuary." Our Creative North Star is **The Digital Curator**. We aim for a high-end, editorial feel that prioritizes breathability, quiet authority, and community-driven trust. 

To break the "template" look, we utilize **Intentional Asymmetry**. Rather than a rigid 12-column grid, we lean into generous whitespace on one side of the screen to guide the eye toward "Signature Moments"—overlapping typography and layered surfaces that feel like a premium physical ledger. We don't just display data; we curate an environment where wealth feels stable and community feels safe.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is built on deep, nocturnal blues and verdant greens, grounded by a sophisticated scale of grays.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts. Use `surface-container-low` for large section backgrounds against a `surface` base. Trust is built through clarity, not cages.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers.
*   **Base:** `surface` (#f8f9fa)
*   **Sections:** `surface-container-low` (#f3f4f5)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff)
*   **Emphasis/Overlays:** `surface-container-highest` (#e1e3e4)

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating headers or navigation rails. Apply `surface` with 80% opacity and a 20px backdrop-blur. 
*   **Signature Textures:** For primary CTAs and Hero sections, use a subtle linear gradient from `primary` (#00162a) to `primary_container` (#0d2b45). This adds a "silk" finish that flat hex codes cannot achieve.

---

## 3. Typography: The Editorial Voice
We use a dual-font strategy to balance character with utility.

*   **Display & Headlines (Manrope):** Chosen for its geometric stability and modern warmth. Use `display-lg` for impactful community statistics. Headlines should feel authoritative, utilizing the deep `on_surface` (#191c1d) to anchor the page.
*   **Body & Labels (Inter):** A workhorse for financial legibility. Inter’s tall x-height ensures that even `body-sm` (0.75rem) remains crisp for legal disclaimers or micro-data.
*   **Hierarchy Note:** Use high-contrast scale jumps. A `display-md` headline paired with a `body-md` description creates a professional, "white-paper" aesthetic that signals transparency.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "software-standard." We achieve depth through **Ambient Light Physics**.

*   **The Layering Principle:** Instead of shadows, stack `surface-container-lowest` elements on top of `surface-container-low`. The 1% shift in brightness provides a soft, natural lift.
*   **Ambient Shadows:** If a card must float (e.g., a modal), use a blur of 40px at 6% opacity using `on_surface` as the shadow color. It should feel like a soft glow, not a dark smudge.
*   **The "Ghost Border" Fallback:** For input fields where definition is required for accessibility, use `outline_variant` at 20% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** Use `surface_variant` at 40% opacity with a blur for "Community Insight" chips to make them feel integrated into the background.

---

## 5. Components: Precision & Softness

### Buttons (The "Weight" System)
*   **Primary:** Gradient of `primary` to `primary_container`. Text in `on_primary`. Radius: `md` (0.375rem).
*   **Secondary:** `secondary_container` (#b9eeab) with `on_secondary_container` (#3f6d38). No border.
*   **Tertiary:** Ghost style. No background; `primary` text. Use for low-priority actions like "Cancel."

### Cards & Lists (The "Breathable" List)
*   **Rule:** Forbid divider lines.
*   **Execution:** Separate list items using 16px of vertical whitespace. On hover, transition the background to `surface_container_low`.
*   **Community Feed Cards:** Use `xl` rounding (0.75rem) and `surface-container-lowest` to make community posts feel approachable.

### Input Fields
*   **Style:** Minimalist. A subtle `surface_container_high` background. Label in `label-md` Inter, positioned 8px above the field. Error states use `error` (#ba1a1a) with a `ghost-border` of the same color.

### Signature Component: "The Trust Meter"
A custom progress visualization using a gradient from `secondary` (Forest Green) to `primary` (Navy), representing a user's community contribution score. It should use `full` rounding for a pill-like, organic feel.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts where the left margin is wider than the right to create an editorial feel.
*   **Do** leverage `tertiary_fixed_dim` for subtle "Member Since" badges to add a touch of premium gold/wheat tone.
*   **Do** use large typography for "Big Numbers" (e.g., total community savings).

### Don't
*   **Don't** use pure black (#000000). Always use `on_surface` (#191c1d) for text.
*   **Don't** use 1px dividers to separate content. Use background tonal shifts or 24px+ spacing.
*   **Don't** use sharp corners. Every interaction point must have at least an `md` (0.375rem) radius to maintain the "Community Trust" softness.
*   **Don't** clutter the screen. If a section feels "busy," increase the whitespace by 1.5x before considering removing content.
