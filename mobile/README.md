# BRIGHTHOMES mobile

The client companion app: discover projects and services, save projects, send enquiries, request consultations and follow their status. Expo SDK 57, Expo Router, TypeScript, TanStack Query and Axios, talking to the Django API at `/api/v1/`.

## Setup

```sh
npm ci --legacy-peer-deps
cp .env.example .env   # then set EXPO_PUBLIC_API_BASE_URL
npx expo start
```

`EXPO_PUBLIC_API_BASE_URL` must be reachable from the device running the app:

| Where the app runs | Base URL | Backend |
| --- | --- | --- |
| iOS simulator, web preview | `http://127.0.0.1:8000/api/v1` | `python manage.py runserver` |
| Android emulator | `http://10.0.2.2:8000/api/v1` | add `10.0.2.2` to `ALLOWED_HOSTS` |
| Physical phone (Expo Go) | `http://<computer LAN IP>:8000/api/v1` | `runserver 0.0.0.0:8000`, add the LAN IP to `ALLOWED_HOSTS` |

The web preview (`npx expo start --web`, port 8081) also needs `http://localhost:8081` in the backend's `CORS_ALLOWED_ORIGINS`. Native apps are not subject to CORS.

## Structure

- `app/` — routes. `(tabs)/` holds the five tabs (Home, Projects, Saved, Activity, Profile); detail, form, account and utility screens are stacked above them.
- `src/api/` — Axios client (JWT refresh), query hooks, response types and friendly error mapping. Screens never call Axios directly.
- `src/auth/` — session state, the sign-in prompt and signed-out fallbacks.
- `src/components/` — UI primitives (`ui/`), brand drawings (`brand/`) and feature components.
- `src/content/company.ts` — verified company copy with no API source. Do not add unverified claims.
- `src/theme/` — colours and type, shared with the website's design tokens.

## Sessions

The access token stays in memory; the refresh token is kept in the iOS Keychain / Android Keystore via `expo-secure-store` (in `localStorage` for the web preview only). Tokens are never logged.

## Checks

```sh
npx tsc --noEmit
npx expo-doctor
npx expo export --platform android --platform ios --output-dir /tmp/brighthomes-export
```
