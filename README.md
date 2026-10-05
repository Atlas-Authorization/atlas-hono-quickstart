# atlas-hono-quickstart

A minimal [Hono](https://hono.dev) API protected by [Atlas](https://atlasauth.net)
auth, running on `@hono/node-server`.

## What's wired

- **`src/server.js`** — `atlasMiddleware()` from `@atlasauth/hono` verifies the
  session JWT **locally** against the instance JWKS and stores the auth object on
  the context.
  - `GET /api/me` reads `getAuth(c)` — public.
  - `GET /api/protected` gates inline on `getAuth(c).userId` — 401 when signed
    out, and uses `auth.has({ role })` for authorization.

## Run

```sh
npm install
cp .env.example .env
node --env-file=.env --watch src/server.js
```

```sh
curl http://localhost:3000/api/me
curl -H "Authorization: Bearer <jwt>" http://localhost:3000/api/protected
```

Hono runs on any runtime; swap `@hono/node-server` for the Workers / Deno / Bun
adapter and the middleware is unchanged.

## Packages

- `@atlasauth/hono` — `atlasMiddleware`, `getAuth`
