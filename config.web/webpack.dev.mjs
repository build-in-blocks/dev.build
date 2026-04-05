import path from 'path';
import { merge } from 'webpack-merge';
import baseConfig, { getDynamicChunkFileName, userAppRoot } from './webpack.common.mjs';

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
});
