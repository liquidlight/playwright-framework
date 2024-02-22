# Overview

Playwright requires 1 device per "[project](https://playwright.dev/docs/test-projects)", so if you wish to test a site on multiple devices, you need multiple projects. Some of our setups have multiple sites which quickly makes a gnarly config file.

This framework allows you to specify devices and sites as two separate arrays. It then builds up the projects for Playwright while keeping the user-facing config succinct. The default browsers can be overridden globally or on a specific site if required.

This framework assumes that each `Site` has a `testDir` specific to that particular site in your install

Also included are some common testing functions - specific search or accessibility tests we want to run. Having them centralised allows a cleaner test file in the project itself.
