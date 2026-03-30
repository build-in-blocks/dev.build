import path from 'path';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig, { userAppRoot } from './webpack.common.mjs';

export default merge(baseConfig, {
  mode: 'production',
  devtool: false, // Disable source maps in production (for now)
  output: {
    path: path.resolve(userAppRoot, 'build'),
    filename: '[name].js', // Since devtool is set to false, use stable name for published entry points
    chunkFilename: 'chunks/[name].[contenthash].js',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: { format: { comments: false } },
        extractComments: false,
      }),
    ],
    splitChunks: {
      chunks: 'all',
    },
  },
});