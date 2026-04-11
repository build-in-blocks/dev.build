#!/usr/bin/env node

import { path, spawn, execSync } from '../config.root/external.packages.js';

import { blocksTerminalLogger } from '../config.root/blocks.packages.js';
//-
import {
  require,
  __dirname,
  internalPkgJSON,
  isWindowsOS,
  windowsCmdextension,
} from '../config.root/root.js';
//-
import { renameRootTypeFileInBuildOutputFolder } from './helper/rename-root-type.js';
//-

const userAppArg = {
  devBuild: 'dev:build',
  prodBuild: 'prod:build',
};

const args_ = process.argv.slice(2);

const pkgArgDetected =
  args_.length === 1 &&
  (args_[0] === userAppArg.devBuild || args_[0] === userAppArg.prodBuild);

if (pkgArgDetected) {
  const isProd = args_[0] === userAppArg.prodBuild;
  const mode = isProd ? 'production' : 'development';

  // ------------------------------------------------------------------------------
  // Find the path to the webpack-cli executable within your library's dependencies
  // ------------------------------------------------------------------------------
  const webpackCliPath = require.resolve('webpack-cli/bin/cli.js');
  // ---------------------------------------------
  // The path to YOUR internal node_modules folder
  // ---------------------------------------------
  const internalModulesPath = path.resolve(__dirname, '../node_modules');
  //---------------------------------------------------------------
  // Let Node's resolution engine find where typescript is actually
  // installed, in order to find and use TSC (from path) from this
  // shared library
  //---------------------------------------------------------------
  const tsPath = require.resolve('typescript');
  const tscPath = path.resolve(path.dirname(tsPath), '../bin/tsc');

  //-------------------------------------------------------
  // Webpack config to use depending on mode or environment
  //-------------------------------------------------------
  const configFileName = isProd ? 'webpack.prod.mjs' : 'webpack.dev.mjs';
  const configPath = path.resolve(__dirname, '../config.web', configFileName);

  // -------------------------------------------------------------------------
  // (Related to webpack-dev-server) Use 'serve' for dev, no command for build
  // -------------------------------------------------------------------------
  const webpackAction = isProd ? [] : ['serve'];

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
    ...webpackAction, // This adds 'serve' if command is 'dev'
    '--config',
    configPath,
    '--mode',
    mode,
  ];

  // ----------------------------------------------------------------------------------
  // Spawn 'node' instead of 'npx' or 'webpack' directly
  // This is safer, avoids shell vulnerabilities, and ensures it finds the right files.
  // ----------------------------------------------------------------------------------
  const spawnChildProcess = spawn(process.execPath, webpackCmdArgs, {
    stdio: 'inherit',
    // -------------------------------------------------
    // Spawn the Process with the "Ghost Dependency" Fix
    // -------------------------------------------------
    env: {
      ...process.env,
      //---------------------------------------------------------
      // CRITICAL: This tells Webpack to look in YOUR framework's
      // node_modules to find webpack-dev-server, keeping the
      // User App's node_modules completely clean.
      //---------------------------------------------------------
      NODE_PATH: internalModulesPath,
    },
  });

  spawnChildProcess.on('exit', (code) => {
    if (code === 0 && isProd) {
      console.log('============================================\n');
      console.log(
        '[PROD] Bundling complete.\n[PROD] Generating type definitions...',
      );
      try {
        // --------------------------------------------------------------
        // Execute the ENGINE'S internal tsc relative to the user project
        // --------------------------------------------------------------
        // Run tsc to generate .d.ts files into the 'build' folder
        // Using the user app's local tsc
        // -------------------------------------------------------
        const tscPathForRelevantOS = isWindowsOS
          ? `tsc${windowsCmdextension}`
          : tscPath; // This check makes it compatible with Windows OS (in production)
        execSync(`${tscPathForRelevantOS} --emitDeclarationOnly`, {
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_PATH: internalModulesPath,
          },
        });
        //-
        renameRootTypeFileInBuildOutputFolder();
        //-
        console.log('[PROD] Types (.d.ts files) generated successfully.');
      } catch (e) {
        blocksTerminalLogger({
          internalPackage: {
            fullName: internalPkgJSON.name,
            errorMessage: 'Type generation failed.',
          },
          originalErrorMessage: e,
        });
      }
      console.log('');
    }
    process.exit(code || 0);
  });
}
