---
trigger: always_on
description: Rules and conventions for structuring React components, dedicated component directories, adjacent .types.ts files, component-scoped styles (.module.css), prop contracts, and type-only imports.
---

# Frontend Component Architecture & Types Rule

## Core Requirements

1. **Dedicated Directory (1 Component = 1 Directory)**:
   Every React component **MUST** reside in its own dedicated folder named after the component.

2. **Separated Types (`ComponentName.types.ts`)**:
   Every React component that accepts props or defines component-specific types/interfaces **MUST** keep those type definitions in a separate `.types.ts` file located directly adjacent to the component's `.tsx` file.

3. **Component-Scoped Styles (`ComponentName.module.css`)**:
   Styles that apply to a specific component **MUST** be placed in a dedicated `ComponentName.module.css` file located directly adjacent to the component's `.tsx` file (e.g., `QuizCard.tsx` + `QuizCard.module.css`).
   - **Do NOT** dump component-specific classes into a large monolithic shared CSS module (e.g. `GameSession.module.css`, `Classes.module.css`, `Drafts.module.css`).
   - Each component owns its own styles and imports its own `./ComponentName.module.css`.

4. **Centralized Module Validators (`modules/<currentModule>/models/validators/`)**:
   All form validation schemas (Zod validators, etc.) for components, modals, and forms **MUST** reside in the module's `models/validators/` directory (e.g., `modules/<moduleName>/models/validators/`).
   - Do **NOT** declare Zod schemas inside component folders or inline in `ComponentName.types.ts`.
   - Export schemas and their inferred types from `models/validators/` and import them into component types or components.

---

## File Structure Conventions

```
ComponentName/
├── ComponentName.tsx          # Component logic and JSX
├── ComponentName.types.ts     # Props, UI variants, and component-specific types
├── ComponentName.module.css   # Component-specific styles (strictly scoped)
└── index.ts                   # Public exports (component and types)
```

---

## Guidelines & Best Practices

### 1. Separation of Responsibilities & File Roles
- **`ComponentName.types.ts`**:
  - Component props interface (`[ComponentName]Props`).
  - UI state, variants, sizes, sub-component props (`[ComponentName]Variant`, `[ComponentName]Size`, etc.).
  - Handler signatures specific to this component.
- **`ComponentName.module.css`**:
  - All CSS classes, animations, and responsive rules strictly scoped to this component.
- **`ComponentName.tsx`**:
  - Component implementation, hooks, and JSX markup.
  - Type imports via explicit `import type`:
    ```typescript
    import type { ButtonProps, ButtonVariant } from './Button.types';
    import styles from './Button.module.css';
    ```
- **`index.ts`**:
  - Barrel export for public consumption:
    ```typescript
    export { Button } from './Button';
    export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
    ```

### 2. Component-Scoped Styling (`.module.css`)
- Each component that has non-trivial styling MUST have its own adjacent `ComponentName.module.css`.
- Classes should use kebab-case or camelCase consistently and describe local component elements (e.g. `.card`, `.header`, `.avatar`, `.badge`, `.actions`).
- Shared design tokens (colors, radii, shadows, typography) should be referenced via CSS variables (`var(--color-bg-surface)`, `var(--radius-md)`), rather than copy-pasting raw hex values across files.

### 3. Naming Conventions
- **Props interface**: `[ComponentName]Props` (e.g., `ButtonProps`, `PasswordInputProps`, `UserCardProps`).
- **Variants / Sizes / UI states**: `[ComponentName][Aspect]` (e.g., `ButtonVariant`, `ButtonSize`, `DropdownOption`).
- **Event handlers**: `on[Action]` with strongly typed payloads (e.g., `onSelect: (id: string) => void`, `onOpenChange: (isOpen: boolean) => void`).

### 4. Domain vs Component Types (Single Source of Truth)
- **Do not redefine domain models** in `.types.ts`.
- Domain entities (e.g., `User`, `Quiz`, `Question`, `ParticipantDto`) must be imported from their central location (e.g., `@viaquiz/shared-types`, `@/modules/auth/models`, `@/models`).
- Use TypeScript utility types (`Pick`, `Omit`, indexed access `Entity['id']`) to compose component props:
  ```typescript
  import type { User } from '@/modules/auth/models';

  export interface UserCardProps {
    user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
    isActive?: boolean;
    onSelect?: (userId: User['id']) => void;
  }
  ```

### 5. Native HTML Attribute Inheritance
For atomic UI components (buttons, inputs, links, cards), extend native React HTML element attributes to support standard props (`disabled`, `aria-*`, `tabIndex`, `ref`, etc.):
```typescript
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
}
```

### 6. Discriminated Unions for Mutually Exclusive Props
Use discriminated unions when a component supports multiple mutually exclusive modes to prevent invalid prop combinations:
```typescript
import type { ReactNode } from 'react';

type AsButtonProps = {
  as?: 'button';
  onClick?: () => void;
  href?: never;
};

type AsLinkProps = {
  as: 'a';
  href: string;
  onClick?: never;
};

export type LinkButtonProps = (AsButtonProps | AsLinkProps) & {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
};
```

### 7. Re-exporting via `index.ts` (Barrel Files)
When exporting a component through a barrel file (`index.ts`), always re-export its types alongside the component:
```typescript
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
```

### 8. Exceptions: Trivial Components
- If a component does not accept any props and has no local types (e.g., static page wrapper `NotFoundPage`, simple static skeleton), a `.types.ts` file **should not be created** to avoid empty boilerplate files.
- If a component does not require custom CSS, a `.module.css` file **should not be created**.

### 9. Form Validators & Schemas (`modules/<moduleName>/models/validators/`)
- All form validation schemas (e.g. Zod validators) for components, modals, and forms **MUST** reside in the module's `models/validators/` directory:
  ```
  modules/<moduleName>/
  ├── models/
  │   ├── validators/
  │   │   ├── <featureName>.validator.ts   # Zod schema and inferred types
  │   │   └── index.ts                     # Public validator exports
  │   └── ...
  ├── ui/
  │   └── ComponentName/
  │       ├── ComponentName.tsx
  │       ├── ComponentName.types.ts       # Imports types from ../../models/validators
  │       └── ...
  ```
- **Do NOT** define Zod schemas directly inside component `.tsx` or `ComponentName.types.ts`. Keep them centralized and reusable in `models/validators/`.


---

## Examples

### ❌ Incorrect (Shared massive CSS, embedded types, duplicated domain models)
```
# BAD STRUCTURE:
ui/
├── UserCard.tsx             # Types inside .tsx, imports monolithic ../CommonStyles.module.css
└── CommonStyles.module.css  # 2000 lines of CSS for 10 unrelated components
```

```tsx
// UserCard.tsx — BAD
import styles from '../CommonStyles.module.css';

export interface UserCardProps {
  userId: string;       // Duplicated from User model
  userName: string;     // Duplicated from User model
  userEmail: string;    // Duplicated from User model
  role: 'admin' | 'student'; // Duplicated union, desync risk
  isActive?: boolean;
}

export function UserCard({ userId, userName, userEmail, role, isActive }: UserCardProps) {
  return <div className={`${styles['user-card']} ${isActive ? styles['active'] : ''}`}>{userName} ({role})</div>;
}
```

### ✅ Correct (Isolated directory with .tsx, .types.ts, .module.css, and index.ts)

```
# GOOD STRUCTURE:
UserCard/
├── UserCard.tsx
├── UserCard.types.ts
├── UserCard.module.css
└── index.ts
```

```typescript
// UserCard.types.ts — GOOD
import type { User } from '@/modules/auth/models';

export type UserCardVariant = 'compact' | 'full';

export interface UserCardProps {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl' | 'role'>;
  variant?: UserCardVariant;
  isActive?: boolean;
  onSelect?: (userId: User['id']) => void;
}
```

```css
/* UserCard.module.css — GOOD */
.card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--color-bg-surface, #1a1a26);
  border: 1px solid var(--color-border, #2a2a3a);
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.card:hover {
  border-color: var(--color-accent, #863bff);
}

.card--compact {
  padding: 0.5rem 0.75rem;
}

.active {
  border-color: var(--color-accent, #863bff);
  background: var(--color-bg-accent-subtle, rgba(134, 59, 255, 0.1));
}

.name {
  font-weight: 600;
  color: #fff;
}

.email {
  font-size: 0.875rem;
  color: var(--color-text-muted, #9090a8);
}
```

```tsx
// UserCard.tsx — GOOD
import type { UserCardProps } from './UserCard.types';
import styles from './UserCard.module.css';

export function UserCard({
  user,
  variant = 'compact',
  isActive = false,
  onSelect,
}: UserCardProps) {
  return (
    <div
      className={`${styles.card} ${styles[`card--${variant}`]} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect?.(user.id)}
    >
      <span className={styles.name}>{user.name}</span>
      <span className={styles.email}>{user.email}</span>
    </div>
  );
}
```

```typescript
// index.ts — GOOD
export { UserCard } from './UserCard';
export type { UserCardProps, UserCardVariant } from './UserCard.types';
```
