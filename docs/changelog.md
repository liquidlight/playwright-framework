---
title: Changelog
nav_order: 99
---

# Changelog

## 2.3.0

**23rd November 2026**

#### Feature

- Add a CI reporter that prints one line per test and one error per failed test, summarising retries that failed the same way, replacing the `dot` reporter in CI
- Show the URLs a failed test visited or requested (`page.goto` and the `request` fixture), including where the page ended up after a redirect
- List screenshots, traces and visual comparison images (expected, actual and diff) under each failure
- Link screenshots and traces to the job artifacts, and visual comparison baselines to the repository, and fold the output of retries that failed differently into collapsible sections when running in GitLab CI

#### Dependencies

- Bump `glob` to v14
- Bump `addressable` in /docs

## 2.2.1

**28th September 2026**

#### Fix

- Resolve `screenshot.css` from the compiled `dist` folder when source maps rewrite stack traces (e.g. under Playwright)

## 2.2.0

**17th September 2026**

#### Feature

- Add `viteAsset` function to resolve Vite manifest entries

#### Dependencies

- Bump `json` in /docs
- Bump `concurrent-ruby`

## 2.1.2

**16th July 2026**

#### Fix

- Resolve path resolution for CSS file when using Common JS

## 2.1.1

**9th July 2025**

#### Feature

- Add custom CSS when taking screenshots

#### Fix

- Add annotation to `playwrightTest`, not our new `test` for report
- Correct `FrameworkPage.setContentAndScriptTag` type signature to match its implementation (`(content?: string, path?: string) => Promise<void>`, not `() => void`)

#### Dependencies

- Update several dependencies (non-breaking)

## 2.1.0

**8th May 2025**

#### Feature

- Expose more `utils` methods for project use
- Add `setContentAndScriptTag` method for quick content & JS setting
- Update CI reporter output

## 2.0.0

**21st February 2025**

#### Feature

- Complete re-write of functionality (see [upgrading docs](./upgrading.md) for details)
- Added dynamic host switching - swaps the base domain depending on environment
- Refined dynamic test - added `.mobile` and `.desktop` prefixes to target
- Moved away from projects per folder and only have device projects
- Refined `typo3` function
- Removed `testbed`

## 1.1.0

**3rd October 2024**

#### Refactor

- Move `testbed` to be an export of the main file

#### Fix

- Include the `dist` files in the NPM package

## 1.0.1

**3rd October 2024**

#### Dependencies

- Release version 1.0.1. 1.0.0 was accidentally released in December 2023 and NPM won't let you republish

## 1.0.0

**3rd October 2024**

#### Feat

- Initial release
