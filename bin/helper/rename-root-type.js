import path from 'path';
import fs from 'fs';

export const renameRootTypeFileInBuildOutputFolder = () => {
  const buildFolderRoot = path.resolve(process.cwd(), 'build');
  const expectedDtsTypeFile = path.join(buildFolderRoot, 'index.d.ts');
  //----------------------------------------------------------------
  // Find the current root type file and rename index.d.ts (i.e. if
  // there's no index.d.ts detected in build folder root).
  //----------------------------------------------------------------
  if (!fs.existsSync(expectedDtsTypeFile)) {
    const generatedFiles = fs.readdirSync(buildFolderRoot);
    const dtsTypeFile = generatedFiles.find((dtsFile) => dtsFile.endsWith('.d.ts'));
    //-
    if (dtsTypeFile) {
      fs.renameSync(path.join(buildFolderRoot, dtsTypeFile), expectedDtsTypeFile);
      console.log(`[PROD] Root type file ${dtsTypeFile} renamed to index.d.ts`);
    }
  }
};
