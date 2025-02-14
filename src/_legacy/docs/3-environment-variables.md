# Environment Variables

The Playwright framework comes with [dotenv](https://www.npmjs.com/package/dotenv) as a dependency, meaning you can load `.env` file details, if required, for your tests.

This can be useful for testing if a variable your code is using exists (before the timely test is run) or for storing login credentials, for example.

To use it, you need to include it as per the docs, however you don't have to list it a separate dependency in your project.

```ts
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

test('A test', async ({ page, isMobile }) => {
    // Read from default ".env" file.
    dotenv.config();

    // Test we have the API key
    if (process.env.PLAYWRIGHT_ENV != 'production') {
        await expect(process.env.SOME_ENV).toBeTruthy();
    }

    ...
});
```
