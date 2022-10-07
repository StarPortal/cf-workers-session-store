Cloudflare Workers Session Store
===

This package provides a Rails-like session store.

## Usage

### createCookieStore

Create a CookieStore middleware to provide `data.session`

```ts
# functions/_middleware.ts
import { createCookieStore } from '@starportal/cf-workers-session-store'

const sessionStore = async(ctx) => createCookieStore({ password: ctx.env.SESSION_PASSWORD })(ctx)
const userFinder = async({ data, next }) => {
  if(!data.session) {
    return next()
  }

  // Read from `Cookie: _user_id=1`
  const userID = await data.session.get('_user_id')

  // Do something...

  return next();
}

export const onRequest = [sessionStore, userFinder];
```

### IStore

The interface implement `put` and `get` which has same interface with `KVNamespace`

```ts
// Write
const store = new CookieStore({ writer: request, reader: tmpResponse })
await store.put('_user_id', 1, ['HttpOnly', 'SameSite=Lax'])

// Read
await store.get('_user_id')
```

