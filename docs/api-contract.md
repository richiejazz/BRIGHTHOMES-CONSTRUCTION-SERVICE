# API contract

All routes use `/api/v1/`. Breaking API changes will be released under a new major version such as `/api/v2/`; stable versions will be retained through a documented deprecation period.

Current endpoints:

- `GET /api/v1/health/` — service health response.
- `GET /api/v1/schema/` — OpenAPI schema.
- `GET /api/v1/docs/` — Swagger UI.

Future resources will use plural nouns, standard HTTP status codes, field-level validation responses, pagination, and URL query parameters for filtering, searching, and ordering.
