little scheduling project @ https://terptrack.vercel.app

## Local checks

```sh
node scripts/test-generated-plans.js
for f in js/*.js; do node --check "$f" || exit 1; done
```

## Supabase setup

Apply `supabase/schema.sql` to enable magic-link accounts, cloud plan saves, friend requests, and accepted-friend shared plan reads.

1. Create a Supabase project.
2. Open the Supabase SQL editor and run the full contents of `supabase/schema.sql`.
3. In Supabase Auth settings, enable email magic links.
4. Add the deployed app URL, such as `https://terptrack.vercel.app`, to the Site URL and redirect URL allow list.
5. In Vercel, set these environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
6. Redeploy Vercel and open the Account modal. The Cloud setup checklist should show Vercel env config and valid credential shape.
7. Test the round trip:
   - send a magic link to a real email.
   - open the link in the same browser.
   - save the current plan to cloud.
   - reload the app and load the cloud plan.
   - invite a friend account, accept it, publish a plan, and load it from the friend account.

For local development, paste the Supabase URL and anon key into the Account modal's dev config fields. Do not commit real keys; `.env.example` only documents the required names.
