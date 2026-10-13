# Architecture

BRIGHTHOMES is a monorepo with three independently runnable applications: `backend`, `website`, and `mobile`.

The Django 5 backend is the shared source of truth. It exposes a versioned REST API, uses JWT authentication and server-side authorization, defaults to SQLite locally, and accepts `DATABASE_URL` for PostgreSQL. Django Admin is the initial management surface.

The React/Vite website is editorial and portfolio-led. The Expo/React Native app is task-oriented. Both consume the same API but are intentionally designed as distinct experiences.

Development uses local media files; production images will use Cloudinary only when credentials are configured. No production credentials are stored in the repository.

The custom email-authenticated user model is created before dependent data models. Current roles are client, staff, and admin. Users have an optional phone number and a profile photo, which the API re-encodes as a 512px square JPEG (EXIF removed) before storing it in the configured media storage.

Construction projects (`projects`) and real-estate listings (`properties`) are separate domains: a project is portfolio work, a property is a listing with a type, listing type, price display, availability, specifications, features and a gallery. Both use the shared `core.models.GalleryImage` base, which keeps exactly one cover image per record. Clients can save projects and properties separately, and enquiries and consultation requests can reference a property as well as a project or service.

Company content is managed by staff in Django Admin (publish, feature and availability actions) or through the staff-only API. Temporary illustrative content is created by `seed_illustrative_content` from `backend/core/content/illustrative.json`, always with `is_demo=true`.
