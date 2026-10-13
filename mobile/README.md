# BRIGHTHOMES mobile

The client app for construction and real estate: explore projects, properties and services, save projects and properties, send enquiries, request consultations and follow their status, and manage a profile with a photo. Expo SDK 57, Expo Router, TypeScript, TanStack Query and Axios, talking to the Django API at `/api/v1/`.

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

- `app/` — routes. `(tabs)/` holds the five tabs (Home, Explore, Saved, Activity, Profile). Explore switches between Construction, Real Estate and Services; detail, form, account and utility screens are stacked above the tabs.
- `src/api/` — Axios client (JWT refresh), query hooks, response types and friendly error mapping. Screens never call Axios directly.
- `src/auth/` — session state, the sign-in prompt and signed-out fallbacks.
- `src/components/` — UI primitives (`ui/`), photography and galleries (`media/`), cards and detail layouts (`content/`), Explore browsers (`explore/`), account pieces (`account/`) and brand drawings (`brand/`).
- `src/content/company.ts` — verified company copy with no API source. Do not add unverified claims.
- `src/content/media.ts` — the bundled editorial photographs (`assets/editorial/`), with alt text and credits. These are temporary, illustrative Unsplash images; swap a file and its entry here to replace one.
- `src/theme/` — light and dark colour tokens, Cormorant Garamond + Inter type scale, and `ThemeProvider` (System / Light / Dark, saved on the device with AsyncStorage). Components read colours through `useTheme()` or `makeStyles()`; nothing hard-codes a colour.

## Sessions

The access token stays in memory; the refresh token is kept in the iOS Keychain / Android Keystore via `expo-secure-store` (in `localStorage` for the web preview only). Tokens are never logged.

## Checks

```sh
npx tsc --noEmit
npx expo-doctor
npx expo export --platform android --platform ios --output-dir /tmp/brighthomes-export
```
