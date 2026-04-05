import path from 'path';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
//-
import baseConfig, { getDynamicChunkFileName, userAppRoot } from './webpack.common.mjs';

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

export default merge(baseConfig, {
  mode: 'production',
  devtool: false, // Disable source maps in production (for now)
  output: {
    path: path.resolve(userAppRoot, 'build'),
    filename: '[name].js', // Since devtool is set to false, use stable name for published entry points
    chunkFilename: (pathData) => {
      return getDynamicChunkFileName({ 
        pathData,
        mode: 'prod',
      });
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
