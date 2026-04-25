import { fs, path, fileURLToPath, createRequire } from './external.packages.js';

// ------------------------------------------------
// ESM & Resolution Helpers:
// Recreate 'require' and '__dirname' for ESM scope
// ------------------------------------------------
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const internalProjectRoot = path.join(__dirname, '../', 'package.json');
const internalPkgJSON = JSON.parse(
  fs.readFileSync(internalProjectRoot, 'utf-8'),
);

const isWindowsOS = process.platform === 'win32';
const windowsCmdextension = '.cmd';

const buildOutputFolderName = 'build';
const distOutputFolderName = 'dist';

const mainTSconfigFileName = 'tsconfig.json';

const distProdFolderName = 'dist.prod';
const supportingTSconfigFileName = 'tsconfig.build.json';

export {
  //-------------------------------
  // Export global access variables
  //-------------------------------
  require,
  __filename,
  __dirname,
  //-
  internalProjectRoot,
  internalPkgJSON,
  //-
  isWindowsOS,
  windowsCmdextension,
  //-
  buildOutputFolderName,
  distOutputFolderName,
  //-
  mainTSconfigFileName,
  //-
  distProdFolderName,
  supportingTSconfigFileName,
};
