---
trigger: always_on
description: Requires all code comments, docstrings, and technical annotations across the entire codebase to be written strictly in English.
---

# Code Comments Language Rule

## Core Requirements

1. **English Only for Comments**:
   All comments within code files across the entire project (backend, frontend, shared packages, scripts, configurations) **MUST** be written strictly in **English**.
   - Single-line comments (`// ...`)
   - Multi-line / block comments (`/* ... */`)
   - JSDoc and TSDoc annotations (`/** ... */`)
   - Shell script comments (`# ...`)

2. **No Non-English Comments in Code**:
   - **Do NOT** write comments in Ukrainian, Russian, or any other language in code files.
   - When modifying or refactoring existing code files, translate any legacy non-English comments in the touched sections to clear English.

3. **Exceptions & Clarifications**:
   - **User-Facing UI Strings & i18n**: Application text, error messages displayed to end users, and localization JSON files (`locales/uk.json`, etc.) should use the appropriate language required for the product UI.
   - **Mock & Seed Data**: Specific test fixtures or seed values representing Ukrainian text/names (e.g. sample quiz titles or Ukrainian names in seeds) are allowed.
   - **Git Commit Messages & PRs**: Follow standard team conventions (English preferred).
