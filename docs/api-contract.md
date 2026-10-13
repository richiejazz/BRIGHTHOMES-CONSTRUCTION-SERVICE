# API contract

All routes use `/api/v1/`. Breaking API changes will be released under a new major version such as `/api/v2/`; stable versions will be retained through a documented deprecation period.

Current endpoints:

- `GET /api/v1/health/` — service health response.
- `GET /api/v1/schema/` — OpenAPI schema.
- `GET /api/v1/docs/` — Swagger UI.
- `GET /api/v1/projects/` and `/api/v1/projects/{slug}/` — published project portfolio. Filters: `category`, `status`, `is_featured`, `is_demo`.
- `GET /api/v1/categories/` — active project categories.
- `GET /api/v1/properties/` and `/api/v1/properties/{slug}/` — published real-estate listings in active property types. Filters: `category` (id), `category_slug`, `listing_type`, `status`, `is_featured`, `is_demo`, `location` (contains), `min_price`, `max_price`, `min_bedrooms`; `search`; `ordering` by `price`, `created_at` or `title`. Features are a list of names.
- `GET /api/v1/property-types/` — active property types (house, apartment, land, commercial, estate / development, other).
- `GET /api/v1/services/` — published services.
- `GET /api/v1/achievements/` — published achievements.
- `POST /api/v1/enquiries/` — anonymous or authenticated enquiry submission; authenticated users can list their own records.
- `POST /api/v1/appointments/` — anonymous or authenticated appointment request; authenticated users can list their own records.
- `/api/v1/saved-projects/` — authenticated saved-project management, restricted to the current user.
- `/api/v1/saved-properties/` — authenticated saved-property management (list, create, delete), restricted to the current user; unique per user and property, published listings only.
- `/api/v1/project-images/` and `/api/v1/property-images/` — staff-only gallery management (multipart upload, edit, delete). Marking an image as the cover clears the previous cover.
- `POST /api/v1/auth/token/` and `/api/v1/auth/token/refresh/` — JWT authentication.
- `POST /api/v1/auth/register/` — create a client account (email, first name, last name, password). Accounts are always created with the client role.
- `GET`/`PATCH /api/v1/auth/me/` — the authenticated user's profile; first name, last name and phone are editable. The response also includes `avatar` (absolute URL or null).
- `PUT`/`DELETE /api/v1/auth/me/avatar/` — upload or replace (multipart field `avatar`; JPEG, PNG or WebP up to 8 MB) or remove the profile photo. Returns the updated profile.

Saved projects, saved properties, enquiries and appointments include read-only `project_summary`, `property_summary` and (where relevant) `service_summary` objects alongside the `project`/`property`/`service` IDs so clients can display them without extra requests. Enquiries and appointments accept an optional `property` ID; existing clients that omit it are unaffected.

When a listing's `price_display` is `on_request`, its `price` is returned as null to everyone except staff, and price filters exclude it.

Enquiry and appointment `internal_notes` are staff-only: the field is omitted from every response to non-staff users, including a client's own records.

Staff users can manage domain content (projects, properties, images, services, achievements) and operational enquiries and appointments. Public content is filtered server-side to published records; demo content is never implied to be real and must be explicitly marked with `is_demo=true`. Generic local demo records can be created with `python manage.py seed_demo`. Clearly marked illustrative properties and projects with Unsplash photography (no invented names, locations, prices or dates) can be created with `python manage.py seed_illustrative_content` after `seed_company_content`. The verified company services, achievements and project categories can be created with `python manage.py seed_company_content`; it also creates the property types, is safe to re-run and never overwrites records edited in Django Admin.

Future resources will use plural nouns, standard HTTP status codes, field-level validation responses, pagination, and URL query parameters for filtering, searching, and ordering.
