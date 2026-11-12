# Backend Architecture & Coding Conventions

## 1. Functional / Object-Literal Architecture (No ES Classes)
- **Controllers, Services, Repositories, and Socket Controllers** MUST be implemented as **object literals** conforming to an explicit contract interface (e.g. `export const UserController: UserControllerContract = { ... }`), NOT ES classes (`class UserController { ... }`).

## 2. Contracts & Type Definitions Naming & Structure
- Every module must maintain its interfaces and contracts inside `apps/backend/src/modules/<module>/types/` (e.g. `<module>.contracts.ts`, `<module>.types.ts`).
- Naming conventions for Contract Types:
  - `export type <Module>RepositoryContract = { ... }`
  - `export type <Module>ServiceContract = { ... }`
  - `export type <Module>ControllerContract = { ... }`
  - `export interface <Module>ClientEventsContract { ... }`
  - `export interface <Module>ServerEventsContract { ... }`
  - `export interface <Module>SocketControllerContract extends SocketController { ... }`

## 3. Express Controller Handler Typing
- Controller methods in `<Module>ControllerContract` return `Promise<void>`.
- Express handler parameters MUST specify generic types for `Request` and `Response`:
  - `req: Request<Params, ResBody, ReqBody, ReqQuery, AuthenticatedUser>`
  - `res: Response<ResBody, AuthenticatedUser & PaginationLocals>`
  - `next: NextFunction`
- Combine `AuthenticatedUser & PaginationLocals` in `res: Response<...>` whenever endpoints are paginated and authenticated.
- Pass pagination parameter `{ skip: number; take: number }` explicitly into Service / Repository methods.

## 4. DTOs & Prisma Types
- Derive database model types using Prisma payload helpers (`Prisma.<Model>GetPayload<{ ... }>`).
- Define explicit DTOs for inputs/outputs or infer from schemas (`InferType<typeof schema>`).

## 5. Route Registration
- Main API routes must be aggregated and registered in `apps/backend/src/app/routes.ts` (NOT in `modules/routes.ts`).
