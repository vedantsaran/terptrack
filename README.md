little scheduling project @ https://terptrack.vercel.app

## Local checks

```sh
node scripts/test-generated-plans.js
for f in js/*.js; do node --check "$f" || exit 1; done
```

## Supabase setup

Apply `supabase/schema.sql` to enable magic-link accounts, cloud plan saves, friend requests, and accepted-friend shared plan reads.
