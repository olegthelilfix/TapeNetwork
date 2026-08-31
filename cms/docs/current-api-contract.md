# Current CMS API contract

This document records the behaviour that the migration must preserve. It is
derived from the existing Refine configuration and should be validated against
the backend before changing an endpoint or a DTO.

## Authentication

- `POST /auth/login` accepts `{ email, password }` and returns a token, email
  and role.
- `GET /auth/me` is called with `Authorization: Bearer <token>` to validate an
  existing session.
- The browser stores the session token and the user identity locally.

## Resources

The generic Refine CRUD interface uses these REST resources: `shows`,
`episodes`, `hosts`, `categories`, `subcategories`, `videos`, `authors`,
`articles`, `schedule`, `ticker`, `home-blocks`, and `media`.

Each resource supports list, create, edit and delete through the configured
Refine simple REST data provider.

## Custom operation

- `POST /media/upload` receives multipart form data with a `file` field and
  returns an object containing a numeric `id`.

## Migration checks

After each migration stage, manually verify login, session restoration, list,
create, edit, delete and media upload. Automated contract tests can be added
once the backend exposes a stable test environment.
