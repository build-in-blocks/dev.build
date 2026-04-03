import { fileURLToPath, fs, path } from './external.packages.js';

// ------------------------------------------------
// ESM & Resolution Helpers:
// Recreate 'require' and '__dirname' for ESM scope
// ------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const internalProjectRoot = path.join(__dirname, '../', 'package.json');
const internalPkgJSON = JSON.parse(fs.readFileSync(internalProjectRoot, 'utf-8'));

export {
  //-------------------------------
  // Export global access variables
  //-------------------------------
  internalProjectRoot,
  internalPkgJSON,
};
