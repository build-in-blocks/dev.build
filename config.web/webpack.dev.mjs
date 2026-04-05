import path from 'path';
import { merge } from 'webpack-merge';
import baseConfig, { blocksConfigDevServerOpen, blocksConfigDevServerPort, getDynamicChunkFileName, userAppRoot } from './webpack.common.mjs';

export default merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(userAppRoot, 'dist'),
    filename: '[name].js',
    chunkFilename: (pathData) => {
      return getDynamicChunkFileName({
        pathData,
        mode: 'dev',
      });
    },
  },
  devServer: {
    static: {
      // ----------------------------------------------------------------
      // Tell the server WHERE the actual files are (The User's App Root)
      // ----------------------------------------------------------------
      directory: path.resolve(userAppRoot, 'dist'),
    },
    //--------------------------------------
    // Use the PORT supplied by the user app
    //--------------------------------------
    port: blocksConfigDevServerPort || 3000,
    //-------------------------------
    // Open the browser automatically
    //-------------------------------
    open: blocksConfigDevServerOpen || false,
    // -----------------------------------------------------------------
    // NEW: Force Webpack to save the files to your build/dist folder
    // -----------------------------------------------------------------
    devMiddleware: {
      writeToDisk: true,
    },
    // -----------------------------
    // Enable Hot Module Replacement
    // -----------------------------
    hot: true,
    //--------------------------------
    // Useful if you add routing later
    //--------------------------------
    historyApiFallback: true,
    //---------------------------------------------------------
    // Fix for ESM: Ensure headers allow cross-origin if needed
    //---------------------------------------------------------
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    //------------------------------------------------------------------------
    // Ensure client knows where to find the socket (crucial for custom roots)
    //------------------------------------------------------------------------
    client: {
      overlay: true, // Shows errors in the browser
    },
  },
});
