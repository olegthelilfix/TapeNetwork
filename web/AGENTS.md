# Project Instructions

## Stack

The project uses:

* TypeScript
* React
* Next.js with App Router
* REST API provided by the backend
* `@devexperts/swagger-codegen-ts`
* `@devexperts/remote-data-ts`
* `fp-ts`
* `io-ts`

The majority of application pages are rendered on the server using SSR.

All new handwritten code must follow the conventions and architecture described in this document.

Generated code under `src/api/` is excluded from handwritten-code style rules.

---

# General Principles

Prefer:

* strict typing
* explicit code
* immutable data where practical
* Server Components over Client Components
* SSR over unnecessary client-side data loading
* small client-side islands
* explicit server/client boundaries
* functional error handling
* generated API clients over handwritten endpoint requests
* application controllers over direct generated API usage
* domain entities over transport DTOs
* explicit DTO-to-domain mapping
* small public module APIs
* colocated business logic
* composition over coupling
* thin Next.js route files

Avoid:

* `any`
* `@ts-ignore`
* unnecessary type assertions
* direct API calls from UI
* leaking DTOs through the application
* importing server code into client code
* unnecessarily marking large trees as `"use client"`
* manually editing generated API files
* ad-hoc error/loading/data state objects
* unnecessary abstractions
* unnecessary architectural layers
* feature-to-feature coupling

Before introducing a new abstraction, ensure that it solves a real architectural, ownership, or reuse problem.

---

# Language and Syntax

## Modern ECMAScript

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

All handwritten functions must use arrow-function syntax.

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

This rule applies to:

* React components
* utility functions
* hooks
* callbacks
* event handlers
* controllers
* mappers
* factories
* validators
* Route Handlers
* Server Actions
* metadata generators
* service functions
* application helpers

When Next.js requires a named export, export an arrow function.

Example:

```ts
export const GET = async (): Promise<Response> => {
    // ...
};
```

Prefer named arrow functions over complex anonymous inline functions.

---

# TypeScript

## Strict Typing

All handwritten code must be strictly typed.

The project must remain compatible with TypeScript strict mode.

Never use:

```ts
any
```

This includes:

```ts
const value: any = ...
Array<any>
Record<string, any>
Promise<any>
```

Use a concrete type whenever possible.

If a value is genuinely unknown, use:

```ts
unknown
```

and narrow or validate it before use.

Example:

```ts
const parseValue = (value: unknown): string => {
    if (typeof value !== "string") {
        throw new Error("Expected string");
    }

    return value;
};
```

---

# TypeScript Error Suppression

Never use:

```ts
// @ts-ignore
```

Avoid:

```ts
// @ts-expect-error
```

unless there is an unavoidable compatibility problem with a third-party dependency.

Any such exception must contain an explicit comment explaining why it is required.

Do not suppress TypeScript errors merely to make compilation pass.

Fix the underlying type problem instead.

---

# Type Assertions

Avoid unsafe assertions:

```ts
value as SomeType
```

unless:

* the value has already been validated
* TypeScript cannot express a known invariant
* a third-party API requires the assertion

Prefer:

* type guards
* proper inference
* `io-ts`
* generated Swagger codecs
* discriminated unions

Do not use type assertions as a substitute for runtime validation.

---

# React Components

Every React component must explicitly use the `FC` type imported from React.

Use:

```tsx
import type { FC } from "react";

type UserCardProps = {
    user: User;
};

export const UserCard: FC<UserCardProps> = ({ user }) => {
    return <div>{user.name}</div>;
};
```

For components without props:

```tsx
import type { FC } from "react";

export const Dashboard: FC = () => {
    return <div>Dashboard</div>;
};
```

Do not declare React components as ordinary untyped arrow functions.

Do not use function declarations for React components.

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

This rule also applies to Next.js page and layout components.

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

Public exports must go through `index.ts`.

Example:

```ts
export { UserCard } from "./UserCard";
export type { UserCardProps } from "./UserCard.types";
```

Consumers outside the module should import through the module's public API.

Use:

```ts
import { UserCard } from "@/ui/UserCard";
```

Avoid:

```ts
import { UserCard } from "@/ui/UserCard/UserCard";
```

---

# Private Components

Components used exclusively by one parent component may remain inside that parent's directory without creating separate subdirectories and `index.ts` files.

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

* `UserFormField` is only used by `UserForm`
* `UserFormActions` is only used by `UserForm`
* these components are implementation details

Do not create unnecessary folders and barrel files for private implementation details.

If a private component becomes reusable outside its owning module, extract it into its own module.

---

# Architecture

The application uses a modular layered architecture.

Primary structure:

```text
src/
├── app/
├── features/
├── ui/
├── services/
│   ├── server/
│   └── client/
├── domain/
├── utils/
└── api/
```

The core application layers are:

```text
app
 ↓
features
 ↓
ui
 ↓
domain
```

`services` represents integration/application services.

`api` represents generated transport infrastructure.

`utils` contains generic technical helpers and is not considered an application layer.

---

# Architectural Responsibility

The intended responsibilities are:

```text
app
    routing
    SSR entry points
    layouts
    route composition

features
    application behavior
    use cases
    orchestration

ui
    reusable presentation

domain
    business entities
    business rules

services
    backend integration
    controllers
    HTTP clients
    DTO mapping

api
    generated OpenAPI transport layer

utils
    generic application-independent helpers
```

---

# App Layer

Location:

```text
src/app/
```

The `app` directory is the Next.js App Router and the highest composition layer.

It may contain:

* `page.tsx`
* `layout.tsx`
* `loading.tsx`
* `error.tsx`
* `global-error.tsx`
* `not-found.tsx`
* `route.ts`
* route groups
* dynamic route segments
* Server Actions
* metadata
* route-specific composition

Route-level files must remain as thin as reasonably possible.

A page should primarily:

1. read route/request data
2. invoke a feature or server controller
3. compose features/UI
4. select route-level behavior
5. handle route-specific conditions

Do not place substantial business logic directly in `page.tsx`.

Avoid:

```text
page.tsx
    ↓
API calls
mapping
validation
business logic
500 lines of UI
```

Prefer:

```text
page.tsx
    ↓
feature
    ↓
server controller
```

---

# Next.js App Router

Use the App Router architecture.

Do not introduce the legacy Pages Router for new application functionality.

Route-level concerns belong under:

```text
src/app/
```

Application features should remain outside `app` unless they are strictly route-specific implementation details.

Do not turn `app/` into a general-purpose components directory.

---

# Server Components First

React Server Components are the default.

Do not add:

```ts
"use client";
```

unless client-side execution is genuinely required.

Prefer Server Components for:

* backend API access
* initial data loading
* authenticated rendering
* authorization checks
* expensive transformations
* server-only orchestration
* initial page rendering
* SEO-sensitive content

Use Client Components only when necessary for:

* `useState`
* `useEffect`
* event handlers
* browser APIs
* browser-only libraries
* interactive local state
* client-side polling
* client-side requests

Keep `"use client"` boundaries as deep as possible.

Prefer:

```text
Server Page
├── Server Feature
├── Server UI
└── Small Client Component
```

instead of:

```text
"use client"

Entire Page
└── Everything runs in client graph
```

---

# SSR

The default rendering strategy for application pages is SSR.

Most application data should be loaded on the server.

Do not accidentally replace request-time rendering with:

* static generation
* ISR
* browser-only initial loading

when SSR is required.

Where explicitly necessary to guarantee request-time rendering, use the appropriate Next.js dynamic rendering configuration.

For example:

```ts
export const dynamic = "force-dynamic";
```

Caching must always be intentional.

When introducing caching:

* document why the data may be cached
* define invalidation behavior
* verify that user-specific data cannot leak between users
* do not cache authorization state incorrectly

---

# Server and Client Boundaries

Server and client code must be explicitly separated.

Server-only modules must use:

```ts
import "server-only";
```

This especially applies to:

```text
services/server/
```

and other modules that:

* access secrets
* access secure environment variables
* use server authentication
* use Node/server-only APIs
* create backend HTTP clients
* contain server controllers

Never import a server-only module into a Client Component.

---

# Client-Only Modules

Modules inherently dependent on browser APIs may use:

```ts
import "client-only";
```

Examples:

* `window`
* `document`
* `localStorage`
* browser-only SDKs

Browser-specific code must not be imported into server-only infrastructure.

---

# Environment Boundary

Every dependency must satisfy two different constraints:

## Architectural dependency

```text
app → features → ui → domain
```

## Runtime dependency

```text
client code must never depend on server-only code
```

A dependency may be architecturally reasonable but still runtime-invalid.

For example:

```text
Client Feature
      ↓
Server Controller
```

is forbidden.

---

# Bundle Size

Preventing server infrastructure from leaking into the browser bundle is an architectural requirement.

Before introducing `"use client"`:

1. inspect the module's dependencies
2. ensure no server controller becomes reachable
3. ensure no server HTTP service becomes reachable
4. determine whether generated API runtime code becomes reachable
5. determine whether `fp-ts`, `io-ts`, generated codecs, or other heavy dependencies are unnecessarily pulled into the client graph
6. keep the client boundary as small as possible

Do not move functionality into the client merely because it is convenient.

Prefer server execution.

---

# Domain Layer

Location:

```text
src/domain/
```

The domain layer represents application/business concepts.

Example:

```text
domain/
├── schedule/
├── show/
├── video/
├── user/
└── category/
```

Example module:

```text
domain/show/
├── Show.ts
├── ShowStatus.ts
├── show.factory.ts
├── show.utils.ts
└── index.ts
```

The domain layer may contain:

* entities
* value objects
* domain types
* discriminated unions
* domain constants
* business rules
* pure business validation
* calculations
* factories
* transformations between domain concepts

---

# Domain Independence

The domain layer must remain independent from infrastructure.

It must not know about:

* React
* Next.js
* Swagger
* OpenAPI
* generated DTOs
* generated controllers
* HTTP
* REST
* browser APIs
* server controllers
* client controllers
* UI components

Never import:

```text
src/api/
```

into:

```text
src/domain/
```

even as a type-only import.

---

# Domain Entities Are Not DTOs

Generated API DTOs are transport types.

They are not automatically application/domain entities.

For example:

```text
ScheduleItemDtoV1
```

is a transport DTO.

A domain/application type should have an application-oriented name:

```text
ScheduleItem
```

Do not propagate generated DTOs through features and UI merely because they already have TypeScript types.

---

# Domain Factories

When creating a domain entity requires validation or invariants, expose a pure domain factory.

Example:

```ts
export type CreateScheduleItemInput = {
    id: string;
    title: string;
};

export const createScheduleItem = (
    input: CreateScheduleItemInput,
): ScheduleItem => {
    return {
        id: input.id,
        title: input.title,
    };
};
```

The factory must accept transport-independent input.

Do not write:

```ts
const createScheduleItem = (
    dto: ScheduleItemDtoV1,
): ScheduleItem => ...
```

inside the domain layer.

---

# UI Layer

Location:

```text
src/ui/
```

The UI layer contains reusable presentational components.

UI components should be as dumb and declarative as reasonably possible.

They may:

* receive typed props
* render data
* emit callbacks
* manage purely local visual state
* use UI libraries
* format values for presentation

They should not:

* call backend endpoints
* import generated API controllers
* import generated DTOs
* import server controllers
* contain backend orchestration
* perform business workflows
* know backend URL structures

Example:

```tsx
type ShowCardProps = {
    show: Show;
};

export const ShowCard: FC<ShowCardProps> = ({
    show,
}) => {
    return <div>{show.title}</div>;
};
```

---

# UI and Server Components

A UI component should remain a Server Component unless client functionality is required.

Do not add `"use client"` merely because a component is reusable.

Example:

```tsx
import type { FC } from "react";

export const ShowTitle: FC<ShowTitleProps> = ({
    show,
}) => {
    return <h1>{show.title}</h1>;
};
```

This should remain server-compatible.

Interactive components may be client components:

```tsx
"use client";

import type { FC } from "react";

export const FavoriteButton: FC<FavoriteButtonProps> = ({
    showId,
}) => {
    // ...
};
```

Prefer small client islands.

---

# Features Layer

Location:

```text
src/features/
```

A feature represents meaningful application behavior or a use case.

Examples:

```text
features/
├── show-details/
├── schedule-list/
├── video-player/
├── favorite-show/
├── show-search/
└── user-profile/
```

Features may contain:

* Server Components
* Client Components
* application orchestration
* feature-specific state
* controller calls
* transformations
* `fp-ts` pipelines
* `RemoteData`
* feature-specific UI
* feature-specific hooks

Features must not expose transport DTOs as their public API.

---

# Feature Dependencies

Features may depend on:

* domain
* UI
* utils
* appropriate service layer
* `fp-ts`
* `@devexperts/remote-data-ts`

Features should generally not depend directly on other features.

If multiple features need composition, perform it at a higher level.

Usually:

```text
app/
```

or in an explicitly created higher-order composition feature.

If logic is shared between multiple features, first determine whether it actually belongs in:

* domain
* UI
* utils
* services

before introducing feature-to-feature coupling.

---

# Server Features

Server-rendered features may call server controllers directly.

Preferred:

```text
Server Page
    ↓
Server Feature
    ↓
Server Controller
```

Do not introduce an HTTP round trip through a Next.js Route Handler when direct server invocation is possible.

Avoid:

```text
Server Component
      ↓ HTTP
Next Route Handler
      ↓
Server Controller
```

when this is possible:

```text
Server Component
      ↓
Server Controller
```

---

# Client Features

Client features must not import server controllers.

Allowed:

```text
Client Feature
      ↓
Client Controller
```

or:

```text
Client Feature
      ↓
Server Action / Route Handler
      ↓
Server Controller
```

Prefer the second approach when direct browser-to-backend communication is unnecessary.

---

# Services Layer

Location:

```text
src/services/
```

The services layer is the integration boundary between application code and external systems.

Structure:

```text
services/
├── server/
│   ├── http/
│   └── controllers/
│
└── client/
    ├── http/
    └── controllers/
```

Server and client implementations must remain physically separated.

---

# Server Services

Location:

```text
src/services/server/
```

All server-only infrastructure must use:

```ts
import "server-only";
```

This includes:

```text
services/server/http/
services/server/controllers/
```

Server services may access:

* server environment variables
* secure backend URLs
* cookies
* request headers
* server authentication
* credentials
* Node APIs
* Next.js server APIs

None of this infrastructure may become reachable from a client dependency graph.

---

# Client Services

Location:

```text
src/services/client/
```

Client services are used only when direct browser-side backend access is genuinely required.

They must not import:

* `services/server`
* server-only environment configuration
* Node-only APIs
* secrets
* secure credentials
* modules marked `server-only`

Direct client API access is an exception, not the default.

---

# Generated API

The backend API client is generated using:

```text
@devexperts/swagger-codegen-ts
```

Generated files are stored in:

```text
src/api/
```

The generated API is transport infrastructure.

It is not application or domain code.

---

# API Generation

Generate the API using:

```bash
yarn gen:api
```

The generated API must exist before running commands that depend on its generated types or runtime modules.

On a clean checkout, run:

```bash
yarn gen:api
```

before relevant:

```bash
yarn typecheck
yarn test
yarn build
```

Build and CI pipelines must guarantee that API generation happens before compilation when required.

Never assume that `src/api/` already exists on a clean checkout.

---

# Generated API and Git

The generated API directory must not be committed.

`.gitignore` must contain:

```gitignore
/src/api/
```

Never manually edit files inside:

```text
src/api/
```

If generated output is wrong, fix:

* OpenAPI / Swagger specification
* generator configuration
* generator script
* generator templates

Do not patch generated files manually.

---

# Generated Code Style Exception

The normal handwritten-code style rules do not apply to:

```text
src/api/
```

Generated code may contain:

* function declarations
* classes
* overloads
* non-arrow functions
* different formatting
* generated naming conventions
* deep imports

Do not refactor generated files to conform to application coding conventions.

Generated code is treated as external machine-produced infrastructure.

---

# Generated API Structure

The exact structure is controlled by `@devexperts/swagger-codegen-ts`.

Typical generated files may include:

```text
src/api/
├── client/
│   └── client.ts
├── components/
│   └── schemas/
├── paths/
│   ├── ScheduleControllerController/
│   ├── ShowsControllerController/
│   └── VideosControllerController/
├── utils/
└── ...
```

Generated code may contain:

* DTO interfaces/types
* `io-ts` codecs
* generated controller factories
* request types
* HTTP client interfaces
* generated response validation
* Swagger/OpenAPI-specific utilities

---

# Generated HTTP Client Contract

The generator defines an abstract HTTP transport contract.

For example:

```ts
export interface HTTPClient2<F extends URIS2>
    extends MonadThrow2<F> {
    readonly request: (
        request: Request,
    ) => Kind2<F, unknown, unknown>;
}
```

Generated controllers do not own a concrete HTTP implementation.

Instead, they accept an HTTP client through dependency injection.

Conceptually:

```ts
const controller = scheduleControllerController({
    httpClient,
});
```

The application must provide the HTTP client implementation.

This is an intentional part of the generated architecture.

---

# HTTP Service

The project must implement its own HTTP service implementing the generated HTTP client abstraction.

Server implementation:

```text
src/services/server/http/
```

Recommended structure:

```text
services/server/http/
├── serverHttpClient.ts
├── http.errors.ts
└── index.ts
```

Client implementation, if required:

```text
services/client/http/
├── clientHttpClient.ts
├── http.errors.ts
└── index.ts
```

Do not implement transport behavior inside generated controllers.

---

# Server HTTP Service

The server HTTP implementation should normally use native `fetch`.

It should implement the generated:

```text
HTTPClient2
```

contract with the project's chosen `fp-ts` effect.

For this project, prefer `TaskEither`.

Conceptually:

```text
HTTPClient2<TaskEither URI>
```

The exact implementation must match the generated `fp-ts` interfaces.

---

# HTTP Service Responsibilities

The HTTP service is responsible only for transport-level concerns.

Responsibilities include:

* backend base URL
* HTTP method
* query string
* headers
* authentication headers
* cookies/request context
* request body serialization
* executing `fetch`
* network errors
* HTTP status handling
* parsing response bodies
* honoring generated `responseType`

Generated response types may include:

```text
json
text
blob
```

The HTTP service should decode the transport representation appropriately.

For JSON responses, it should conceptually produce:

```text
HTTP response
    ↓
response.json()
    ↓
unknown
```

---

# HTTP Service Must Not Validate API DTOs

Do not duplicate generated Swagger validation in the HTTP service.

Generated controllers already perform runtime validation using generated `io-ts` codecs.

For example:

```text
unknown
   ↓
array(ScheduleItemDtoV1IO).decode(...)
   ↓
ScheduleItemDtoV1[]
```

Therefore:

```text
HTTP Service
```

handles transport.

```text
Generated Controller
```

handles OpenAPI response validation.

```text
Domain
```

handles business invariants.

Keep these responsibilities separate.

---

# HTTP Status Handling

Do not assume `fetch` throws for HTTP errors.

Responses such as:

```text
400
401
403
404
500
```

are still valid `fetch` responses.

The HTTP service must explicitly inspect the status.

For example:

```ts
response.ok
```

or equivalent status logic.

Transport-level failures must be represented explicitly.

---

# HTTP Errors

At minimum, transport error handling should distinguish between:

* network failures
* failed HTTP status codes
* response parsing failures
* unexpected transport errors

Do not leak arbitrary raw `fetch` failures throughout the application.

Use typed errors.

Prefer discriminated unions where practical.

---

# TaskEither for HTTP Operations

Use `TaskEither` for fallible asynchronous transport operations.

Conceptually:

```text
Request
   ↓
TaskEither<HttpError, unknown>
```

The generated controller then composes runtime DTO validation on top of this computation.

Conceptually:

```text
TaskEither<HttpError, unknown>
           ↓
Generated io-ts decode
           ↓
TaskEither<Error, DTO>
```

Do not unwrap `TaskEither` merely to convert the entire flow into imperative Promise-based control flow.

Keep functional composition where practical.

---

# HTTP Client Factory

Prefer centralizing HTTP client creation.

Use either:

```text
serverHttpClient
```

or:

```text
createServerHttpClient(...)
```

Prefer a factory when configuration depends on request context.

Examples:

* auth cookies
* authorization token
* tenant context
* locale
* correlation ID
* request-specific headers

Do not independently reimplement HTTP transport inside every controller.

---

# Generated Controllers

Generated Swagger controllers live under:

```text
src/api/
```

For example:

```ts
scheduleControllerController({
    httpClient: serverHttpClient,
});
```

Generated controllers are transport controllers.

They are not the application's public service API.

Do not expose generated method names such as:

```text
list_14
```

to features or UI.

Generated method names are implementation details.

---

# Application Controllers

Handwritten application controllers live under:

```text
src/services/server/controllers/
```

or:

```text
src/services/client/controllers/
```

depending on runtime.

Example:

```text
services/server/controllers/
└── schedule/
    ├── schedule.controller.ts
    ├── schedule.mapper.ts
    ├── schedule.errors.ts
    └── index.ts
```

Application controllers are stable application-facing abstractions around generated API controllers.

For example:

```text
generated:

list_14()
```

should become something application-oriented such as:

```text
getSchedule()
```

Higher layers must use meaningful application API names rather than generated transport method names.

---

# Application Controller Responsibilities

Application controllers may:

* instantiate generated API controllers
* inject HTTP services
* call generated endpoints
* compose multiple backend operations
* normalize low-level errors
* map DTOs into application/domain entities
* expose stable application-oriented operations
* use `TaskEither`
* use `fp-ts`

Application controllers must not:

* render JSX
* contain presentational logic
* expose generated controller instances
* expose transport implementation details
* leak DTOs unnecessarily

---

# Recommended Server API Flow

The default server-side backend flow is:

```text
Next.js Server Component
          ↓
Server Feature
          ↓
Application Controller
          ↓
Generated Swagger Controller
          ↓
Server HTTP Service
          ↓
Backend
```

Response flow:

```text
Backend
   ↓
HTTP response
   ↓
Server HTTP Service
   ↓
unknown
   ↓
Generated io-ts validation
   ↓
DTO
   ↓
Service Mapper
   ↓
Domain Entity
   ↓
Feature
   ↓
UI
```

---

# DTO Mapping

Generated DTOs must be mapped at the service/integration boundary.

For example:

```text
services/server/controllers/schedule/
├── schedule.controller.ts
├── schedule.mapper.ts
└── index.ts
```

The mapper may import both:

```text
src/api/
```

and:

```text
src/domain/
```

because its job is to adapt transport types into application types.

Example:

```ts
import type { ScheduleItemDtoV1 } from "@/api/...";
import type { ScheduleItem } from "@/domain/schedule";

export const mapScheduleItemDto = (
    dto: ScheduleItemDtoV1,
): ScheduleItem => {
    return {
        id: dto.id,
        title: dto.title,
    };
};
```

DTO-to-domain mappers must not live in `domain` if they import generated DTOs.

---

# Mapper Direction

Preferred:

```text
Generated DTO
     ↓
Service Mapper
     ↓
Domain Entity
```

Forbidden:

```text
Domain Mapper
     ↓
imports generated DTO
```

The domain must not depend on the transport layer.

---

# Domain Factories with Mappers

When mapping requires enforcement of domain invariants:

```text
DTO
 ↓
Service Mapper
 ↓
transport-independent primitives/input
 ↓
Domain Factory
 ↓
Domain Entity
```

Example:

```ts
export type CreateShowInput = {
    id: string;
    title: string;
};

export const createShow = (
    input: CreateShowInput,
): Show => {
    // business invariants

    return {
        id: input.id,
        title: input.title,
    };
};
```

Service mapper:

```text
ShowDto
   ↓
extract values
   ↓
createShow(...)
   ↓
Show
```

---

# Generated DTO Leakage

Generated DTOs should normally only be referenced inside integration code.

Avoid importing generated DTOs directly into:

```text
domain/
ui/
features/
app/
```

Prefer application/domain types.

This isolates the rest of the application from OpenAPI schema changes.

---

# Type-Only Generated Imports

When a generated type is required only during compilation, use:

```ts
import type { ScheduleItemDtoV1 } from "@/api/...";
```

Do not use runtime imports for purely TypeScript types.

This is particularly important around client boundaries.

---

# Client Controllers

Direct browser-side backend requests are allowed only when they provide a real benefit.

Location:

```text
src/services/client/controllers/
```

Example:

```text
services/client/controllers/
└── schedule/
    ├── schedule.controller.ts
    ├── schedule.mapper.ts
    └── index.ts
```

Client controllers must never import server controllers.

---

# Client HTTP Service

When direct backend requests from the browser are needed, use a separate client HTTP service:

```text
src/services/client/http/
```

Never reuse:

```text
src/services/server/http/
```

inside the browser.

Client HTTP infrastructure must remain browser-safe.

---

# Direct Client API Usage

When direct browser access is justified:

```text
Client Feature
      ↓
Client Application Controller
      ↓
Generated Swagger Controller
      ↓
Client HTTP Service
      ↓
Backend
```

Be careful: generated runtime code may include:

* `fp-ts`
* `io-ts`
* generated codecs
* generated utilities
* generated controller code

and therefore may increase the browser bundle.

Use this path intentionally.

---

# Preferred Client-to-Backend Path

When direct browser-to-backend communication is unnecessary, prefer:

```text
Client Component
      ↓
Server Action / Route Handler
      ↓
Server Application Controller
      ↓
Generated Swagger Controller
      ↓
Server HTTP Service
      ↓
Backend
```

This keeps most generated runtime infrastructure on the server.

---

# Server Actions

Use Server Actions primarily for mutations initiated by application UI.

Server Actions should remain thin.

Preferred:

```text
Client Form
    ↓
Server Action
    ↓
Server Controller
```

Do not put significant mapping, business logic, or backend orchestration directly inside a Server Action.

Server Actions are entry points, not service implementations.

---

# Route Handlers

Route Handlers live under:

```text
app/**/route.ts
```

Use them when an actual HTTP boundary is required.

Appropriate examples:

* client-side requests
* webhooks
* external consumers
* BFF endpoints
* integrations

Route Handler logic should remain thin.

Prefer:

```text
route.ts
   ↓
server controller
```

Do not duplicate controller logic inside `route.ts`.

---

# Do Not Call Route Handlers from Server Components

Do not introduce internal HTTP calls from Server Components to your own Route Handlers.

Avoid:

```text
Server Component
      ↓ HTTP
/api/schedule
      ↓
Server Controller
```

Prefer:

```text
Server Component
      ↓
Server Controller
```

Direct server function calls are simpler and avoid unnecessary network/serialization overhead.

---

# Runtime Validation

Use `io-ts` for handwritten runtime validation.

Examples of appropriate validation boundaries:

* untrusted query input
* third-party data
* cookies with structured values
* local storage
* browser storage
* manually processed external input
* data not covered by generated Swagger codecs

Example:

```ts
import * as t from "io-ts";

export const SearchParamsCodec = t.type({
    query: t.string,
});
```

---

# Generated Swagger Validation

Do not manually duplicate validation already generated by `swagger-codegen-ts`.

Generated controllers already perform logic such as:

```text
unknown
   ↓
ScheduleItemDtoV1IO.decode(...)
   ↓
validated ScheduleItemDtoV1
```

Treat successfully decoded generated DTOs as transport-schema-valid.

This does not guarantee that every domain invariant is satisfied.

Domain rules may still perform additional validation.

---

# Validation Layers

There are three distinct validation layers.

## Transport

Handled by:

```text
services/*/http/
```

Responsibilities:

* network success/failure
* HTTP status
* response body parsing

## OpenAPI Schema

Handled by:

```text
src/api/
```

Responsibilities:

```text
unknown
   ↓
generated io-ts codec
   ↓
DTO
```

## Domain

Handled by:

```text
src/domain/
```

Responsibilities:

```text
typed values
    ↓
business invariants
    ↓
domain entity
```

Do not mix these responsibilities unnecessarily.

---

# io-ts

When manually decoding runtime input with `io-ts`, handle the result functionally.

Do not do:

```ts
const result = Codec.decode(value) as Something;
```

Do not ignore decode failures.

Use the returned `Either`.

Compose decoding using `fp-ts`.

---

# fp-ts

Use `fp-ts` for explicit functional handling of:

* fallible operations
* optional values
* asynchronous errors
* transformations
* functional composition

Prefer appropriate ADTs such as:

```text
Option
Either
TaskEither
```

over:

* `null` as control flow
* uncontrolled exceptions
* custom ad-hoc result structures

Use:

```ts
import { pipe } from "fp-ts/function";
```

or the version/style already established by the project.

Follow existing project conventions when generated code uses older `fp-ts` import paths.

Do not manually rewrite generated `fp-ts` imports.

---

# TaskEither

Use `TaskEither<ErrorType, DataType>` for asynchronous operations where failure is expected and should be represented explicitly.

Controllers should generally expose typed failure.

Prefer:

```text
TaskEither<ScheduleError, ScheduleItem[]>
```

over:

```text
Promise<ScheduleItem[]>
```

when backend/network failure is part of normal operation.

Unexpected programming errors may still throw.

Expected failures should be represented explicitly.

---

# Error Types

Application-level errors should be typed.

Prefer discriminated unions.

Example:

```ts
export type ScheduleError =
    | {
        type: "unauthorized";
    }
    | {
        type: "not-found";
    }
    | {
        type: "network";
        cause: unknown;
    }
    | {
        type: "invalid-response";
        cause: unknown;
    }
    | {
        type: "unexpected";
        cause: unknown;
    };
```

Do not expose low-level transport errors throughout the application unless their distinction is genuinely needed.

---

# Error Normalization

Errors should become more application-oriented as they move upward.

Conceptually:

```text
Network error
    ↓
HTTP transport error
    ↓
Generated API / validation error
    ↓
Application controller error
    ↓
Feature
```

Features should not normally need to know about:

```text
ResponseValidationError
```

or raw `fetch` errors.

Normalize them in the service/controller layer.

---

# RemoteData

Use:

```text
@devexperts/remote-data-ts
```

for remote-data UI state where multiple loading states must exist over time.

Do not create ad-hoc structures such as:

```ts
{
    loading: boolean;
    data?: Data;
    error?: Error;
}
```

Prefer:

```text
RemoteData<ErrorType, DataType>
```

with explicit states:

```text
initial
pending
failure
success
```

---

# TaskEither vs RemoteData

Use them for different responsibilities.

## Controllers

Use:

```text
TaskEither<Error, Data>
```

for a fallible asynchronous computation.

## UI state

Use:

```text
RemoteData<Error, Data>
```

for the lifecycle of remotely loaded data.

Conceptually:

```text
Controller
    ↓
TaskEither<Error, Data>
    ↓
Client Feature
    ↓
RemoteData<Error, Data>
    ↓
UI
```

Do not use `RemoteData` as a universal replacement for `Either` or `TaskEither`.

---

# RemoteData and SSR

Do not artificially model:

```text
initial → pending → success
```

inside one server-rendered request when it provides no value.

For SSR:

```text
Server Controller
    ↓
TaskEither<Error, Data>
    ↓
Server Component
```

Use Next.js server rendering, Suspense, `loading.tsx`, error boundaries, redirects, or `notFound()` where appropriate.

Use `RemoteData` primarily for persistent client-side async state.

---

# Loading States

For server-rendered content, prefer:

* `loading.tsx`
* Suspense
* Next.js streaming

For persistent client-side asynchronous state, use `RemoteData`.

Do not model the same loading lifecycle redundantly in both Next.js server rendering and client `RemoteData` without a reason.

---

# Error Boundaries

Use Next.js error handling appropriately.

Relevant files include:

```text
error.tsx
global-error.tsx
not-found.tsx
```

Do not swallow unexpected controller failures merely to render empty UI.

Expected application states should be handled explicitly.

Unexpected failures should propagate to the appropriate error boundary.

---

# Utils

Location:

```text
src/utils/
```

`utils` is not part of the core business layer hierarchy.

It contains generic application-independent helpers.

Possible structure:

```text
utils/
├── hooks/
├── date/
├── format/
├── collection/
├── validation/
└── storage/
```

Appropriate examples:

* generic date helpers
* generic formatting helpers
* generic collection operations
* debounce/throttle
* generic storage wrappers
* generic React hooks
* generic type guards

---

# Utils Must Remain Generic

`utils` must not import from:

```text
domain/
services/
ui/
features/
app/
api/
```

Application layers may use `utils`.

`utils` must not depend on application concepts.

Do not use `utils` as a dumping ground.

---

# Local Utilities

A function does not belong in `utils` merely because it is reused.

If it understands a business concept, keep it close to that concept.

For example:

```ts
isShowPublished(show)
```

belongs in:

```text
domain/show/
```

not:

```text
utils/
```

Similarly:

```text
features/show-search/showSearch.utils.ts
```

is appropriate for feature-specific utilities.

Prefer locality over global reuse.

---

# Public Module APIs

Reusable handwritten modules must expose an explicit public API through `index.ts`.

Example:

```text
domain/show/
├── Show.ts
├── show.factory.ts
├── show.utils.ts
└── index.ts
```

```ts
export type { Show } from "./Show";
export { createShow } from "./show.factory";
export { isShowPublished } from "./show.utils";
```

Consumers should use:

```ts
import {
    type Show,
    isShowPublished,
} from "@/domain/show";
```

Avoid deep imports:

```ts
import type { Show } from "@/domain/show/Show";
```

Files inside the same module may use relative internal imports.

---

# Barrel Files and Server/Client Separation

Do not create barrel files that mix server and client code.

Forbidden:

```text
services/index.ts
```

with:

```ts
export * from "./server";
export * from "./client";
```

This obscures runtime boundaries.

Keep separate public entry points.

Example:

```text
services/
├── server/
│   └── controllers/
└── client/
    └── controllers/
```

Do not create imports that make server-only code accidentally reachable from the client graph.

---

# Generated API Imports

Generated API runtime modules should normally only be imported from:

```text
services/server/
services/client/
```

Avoid direct generated API imports from:

```text
domain/
ui/
features/
app/
```

except for narrowly justified infrastructure cases.

Application code should use handwritten controllers rather than generated controllers.

---

# Dependency Rules

## Domain

May depend on:

* local domain modules where necessary
* generic `utils`
* `fp-ts`
* `io-ts` when domain runtime validation is genuinely appropriate

Must not depend on:

* React
* Next.js
* app
* features
* UI
* services
* generated API
* Swagger
* HTTP

---

## UI

May depend on:

* domain
* utils
* generic UI dependencies
* `fp-ts`
* `RemoteData` when used to render state

Must not depend directly on:

* generated API
* server HTTP
* server controllers
* backend endpoint details

---

## Features

May depend on:

* domain
* UI
* utils
* appropriate services
* `fp-ts`
* `RemoteData`

A client feature must not depend on server services.

---

## App

May depend on:

* features
* UI
* domain
* server services
* client services when appropriate
* utils

`app` is the highest route/composition layer.

Lower layers must not depend on route files under `app`.

---

## Generated API

`src/api/` is generated infrastructure.

It must not import handwritten application layers.

---

## Server HTTP

May depend on:

* generated API HTTP contracts
* `fp-ts`
* Next.js server APIs
* generic utils

Must be server-only.

---

## Server Controllers

May depend on:

* generated API
* server HTTP service
* domain
* utils
* `fp-ts`
* `io-ts`

Must be server-only.

---

## Client HTTP

May depend on:

* generated browser-safe API contracts
* `fp-ts`
* browser-safe utils

Must not depend on server infrastructure.

---

## Client Controllers

May depend on:

* generated browser-safe API modules
* client HTTP service
* domain
* utils
* `fp-ts`
* `io-ts`

Must remain browser-safe.

---

# DTO Serialization Across Server/Client Boundary

Values passed from Server Components to Client Components must be serializable.

Do not pass:

* generated controller instances
* HTTP clients
* service instances
* functions except supported Server Functions
* non-serializable infrastructure objects

Prefer plain application/domain data.

If necessary, create an explicit serializable view model before crossing the server/client boundary.

---

# File Responsibilities

Prefer files with one clear responsibility.

Avoid files that simultaneously contain:

* HTTP calls
* DTO mapping
* business rules
* feature orchestration
* presentation
* routing
* client state

Extract responsibilities according to architectural ownership.

However, do not create abstractions solely to reduce line count.

Prefer cohesive code over unnecessary indirection.

---

# Existing Architecture

Before implementing a task:

1. inspect existing modules with similar responsibilities
2. determine whether new code is server-only, client-only, or runtime-neutral
3. determine its architectural owner
4. inspect generated API functionality before manually implementing requests
5. reuse existing controllers
6. reuse existing HTTP infrastructure
7. reuse existing domain types
8. reuse existing UI
9. verify whether generated runtime validation already covers the response
10. verify whether a Client Component is genuinely necessary
11. verify that generated/server code cannot leak into the client bundle

Follow established project conventions unless they conflict with this document.

---

# API Workflow

For backend-related work, first inspect the generated API.

Do not manually recreate an endpoint already available through:

```text
src/api/
```

Use the generated endpoint controller and inject the appropriate HTTP service.

Preferred:

```text
Generated endpoint
      +
HTTP service
      ↓
Application controller
```

Do not write arbitrary handwritten:

```ts
fetch("/api/v1/schedule")
```

when that endpoint already exists in the generated API.

---

# API Changes

When the backend OpenAPI contract changes:

1. update or obtain the new Swagger/OpenAPI specification
2. run:

```bash
yarn gen:api
```

3. inspect relevant generated DTO/controller changes
4. update service mappers
5. update application controllers if necessary
6. update domain types only when application/domain semantics actually changed
7. run validation

Do not manually patch generated files.

---

# Tests

Test handwritten architectural boundaries rather than generated implementation details.

Prioritize tests for:

* DTO → domain mappers
* application controllers
* error normalization
* domain factories
* domain invariants
* non-trivial `fp-ts` pipelines
* handwritten `io-ts` codecs
* client/server boundary-sensitive code

Do not write tests merely to verify generated Swagger code internals.

---

# Validation Before Completion

Before considering a development task complete, run relevant project checks.

When API code is required, generate it first:

```bash
yarn gen:api
```

Then run available validation commands such as:

```bash
yarn lint
yarn typecheck
yarn test
```

For production-impacting changes:

```bash
yarn build
```

A task is not complete if:

* API generation fails
* TypeScript errors remain
* lint errors remain
* relevant tests fail
* the production build fails
* server-only code leaks into the client graph
* generated API code is missing
* a required DTO mapper is bypassed
* expected errors are left untyped

Do not disable validation rules merely to make checks pass.

Fix the underlying issue.

---

# Architectural Summary

## Server-side default

```text
Incoming Request
      ↓
Next.js App Router
      ↓
Server Page
      ↓
Server Feature
      ↓
Application Controller
      ↓
Generated Swagger Controller
      ↓
Server HTTP Service
      ↓
Backend
      ↓
HTTP Response
      ↓
Generated io-ts Validation
      ↓
DTO
      ↓
Service Mapper
      ↓
Domain Entity
      ↓
Feature
      ↓
Server-rendered UI
```

---

# Client-side Preferred Flow

When a client interaction requires backend execution but does not require direct browser access:

```text
Client Component
      ↓
Server Action / Route Handler
      ↓
Server Application Controller
      ↓
Generated Swagger Controller
      ↓
Server HTTP Service
      ↓
Backend
```

This is preferred because generated API runtime and server infrastructure remain outside the client bundle.

---

# Direct Client API Flow

Use only when justified:

```text
Client Component
      ↓
Client Feature
      ↓
Client Application Controller
      ↓
Generated Swagger Controller
      ↓
Client HTTP Service
      ↓
Backend
```

Consider bundle-size impact before choosing this approach.

---

# Layer Summary

The intended application architecture is:

```text
                    app
                     ↓
                  features -> ui
                     ↓
                  services
                     ↓
                  domain


             services/server
             ↙             ↘
      controllers           http
             ↓               ↓
             └────── api ────┘


             services/client
             ↙             ↘
      controllers           http
             ↓               ↓
             └────── api ────┘


utils ─────────────────────────────
generic helpers available where appropriate
```

The most important architectural rules are:

1. `domain` never depends on generated API DTOs.
2. generated DTOs are mapped in the service/controller layer.
3. generated controllers receive an injected HTTP service.
4. `src/api/` is generated and never manually edited.
5. API generation is performed with `yarn gen:api`.
6. `src/api/` is not committed.
7. server controllers and server HTTP services are protected with `server-only`.
8. client code must never import server controllers.
9. SSR and Server Components are the default.
10. Client Components should remain small.
11. `TaskEither` represents fallible asynchronous computations.
12. `RemoteData` represents persistent remote UI state.
13. generated `io-ts` validation must not be duplicated.
14. handwritten runtime validation uses `io-ts`.
15. expected failures must be represented using explicit typed errors.
16. features and UI work with application/domain models rather than backend DTOs.
17. handwritten endpoint requests must not duplicate generated API functionality.
18. server/client module graphs must remain physically and logically separated.
