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

Create a `tsconfig.json` file at the root of your web project, and add these:

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

#### 3. Update your project's package.json

- **Add dev and build scripts:** In your web project's `package.json` file, add the `dev` and `build` scripts:

  ````
  "scripts": {
    "dev": "npx @build-in-blocks/dev.build@1.0.0 dev:build",
    "build": "npx @build-in-blocks/dev.build@1.0.0 prod:build"
    // your other npm scripts in your project goes here as usual
  },
  ````

  > [!IMPORTANT]  
  > About `@build-in-blocks/dev.build@[VERSION_NUMBER_HERE]` in the scripts: Make sure the version number used your in your `dev` and `build` scripts is the same as the version of the `@build-in-blocks/dev.build` package in your `package.json` file's `devDependencies`.

- **You need this too:** Add these in the your web project's `package.json` file too:

  ````
  {
    "type": "module",
    "sideEffects": false,
    // your other package.json property values go here as usual
  }
  ````

  > [!NOTE]  
  > You need `"type": "module"` since this library package is ESM-first. `sideEffects` helps with treeshaking.

#### 4. Source code folder and entry file for webpack

- **Option 1 - Default webpack entry file path:** If you create or use a `src/index.ts` file in your web project, the library will assume that you don't wish to change your `webpack` entry file path and want to stick to the default.
- **option 2 - Override the default with your preferred entry file path:** If you prefer e.g. `app/main.ts` to be your project's `webpack` entry file path, create a `blocks.config.ts` file at the root of your web project and add this code in there:

  ````
  import { BlocksConfig } from '@build-in-blocks/dev.resources';

  const blocksConfig: BlocksConfig = {
    devBuild: {
      srcFolderRoot: 'app',
      entryFileName: 'main',
    },
  };

  export default blocksConfig;
  ````
  > [!NOTE]  
  > You'll need to install the `@build-in-blocks/dev.resources` package in your web project.
  
  > [!NOTE]  
  > You'll also need to update your web project's `tsconfig.json` file's `include` array i.e. change `"src"` to `"app"`.

#### 5. (Optional) index.html - run code in browser

If you plan to run your web project in the browser, add a main `index.html` file at the root of your source code folder i.e. it's file path should be `src/index.html` if you are using default, or e.g. `app/index.html` if you've used blocks config to override the default. 

> [!NOTE]  
> This will automatically include the main `index.html` file in your `dist` and `build` folders. Your entry point file is also injected in the generated `index.html`'s `body` tag.

#### 6. Run the npm scripts to generate output folders

- **Local development build:** `Webpack` will now watch your source code folder as you make changes to its content, and will also generate/update the `dist` output folder, when you run the `dev` script command:

  ````
  npm run dev
  ````

- **Production build:** Run the `build` script command, anytime you need to generate/update your production build i.e. the `build` output folder:
  
  ````
  npm run build
  ````

> [!NOTE]  
> See user guide 👆🏽 (towards the top of this README) for information for more information.

#

### Contributors

[![All Contributors](https://img.shields.io/github/all-contributors/build-in-blocks/dev.build?color=ee8449&style=flat-square)](#contributors) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/build-in-blocks/dev.build/blob/develop/docs.contributors/README.md) [![License: AGPL v3.0](https://img.shields.io/badge/License-AGPL%20v3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="16.66%"><a href="https://github.com/Ifycode"><img src="https://avatars.githubusercontent.com/u/45185388?v=4?s=100" width="100px;" alt="Mary @Ifycode"/><br /><sub><b>Mary @Ifycode</b></sub></a><br /><a href="https://github.com/build-in-blocks/dev.build/commits?author=Ifycode" title="Code">💻</a> <a href="https://github.com/build-in-blocks/dev.build/commits?author=Ifycode" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
