---
title: Dynamic test running
nav_order: 4
parent: Customisation
---

# Dynamic test running

The framework has the ability to run different tests on different devices based on the filename. This also helps you identify what the kind of test is.

Tests can have one of three main suffixes:

- `.unit.ts` - will be run by the first device
- `.spec.ts` - will be run by the first device
- `.test.ts` - will be run by all devices

As a subset, each of these can be prefixed with `mobile` or `desktop`

E.g.

- `.mobile.spec.ts` - will be run by the first **mobile** device
- `.mobile.spec.ts` - will be run by all **mobile** devices
- `.desktop.spec.ts` - will be run by the first **desktop** device
- `.desktop.test.ts` - will be run by all **desktop** devices

**Note**: The dynamic running is only available if you have used the [projects provided by the framework](./devices).

## More details

### `.unit.ts`

This indicates it is a unit test and shouldn't use the `page` or `request` variables. It is run by the first device specified.

There is nothing checking that `unit` does not utilise the device or page, this is merely an internal naming convention.

For more details on running unit tests in Playwright you can check out out [Mike Street's Blog](https://www.mikestreety.co.uk/blog/run-unit-tests-in-playwright/).

### `.spec.ts`

This indicates that the test is checking for some backend or standard functionality. It will only run on the first device but will expect to open the browser or make a request.

This is handy for checking server-side functionality which doesn't rely on browser technology.

### `.test.ts`

These tests are run by all the projects/devices specified

## `mobile|desktop`

This is identified by the `isMobile` flag in the [playwright device](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json).
