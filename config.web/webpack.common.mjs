import { fs, path, pathToFileURL, register, webpack, HtmlWebpackPlugin, TsconfigPathsPlugin } from '../config.root/external.packages.js';
//-
import { _default, blocksTerminalLogger } from '../config.root/blocks.packages.js';
//-
import { require, __dirname, internalPkgJSON, supportingTSconfigName } from '../config.root/root.js';
//-
import { validateMainEntryFilePathInUserApp } from './validate/userapp.validate.js';
//-

// -------------------------------------------------
// Finds the exact path to the ts-loader file inside
// this shared library (from the user app)
// -------------------------------------------------
const tsLoaderPath = require.resolve('ts-loader');

// ----------------------------------------------------------------------------
// Resolve the absolute path to the ts-node ESM loader from this shared library
// ----------------------------------------------------------------------------
const tsNodeEsmLoader = pathToFileURL(require.resolve('ts-node/esm')).href;
// ------------------------------------------------
// Then, register the loader using the absolute URL
// ------------------------------------------------
register(tsNodeEsmLoader, pathToFileURL('./'));

//--------------------------
// Work from user app's root
//--------------------------
export const userAppRoot = process.cwd();
export const userAppPkgJSON = JSON.parse(fs.readFileSync(path.join(userAppRoot, 'package.json'), 'utf-8'));

// ------------------------------------------
// Blocks config (from user app) loader logic
// ------------------------------------------
const blocksConfigFileName = `blocks.config${_default.fileExtension}`;
const blocksConfigPath = path.resolve(userAppRoot, blocksConfigFileName);
let blocksConfig = {};
//-
if (fs.existsSync(blocksConfigPath)) {
  //-
  const blocksConfigErrorObj = {
    internalPackage: {
      fullName: internalPkgJSON.name,
    },
    userApp: {
      fullName: userAppPkgJSON.name,
      errorMessage: `Could not load ${blocksConfigFileName}`,
    },
    errorSource: true,
    suggestion: {
      // prettier-ignore
      messageList: [
          '→ Check that "type": "module" is present in your project\'s package.json',
          `→ Check that the correct import statement and blocks config object properties are used in your project's ${blocksConfigFileName}`,
        ],
    },
    processExit: true,
  };
  //-
  try {
    // --------------------------------------------------------------------
    // Using the ts-node loader "register" configured earlier to allow node
    // to read the TS config file directly.
    // --------------------------------------------------------------------
    // Dynamic import is used since that's what's required for ESM projects
    // --------------------------------------------------------------------
    const module = await import(pathToFileURL(blocksConfigPath).href);
    blocksConfig = module.default || module;
    //-------------------------------------------------------------------------
    // For when blocks config exists, but the file is either empty, all content
    // commented out. In summary, when there's no recognised default export in
    // the blocks config file.
    //-------------------------------------------------------------------------
    const noDefaultExportInBlocksConfigFile = Object.keys(module).length === 0;
    if (noDefaultExportInBlocksConfigFile) {
      blocksTerminalLogger(blocksConfigErrorObj);
    }
  } catch {
    blocksTerminalLogger(blocksConfigErrorObj);
  }
} else {
  // -------------------------------------------------------------------------------
  // Setting blocksConfig.devBuild to empty object here, prevents errors i.e. in
  // addition to adding optional chaining (?) to blocksConfig.devBuild.srcCodeFolder
  // and blocksConfig.devBuild.entryFileName e.t.c below.
  // -------------------------------------------------------------------------------
  blocksConfig = {
    devBuild: {
      devServer: {},
    },
  };
}
//-
const blocksConfigSrcCodeFolder = blocksConfig.devBuild?.srcCodeFolder;
const blocksConfigEntryFileName = blocksConfig.devBuild?.entryFileName;
const blocksConfigDevServerPort = blocksConfig.devBuild?.devServer?.port;
const blocksConfigDevServerOpen = blocksConfig.devBuild?.devServer?.open;
//-
export const userAppSrcCodeFolder = blocksConfigSrcCodeFolder || _default.srcCodeFolder;
const userAppEntryFileName = blocksConfigEntryFileName || _default.entryFileName;
export const userAppDevServerPort = blocksConfigDevServerPort || 3000;
export const userAppDevServerOpen = blocksConfigDevServerOpen || false;

const entryFilePath = path.resolve(userAppRoot, userAppSrcCodeFolder, userAppEntryFileName);

const userAppHtmlTemplate = path.resolve(userAppRoot, userAppSrcCodeFolder, 'index.html');
const userAppHasHTMLtemplate = fs.existsSync(userAppHtmlTemplate);

validateMainEntryFilePathInUserApp({
  userAppName: userAppPkgJSON.name,
  userAppRoot,
  userAppSrcCodeFolder,
  userAppEntryFileName,
  blocksConfigFileName,
  blocksConfigSrcCodeFolder,
  blocksConfigEntryFileName,
});

// ----------------------------------------------------------------------------------------
// Custom Metadata Plugin Logic to add user app version info into the dist and build folder
// ----------------------------------------------------------------------------------------
const customMetaDataPluginForUserApp = {
  apply: (compiler) => {
    // ----------------------------------------------------------------
    // A. Use the 'thisCompilation' hook to get access to processAssets
    // ----------------------------------------------------------------
    compiler.hooks.thisCompilation.tap('customMetaDataPluginForUserApp', (compilation) => {
      // -------------------------------------------------------------
      // B. Use the 'processAssets' hook, which is the modern standard
      // -------------------------------------------------------------
      compilation.hooks.processAssets.tap(
        {
          name: 'customMetaDataPluginForUserApp',
          // -------------------------------------------------------------
          // STAGE_ADDITIONAL: The correct stage for generating new assets
          // -------------------------------------------------------------
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          const metadata = JSON.stringify(
            {
              name: userAppPkgJSON.name,
              version: userAppPkgJSON.version,
              buildDate: new Date().toISOString(),
              environment: compiler.options.mode,
            },
            null,
            2,
          );

          // 3. Use emitAsset instead of direct assignment
          compilation.emitAsset('metadata.json', new compiler.webpack.sources.RawSource(metadata));
        },
      );
    });
  },
};

const allowedBlocksPackages = ['dom.autoquery'];
//-
const orgPrefix = '@build-in-blocks/';
//-
const actualPackageName = userAppPkgJSON.name.replace(orgPrefix, '');
const isAllowedBlocksPackage = allowedBlocksPackages.some((_package) => _package === actualPackageName);
//-
const contentHashExtension = ({ mode }) => (mode === 'prod' ? '.[contenthash:8]' : '');
//-
const chunkFilename = ({ mode }) => `${isAllowedBlocksPackage ? `chunks.${actualPackageName}` : 'chunks'}/[name]${contentHashExtension({ mode })}.js`;
//-
export const getDynamicChunkFileName = ({ pathData, mode }) => {
  //---------------------------------------------------------------------------
  // First get the absolute path to your main web user app's source code folder
  //---------------------------------------------------------------------------
  const mainBlocksWebAppPath = path.resolve(userAppRoot, userAppSrcCodeFolder);
  //------------------------------------------------------------------------------
  // Get all modules in this chunk. Then find the needed resources i.e. if it's
  // not in the source code folder of the main web user app, then it's an external
  // library used in the main web user app.
  //------------------------------------------------------------------------------
  const chunkModules = Array.from(pathData.chunk.modulesIterable || []);
  const externalModule = chunkModules.find((m) => m.resource && !m.resource.startsWith(mainBlocksWebAppPath));
  //--------------------------------------------------------------------------------------
  // In the main web user app's build output, make the chunks from such external libraries
  // reside in the folder named after a particular external library
  //--------------------------------------------------------------------------------------
  if (externalModule) {
    const resource = externalModule.resource;
    const externalResourceLocalPath = resource.split(/[\\/]dist\.prod/)[0];
    const externalResourcePackageName = allowedBlocksPackages.find((packageName) => externalResourceLocalPath.endsWith(packageName));
    //-
    if (externalResourcePackageName) {
      return `chunks/${externalResourcePackageName}/[name]${contentHashExtension({ mode })}.js`;
    }
  }
  //-----------------------------------------------
  // Every other scenario uses this chunk file name
  //-----------------------------------------------
  return chunkFilename({ mode });
};

// -------------------------------------------------------------
// Libraries only: supportingTSconfigPath location from user app
// Related to Typescript @ import alias error prevention
// -------------------------------------------------------------
const supportingTSconfigPath = path.join(userAppRoot, supportingTSconfigName);


export default {
  // ----------------------------------------------------------
  // Ensure Webpack knows we are working on the User app's code
  // ----------------------------------------------------------
  context: userAppRoot,
  // --------------
  entry: {
    index: entryFilePath,
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        use: {
          // ----------------------------------------------------------------
          // Using the absolute path here so Webpack doesn't have to "search"
          // ----------------------------------------------------------------
          loader: tsLoaderPath,
          options: {
            transpileOnly: true,
            // -----------------------------------------
            // Point to the user app's config explicitly
            // -----------------------------------------
            configFile: path.resolve(userAppRoot, 'tsconfig.json'),
            //----------------------------------------------
            // This ensures ts-loader uses the version of TS
            // that sits right next to it in your engine.
            //----------------------------------------------
            compiler: require.resolve('typescript'),
            //-------------------------------------------------------------------
            // HIDES ts-laoder related WARNINGS, so that users don't get confused
            //-------------------------------------------------------------------
            logLevel: 'error',
          },
        },
        //---------------------------------------------
        // Ensure we ONLY process the user's app folder
        //---------------------------------------------
        include: path.resolve(userAppRoot, userAppSrcCodeFolder),
        //---------------------------------------------------------------------
        // Keeps @build-in-blocks processable while ignoring other node_modules
        // i.e. Make sure we ARE processing the blocks library from within the
        // main web user app's node_modules folder
        //---------------------------------------------------------------------
        exclude: /node_modules\/(?!@build-in-blocks)/,
      },
      {
        test: /\.m?js$/,
        resolve: {
          //-------------------------------------------------------------------------------------
          // For blocks library from within the main web user app (e.g. dom.autoquery dist.prod):
          // This tells Webpack: "If you don't see an extension,try adding .js before giving up."
          //-------------------------------------------------------------------------------------
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    plugins: [
      ...(fs.existsSync(supportingTSconfigPath)
      ? [
          new TsconfigPathsPlugin({
            configFile: supportingTSconfigPath, // Prevent Typescript @ import alias error: read user app's @ aliases automatically!
          })
        ]
      : []),
    ],
    extensions: [_default.fileExtension, '.js', '.mjs', '.json'], // TODO: [Maybe later if needed] | Add these other extensions to the array: '.tsx', '.jsx'
    alias: {
      //---------------------------------------------------------------------------------------------
      // Force Webpack to resolve library imports to the library's source
      // Add more alias here when you have more libraries to access from within the main web user app
      //---------------------------------------------------------------------------------------------
      '@build-in-blocks/dom.autoquery': path.resolve(userAppRoot, 'node_modules/@build-in-blocks/dom.autoquery/dist.prod'),

      //--------------------------------------------------------------------------------------------------
      // Dynamic imports: ts-alias library doesn't take care of typescript's @ import from dynamic imports
      // We therefor need to map the internal library alias to the actual compiled folder
      //--------------------------------------------------------------------------------------------------
      '@_queries': path.resolve(userAppRoot, 'node_modules/@build-in-blocks/dom.autoquery/dist.prod/queries'),
    },
    // --------------------------------------
    // Helps to resolve standard dependencies
    // --------------------------------------
    // prettier-ignore
    modules: [
      path.resolve(userAppRoot, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
    ],
  },
  // -------------------------------------------------
  // Helps resolve other loaders if you add them later
  // -------------------------------------------------
  resolveLoader: {
    // prettier-ignore
    modules: [
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
    ],
  },
  output: {
    publicPath: 'auto',
    module: true, // Enable output as an ES Module
    library: {
      type: 'module', // Set library type to module
    },
    clean: true, // Wipes the dist/build folder before every new build
  },
  experiments: {
    outputModule: true, // Required by Webpack 5 for ESM output
  },
  plugins: [
    customMetaDataPluginForUserApp,

    // ----------------------------------------------------------------------------------------------------------------------------
    // Hey webpack, whenever you encounter a dynamic import, ONLY look for .js files. Ignore everything else (like .d.ts or .json)"
    // ----------------------------------------------------------------------------------------------------------------------------
    new webpack.ContextReplacementPlugin(
      /./, // Match all contexts
      null, // Don't change the directory
      {
        test: /\.js$/, // ONLY include .js files in chunks
      },
    ),

    // ---------------------------------------------------------------------------------------------------------
    // Only initialize and add the HtmlWebpackPlugin plugin if the user app's "src folder root" has an html file
    // ---------------------------------------------------------------------------------------------------------
    ...(userAppHasHTMLtemplate
      ? [
          new HtmlWebpackPlugin({
            title: 'Blocks App',
            filename: 'index.html',
            template: userAppHtmlTemplate,
            inject: 'body',
            // -------------------------------------------------------------------------------
            // CRITICAL (webpack-dev-server): This tells Webpack to use <script type="module">
            // -------------------------------------------------------------------------------
            scriptLoading: 'module',
          }),
        ]
      : []),
  ],
};
