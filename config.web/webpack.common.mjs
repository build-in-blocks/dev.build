import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire, register } from 'module';
import HtmlWebpackPlugin from 'html-webpack-plugin';

// ------------------------------------------------
// ESM & Resolution Helpers:
// Recreate 'require' and '__dirname' for ESM scope
// ------------------------------------------------
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const userAppPkgJSON = JSON.parse(fs.readFileSync(path.join(userAppRoot, 'package.json'), 'utf-8'));

const pkgJSONnameFormatter = (name) => {
  return name
    .replace(/^@.*\//, '') 
    .split(/[-_]/)         
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};


// ------------------------------------------
// Blocks config (from user app) loader logic
// ------------------------------------------
const userAppConfigName = 'blocks.config.ts';
const blocksConfigPath = path.resolve(userAppRoot, userAppConfigName);
let blocksConfig = {};
//-
if (fs.existsSync(blocksConfigPath)) {
  try {
    // --------------------------------------------------------------------
    // Using the ts-node loader "register" configured earlier to allow node
    // to read the TS config file directly.
    // --------------------------------------------------------------------
    // Dynamic import is used since that's what's required for ESM projects
    // --------------------------------------------------------------------
    const module = await import(pathToFileURL(blocksConfigPath).href);
    blocksConfig = module.default || module;
  } catch (e) {
    console.warn(`⚠️ Could not load ${userAppConfigName}, using defaults.`, e.message);
  }
}
//-
const userAppSrcFolderRoot = blocksConfig.webpack.srcFolderRoot || 'src';
const userAppEntryFileName = blocksConfig.webpack.entryFileName || 'index';

const userAppHtmlTemplate = path.resolve(userAppRoot, userAppSrcFolderRoot, 'index.html');
const userAppHasHTMLtemplate = fs.existsSync(userAppHtmlTemplate);

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
          const metadata = JSON.stringify({
            name: userAppPkgJSON.name,
            version: userAppPkgJSON.version,
            buildDate: new Date().toISOString(),
            environment: compiler.options.mode
          }, null, 2);

          // 3. Use emitAsset instead of direct assignment
          compilation.emitAsset(
            'metadata.json',
            new compiler.webpack.sources.RawSource(metadata)
          );
        }
      );
    });
  }
};


export default {
  // ----------------------------------------------------------
  // Ensure Webpack knows we are working on the User app's code
  // ----------------------------------------------------------
  context: userAppRoot,
  // --------------
  entry: {
    index: path.resolve(userAppRoot, userAppSrcFolderRoot, userAppEntryFileName),
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
            configFile: path.resolve(userAppRoot, 'tsconfig.json')
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    // --------------------------------------
    // Helps to resolve standard dependencies
    // --------------------------------------
    modules: [
      path.resolve(userAppRoot, 'node_modules'),
      path.resolve(__dirname, '../node_modules')
    ],
  },
  // -------------------------------------------------
  // Helps resolve other loaders if you add them later
  // -------------------------------------------------
  resolveLoader: {
    modules: [
      path.resolve(__dirname, '../node_modules'),
      'node_modules'
    ],
  },
  output: {
    library: {
      name: pkgJSONnameFormatter(userAppPkgJSON.name),
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
    clean: true, // Wipes the dist/build folder before every new build
  },
  plugins: [
    customMetaDataPluginForUserApp,
    // ---------------------------------------------------------------------------------------------------------
    // Only initialize and add the HtmlWebpackPlugin plugin if the user app's "src folder root" has an html file
    // ---------------------------------------------------------------------------------------------------------
    ...(userAppHasHTMLtemplate ? [
      new HtmlWebpackPlugin({
        title: 'Blocks App',
        filename: 'index.html',
        template: userAppHtmlTemplate,
        inject: 'body',
      })
    ] : []),
  ],
};