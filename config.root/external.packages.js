//-------------
// Node-related
//-------------
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire, register } from 'module';
//----------------
// Webpack-related
//----------------
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

export {
  //-
  fs,
  //-
  path,
  //-
  spawn,
  execSync,
  //-
  fileURLToPath,
  pathToFileURL,
  //-
  createRequire,
  register,
  //-
  webpack,
  merge,
  TerserPlugin,
  BundleAnalyzerPlugin,
  HtmlWebpackPlugin,
  TsconfigPathsPlugin,
};
