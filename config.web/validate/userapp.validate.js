import fs from 'fs';
import path from 'path';
import { _default, getCurrentFolderContent } from '@build-in-blocks/dev.resources';
//-
import { validationErrorMessage, moreDetailsErrorText } from '../helpers/userapp.helper.js';

export const validateMainEntryFilePathInUserApp = ({ userAppName, userAppRoot, userAppSrcFolderRoot, userAppEntryFileName, blocksConfigFileName, blocksConfigSrcFolderRoot, blocksConfigEntryFileName }) => {
  const hasFileExtension = ({ filePath }) => path.extname(filePath).length > 0;
  const hasTSfileExtension = ({ filePath }) => {
    const extension = path.extname(filePath);
    return extension === _default.fileExtension;
  };
  //-
  const mainFile = path.join(userAppSrcFolderRoot, userAppEntryFileName);

  //------------------------------------------------------------------
  // [SPEC IDEA] The user app's main entry file path can be a MIX of:
  // A. _default.srcFolderRoot and _default.entryFileName${.ts}
  // B. _default.srcFolderRoot and blocksConfigEntryFileName${.ts}
  // C. blocksConfigSrcFolderRoot and _default.entryFileName${.ts}
  // D. blocksConfigSrcFolderRoot and blocksConfigEntryFileName${.ts}
  //------------------------------------------------------------------
  // [Validation - Part 1]:
  // => (Initially) check the user app to see if a main entry file (path that matches any of the MIX above) is present.
  // => Return error - if a main entry file (path that matches any of the MIX above) is not present in the user app.
  //------------------------------------------------------------------
  const entryFilePathHasTSext = hasFileExtension({ filePath: mainFile }) && hasTSfileExtension({ filePath: mainFile });
  const entryFilePathWithTSextension = `${mainFile}${entryFilePathHasTSext ? '' : _default.fileExtension}`;
  const fullEntryFilePath = path.resolve(userAppRoot, entryFilePathWithTSextension);
  //-
  const srcFolderReference = blocksConfigSrcFolderRoot ? `Root ${blocksConfigFileName} file reference => srcFolderRoot: '${blocksConfigSrcFolderRoot}'` : `Default srcFolderRoot unchanged => srcFolderRoot: '${_default.srcFolderRoot}'`;
  const entryFileReference = blocksConfigEntryFileName ? `Root ${blocksConfigFileName} file reference => entryFileName: '${blocksConfigEntryFileName}'` : `Default entryFileName unchanged => entryFileName: '${_default.entryFileName}${_default.fileExtension}'`;
  const blocksConfigReference = `${srcFolderReference}\n${entryFileReference}`;
  //-
  if (!fs.existsSync(fullEntryFilePath)) {
    console.error('--------------------------');
    console.error('ERROR |', `${userAppName} (your app):`);
    console.error(`Main file "${entryFilePathWithTSextension}" does not exist.`);
    console.error('--------------------------');
    console.error(`Your blocks config current state:`);
    console.error(blocksConfigReference);
    console.error('--------------------------');
    console.error(`Suggestion (based on current state):`);
    console.error(`→ Create main file "${entryFilePathWithTSextension}" in your project.`);

    //-
    const userAppRootContent = getCurrentFolderContent({
      workingDirectory: userAppRoot,
      errorFunc: () => {
        process.exit(1);
      },
    });
    //-
    const detectedBlocksConfigFile = userAppRootContent.filter((fileName) => fileName === blocksConfigFileName)[0];
    //-
    const userAppSrcFolderContent = getCurrentFolderContent({
      workingDirectory: path.resolve(userAppRoot, userAppSrcFolderRoot),
      errorFunc: () => {
        //--------------------------------------------------------------------------------
        // [Validation - Part 2 (A - scenario)]:
        // Add this error to exisiting error message, when:
        // No "root folder" in the user app matches _default.srcFolderRoot, AND there's
        // also no blocks.config.ts file at the root of the user app.
        //--------------------------------------------------------------------------------
        if (!detectedBlocksConfigFile) {
          validationErrorMessage({ blocksConfigFileName });
          //-
          process.exit(1);
        }
        //-----------------------------------------------------------------------------
        // [Validation - Part 2 (B - scenario)]:
        // [WHEN NOTHING OVERRIDES _default.srcFolderRoot (yet)]
        // -----------
        // Add this error to existing error message, when:
        // No "root folder" in the user app matches _default.srcFolderRoot, AT THE SAME TIME
        // there's no file name in the said "root folder", that matches EITHER the
        // _default.entryFileName (i.e. system default value) OR blocksConfigEntryFileName (i.e. value from the blocks.config.ts
        // file).
        //-----------------------------------------------------------------------------
        if (detectedBlocksConfigFile) {
          console.error(moreDetailsErrorText);
          //-
          process.exit(1);
        }
      },
    });
    //-
    //-----------------------------------------------------------------------------
    // [Validation - Part 3 (A - scenario)]:
    // [WHEN NOTHING OVERRIDES _default.srcFolderRoot (yet)]
    // -----------
    // Add this error to existing error message, when:
    // A "root folder" in the user app matches _default.srcFolderRoot, BUT there's
    // no file name in the said "root folder" that matches ANY of the
    // _default.entryFileName OR blocksConfigEntryFileName (when blocks config file
    // is present).
    //-------------
    // Note: This also covers when there's no blocks config file in the user app.
    //-----------------------------------------------------------------------------
    // [Validation - Part 3 (B - scenario)]:
    // [ONCE THE PRESENCE OF blocksConfigSrcFolderRoot OVERRIDES _default.srcFolderRoot]
    // -----------
    // Add this error to existing error message, when:
    // A "root folder" in the user app matches blocksConfigSrcFolderRoot (i.e. the
    // srcFolderRoot coming from the blocks.config.ts file at the root of the user
    // app), BUT there's no file name in the said "root folder" that matches ANY of the
    // _default.entryFileName OR blocksConfigEntryFileName;
    //-----------------------------------------------------------------------------
    if (userAppSrcFolderContent) {
      console.error(moreDetailsErrorText);
      //-
      process.exit(1);
    }
  }
};
