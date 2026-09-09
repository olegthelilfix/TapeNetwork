# Project Instructions

It's an admin panel dedicated to manage media resources and data for other web applications. The admin panel is SPA React app and works only with BE (Rest API).

## Stack

The project uses:

* TypeScript
* React
* Vite
* Refine
* REST API provided by the backend

All new code must follow the conventions and architecture described in this document.

---

# Language and Syntax

## Modern ECMAScript Only

Use modern ECMAScript / ES6+ syntax exclusively.

Always use ES Modules.

Allowed:

```ts
import { something } from "./something";

export const value = something;
```

Do not use CommonJS.

Forbidden:

```ts
const foo = require("./foo");

module.exports = foo;
```

Use `const` by default.

Use `let` only when reassignment is required.

Never use `var`.

---

# Functions

All functions must be declared using arrow-function syntax.

Use:

```ts
const calculateTotal = (items: Item[]): number => {
    return items.reduce((total, item) => total + item.price, 0);
};
```

Do not use:

```ts
function calculateTotal(items: Item[]): number {
    return items.reduce((total, item) => total + item.price, 0);
}
```

This applies to:

* React components
* utility functions
* callbacks
* event handlers
* hooks
* service functions
* mappers
* validators
* factories

Prefer named `const` functions over anonymous inline functions when the logic is non-trivial.

---

# TypeScript

## Strict Typing

All code must be strictly typed.

The project must be compatible with TypeScript strict mode.

Never use:

```ts
any
```

This includes explicit and implicit usages such as:

```ts
const value: any = ...
Array<any>
Record<string, any>
Promise<any>
```

Use an appropriate concrete type instead.

If the value is genuinely unknown, use:

```ts
unknown
```

and narrow the type before using it.

Example:

```ts
const parseValue = (value: unknown): string => {
    if (typeof value !== "string") {
        throw new Error("Expected string value");
    }

    return value;
};

const isPerson = (value: unknown): value is Person => { ... }
```

Never suppress TypeScript errors using:

```ts
// @ts-ignore
```

Do not use:

```ts
// @ts-expect-error
```

unless there is an exceptional third-party compatibility issue that cannot reasonably be solved with proper typing.

Such exceptional cases must contain an explicit comment explaining why the suppression is required.

Do not bypass the type system merely to make the compiler pass.

Avoid unsafe type assertions such as:

```ts
value as SomeType
```

unless:

* the value has already been validated
* TypeScript cannot infer a known invariant
* a third-party API requires the assertion

Prefer type guards and runtime validation.

---

# React

## Component Declaration

Every React component must explicitly use the `FC` type imported from React.

Use:

```tsx
import type { FC } from "react";

type UserCardProps = {
    user: User;
};

export const UserCard: FC<UserCardProps> = ({ user }) => {
    return (
        <div>
            {user.name}
        </div>
    );
};
```

For components without props:

```tsx
import type { FC } from "react";

export const Dashboard: FC = () => {
    return <div>Dashboard</div>;
};
```

Do not declare React components without `FC`.

Forbidden:

```tsx
export const UserCard = ({ user }: UserCardProps) => {
    return <div>{user.name}</div>;
};
```

Forbidden:

```tsx
export function UserCard(props: UserCardProps) {
    return <div>{props.user.name}</div>;
}
```

---

# Component Modules

Every reusable component must be represented as a module with its own directory and public `index.ts`.

Example:

```text
UserCard/
├── UserCard.tsx
├── UserCard.types.ts
├── UserCard.utils.ts
└── index.ts
```

The public API must be exported through `index.ts`.

Example:

```ts
export { UserCard } from "./UserCard";
export type { UserCardProps } from "./UserCard.types";
```

Consumers outside the module must import from the module public API.

Use:

```ts
import { UserCard } from "@/ui/UserCard";
```

Avoid deep imports:

```ts
import { UserCard } from "@/ui/UserCard/UserCard";
```

---

# Private Components

If a component exists exclusively as an implementation detail of one parent component, it may remain inside the parent's module without creating an additional directory and `index.ts`.

Example:

```text
UserForm/
├── UserForm.tsx
├── UserFormField.tsx
├── UserFormActions.tsx
├── UserForm.types.ts
└── index.ts
```

This is appropriate when:

* `UserFormField` is used only by `UserForm`
* `UserFormActions` is used only by `UserForm`
* the components are implementation details rather than reusable application concepts

Do not create unnecessary directories and barrel files for private implementation details.

If such a component becomes reusable outside its owning module, extract it into a standalone module with its own `index.ts`.

---

# Architecture

The application follows a modular layered architecture.

The primary application layers are:

```text
src/
├── app/
├── pages/
├── features/
├── ui/
├── domain/
└── utils/
```

The primary dependency direction is:

```text
app
 ↓
pages
 ↓
features
 ↓
ui
 ↓
domain
```

Higher-level layers may depend on lower-level layers.

Lower-level layers must never depend on higher-level layers.

Circular dependencies between modules or layers are forbidden.

`utils` is not an application layer.

It is a collection of generic, application-independent helpers that may be used by any layer.

`utils` must not depend on application layers.

---

# Domain Layer

Location:

```text
src/domain/
```

The domain layer represents business concepts and business rules.

Examples:

```text
domain/
├── user/
├── order/
├── product/
├── subscription/
└── invoice/
```

A domain module may contain:

```text
domain/user/
├── User.ts
├── UserRole.ts
├── UserStatus.ts
├── user.utils.ts
└── index.ts
```

The domain layer may contain:

* entities
* domain types
* value objects
* enums or union types
* domain constants
* pure business rules
* pure validation rules
* calculations
* domain transformations

The domain layer must remain framework-independent.

It must not import:

* React
* Refine
* React Router
* UI libraries
* Axios
* API clients
* TanStack Query
* browser APIs
* application state libraries
* application UI components

In particular:

```ts
import { useList } from "@refinedev/core";
```

must never appear in the domain layer.

The domain layer must not know that:

* React exists
* Refine exists
* REST exists
* HTTP exists
* a particular backend implementation exists

Domain entities represent business concepts, not Refine resources.

Example:

```ts
export type User = {
    id: string;
    email: string;
    status: UserStatus;
};
```

This is a domain entity.

A Refine resource configuration such as:

```ts
{
    name: "users",
    list: "/users",
    show: "/users/:id",
}
```

is application configuration and must not live in `domain`.

Domain modules may import other domain modules when there is a genuine business dependency.

Keep cross-domain dependencies minimal.

Prefer keeping domain entities independent whenever possible.

---

# Refine Integration

Refine is application/framework infrastructure, not domain code.

Refine concepts such as:

* `<Refine>`
* resources
* `dataProvider`
* `authProvider`
* `accessControlProvider`
* routing configuration
* `useList`
* `useOne`
* `useCreate`
* `useUpdate`
* `useDelete`
* `useForm`
* `useTable`
* `useNavigation`
* other Refine-specific hooks

must not leak into the domain layer.

Refine resource definitions belong to application configuration.

Prefer:

```text
app/
├── App.tsx
├── router/
└── refine/
    ├── resources.ts
    ├── dataProvider.ts
    ├── authProvider.ts
    └── index.ts
```

Example:

```ts
export const resources = [
    {
        name: "users",
        list: "/users",
        create: "/users/create",
        edit: "/users/:id/edit",
        show: "/users/:id",
    },
];
```

Do not place Refine resource definitions inside domain modules.

For example, do not put Refine configuration inside:

```text
domain/user/
```

even when the Refine resource represents users.

---

# Backend API Boundary

Communication with the backend REST API must be isolated behind an explicit data-access boundary.

Refine CRUD operations should normally communicate with the backend through the configured `dataProvider`.

Prefer keeping Refine-specific API integration under:

```text
app/refine/
```

For example:

```text
app/refine/
├── dataProvider/
│   ├── dataProvider.ts
│   ├── mappers/
│   └── index.ts
├── authProvider/
├── resources.ts
└── index.ts
```

Do not call backend endpoints directly from presentational UI components.

Forbidden:

```tsx
export const UserCard: FC<UserCardProps> = ({ userId }) => {
    fetch(`/api/users/${userId}`);

    return ...;
};
```

Do not scatter backend-specific response structures throughout the application.

When an API response differs from the application's domain model, transform it at the API/data-provider boundary.

Conceptually:

```text
Backend API
    ↓
API DTO
    ↓
Data Provider / API Adapter
    ↓
Domain Model
    ↓
Feature
    ↓
UI
```

The domain model should represent the application's business concepts rather than accidental details of the backend transport format.

---

# UI Layer

Location:

```text
src/ui/
```

The UI layer contains reusable presentational components.

UI components should be as dumb and declarative as reasonably possible.

They may:

* receive strictly typed props
* render data
* emit events through callbacks
* manage local visual state
* use UI libraries
* format values for presentation

They should not:

* fetch remote data
* call backend APIs
* know API endpoints
* contain business workflows
* contain Refine CRUD orchestration
* perform route-level navigation decisions
* own complex application state

Example:

```tsx
type UserCardProps = {
    user: User;
    onEdit: (userId: string) => void;
};

export const UserCard: FC<UserCardProps> = ({
    user,
    onEdit,
}) => {
    return (
        <Card>
            <span>{user.email}</span>

            <Button onClick={() => onEdit(user.id)}>
                Edit
            </Button>
        </Card>
    );
};
```

The component knows:

* what should be rendered
* which interaction occurred

It does not know how the application handles that interaction.

---

# Features Layer

Location:

```text
src/features/
```

A feature represents meaningful application behavior or a user interaction.

Examples:

```text
features/
├── create-user/
├── edit-user/
├── user-list/
├── cancel-subscription/
├── change-user-role/
└── order-management/
```

Features are the primary location for application behavior.

Features may contain:

* Refine hooks
* queries
* mutations
* orchestration
* forms
* feature-specific state
* permissions
* validation orchestration
* navigation behavior
* transformations between application and UI data
* composition of domain entities and UI components

Example:

```text
features/user-list/
├── UserList.tsx
├── useUserList.ts
├── UserList.types.ts
└── index.ts
```

A feature may use Refine hooks such as:

```ts
useList<User>()
```

because the feature layer is allowed to know about application/framework infrastructure.

Feature modules must expose a small public API through `index.ts`.

Avoid importing internal files of another feature.

Prefer:

```ts
import { UserList } from "@/features/user-list";
```

instead of:

```ts
import { UserList } from "@/features/user-list/UserList";
```

Features should generally not depend directly on other features.

When multiple features must be composed, prefer doing so in:

* a page
* a deliberately introduced higher-level composition feature

If common logic appears in multiple features, first determine whether it belongs in:

* `domain`
* `ui`
* `utils`

instead of creating unnecessary feature-to-feature coupling.

---

# Pages Layer

Location:

```text
src/pages/
```

Pages represent complete route-level screens.

Examples:

```text
pages/
└── users/
    ├── UsersListPage/
    ├── UserShowPage/
    ├── UserCreatePage/
    └── UserEditPage/
```

Pages primarily compose features and UI.

Example:

```tsx
export const UsersListPage: FC = () => {
    return (
        <PageLayout>
            <UserFilters />
            <UserList />
        </PageLayout>
    );
};
```

Pages should contain minimal business logic.

Do not implement reusable business workflows directly inside pages.

If page logic becomes substantial, extract it into a feature.

Pages are allowed to know about:

* routing
* route parameters
* route-level Refine behavior

Prefer keeping reusable Refine-related logic inside features.

---

# App Layer

Location:

```text
src/app/
```

The `app` layer is the composition root and highest application layer.

It may contain:

* `<Refine>`
* React Router configuration
* Refine resources
* data providers
* auth providers
* access-control providers
* global providers
* application layout
* global error boundaries
* application initialization
* route registration
* dependency wiring

Example:

```text
app/
├── App.tsx
├── router/
│   ├── routes.tsx
│   └── index.ts
├── refine/
│   ├── resources.ts
│   ├── dataProvider/
│   ├── authProvider/
│   └── index.ts
└── index.ts
```

The app layer may depend on all lower application layers.

No lower layer may depend on `app`.

---

# Utils

Location:

```text
src/utils/
```

`utils` is not part of the application layer hierarchy.

It contains generic reusable technical code that does not belong to any business domain.

Examples:

```text
utils/
├── hooks/
├── date/
├── format/
├── validation/
├── storage/
└── collection/
```

Examples of appropriate utilities:

* generic date helpers
* generic formatting helpers
* generic collection helpers
* generic debounce/throttle functions
* generic browser storage helpers
* generic React hooks
* reusable type guards
* generic runtime helpers

For example:

```text
utils/hooks/
├── useDebounce/
├── usePrevious/
└── useLocalStorage/
```

Utility code must remain independent of application architecture.

`utils` must not import from:

```text
domain/
ui/
features/
pages/
app/
```

All application layers may import from `utils` when appropriate.

Conceptually:

```text
                  app
                   ↓
                 pages
                   ↓
                features
                   ↓
                  ui
                   ↓
                domain

utils ─────────────────────────
       usable by every layer
       depends on no layer
```

Do not use `utils` as a dumping ground.

A function does not belong in `utils` merely because it is reusable.

If a function understands a business concept, it belongs to the corresponding domain module.

Example:

```ts
const calculateSubscriptionPrice = (...) => ...
```

belongs in:

```text
domain/subscription/
```

not:

```text
utils/
```

A good utility should normally make sense in an unrelated application.

---

# Local Module Utilities

Domain-specific or module-specific helpers should remain close to the module that owns them.

For example:

```text
domain/user/
├── User.ts
├── UserStatus.ts
├── user.utils.ts
└── index.ts
```

A helper such as:

```ts
isUserActive(user)
```

belongs to the user domain module because it understands what a `User` is.

It must not be moved to global:

```text
src/utils/
```

simply because multiple files use it.

Similarly, feature-specific helpers belong to their feature.

Example:

```text
features/user-list/
├── UserList.tsx
├── useUserList.ts
├── userList.utils.ts
└── index.ts
```

Prefer colocating specialized code with its owner over creating global abstractions.

---

# Dependency Rules

The application layer hierarchy is:

```text
domain
   ↑
ui
   ↑
features
   ↑
pages
   ↑
app
```

Allowed dependencies:

```text
domain   → utils

ui       → domain
ui       → utils

features → ui
features → domain
features → utils

pages    → features
pages    → ui
pages    → domain
pages    → utils

app      → pages
app      → features
app      → ui
app      → domain
app      → utils
```

Forbidden dependencies include:

```text
domain   → ui
domain   → features
domain   → pages
domain   → app

ui       → features
ui       → pages
ui       → app

features → pages
features → app

pages    → app

utils    → domain
utils    → ui
utils    → features
utils    → pages
utils    → app
```

When an architectural violation appears necessary, reconsider where the code belongs before introducing the dependency.

Circular dependencies are forbidden.

---

# Public Module APIs

Modules must expose an explicit public API through `index.ts`.

Example:

```text
domain/user/
├── User.ts
├── UserRole.ts
├── user.utils.ts
└── index.ts
```

```ts
export type { User } from "./User";
export type { UserRole } from "./UserRole";
export { isUserActive } from "./user.utils";
```

External modules must import through the public API.

Use:

```ts
import {
    type User,
    isUserActive,
} from "@/domain/user";
```

Avoid:

```ts
import type { User } from "@/domain/user/User";
```

Files inside the same module may use relative imports.

---

# File Responsibilities

Prefer small files with one clear responsibility.

Avoid components that simultaneously contain:

* data fetching
* business logic
* mutations
* value formatting
* complex layout
* routing
* modal state
* application orchestration

Extract responsibilities according to architectural boundaries.

However, do not create abstractions solely to reduce line count.

Prefer a small cohesive implementation over unnecessary indirection.

---

# API Access

Backend API access must not be performed directly from arbitrary React components.

Do not call `fetch` or Axios directly from UI components.

Refine CRUD operations should normally go through the configured `dataProvider` and Refine hooks.

Custom backend operations should go through an explicit API abstraction.

Never hardcode backend base URLs inside components.

Backend-specific DTOs must not leak into unrelated UI or domain modules when they differ from the application's domain representation.

---

# Business Logic

Business logic must not live in presentational components.

Pure business rules belong in:

```text
domain/
```

Application workflows and orchestration belong in:

```text
features/
```

Reusable presentation belongs in:

```text
ui/
```

Route-level composition belongs in:

```text
pages/
```

Framework initialization and global wiring belong in:

```text
app/
```

Generic application-independent helpers belong in:

```text
utils/
```

---

# Existing Architecture

Before introducing a new pattern:

1. Inspect existing modules with similar responsibilities.
2. Follow established project conventions where they do not violate this document.
3. Reuse existing components, hooks, utilities and abstractions.
4. Do not introduce duplicate implementations.
5. Do not add a dependency when the requirement can reasonably be implemented using the existing stack.
6. Determine the correct architectural owner of new code before creating files.

When modifying an existing module, preserve its public API unless the task explicitly requires a breaking change.

---

# Validation

Before considering a development task complete, run the relevant project checks.

At minimum, when available:

```bash
npm run lint
npm run typecheck
npm test
```

For changes that may affect production compilation also run:

```bash
npm run build
```

Do not consider the task complete when:

* TypeScript errors remain
* lint errors remain
* relevant tests fail
* the production build fails because of the changes

Do not disable validation rules merely to make checks pass.

Fix the underlying issue instead.

---

# General Principles

Prefer:

* explicit code over hidden magic
* strict types over assertions
* composition over coupling
* framework-independent domain models
* colocated domain logic
* reusable presentational UI
* features for application behavior
* pages for route-level composition
* Refine as application infrastructure rather than part of the domain
* small explicit public module APIs
* generic utilities only when they are truly generic

Do not over-engineer simple functionality.

Do not introduce architectural layers without a clear responsibility.

Do not move code to global `utils` merely because it is reused.

Before creating a new abstraction, verify that it solves an existing architectural or reuse problem.
