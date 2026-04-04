import path from 'path';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
//-
import baseConfig, { userAppPkgJSON, userAppRoot, userAppSrcCodeFolder } from './webpack.common.mjs';

const sizeSummaryPlugin = {
  apply: (compiler) => {
    compiler.hooks.done.tap('SizeSummaryPlugin', (stats) => {
      const assets = stats.toJson().assets;
      console.log('\n============================================');
      console.log('📊   Blocks App | Prod Build Size Summary   ');
      console.log('============================================');
      assets.forEach((asset) => {
        if (asset.name === 'index.html' || asset.name.endsWith('.js') || asset.name.endsWith('.json')) {
          // if (/\.(js|json|html)$/.test(asset.name)) //Note: Using this instead Captures .js, .json, and .html (including nested chunks)
          const sizeKb = (asset.size / 1024).toFixed(2);
          const emoji = asset.size > 244000 ? '⚠️' : '✅'; // 244kb is Webpack's default warning limit
          console.log(`${emoji} ${asset.name}: ${sizeKb} KB`);
        }
      });
      console.log('============================================\n');
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
const prodChunkFilename = `${isAllowedBlocksPackage ? `chunks.${actualPackageName}` : 'chunks'}/[name].[contenthash:8].js`;

export default merge(baseConfig, {
  mode: 'production',
  devtool: false, // Disable source maps in production (for now)
  output: {
    path: path.resolve(userAppRoot, 'build'),
    filename: '[name].js', // Since devtool is set to false, use stable name for published entry points
    chunkFilename: (pathData) => {
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
          return `chunks/${externalResourcePackageName}/[name].[contenthash:8].js`;
        }
      }
      //-----------------------------------------------
      // Every other scenario uses this chunk file name
      //-----------------------------------------------
      return prodChunkFilename;
    },
  },
  optimization: {
    usedExports: true, // Crucial for tree-shaking: It tells Webpack to determine used exports for each module
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            passes: 2,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // Generates a file instead of starting a server
      openAnalyzer: false, // Don't pop up the browser automatically
      reportFilename: path.resolve(userAppRoot, '.build-in-blocks', 'webpack.bundle.analyse.html'), // Save it in the build folder
      logLevel: 'info',
    }),
    sizeSummaryPlugin,
  ],
});
