# apps/

This directory is reserved for future platform-specific applications in the monorepo.

## Intended Structure

```
apps/
├── web/          ← current Next.js web app (to be moved here from repo root)
├── mobile/       ← future React Native / Expo app (iOS & Android)
└── tv/           ← future React Native TV app (Apple TV, Android TV)
```

## Migration Plan

When the monorepo migration is ready:

1. Move the current Next.js app from the repo root into `apps/web/`
2. Scaffold the Expo app under `apps/mobile/`
3. Scaffold the React Native TV app under `apps/tv/`
4. All apps consume shared utilities from `packages/shared`

## Shared Dependencies

Each app will import from `@streaming-app/shared` for:
- TMDB API client
- Auth helpers
- Shared constants and types
