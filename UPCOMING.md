# Patch

#### Fix

- Add annotation to `playwrightTest`, not our new `test`
- Correct `FrameworkPage.setContentAndScriptTag` type signature to match its implementation (`(content?: string, path?: string) => Promise<void>`, not `() => void`)