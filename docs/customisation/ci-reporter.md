---
title: CI reporter
nav_order: 6
parent: Customisation
---

# CI reporter

When the `CI` environment variable is set, the framework reports results with its own CI reporter, alongside a JUnit report at `./playwright-report/playwright-report.xml`.

Each test gets one line once all its retries have finished. Each failed test then gets one error block, with the URLs the test used, so you can open the page straight from the job log:

```
Running 6 tests using 1 worker

app/sites/annual-review/smoke.spec.ts  [Desktop Edge]
  ❌ Smoke test › Homepage  failed 3/3 attempts
  ❌ Smoke test › Homepage has CSS  failed 3/3 attempts
  ✅ Smoke test › Homepage has jQuery  1.2s
========================================================================
❌ 2 failed · ✅ 4 passed · 46.5s
========================================================================
1) app/sites/annual-review/smoke.spec.ts:6 › Smoke test › Homepage  [Desktop Edge]
   URL: GET https://www.example.com/annual-review/

   Error: expect(received).toBe(expected) // Object.is equality

   Expected: 200
   Received: 307

     > 8 | 		expect(response?.status()).toBe(200);
   at app/sites/annual-review/smoke.spec.ts:8:30

   Trace:      test-results/app-sites-annual-review-smoke-Smoke-test-Homepage-Desktop-Edge-retry1/trace.zip

   Same error on all 3 attempts
```

## URLs

The URLs come from the framework's `test` fixtures, so specs need to import `test` from `@liquidlight/playwright-framework`:

- `page.goto()` records the URL it visited, after [dynamic host](./dynamic-hosts) matching
- `request.get()`, `post()`, `fetch()` and the other `request` methods record the method and URL
- If the page ended on a different URL (after a redirect, for example), that is shown as `→ ended on …`

## Retries

When every attempt fails with the same error, the error is shown once. When attempts fail differently, the last error is shown in full and the line that differs is listed for each earlier attempt. A test that passes on a retry is marked as flaky.

## GitLab

When `GITLAB_CI` is set:

- Screenshots, traces and the actual and diff images of a failed visual comparison link to the job's artifacts, using `CI_JOB_URL`. The links only work when the job uploads `test-results` as an artifact.
- The expected image of a visual comparison links to the committed baseline in the repository, at the commit being tested.
- The full output of every attempt is added in a collapsed section under each failure.
- Output is coloured, unless `NO_COLOR` is set.

## Using a different reporter

Set `reporter` in the [configuration function](./configuration-function#overwriting-configuration) to replace the CI reporter and JUnit report:

```ts
export default defineConfig(
	configuration({}, {
		reporter: process.env.CI ? 'dot' : 'list'
	})
);
```
