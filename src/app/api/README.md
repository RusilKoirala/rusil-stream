# API Routes

All API routes under this directory follow a **domain-grouping convention**: each subdirectory represents a single domain or resource, and all endpoints for that domain live within it.

## Convention

```
src/app/api/
├── auth/          # Authentication (signup, login, logout, email verification)
├── admin/         # Admin-only endpoints (e.g., pending verifications)
├── history/       # Watch history for the current user
├── login/         # Session login endpoint
├── movies/        # Movie catalog queries
├── profile/       # User profile read/update
├── saved/         # Saved/watchlist management
└── stream/        # Streaming URL resolution
```

## Rules

1. **One domain per folder** — group all routes for a resource under a single named directory (e.g., `auth/`, `movies/`).
2. **Use `route.js`** — each endpoint is a `route.js` file inside its domain folder, using Next.js App Router handler exports (`GET`, `POST`, `PUT`, `DELETE`, etc.).
3. **Nested resources** — for sub-resources or parameterized routes, nest them inside the domain folder (e.g., `stream/[id]/route.js`).
4. **No flat routes** — do not place `route.js` files directly under `src/app/api/`; always use a domain subfolder.
5. **New domains** — when adding a new API feature, create a new domain subfolder rather than adding to an existing unrelated one.
