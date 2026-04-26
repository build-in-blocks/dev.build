#!/usr/bin/env node

import { fs, path, spawn, execSync } from '../config.root/external.packages.js';

import { blocksTerminalLogger } from '../config.root/blocks.packages.js';
//-
import { require, __dirname, internalPkgJSON, isWindowsOS, windowsCmdextension, distProdFolderName, mainTSconfigFileName, supportingTSconfigFileName, buildOutputFolderName } from '../config.root/root.js';
//-
import { renameRootTypeFileInBuildOutputFolder } from './helper/rename-root-type.js';
//-

//-------------------------------------------------------------------------
// Work from user app's root | Declaring it here again instead of importing
// them from webpack config to prevent webpack-related depreciation errors
//-------------------------------------------------------------------------
export const userAppRoot = process.cwd();
export const userAppPkgJSON = JSON.parse(fs.readFileSync(path.join(userAppRoot, 'package.json'), 'utf-8'));
//-------------------------------------------------------------------------

const userAppArg = {
  devBuild: 'dev:build',
  prodBuild: 'prod:build',
  lib: {
    build: 'lib:build',
  },
};

const args_ = process.argv.slice(2);

const pkgArgDetected = args_.length === 1 && (args_[0] === userAppArg.devBuild || args_[0] === userAppArg.prodBuild || args_[0] === userAppArg.lib.build);

if (pkgArgDetected) {
  const isProd = args_[0] !== userAppArg.devBuild;
  const mode = isProd ? 'production' : 'development';

  // ------------------------------------------------------------------------------
  // Find the path to the webpack-cli executable within your library's dependencies
  // ------------------------------------------------------------------------------
  const webpackCliPath = require.resolve('webpack-cli/bin/cli.js');
  // ---------------------------------------------
  // The path to YOUR internal node_modules folder
  // ---------------------------------------------
  const engineRoot = path.resolve(__dirname, '..');
  const internalModulesPath = path.resolve(engineRoot, 'node_modules');

  // -----------------------------------------------
  // Safely find binary paths for the internal tools
  // -----------------------------------------------
  const getBinPath = (pkgName) => {
    //-----------------------------------------------------------------
    // A. Look in the User App's .bin (Production or hoisted)
    // B. Look in the Engine's .bin (Development i.e. local npm link)
    // C. Return the .bin path that match based on environment detected
    //-----------------------------------------------------------------
    const paths = [path.resolve(userAppRoot, 'node_modules/.bin', pkgName), path.resolve(engineRoot, 'node_modules/.bin', pkgName)];

    const found = paths.find((p) => fs.existsSync(p));

    if (!found) {
      throw new Error(`Binary for ${pkgName} not found. Try 'npm install'`);
    }

    return found;
  };
  //-
  const tscAliasBin = getBinPath('tsc-alias');
  const rimrafBin = getBinPath('rimraf');

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

  const tscPathForRelevantOS = isWindowsOS ? `tsc${windowsCmdextension}` : tscPath; // This check makes it compatible with Windows OS (in production)
  //-
  const tscAliasBinCmd = isWindowsOS ? `tsc-alias${windowsCmdextension}` : `node "${tscAliasBin}"`; // This check makes it compatible with Windows OS (in production)
  //-
  spawnChildProcess.on('exit', (code) => {
    if (code === 0 && isProd) {
      console.log('============================================\n');
      console.log('[PROD] Bundling complete.\n[PROD] Generating type definitions...');
      try {
        // --------------------------------------------------------------
        // Execute the ENGINE'S internal tsc relative to the user project
        // --------------------------------------------------------------
        // Run tsc to generate .d.ts files into the buildOutputFolder
        // Using the user app's local tsc
        // -------------------------------------------------------
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

      //-------------------------------------------------------------------
      // Take note that although this typescript import alias code has been
      // left to always show up in the console when the prod build command
      // runs; it particularly solves errors/issues when "paths" object is
      // detected in tsconfig files, with @ imports specified therein.
      //-------------------------------------------------------------------
      console.log('===============================================\n');
      console.log('[PROD] Resolving Typescript @ import aliases...');
      try {
        execSync(`${tscAliasBinCmd}`, {
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_PATH: internalModulesPath,
          },
        });
        //-
        console.log('[PROD] Typescript @ import aliases resolved successfully.');
      } catch {
        blocksTerminalLogger({
          internalPackage: {
            fullName: internalPkgJSON.name,
          },
          userApp: {
            fullName: userAppPkgJSON.name,
            errorMessage: 'Typescript @ import aliases resolution failed',
          },
          errorSource: true,
          suggestion: {
            // prettier-ignore
            messageList: [
              `→ Check that your (main) ${mainTSconfigFileName} has "outDir" set to "./${buildOutputFolderName}"`,
            ],
          },
          processExit: true,
        });
      }
      console.log('');

      // -------------------------------------------
      // Extra build step/process for libraries only
      // -------------------------------------------
      const rimrafBinCmd = isWindowsOS ? `rimraf${windowsCmdextension}` : `node "${rimrafBin}"`; // This check makes it compatible with Windows OS (in production)
      //-
      const supportingTSconfigPath = path.join(userAppRoot, supportingTSconfigFileName);
      //-
      if (fs.existsSync(supportingTSconfigPath)) {
        const distProdFolderPath = path.join(userAppRoot, distProdFolderName);
        //-
        const isLibBuildArg = args_[0] === userAppArg.lib.build;
        //-
        if (isLibBuildArg) {
          try {
            execSync(`${rimrafBinCmd} ${distProdFolderPath} && ${tscPathForRelevantOS} -p ${supportingTSconfigPath} && ${tscAliasBinCmd} -p ${supportingTSconfigPath}`, {
              stdio: 'inherit',
              shell: true, // CRITICAL: Makes && and paths work on Windows OS
              env: {
                ...process.env,
                NODE_PATH: internalModulesPath,
              },
            });
            console.log('============================================\n');
            console.log(`[PROD] ${distProdFolderName} output folder built successfully.`);
            console.log('');
          } catch (e) {
            blocksTerminalLogger({
              internalPackage: {
                fullName: internalPkgJSON.name,
                errorMessage: `${distProdFolderName} output folder build failed.`,
              },
              originalErrorMessage: e,
            });
          }
        }
      }
    }
    process.exit(code || 0);
  });
}
