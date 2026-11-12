---
name: viaquiz-minimal-pro-ui
description: "Creates and refactors ViaQuiz UI components and pages using the Minimal Pro (Linear-style) design system. Use when designing new views, auditing screenshots for AI-slop, or converting legacy styles into component-scoped modules."
metadata:
  author: ViaQuiz
  version: "1.0.0"
---

# ViaQuiz Minimal Pro UI

## Purpose

Standardizes how frontend pages and modules across ViaQuiz are designed, audited, and refactored. Enforces a calm, data-first **Minimal Pro / Linear-style** aesthetic grounded in `apps/web/src/app/styles/global.css` tokens and the project's component architecture rules.

## When to Use This Skill

Invoke this skill when:
- Redesigning any existing ViaQuiz page, modal, or tab that feels cluttered, overly decorative, or "AI-slop"
- Building new views, tables, filter toolbars, dashboards, or card grids anywhere in `apps/web`
- Auditing a screenshot or JSX/CSS diff for visual hierarchy issues
- Migrating views off monolithic or legacy stylesheets into dedicated component-scoped modules

## Prerequisites & Companion Rules

Always apply alongside:
- `.agents/rules/frontend-design-system.md` (tokens, anti-slop prohibitions, spacing, table/card standards)
- `.agents/rules/frontend-component-types.md` (1 component = 1 folder with `.tsx`, `.types.ts`, `.module.css`, `index.ts`)
- `.agents/rules/code-comments-language.md` (English-only code comments)

## Workflow

### Step 1: Audit Against Anti-Slop Criteria

Before modifying code or proposing fixes, inspect the screenshot or component code using [references/anti-slop-checklist.md](references/anti-slop-checklist.md):

1. Check for neon glows, multi-color gradient avatars/icons, bouncy `translateY(-2px/-3px)` hover animations, and off-palette green CTA buttons.
2. Check for "card-inside-a-card" nesting, duplicate top-bar `<h1>` titles, and redundant `"View >"` footer links on already-clickable cards.
3. Check tables for wrapped column headers, bordered badges around simple integer counts, and rows cluttered with multiple inline buttons instead of a `•••` popover.

### Step 2: Align Layout Choices First

When several meaningful layout options exist (e.g., dense table vs. card grid, compact 1-row bar vs. side panel), ask one concise multiple-choice question with `ask_question` presenting 2–3 trade-offs and a recommended default before writing code.

### Step 3: Scaffold Component-Scoped Files

Create or refactor each non-trivial component inside its own folder:

```text
ComponentName/
├── ComponentName.tsx
├── ComponentName.types.ts
├── ComponentName.module.css
└── index.ts
```

Rules for implementation:
- Reuse domain DTOs from `@viaquiz/shared-types`; never duplicate model fields in `.types.ts`.
- Reuse shared primitives from `apps/web/src/shared` (`SearchInput`, `pluralizeUk`, `copyToClipboard`, `PlusIcon`, `ArrowRightIcon`, `CopyIcon`, `CheckIcon`, `BinIcon`, `LockIcon`, `HourglassIcon`).
- Put all loading, error, and empty states in `.module.css`—avoid inline `style={{ ... }}` objects with hardcoded hex colors.
- Keep all code comments in English.

### Step 4: Apply Minimal Pro Visual Patterns

Consult [references/patterns.md](references/patterns.md) for copy-ready ViaQuiz CSS and JSX templates covering:
1. **Page Container**: `max-width: 1120px`, `gap: 20px`, `padding-bottom: 40px`.
2. **Segmented Tabs & Presets**: `3px` padded `--color-bg-elevated` track with `--color-bg-surface` active pill and `:focus-visible` ring.
3. **Compact Context Bars**: Single-row `10px 14px` horizontal bar instead of tall multi-row metadata cards.
4. **Data Tables**: Single-line headers (`white-space: nowrap`), `font-variant-numeric: tabular-nums` borderless counts, 1-click copyable login chips, and `•••` action popovers (`z-index: 30`, no `overflow: hidden` on `.tableCard`).
5. **Grid Cards**: `minmax(300px, 1fr)`, `12px` radius, subtle `-1px` hover without box-shadow glow, header arrow instead of footer CTA text, optional `3px` capacity bar.

### Step 5: Verify Build, React Compiler Lint & Knowledge Graph

After completing edits in `apps/web`:
1. Run `pnpm.cmd --filter web build` (`tsc -b && vite build`).
2. Run ESLint specifically on the touched directories (`pnpm.cmd --filter web exec eslint <touched-paths>`) and resolve any React Compiler rules (`react-hooks/set-state-in-effect`, `react-hooks/preserve-manual-memoization`).
3. If backend endpoints or shared contracts changed, run `pnpm.cmd --filter backend build`.
4. Run `graphify update .` to keep `graphify-out/` current.

## Core Token Cheat Sheet

| Role | Token (with fallback) | Usage |
|---|---|---|
| Elevated card / track | `var(--color-bg-elevated, #12121a)` | Cards, tables, segmented control track |
| Interactive surface | `var(--color-bg-surface, #1a1a26)` | Active tab, popover menu, avatar chip, card hover |
| Hover fill | `var(--color-bg-hover, #22222e)` | Menu items, secondary buttons |
| Hairline border | `var(--color-border, #2a2a3a)` | Outer borders on cards/inputs/bars |
| Inner divider | `rgba(255, 255, 255, 0.06)` | Table row dividers, footer rules, popover separators |
| Primary text | `var(--color-text-primary, #f0f0f5)` | Headings, entity names, non-zero counts |
| Secondary text | `var(--color-text-secondary, #9090a8)` | Metadata, logins, inactive tabs |
| Muted text | `var(--color-text-muted, #606078)` | Column headers, row indices, zero counts |
| Accent CTA | `var(--color-accent, #863bff)` | Primary action button, progress fill |
