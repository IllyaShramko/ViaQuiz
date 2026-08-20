# Frontend Architecture & Directory Structure (`apps/web`)

## 1. Architectural Layers & Dependency Rules

The frontend application follows a layered modular architecture. The dependency flow is strictly **unidirectional** from top to bottom:

```
┌─────────────────────────────────────────────────────────┐
│                          app/                           │  (App root, store, router, providers)
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                         pages/                          │  (Route containers & composition)
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                        modules/                         │  (Domain slices: auth, quiz-editor, etc.)
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                         shared/                         │  (Cross-cutting UI, baseApi, i18n, utils)
└─────────────────────────────────────────────────────────┘
```

### Dependency Rules:
1. **`shared/`** MUST NOT import from `modules/`, `pages/`, or `app/`.
2. **`modules/`** may import from `shared/` and packages (`packages/*`). Modules MUST NOT import from `pages/` or `app/`.
3. **Cross-Module Imports**: Modules should be self-contained. If a module must import from another module, it MUST only import via that module's public barrel file (`modules/<module-name>`), never deep internal paths.
4. **`pages/`** may import from `modules/`, `shared/`, and packages (`packages/*`). Pages MUST NOT import from `app/`.
5. **`app/`** is the top-level aggregator and may import from `pages/`, `modules/`, `shared/`, and packages.

---

## 2. Directory Structure (Illustrative Reference)

> **Note**: The module and page names below (`auth`, `quiz-editor`, `landing`, `main`, etc.) are **illustrative examples** based on current domain requirements. They are **not rigid or exhaustive**. New modules and page groups can and should be added/renamed as features evolve, as long as they follow the layer responsibilities and internal submodule structure outlined below.

```
apps/web/src/
├── app/                  # Application initialization & global configs
│   ├── router/           # React Router route tree definitions
│   │   └── index.tsx     # createBrowserRouter config
│   ├── styles/           # Global styles & CSS resets
│   │   └── global.css
│   ├── store.ts          # Redux Toolkit store setup & middleware
│   └── App.tsx           # Root provider wrapper (Redux, i18n, Auth, Router)
│
├── pages/                # Route-level page components (grouped by flow / layout)
│   ├── <flow-group>/     # Example: landing/, main/, student-main/, game-sessions/
│   │   ├── <PageName>/   # Page component directory (e.g. LoginPage, QuizDraftsPage)
│   │   │   ├── <PageName>.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── NotFoundPage/     # 404 Catch-all page
│   └── index.ts          # Barrel re-exporting all pages
│
├── modules/              # Domain-driven feature slices (named by domain/feature)
│   ├── <module-name>/    # Example: auth, quiz-editor, quiz-details, dashboard, profile
│   │   ├── api/          # RTK Query endpoints
│   │   ├── models/       # Types, interfaces, schemas
│   │   ├── ui/           # Components & styles
│   │   ├── hooks/        # Module hooks (optional)
│   │   ├── context/      # Module context (optional)
│   │   ├── utils/        # Helper functions (optional)
│   │   └── index.ts      # Public API of the module
│   └── index.ts          # Modules barrel
│
├── shared/               # Reusable domain-agnostic foundation
│   ├── api/              # baseApi (RTK Query), client fetch wrapper, token helpers
│   ├── ui/               # Common layouts (TeacherLayout, Layout, ProtectedRoute), icons & UI elements
│   ├── constants/        # App constants, routes, storage keys, colors
│   ├── hooks/            # Generic shared React hooks
│   ├── theme/            # Theme tokens, font variables
│   ├── tools/            # Shared utility functions (e.g. image picking)
│   ├── i18n/             # Translations, locale context & provider
│   └── index.ts          # Public barrel for shared layer
│
├── assets/               # Static assets (images, raw SVG icons)
└── main.tsx              # DOM root mounting point
```

---

## 3. Module (`modules/<module-name>/`) Internal Structure

Each module represents an isolated domain or vertical feature slice with standard internal subdirectories:

```
modules/<module-name>/
├── api/                  # RTK Query API slice (injectEndpoints into baseApi)
│   └── <module>Api.ts    # e.g., quizEditorApi.ts
├── models/               # Types, interfaces, DTOs & validation schemas
│   ├── types.ts          # Data models and contract types
│   ├── validators/       # Form/validation schemas (if applicable)
│   └── index.ts
├── ui/                   # Module-specific React components & CSS modules
│   ├── ComponentName/    # Component folder
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.module.css  (optional)
│   │   └── index.ts
│   ├── ModuleStyles.module.css       (shared module styles)
│   └── index.ts          # Barrel exporting all module UI components
├── hooks/                # Module-specific custom React hooks (e.g., useAutoSave.ts)
├── context/              # Module-specific React context (e.g., user.context.tsx)
├── utils/                # Module-specific pure helper functions
└── index.ts              # PUBLIC API BARREL — explicitly exports only what external layers need
```

### Module Rules:
- **`index.ts` is the Gatekeeper**: Only things exported in `modules/<module>/index.ts` can be used outside the module.
- **RTK Query Integration**: Modules define endpoints by injecting them into `baseApi` from `shared/api`:
  ```ts
  import { baseApi } from '../../shared/api';

  export const quizEditorApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({ ... }),
  });
  ```
- **UI Components Breakdown**: Decompose large views into focused subcomponents inside `modules/<module>/ui/ComponentName/`.

---

## 4. Pages (`pages/`) Conventions

Pages are thin container components mapped to routes.

### Page Responsibilities:
1. Extract URL parameters (`useParams`, `useSearchParams`).
2. Trigger module queries/mutations or bind module contexts.
3. Compose module UI components with shared layouts and page grids.
4. Manage top-level navigation (`useNavigate`).

### Page Restrictions:
- ❌ **NO heavy business logic**: Move data manipulation and business rules to module services/hooks/utilities.
- ❌ **NO raw micro-UI implementation**: Pages compose components from `modules/` and `shared/ui`.
- ❌ **NO direct DB or low-level API calls**: Use RTK Query hooks exported by modules.

```ts
// Example: pages/main/QuizDraftsPage/QuizDraftsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyDraftsQuery,
  useCreateQuizMutation,
  DraftsTopbar,
  DraftsHero,
  DraftsGrid,
} from '../../../modules/quiz-editor';
import styles from '../../../modules/quiz-editor/ui/Drafts.module.css';

export function QuizDraftsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyDraftsQuery();
  // Compose module components...
}
```

---

## 5. Shared (`shared/`) Conventions

The `shared/` directory contains universal, domain-agnostic utilities and reusable UI components.

- **`shared/api`**: Holds the root `baseApi` (RTK Query), HTTP client wrapper, authentication token storage handlers (`localStorage`), and header builders.
- **`shared/ui`**: Holds general routing wrappers (`ProtectedRoute`, `PublicRoute`), high-level application layouts (`Layout`, `TeacherLayout`), and common icon components (`icons/`).
- **`shared/i18n`**: Multi-language localization engine, locale providers, translation dictionary (`t()`, `pluralize()`).
- **`shared/constants`**: Application constants, endpoints, theme color tokens.
- **`shared/index.ts`**: Re-exports all shared assets for clean, top-level imports.

---

## 6. General Coding & Export Standards

1. **Named Exports Only**: NEVER use `export default`. Always use explicit named exports:
   - ✅ `export function DraftCard() { ... }`
   - ❌ `export default function DraftCard() { ... }`
2. **Component Folder Pattern**: Every component resides in its own folder with `ComponentName.tsx` and an `index.ts` re-export:
   - `ui/DraftCard/DraftCard.tsx`
   - `ui/DraftCard/index.ts` (`export { DraftCard } from './DraftCard';`)
3. **CSS Modules**: All styles MUST use `.module.css` and be imported as `styles`:
   - ✅ `import styles from './DraftCard.module.css';`
   - ❌ `import './DraftCard.css';`
4. **No `.js` in Imports**: TypeScript files must never include `.js` extension in import specifiers.
5. **No Wildcard Imports in `index.ts`**: Explicitly declare named re-exports in barrel files.
