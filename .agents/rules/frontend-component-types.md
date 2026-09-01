---
trigger: always_on
description: Rules and conventions for structuring React component types, adjacent .types.ts files, prop contracts, and type-only imports.
---

# Frontend Component Types Rule

## Core Requirement
Every React component that accepts props or defines component-specific types/interfaces **MUST** keep those type definitions in a separate `.types.ts` file located directly adjacent to the component's `.tsx` file.

---

## File Structure Conventions

```
ComponentName/
├── ComponentName.tsx          # Component logic and JSX
├── ComponentName.types.ts     # Props, UI variants, and component-specific types
├── ComponentName.module.css   # Component styles (if applicable)
└── index.ts                   # Public exports (component and types)
```

---

## Guidelines & Best Practices

### 1. Separation of Responsibilities & Type-Only Imports
- **`ComponentName.types.ts`** contains:
  - Component props interface (`[ComponentName]Props`).
  - UI state, variants, sizes, sub-component props (`[ComponentName]Variant`, `[ComponentName]Size`, etc.).
  - Handler signatures specific to this component.
- **`ComponentName.tsx`** contains:
  - React component implementation, hooks, and JSX markup.
  - Type imports via explicit `import type`:
    ```typescript
    import type { ButtonProps, ButtonVariant } from './Button.types';
    ```

### 2. Naming Conventions
- **Props interface**: `[ComponentName]Props` (e.g., `ButtonProps`, `PasswordInputProps`, `UserCardProps`).
- **Variants / Sizes / UI states**: `[ComponentName][Aspect]` (e.g., `ButtonVariant`, `ButtonSize`, `DropdownOption`).
- **Event handlers**: `on[Action]` with strongly typed payloads (e.g., `onSelect: (id: string) => void`, `onOpenChange: (isOpen: boolean) => void`).

### 3. Domain vs Component Types (Single Source of Truth)
- **Do not redefine domain models** in `.types.ts`.
- Domain entities (e.g., `User`, `Quiz`, `Question`) must be imported from their central location (e.g., `@/entities`, `@/modules/auth/models`, `@/shared/types`).
- Use TypeScript utility types (`Pick`, `Omit`, indexed access `Entity['id']`) to compose component props:
  ```typescript
  import type { User } from '@/modules/auth/models';

  export interface UserCardProps {
    user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
    isActive?: boolean;
    onSelect?: (userId: User['id']) => void;
  }
  ```

### 4. Native HTML Attribute Inheritance
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

### 5. Discriminated Unions for Mutually Exclusive Props
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

### 6. Re-exporting via `index.ts` (Barrel Files)
When exporting a component through a barrel file (`index.ts`), always re-export its types alongside the component:
```typescript
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
```

### 7. Exceptions: Trivial Components
If a component does not accept any props and has no local types (e.g., static page wrapper `NotFoundPage`, simple static layout), a `.types.ts` file **should not be created** to avoid empty boilerplate files.

---

## Examples

### ❌ Incorrect (Types embedded inside .tsx and duplicated domain types)
```tsx
// UserCard.tsx — BAD
export interface UserCardProps {
  userId: string;       // Duplicated from User model
  userName: string;     // Duplicated from User model
  userEmail: string;    // Duplicated from User model
  role: 'admin' | 'student'; // Duplicated union, desync risk
  isActive?: boolean;
}

export function UserCard({ userId, userName, userEmail, role, isActive }: UserCardProps) {
  return <div className={`user-card ${isActive ? 'active' : ''}`}>{userName} ({role})</div>;
}
```

### ✅ Correct (Separated into .types.ts and .tsx with domain type composition)

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
