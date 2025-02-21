---
title: Framework Development
nav_order: 99
---

# Framework Development

## Releasing this Playwright Framework

When it comes to creating a new release for the Playwright Framework, run the following:

1. `npx eslint .` and `npx eslint . --fix`
2. `npm run build`
3. Update the version number in `package.json`
4. Commit result
5. `git tag [version]`
6. `git push origin main --tags` - this will publish to NPM

## Local Development of the Playwright Framework

1. Clone the repository down parallel to your project
2. Run `npm install`
2. Run `npm run pack`
3. In your project, delete `node_modules/@liquidlight/playwright-framework`
4. Update the `package.json` in the project to be `"@liquidlight/playwright-framework": "file:./../playwright-framework/liquidlight-playwright-framework-0.4.0-beta.1.tgz"` (or whatever the tgz file made is)
5. Run `npm update` in the project

If you make changes to the package, run `npm run pack` in the package and `npm update` in the project
