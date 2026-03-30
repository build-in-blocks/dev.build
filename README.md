# @build-in-blocks/dev.build
**Supported Node.js versions:** Node.js v20.x, v22.x, v24.x and v25.x

#

**Description:** Production and development bundler build setup for your `typescript` and `javascript` web-related code repositories.

#

**How it works:** The **@build-in-blocks/dev.build** package contains preconfigured `webpack` setup for both development and production environment. After installation in your web project (and with very minimal intervention on your end), you just need to run `npm run dev` to generate a development mode bundle or `npm run build` to generate a well optimized production mode bundle.

#

**User guide:** See [docs.users README.md](https://github.com/build-in-blocks/dev.build/blob/develop/docs.users/README.md)

#

**Contributor guide:** See [docs.contributors README.md](https://github.com/build-in-blocks/dev.build/blob/develop/docs.contributors/README.md)

#

**Run into any issues?** Report them via our [product issue reports repo](https://github.com/build-in-blocks/product-issue-reports/issues)

#

### Quick installation & usage guide

#### 1. Main package installation

Install the package in your project:

````
npm install -D @build-in-blocks/dev.build
````

#### 2. Add typescript config

If your web project uses `typescript`, you will need this step too. Create a `tsconfig.json` file at the root of your web project, and add these:

````
{
    "extends": "@build-in-blocks/dev.build/tsconfig.base.json",
    "compilerOptions": {
        "declarationDir": "./build"
    },
    // NOTE: Change folder name in the include array to where your app's .ts work files reside.
    "include": ["src"],
}
````

#### 3. Add dev and build scripts

In your web project's `package.json` file, add the `dev` and `build` scripts:

````
"scripts": {
    "dev": "npx @build-in-blocks/dev.build@1.0.0 dev:build",
    "build": "npx @build-in-blocks/dev.build@1.0.0 prod:build"
    // your other npm scripts in your project goes here as usual
},
````

> [!IMPORTANT]  
> About `@build-in-blocks/dev.build@[VERSION_NUMBER_HERE]` in the scripts: Make sure the version number used your in your `dev` and `build` scripts is the same as the version of the `@build-in-blocks/dev.build` package in your `package.json` file's `devDependencies`.

#

### Contributors

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/build-in-blocks/dev.build/blob/develop/docs.contributors/README.md) [![License: AGPL v3.0](https://img.shields.io/badge/License-AGPL%20v3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
