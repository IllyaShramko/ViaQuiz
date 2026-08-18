# Import & Export Conventions

## 1. No Wildcard Imports in `index.ts` Files
- **Do NOT use wildcard imports** (`import * from "..."` or `import * as Name from "..."`) in `index.ts` files.
- Always explicitly list exact named imports:
  - ❌ `import * from "./routes";`
  - ✅ `import { apiRouter, authRouter } from "./routes";`

## 2. Direct Re-Exports
- **Do NOT** split re-exporting into import followed by export.
  - ❌
    ```ts
    import { apiRouter } from "../app/routes";
    export { apiRouter };
    ```
  - ✅
    ```ts
    export { apiRouter } from "../app/routes";
    ```

## 3. Inline Export Declarations
- If a file defines a variable, function, type, interface, or constant that will 100% be exported from the file, write `export` directly in front of its declaration (`const`, `let`, `function`, `type`, `interface`, etc.).
  - ❌
    ```ts
    const apiRouter: Router = Router();
    export { apiRouter };
    ```
  - ✅
    ```ts
    export const apiRouter: Router = Router();
    ```
## 4. NO .js in imports
  - ❌ `import { apiRouter, authRouter } from "./routes.js";`
  - ✅ `import { apiRouter, authRouter } from "./routes";`

## 5. No Default Exports (`export default`)
- **NEVER use `export default`**. Always use named exports (`export const ...`, `export function ...`, `export type ...`, etc.).
- Always use named imports (`import { ... } from "..."`).
  - ❌
    ```ts
    // myService.ts
    const myService = { ... };
    export default myService;

    // consumer.ts
    import myService from "./myService";
    ```
  - ✅
    ```ts
    // myService.ts
    export const myService = { ... };

    // consumer.ts
    import { myService } from "./myService";
    ```

## 6. CSS Modules & Style Imports
- **CSS File Naming**: All component/page `.css` files MUST be named using the `.module.css` extension (e.g., `QuizDraftsPage.module.css`, not `QuizDraftsPage.css`).
- **CSS Imports**: NEVER use direct side-effect imports for component styles (e.g., `import './QuizDraftsPage.css';`). Always import class names as `styles` from the corresponding `.module.css` file:
  - ❌
    ```ts
    import './QuizDraftsPage.css';
    import './QuizDraftsPage.module.css';
    ```
  - ✅
    ```ts
    import styles from './QuizDraftsPage.module.css';
    ```