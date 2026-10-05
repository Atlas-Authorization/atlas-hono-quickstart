// Atlas + Hono quickstart.
//
// `atlasMiddleware(options)` verifies the session JWT LOCALLY (JWKS cached
// in-process) and stores the auth object on the Hono context. Read it anywhere
// downstream with `getAuth(c)`. No Atlas endpoint is called per request.
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { atlasMiddleware, getAuth, type AtlasAuth } from '@atlasauth/hono';

const { ATLAS_JWKS_URL, ATLAS_ISSUER, ATLAS_PUBLISHABLE_KEY, PORT = '3000' } = process.env;

if (!ATLAS_JWKS_URL || !ATLAS_ISSUER) {
  console.error('Missing ATLAS_JWKS_URL / ATLAS_ISSUER — copy .env.example and fill them in.');
  process.exit(1);
}

const app = new Hono();

app.use(
  '*',
  atlasMiddleware({
    jwksUrl: ATLAS_JWKS_URL,
    issuer: ATLAS_ISSUER,
    publishableKey: ATLAS_PUBLISHABLE_KEY,
  }),
);

// Public — reports who you are, if anyone.
app.get('/api/me', (c) => {
  const { userId, sessionId, orgId, orgRole } = getAuth(c);
  // The auth object has no `isSignedIn` field; derive it from `userId`.
  const isSignedIn = userId !== null;
  return c.json({ isSignedIn, userId, sessionId, orgId, orgRole });
});

// Protected — gate inline off the verified auth object.
app.get('/api/protected', (c) => {
  const auth: AtlasAuth = getAuth(c);
  if (!auth.userId) return c.json({ errors: [{ code: 'UNAUTHENTICATED' }] }, 401);
  return c.json({ message: `Hello, ${auth.userId}.`, isAdmin: auth.has({ role: 'admin' }) });
});

serve({ fetch: app.fetch, port: Number(PORT) }, (info) => {
  console.log(`atlas-hono-quickstart on http://localhost:${info.port}`);
});
