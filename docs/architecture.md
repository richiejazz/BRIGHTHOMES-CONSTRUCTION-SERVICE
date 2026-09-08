# Architecture

BRIGHTHOMES is a monorepo with three independently runnable applications: `backend`, `website`, and `mobile`.

The Django 5 backend is the shared source of truth. It exposes a versioned REST API, uses JWT authentication and server-side authorization, defaults to SQLite locally, and accepts `DATABASE_URL` for PostgreSQL. Django Admin is the initial management surface.

The React/Vite website is editorial and portfolio-led. The Expo/React Native app is task-oriented. Both consume the same API but are intentionally designed as distinct experiences.

Development uses local media files; production images will use Cloudinary only when credentials are configured. No production credentials are stored in the repository.

The custom email-authenticated user model is created before dependent data models. Current roles are client, staff, and admin.
