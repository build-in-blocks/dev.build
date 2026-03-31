#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// ------------------------------------------------
// ESM & Resolution Helpers:
// Recreate 'require' and '__dirname' for ESM scope
// ------------------------------------------------
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userAppArg = {
  devBuild: 'dev:build',
  prodBuild: 'prod:build',
};

const args_ = process.argv.slice(2);

const pkgArgDetected = args_.length === 1 && (args_[0] === userAppArg.devBuild || args_[0] === userAppArg.prodBuild);

if (pkgArgDetected) {
  const isProd = args_[0] === userAppArg.prodBuild;
  const mode = isProd ? 'production' : 'development';

  // ------------------------------------------------------------------------------
  // Find the path to the webpack-cli executable within your library's dependencies
  // ------------------------------------------------------------------------------
  const webpackCliPath = require.resolve('webpack-cli/bin/cli.js');

  //-------------------------------------------------------
  // Webpack config to use depending on mode or environment
  //-------------------------------------------------------
  const configFileName = isProd ? 'webpack.prod.mjs' : 'webpack.dev.mjs';
  const configPath = path.resolve(__dirname, '../config.web', configFileName);

  const webpackCmdArgs = [
    // ------------------------------------------------------------------
    // (Comment this --no-depreciation flag out during local development)
    // (of this shared library)
    // ------------------------------------------------------------------
    // It hides the e.g. fs.Stats warning which is useful for external
    // libraries used and that we can't control/fix (from users, after
    // we publish this package to npm).
    // ---------------------------------------------------------------------
    // e.g. ts-node gives depreciation warnings that we can't fix or control
    // ---------------------------------------------------------------------
    '--no-deprecation',
    //-----------------
    webpackCliPath, // Run the CLI script directly via node
    '--config',
    configPath,
    '--mode',
    mode,
  ];

  const isDev = args_[0] === userAppArg.devBuild;
  if (isDev) {
    webpackCmdArgs.push('--watch');
  }

  // ---------------------------------------------------------------------------------
  // Spawn 'node' instead of 'npx' or 'webpack' directly
  // This is safer, avoids shell vulnerabilities, and ensures it finds the right files.
  // ---------------------------------------------------------------------------------
  const spawnChildProcess = spawn(process.execPath, webpackCmdArgs, {
    stdio: 'inherit',
  });

  spawnChildProcess.on('exit', (code) => {
    if (code === 0 && isProd) {
      console.log('[PROD] Bundling complete.\n[PROD] Generating type definitions...');
      try {
        // -------------------------------------------------------
        // Run tsc to generate .d.ts files into the 'build' folder
        // Using the user app's local tsc
        // -------------------------------------------------------
        execSync('npx tsc --emitDeclarationOnly', { stdio: 'inherit' });
        console.log('[PROD] Types (.d.ts files) generated successfully.');
      } catch (e) {
        console.error(`ERROR | @build-in-blocks dev.build (internal):\nType generation failed.\n${e}`);
      }
    }
    process.exit(code || 0);
  });
}
