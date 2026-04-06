
# User guide: Package installation, setup and usage

Build production-ready typescript web apps (or web-based libraries) without your regular javascript/typescript web frameworks, with ease and speed. The **@build-in-blocks/dev.build** package contains preconfigured `webpack` setup for both development and production environment. After installation in your web project (and with very minimal intervention on your end), you just need to run `npm run dev` to generate a development mode bundle or `npm run build` to generate a well optimized production mode bundle.

#

### User installation instructions

User installation and setup instructions can in the [root README.md](https://github.com/build-in-blocks/dev.build).

#

### Dependency Information

`@build-in-blocks` framework libraries that have `dev.` in their name are only useful for local development, and should only be installed as a `devDependency` in your **web app**. If you are using a particular `dev.` package to build a **library** you wish to publish, and your library's end users will need to access that `dev.` packages' functionality or interface, in this case you will need to install it as a `dependency` instead.

#

### What's included out of the box?

You have option to stick to the default or change your web app's:
- Source code folder and entry file names
- `webpack` development server port and browser open

These `webpack` config settings are applied to your web app once your run the development server or generate production build:

||Both|Development |Production|
|:-- |:-- |:-- |:-- |
|`index.html` copy and entry `.js` file injection in the html in output build|Yes |- |- |
|Tree shaking (TS/JS only for now)|Yes |- |- |
|Minification and comment removed in output build|- | No |Yes|
|`contenthash` in output chunk file names|- | No |Yes|
|Output files "Build Size Summary" in terminal|- | No |Yes|
|Bundle analysis|- |No |Yes|
|Dev server|- |Yes |No|
|(eval) source-map debugging in browser|- |Yes |No|

#

### Blocks config default and changing to your preferred settings

If you don't add a `blocks.config.ts` file at the root of your web app or web library project, or the file exists but the blocks config object is empty:

- `blocksConfig.devBuild.srcCodeFolder` is set to the default `src`.
- `blocksConfig.devBuild.entryFileName` is set to the default `index`.
- `blocksConfig.devBuild.devServer.port` is set to the default `3000`.
- `blocksConfig.devBuild.devServer.open` is set to the default `false`.

To use your own preferred settings, add a `blocks.config.ts` file at the root of your web app or web library project. For example:

````
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

E.g. For this code located at `your-source-code-folder-name-here/dummy/console.ts` file:

````
export const dummyConsole = () => {
  console.log('dummy console module! Yay!');
};
````

Call it else where (i.e. in another file e.g. your entry file) using dynamic import, so that it gets split into a separate output file:

````
const { dummyConsoleCode } = await import(
    /* webpackChunkName: "dummy.console" */
    /* webpackExclude: /\.d\.ts$/ */
    './dummy/console'
);
dummyConsoleCode();
````

To lazy load, just use the dynamic import inside an event listener based on user activity e.g. on click.

> [!NOTE]  
> Include the webpack comments if you want your output files to have a recognizable name.

#

### Getting your web app's metadata

Add this to your web app's entry file to see your app's metadata:

````
export const getAppInfo = async () => {
  const response = await fetch('./metadata.json');
  const info = await response.json();
  return info;
};

const appInfo = getAppInfo();
console.log(`Running version ${appInfo.version} built on ${appInfo.buildDate}`);

````

#

### Bundle analysis (production only)

Upon running your production build script, `webpack` via the `webpack-bundle-analyzer` generates or updates the `.build-in-blocks/webpack.bundle.analyse.html` file. Open the html file in the browser to see an interactive treemap visualization of the contents of all your bundles.
