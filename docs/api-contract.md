# API contract

All routes use `/api/v1/`. Breaking API changes will be released under a new major version such as `/api/v2/`; stable versions will be retained through a documented deprecation period.

Current endpoints:

- `GET /api/v1/health/` — service health response.
- `GET /api/v1/schema/` — OpenAPI schema.
- `GET /api/v1/docs/` — Swagger UI.
- `GET /api/v1/projects/` and `/api/v1/projects/{slug}/` — published project portfolio.
- `GET /api/v1/categories/` — active project categories.
- `GET /api/v1/services/` — published services.
- `GET /api/v1/achievements/` — published achievements.
- `POST /api/v1/enquiries/` — anonymous or authenticated enquiry submission; authenticated users can list their own records.
- `POST /api/v1/appointments/` — anonymous or authenticated appointment request; authenticated users can list their own records.
- `/api/v1/saved-projects/` — authenticated saved-project management, restricted to the current user.
- `POST /api/v1/auth/token/` and `/api/v1/auth/token/refresh/` — JWT authentication.
- `POST /api/v1/auth/register/` — create a client account (email, first name, last name, password). Accounts are always created with the client role.
- `GET`/`PATCH /api/v1/auth/me/` — the authenticated user's profile; only first and last name are editable.

Saved projects, enquiries and appointments include read-only `project_summary` (and, where relevant, `service_summary`) objects alongside the existing `project`/`service` IDs so clients can display them without extra requests.

Enquiry and appointment `internal_notes` are staff-only: the field is omitted from every response to non-staff users, including a client's own records.

Staff users can manage domain content and operational enquiries and appointments. Public content is filtered server-side to published records; demo content is never implied to be real and must be explicitly marked with `is_demo=true`. Generic local demo records can be created with `python manage.py seed_demo`. The verified company services, achievements and project categories can be created with `python manage.py seed_company_content`; it is safe to re-run and never overwrites records edited in Django Admin.

Future resources will use plural nouns, standard HTTP status codes, field-level validation responses, pagination, and URL query parameters for filtering, searching, and ordering.
