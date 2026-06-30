little scheduling project @ https://terptrack.vercel.app

## Local checks

```sh
node scripts/test-generated-plans.js
for f in js/*.js; do node --check "$f" || exit 1; done
```
