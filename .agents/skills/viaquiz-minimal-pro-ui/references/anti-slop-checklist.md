# ViaQuiz Anti-Slop Audit Checklist

Use this checklist when inspecting screenshots, JSX, or CSS modules before starting a UI refactor.

| # | AI-Slop Symptom | Why It Hurts UX | Minimal Pro Replacement |
|---|---|---|---|
| 1 | Colored `box-shadow` glow on cards/buttons/icons | Adds visual noise and dated neon styling | `1px solid var(--color-border, #2a2a3a)` and calm border/surface tint on hover |
| 2 | `transform: translateY(-2px/-3px)` on hover | Makes dense UIs feel bouncy and unstable | `transform: translateY(-1px)` max on cards; color/border transition only on buttons |
| 3 | `linear-gradient(...)` circles for avatars or section icons | Distracts from entity names and wastes contrast | `26px–28px` rounded-square chip (`7px–8px` radius), `--color-bg-surface`, `1px solid var(--color-border)` |
| 4 | Card-inside-a-card (dark bordered stat box inside a bordered card) | Creates double borders and vertical bloat | Flat inline row with `tabular-nums` + `·` dot separator or `1px solid rgba(255, 255, 255, 0.06)` divider |
| 5 | Off-palette neon green `#26c065` primary buttons in content pages | Clashes with topbar controls and purple accent | `var(--color-accent, #863bff)`, `height: 36px`, `border-radius: 8px`, `font-weight: 600` |
| 6 | Duplicate large `<h1>` repeating `useTeacherHeader` title + generic subtitle | Pushes real data down the viewport | Compact section header (`1.25rem`, `600`) with count pill if needed |
| 7 | Redundant `"Переглянути >"` footer link on a clickable `<Link>` card | Wastes a full row of vertical space | Single `ArrowRightIcon` in the card header row |
| 8 | Pill/circle borders around single numbers (`[ 1 ]`) | Clutters scanline in tables | Plain borderless `font-variant-numeric: tabular-nums`; mute `0` with `var(--color-text-muted)` |
| 9 | Multi-line wrapped table column header (`ПРОЙДЕНО` / `ТЕСТІВ`) | Uneven header height and awkward alignment | `white-space: nowrap` and explicit width (e.g. `170px`) on `<th>` |
| 10 | 2–3 inline action buttons per table row | Horizontal crowding on laptops/tablets | Single `•••` popover trigger per row with menu items (`Escape` + outside click close) |
| 11 | Inline `style={{ color: '#9090a8', ... }}` on loading/error/empty blocks | Scatters theme tokens and violates CSS modularity | `.loadingState`, `.errorBanner`, `.emptyCard` in `PageName.module.css` |
| 12 | `overflow: hidden` on `.tableCard` | Clips `•••` row action popovers on the last row | Omit `overflow: hidden`; apply `border-radius` directly to corner `<th>` / `<td>` cells |
