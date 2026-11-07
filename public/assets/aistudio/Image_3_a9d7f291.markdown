---
name: Vision Lumina
colors:
  surface: '#11131d'
  surface-dim: '#11131d'
  surface-bright: '#373944'
  surface-container-lowest: '#0b0e18'
  surface-container-low: '#191b26'
  surface-container: '#1d1f2a'
  surface-container-high: '#272935'
  surface-container-highest: '#323440'
  on-surface: '#e1e1f1'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e1e1f1'
  inverse-on-surface: '#2e303b'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#c0c1ff'
  on-tertiary: '#1000a9'
  tertiary-container: '#8083ff'
  on-tertiary-container: '#0d0096'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#11131d'
  on-background: '#e1e1f1'
  surface-variant: '#323440'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 21px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 0.75rem
  gutter-lg: 2rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies spatial intelligence, hyper-refined scholastic clarity, and next-generation interactive computing tailored for academic rigor in higher engineering disciplines. Synthesizing Apple visionOS-inspired spatial depth with a focused educational workflow, the aesthetic relies on a deep, oceanic cosmic canvas punctuated by luminous glass plates, refraction outlines, and ethereal chromatic energy.

### Visual Aesthetic & Philosophy
- **Liquid Glass Spatiality:** Heavy reliance on thick optical glass (`backdrop-blur-2xl` to `backdrop-blur-md`), specular top edge illumination, and multi-layered translucent planes that drift above deep ink-navy voids.
- **Controlled Luminescence:** Ambient gradients of electric violet, indigo, and cyber cyan spill outward from interactive nodes to establish focal anchors without compromising legibility.
- **Academic Precision:** Balances the sleek fluidity of visionOS with structural data grids, telemetry-driven attendance cards, code snippet projections, and timetable orbs.

### Target Emotional Response
Users should feel immersed in an authoritative, calm, and boundary-pushing computing environment—sensing high-tech sophistication, clarity under heavy cognitive load, and frictionless navigation across lecture streams, labs, and assessment matrices.

## Colors

The palette is engineered around an ultra-deep optical canvas where pure darks recede and luminous translucent planes take visual prominence.

### Canvas & Surfaces
- **Canvas Base:** `#070913` (Deep Midnight Void)
- **Sub-canvas Elevated:** `#0B0F1F` (Abyssal Navy)
- **Glass Plate Ultra-Low:** `rgba(15, 23, 42, 0.45)` with `1px` border `rgba(255, 255, 255, 0.07)`
- **Glass Plate Standard:** `rgba(255, 255, 255, 0.04)` layered over `#0B0F1F`
- **Glass Plate Active/Hover:** `rgba(255, 255, 255, 0.08)` with border `rgba(255, 255, 255, 0.18)`

### Chromatic Accents
- **Primary (Electric Violet - `#8B5CF6`):** Command actions, active lecture indicators, primary navigation highlights, and radial glow centers.
- **Secondary (Cyber Cyan - `#06B6D4`):** Real-time telemetries, verified lab validations, attendance trackers, and high-priority metrics.
- **Tertiary (Quantum Indigo - `#6366F1`):** Structural highlights, auxiliary controls, deep glow falloffs, and timeline demarcations.

### Functional States & Typography Contrast
- **Text Headings / Emphasized:** `#F8FAFC` (Pure Pearl, 98% opacity)
- **Text Body:** `#94A3B8` (Muted Slate, 80% opacity)
- **Text Subdued / Micro:** `#64748B` (Deep Mist, 60% opacity)
- **Success / Online:** `#10B981` (Emerald Core)
- **Warning / Pending Lab:** `#F59E0B` (Solar Amber)
- **Alert / Overdue:** `#F43F5E` (Rose Flare)

## Typography

The typographic engine uses **Inter** across all roles to achieve a technical, crystal-clear, and clinical Swiss appearance akin to visionOS system typography.

### Hierarchy & Treatment
- **Headings & Displays:** Tightly tracked with negative letter spacing (`-0.015em` to `-0.03em`) to anchor floating glass surfaces.
- **Academic Tags & Department Metadata:** Always rendered in `label-caps` with uppercase transformation and loose tracking (`+0.08em`) to mimic instrumentation panels.
- **Numbers & Metrics:** Use tabular numbers (`font-variant-numeric: tabular-nums`) across attendance records, GPA scales, and module code indicators (`CSE-102`, `1CSE22`).
- **Optical Crispness:** All text layers sit with anti-aliasing forced on (`-webkit-font-smoothing: antialiased`) to prevent blurring across frosted backdrops.

## Layout & Spacing

A responsive spatial grid accommodates floating multidimensional panels, side rail projections, and academic schedules.

### Grid & Structure
- **Desktop (>=1280px):** 12-column dynamic fluid grid with `gutter-lg` (32px) and `margin-lg` (56px) outer boundary margins. Primary panels float over ambient cosmic backdrops.
- **Tablet (768px - 1279px):** 8-column layout with `gutter` (24px) and `margin` (32px). Secondary telemetry panels collapse into floating docked sheets.
- **Mobile (<768px):** 4-column layout with `gutter-sm` (12px) and `margin-sm` (16px). Cards span the full column count with vertical continuous scroll and floating bottom glass navigation.

### Rhythm & Density
- Spacing follows an 8-point base module, with fine elements adopting 4-point micro-spacing (`space-xs`).
- Glass cards maintain generous internal padding (`space-lg` to `space-xl`) to establish high optical clearance around content, preventing interface crowding.

## Elevation & Depth

Visual hierarchy is constructed through luminous optical refraction, backdrop light attenuation, and directional chromatic diffusion rather than conventional drop shadows.

### Surface Tiers & Translucency
1. **Tier 0 (Infinite Field):** `#070913` with multi-point radial gradients (`at 15% 15%, rgba(99, 102, 241, 0.12)` and `at 85% 75%, rgba(6, 182, 212, 0.10)`).
2. **Tier 1 (Base App Slabs & Sideboards):** `rgba(11, 15, 31, 0.65)` with `backdrop-filter: blur(24px) saturate(180%)`, perimeter hairline `border: 1px solid rgba(255, 255, 255, 0.08)`.
3. **Tier 2 (Floating Action Panels & Class Pods):** `rgba(255, 255, 255, 0.035)` combined with `backdrop-filter: blur(32px)`, inner specular edge `box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)`, and ambient floor shadow `0 20px 50px -10px rgba(0, 0, 0, 0.6)`.
4. **Tier 3 (Modals, Hovered Nodes & Orbiting Windows):** `rgba(255, 255, 255, 0.07)` layered over `#0B0F1F`, accented with dual exterior glow: `0 0 35px -5px rgba(139, 92, 246, 0.35), 0 0 15px -3px rgba(6, 182, 212, 0.25)`.

### Specular Highlighting
Every card or container features an asymmetric top border reflection:
- `border-top: 1px solid rgba(255, 255, 255, 0.20)`
- `border-bottom: 1px solid rgba(255, 255, 255, 0.04)`
- `border-inline: 1px solid rgba(255, 255, 255, 0.08)`

## Shapes

The geometric architecture is defined by fluid, organic rounded volumes reminiscent of visionOS floating pods and capsule-shaped controls.

### Curvature Taxonomy
- **Pill Primitives (`rounded-full`):** Filter pills, status badges, voice inputs, segmented control sliders, and primary action buttons.
- **Glass Tiles & Shells (`rounded-3xl` / 2rem):** Lecture stream wrappers, schedule containers, and interactive workspace cards.
- **Micro Elements (`rounded-xl` / 1rem):** Inset code viewports, lab submission wells, and table item cells.
- **Concentric Offset Principle:** Nested elements scale their corner radius proportionally: outer parent at `2rem` embeds child nodes at `1.25rem` or `rounded-full` pills to maintain fluid harmony.

## Components

### Buttons
- **Primary Spatial Button:** Pill-shaped (`rounded-full`), background: linear gradient `(135deg, #8B5CF6, #6366F1)`. Inset specular highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.4)`. Outer glow: `0 4px 20px rgba(139, 92, 246, 0.4)`. Text: `#FFFFFF`, `label-md`. Hover triggers slight scale transition (`scale: 1.02`) and cyan-violet outer spread.
- **Secondary Glass Button:** Translucent capsule (`rgba(255, 255, 255, 0.05)`), border `1px solid rgba(255, 255, 255, 0.12)`, text `#F8FAFC`. On hover: surface tints to `rgba(255, 255, 255, 0.12)` with border blooming to `rgba(6, 182, 212, 0.4)`.

### Chips & Pill Tags
- **Section Indicator:** `1CSE22` and department tags are encapsulated in ultra-compact pills (`py-1 px-3`, `rounded-full`). Background `rgba(6, 182, 212, 0.1)`, text `#06B6D4`, border `1px solid rgba(6, 182, 212, 0.3)`. Ambient halo: `0 0 10px rgba(6, 182, 212, 0.2)`.
- **Status Pods (Live / In-Session):** Violet pulsating dot (4px) housed within `rgba(139, 92, 246, 0.15)` capsule with crisp tracking.

### Cards & Module Pods
- Multi-layered frosted glass plates with `32px` corner radii.
- Features top-right chromatic illumination gradients that react to mouse coordinate movement or active class state.
- Card interiors divide into metadata trays with hairline borders `rgba(255, 255, 255, 0.06)`.

### Lists & Row Groups
- Detached floating rows instead of dividing rules. Each row acts as an individual interactive glass capsule with `rounded-2xl` corners, spaced by `space-sm`.
- Hover state raises the row with a cyber cyan gradient border slide and text brightening to `#FFFFFF`.

### Checkboxes & Segmented Controls
- **Segmented Control:** Pill-shaped container holding a sliding fluid glass tab. Inactive tabs are muted text; the selected tab features a bright translucent pill backing with `backdrop-filter: blur(12px)` and subtle violet illumination.
- **Checkbox:** `rounded-lg` glass squares (`rgba(255, 255, 255, 0.06)`). Active state fills with gradient `#8B5CF6` to `#06B6D4` displaying a crisp white micro-tick.

### Input Fields
- Deep glass wells (`rgba(0, 0, 0, 0.3)`) encased in `rounded-2xl` borders (`rgba(255, 255, 255, 0.1)`).
- Focus state creates an electric cyber cyan boundary aura: `border-color: #06B6D4`, `box-shadow: 0 0 20px rgba(6, 182, 212, 0.25)`. Placeholder text in `#64748B`.

### Specialized Domain Components
- **Attendance Telemetry Gauge:** Circular or organic track with electric cyan-to-violet linear gradients, frosted center display depicting real-time percentage alongside threshold indicators.
- **Lab Code Projection Viewport:** Darkened glass terminal (`rgba(3, 7, 18, 0.8)`) with `backdrop-blur-xl`, displaying syntax-colored snippets and batch compilation status.
- **Floating HUD Navigation Bar:** Bottom-anchored glass dock featuring iconic spatial glyphs, elevated `24px` above viewport edge with heavy optical blur and specular border sheen.