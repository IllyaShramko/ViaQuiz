# Frontend UI & Minimal Pro Design System Rule

## Core Philosophy

Before designing, auditing, or refactoring any UI component, page, or screenshot in this repository, read `.agents/skills/viaquiz-minimal-pro-ui/SKILL.md` and consult its `references/` files (`anti-slop-checklist.md` and `patterns.md`).

ViaQuiz teacher/workspace interfaces follow a **Minimal Pro / Linear-style** aesthetic: calm, high-contrast-for-data, low-noise dark surfaces built for daily classroom workflows—never generic "AI-slop" templates with neon glows, nested boxes, or decorative filler.

---

## 1. Anti-Slop Prohibitions (What Never to Add)

1. **No Neon Glows or Bouncy Hover Effects**:
   - Do **NOT** add colored `box-shadow` halos (e.g. `0 0 15px rgba(134, 59, 255, 0.5)` or `0 10px 24px rgba(...)`) to cards, icons, or buttons.
   - Do **NOT** use large `translateY(-2px)` / `translateY(-3px)` jumps on hover. Clickable cards may shift at most `transform: translateY(-1px)` alongside subtle border/surface shifts.
2. **No Gradient Avatars or Glowing Icon Circles**:
   - Do **NOT** style student/teacher initials or section icons with `linear-gradient(...)` circular badges.
   - Use neutral rounded-square chips (`border-radius: 7px` or `8px`, `background: var(--color-bg-surface)`, `border: 1px solid var(--color-border)`, muted text/initials).
3. **No Card-Inside-a-Card Nesting**:
   - Do **NOT** wrap stat groups, instructor metadata, or sub-blocks inside extra bordered dark cards inside an already bordered card.
   - Use flat inline rows, `gap`, or hairline dividers (`1px solid rgba(255, 255, 255, 0.06)`).
4. **No Off-Palette Neon Green Content Buttons**:
   - Primary CTAs inside workspace pages (`Створити клас`, `Додати учня`, `Зарахувати учнів`, `Створити курс`) **MUST** use `var(--color-accent)` (`#863bff`) and `var(--color-accent-hover)` (`#9b5cff`), `height: 36px`, `border-radius: 8px`, without bright green `#26c065` fills or drop shadows.
5. **No Duplicated Titles or Redundant Card Chrome**:
   - When `useTeacherHeader` already renders the page title in the top navigation bar, do **NOT** repeat the same large `<h1>` with boilerplate marketing subtitles underneath. Use compact section headers (`1.25rem`, `font-weight: 600`) when needed.
   - When an entire card is a `<Link>`, do **NOT** add a redundant bottom text link like `Переглянути клас >`. Put a subtle `ArrowRightIcon` in the card header instead.

---

## 2. Color Tokens & Surfaces

Always reference variables defined in `apps/web/src/app/styles/global.css` (with fallbacks):

- **Primary card / elevated container**: `var(--color-bg-elevated, #12121a)` with `1px solid var(--color-border, #2a2a3a)`
- **Interactive surface / active pill / popover / avatar chip**: `var(--color-bg-surface, #1a1a26)`
- **Hover surface**: `var(--color-bg-hover, #22222e)`
- **Hairline divider inside cards/tables**: `1px solid rgba(255, 255, 255, 0.06)`
- **Typography**:
  - Primary: `var(--color-text-primary, #f0f0f5)`
  - Secondary: `var(--color-text-secondary, #9090a8)`
  - Muted labels / indices / zero metrics: `var(--color-text-muted, #606078)`
- **Primary accent**: `var(--color-accent, #863bff)` (hover: `var(--color-accent-hover, #9b5cff)`)
- **Semantic states**: `var(--color-success, #22c55e)`, `var(--color-error, #ef4444)` (used sparingly for feedback, errors, and destructive hover states, never for decorative gradients)

---

## 3. Layout, Spacing & Hierarchy

- **Standard Page Container**:
  - `max-width: 1120px`, `width: 100%`, `margin: 0 auto`, `display: flex; flex-direction: column; gap: 20px; padding-bottom: 40px;`
  - Never import monolithic legacy stylesheets (such as `Classes.module.css`); each page/component owns its own `.module.css`.
- **Segmented Tabs (`ClassTabs`, `CourseTabs`, Period Presets)**:
  - Outer track: `padding: 3px`, `background: var(--color-bg-elevated)`, `border: 1px solid var(--color-border)`, `border-radius: 10px`.
  - Active tab: `background: var(--color-bg-surface)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, `border-radius: 7px`, subtle `box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35)`.
  - Override global `*:focus-visible` cleanly on tab buttons (`outline: none` on `:focus`, clean `2px solid var(--color-border-focus)` on `:focus-visible`).
- **Context / Metadata Bars (`CourseInstructorCard`)**:
  - Prefer a compact 1-row horizontal bar (`border-radius: 10px`, `padding: 10px 14px`) over multi-row boxed cards so tables and primary content remain above the fold.
- **Grid Cards (`ClassesPage`, `ClassCoursesTab`, `AssignedCourseCard`)**:
  - `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px;`
  - Card anatomy: `padding: 18px 20px; border-radius: 12px; gap: 14px;` with title + arrow/tag at top, concise `tabular-nums` metadata row in the middle (`·` separator), and optional `3px` progress track or hairline action footer.

---

## 4. Tables, Metrics & Row Actions

1. **Tabular Numbers Without Borders**:
   - Apply `font-variant-numeric: tabular-nums` to all numeric columns, badges, and KPI values.
   - Render table counts (e.g. `Пройдено тестів`) as **plain borderless numbers**—no pill borders or circular badges around single digits. Style `0` values in `var(--color-text-muted)`.
2. **Single-Line Column Headers**:
   - Table `<th>` labels should never wrap awkwardly into 2 lines when avoidable; give numeric/status columns `white-space: nowrap` and adequate fixed width (e.g. `width: 170px` for `Пройдено тестів`).
3. **1-Click Copyable Identifiers**:
   - Student logins and join codes render as subtle inline buttons showing `CopyIcon` on row hover/focus and switching to `CheckIcon` (`var(--color-success)`) on copy.
4. **Overflow `•••` Popover Menus**:
   - Avoid putting 2–3 inline buttons on every table row. Place secondary and destructive actions (`Аналітика`, `Скинути пароль`, `Видалити`, `Відрахувати з курсу`) inside a `•••` menu popover (`z-index: 30`, closes on outside click and `Escape`), with a hairline divider before danger items.
   - Ensure the `.tableCard` container does **not** set `overflow: hidden` (round corner cells instead) so row popovers are never clipped.

---

## 5. Empty, Loading & Error States

- **No Inline Hex Styles**: Put `.loadingState`, `.errorBanner`, and `.emptyCard` / `.emptyState` in the component/page `.module.css`.
- **Empty States**: Dashed border `1px dashed var(--color-border)` on `var(--color-bg-elevated)`, `border-radius: 12px`, `padding: 56px 24px`, concise heading, 1-line helper description, and a single `var(--color-accent)` action button.
