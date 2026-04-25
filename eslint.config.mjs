// @ts-check

import { defineConfig, blocksDevSetupBaseConfig } from '@build-in-blocks/dev.setup';

//-------------------------------------------------------
// NOTE: Change folder name to where your ts files reside
//-------------------------------------------------------
const TARGET_FOLDER = '.';
const TARGET_FILES = `${TARGET_FOLDER}/**/*.{mjs,ts,js}`;

export default defineConfig([
  //------------------------------------------------------------------
  // USE OUR PRECONFIGURED SETTINGS & UPDATE IT WITH YOUR TARGET FILES
  //------------------------------------------------------------------
  blocksDevSetupBaseConfig.map((/** @type {any} */ config) => ({
    ...config,
    files: [TARGET_FILES],
  })),
]);
