>> Feature

- Add a CI reporter that prints one line per test and one de-duplicated error per failed test, replacing the `dot` reporter in CI
- Show the URLs a failed test visited or requested (`page.goto` and the `request` fixture), including where the page ended up after a redirect
- List screenshots, traces and visual comparison images (expected, actual and diff) under each failure
- Link screenshots and traces to the job artifacts, and visual comparison baselines to the repository, and fold the full output of each attempt into collapsible sections when running in GitLab CI
