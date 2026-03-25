// @ts-check

import { defineConfig } from 'eslint/config';
import blocksDevSetupConfig from '@build-in-blocks/dev.setup';

// NOTE: Change folder name to where your ts files reside
const TARGET_FOLDER = '.';
const TARGET_FILES = `${TARGET_FOLDER}/**/*.{mjs,ts,js,tsx}`;

export default defineConfig([
  //------------------------------------------------------------------
  // USE OUR PRECONFIGURED SETTINGS & UPDATE IT WITH YOUR TARGET FILES
  //------------------------------------------------------------------
  blocksDevSetupConfig.map((config) => ({
    ...config,
    files: [TARGET_FILES],
  })),
]);
