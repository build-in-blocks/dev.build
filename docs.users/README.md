
# User guide: Package installation, setup and usage

Build production-ready typescript web apps (or web-based libraries) without your regular javascript/typescript web frameworks, with ease and speed. The **@build-in-blocks/dev.build** package contains preconfigured `webpack` setup for both development and production environment. After installation in your web project (and with very minimal intervention on your end), you just need to run `npm run dev` to generate a development mode bundle or `npm run build` to generate a well optimized production mode bundle.

#

### User installation instructions

User installation and setup instructions can in the [root README.md](https://github.com/build-in-blocks/dev.build).

#

### User guide extension

More info on **@build-in-blocks** framework libraries in general can be found at: https://github.com/build-in-blocks/.github/wiki/Repo-User-Guide-Extension

#

### What's included out of the box?

You have option to stick to the default or change your web app's:
- Source code folder and entry file names
- `webpack` development server port and browser open

These `webpack` config settings are applied to your web app once your run the development server or generate production build:

||Both|Development |Production|
|:-- |:-- |:-- |:-- |
|`index.html` copy and entry `.js` file injection in the html in output build|Yes |- |- |
|Code splitting & lazy loading |Yes |- |- |
|Tree shaking (TS/JS only for now)|Yes |- |- |
|Get app info |Yes |- |- |
|Minification and comment removed in output build|- | No |Yes|
|`contenthash` in output chunk file names|- | No |Yes|
|Output files "Build Size Summary" in terminal|- | No |Yes|
|Bundle analysis|- |No |Yes|
|Dev server (with customization) |- |Yes |No|
|(eval) source-map debugging in browser|- |Yes |No|
|CSS and images |Not yet supported | Not yet supported |Not yet supported |

#

### Blocks config default and changing to your preferred settings

If you don't add a `blocks.config.ts` file at the root of your web app or web library project, or the file exists but the blocks config object is empty:

- `blocksConfig.devBuild.srcCodeFolder` is set to the default `src`.
- `blocksConfig.devBuild.entryFileName` is set to the default `index`.
- `blocksConfig.devBuild.devServer.port` is set to the default `3000`.
- `blocksConfig.devBuild.devServer.open` is set to the default `false`.

To use your own preferred settings, add a `blocks.config.ts` file at the root of your web app or web library project. For example:

````ts
import { BlocksConfig } from '@build-in-blocks/dev.resources';

const blocksConfig: BlocksConfig = {
  devBuild: {
    srcCodeFolder: 'app',
    entryFileName: 'main',
    devServer: {
      port: 5800,
      open: true,
    }
  },
};

export default blocksConfig;
````

> [!NOTE]  
> For more context, The above example will tell blocks config that `app/main.ts` is your entry file. If you set `srcCodeFolder` to `'app'`, but don't include an `entryFileName`config, you're telling blocks config that you'd like to use `app/index.ts` as your entry file.

> [!NOTE]  
> You'll also need to update your web project's `tsconfig.json` file's `include` array and `rootDir`, to match your `srcCodeFolder` name.

#

### Code splitting and lazy loading

E.g. copy this code and put it inside `your-source-code-folder-name-here/dummy/console.ts` file:

````ts
export const dummyConsole = () => {
  console.log('1. dummy CONSOLE module!');
}
````

Also copy this code and put it inside `your-source-code-folder-name-here/dummy/example.ts` file:

````ts
export const dummyLazyLoadExample = () => {
  console.log('2. dummy EXAMPLE - LAZY LOADED module! YAY!');
}
````

Add the lazy load button in your your `index.html` file:

````html
<button id="lazy-load-me">Click me to lazy load the example module!</button>
````

Call them else where (e.g. your `.ts` entry file) using dynamic import, so that it gets split into a separate output file:

````ts
const app = async() => {
  //-------------------------------------------------
  // This module loads immediately the web page loads
  //-------------------------------------------------
  const { dummyConsole } = await import(
    /* webpackChunkName: "dummy.console" */
    /* webpackExclude: /\.d\.ts$/ */
    './dummy/console'
  );
  dummyConsole();

  //----------------------------------------------------------
  // This module will not be loaded until you click the button
  //----------------------------------------------------------
  const lazyLoadButton = document.querySelector('#lazy-load-me');
  lazyLoadButton?.addEventListener('click', async() => {
    const { dummyLazyLoadExample } = await import(
      /* webpackChunkName: "dummy.example" */
      /* webpackExclude: /\.d\.ts$/ */
      './dummy/example'
    );
    dummyLazyLoadExample();
  });
}

app();
````

Observe your browser dev tool's `console` and `network` tabs to see that the first module loads immediately the page loads, while the second module only loads (i.e. is **lazy loaded**) after you trigger a browser `event` (e.g. button `click` in this case).

> [!NOTE]  
> Include the webpack comments if you want your output files to have a recognizable name. Check the `chunks` folder inside your `dist` or `build` output folders to see it take effect.

#

### Getting your web app's metadata

Add this app mode element in your your `index.html` file:

````html
<h3>mode: <span id="app-mode"></span></h3>
````

Add this to your web app's entry file to see your app's metadata:

````ts
//------------------------------------
// Function to get your web app's info
//------------------------------------
export const getAppInfo = async () => {
  const response = await fetch('./metadata.json');
  const info = await response.json();
  return info;
}

const app = async() => {

  // Your other code here as usual

  //----------------------------
  // Display your web app's info
  //----------------------------
  const appInfo = await getAppInfo();
  console.log(appInfo);
  console.log(`Running version ${appInfo.version} built on ${appInfo.buildDate}`);
  //-
  const appModeElement = document.querySelector('#app-mode');
  if (appModeElement) {
    appModeElement.textContent = appInfo.environment;
  }
}

app();
````

#

### Bundle analysis (production only)

Upon running your production build script, `webpack` via the `webpack-bundle-analyzer` generates or updates the `.build-in-blocks/webpack.bundle.analyse.html` file. Open the html file in the browser to see an interactive treemap visualization of the contents of all your bundles.
