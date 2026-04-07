import { fs, path } from '../../config.root/external.packages.js';
//-
import { _default, getCurrentFolderContent, blocksTerminalLogger } from '../../config.root/blocks.packages.js';
//-
import { internalPkgJSON } from '../../config.root/root.js';
//-
import { validationErrorMessage, moreDetailsErrorText } from '../helpers/userapp.helper.js';
//-

export const validateMainEntryFilePathInUserApp = ({ userAppName, userAppRoot, userAppSrcCodeFolder, userAppEntryFileName, blocksConfigFileName, blocksConfigSrcCodeFolder, blocksConfigEntryFileName }) => {
  const hasFileExtension = ({ filePath }) => path.extname(filePath).length > 0;
  const hasTSfileExtension = ({ filePath }) => {
    const extension = path.extname(filePath);
    return extension === _default.fileExtension;
  };
  //-
  const mainFile = path.join(userAppSrcCodeFolder, userAppEntryFileName);

  //------------------------------------------------------------------
  // [SPEC IDEA] The user app's main entry file path can be a MIX of:
  // A. _default.srcCodeFolder and _default.entryFileName${.ts}
  // B. _default.srcCodeFolder and blocksConfigEntryFileName${.ts}
  // C. blocksConfigSrcCodeFolder and _default.entryFileName${.ts}
  // D. blocksConfigSrcCodeFolder and blocksConfigEntryFileName${.ts}
  //------------------------------------------------------------------
  // [Validation - Part 1]:
  // => (Initially) check the user app to see if a main entry file (path that matches any of the MIX above) is present.
  // => Return error - if a main entry file (path that matches any of the MIX above) is not present in the user app.
  //------------------------------------------------------------------
  const entryFilePathHasTSext = hasFileExtension({ filePath: mainFile }) && hasTSfileExtension({ filePath: mainFile });
  const entryFilePathWithTSextension = `${mainFile}${entryFilePathHasTSext ? '' : _default.fileExtension}`;
  const fullEntryFilePath = path.resolve(userAppRoot, entryFilePathWithTSextension);
  //-
  const srcFolderReference = blocksConfigSrcCodeFolder ? `Root ${blocksConfigFileName} file reference => srcCodeFolder: '${blocksConfigSrcCodeFolder}'` : `Default srcCodeFolder unchanged => srcCodeFolder: '${_default.srcCodeFolder}'`;
  const entryFileReference = blocksConfigEntryFileName ? `Root ${blocksConfigFileName} file reference => entryFileName: '${blocksConfigEntryFileName}'` : `Default entryFileName unchanged => entryFileName: '${_default.entryFileName}${_default.fileExtension}'`;
  const blocksConfigReference = `${srcFolderReference}\n${entryFileReference}`;
  //-
  if (!fs.existsSync(fullEntryFilePath)) {
    blocksTerminalLogger({
      internalPackage: {
        fullName: internalPkgJSON.name,
      },
      userApp: {
        fullName: userAppName,
        errorMessage: `Entry file "${entryFilePathWithTSextension}" does not exist.`,
      },
      errorSource: true,
      suggestion: {
        blocksConfig: {
          showCurrentState: true,
          referenceMessage: blocksConfigReference,
        },
        messageList: [`→ Create entry file "${entryFilePathWithTSextension}" in your project.`],
      },
    });

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
      workingDirectory: path.resolve(userAppRoot, userAppSrcCodeFolder),
      errorFunc: () => {
        //--------------------------------------------------------------------------------
        // [Validation - Part 2 (A - scenario)]:
        // Add this error to exisiting error message, when:
        // No "root folder" in the user app matches _default.srcCodeFolder, AND there's
        // also no blocks.config.ts file at the root of the user app.
        //--------------------------------------------------------------------------------
        if (!detectedBlocksConfigFile) {
          validationErrorMessage({ blocksConfigFileName });
          //-
          process.exit(1);
        }
        //-----------------------------------------------------------------------------
        // [Validation - Part 2 (B - scenario)]:
        // [WHEN NOTHING OVERRIDES _default.srcCodeFolder (yet)]
        // -----------
        // Add this error to existing error message, when:
        // No "root folder" in the user app matches _default.srcCodeFolder, AT THE SAME TIME
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
    // [WHEN NOTHING OVERRIDES _default.srcCodeFolder (yet)]
    // -----------
    // Add this error to existing error message, when:
    // A "root folder" in the user app matches _default.srcCodeFolder, BUT there's
    // no file name in the said "root folder" that matches ANY of the
    // _default.entryFileName OR blocksConfigEntryFileName (when blocks config file
    // is present).
    //-------------
    // Note: This also covers when there's no blocks config file in the user app.
    //-----------------------------------------------------------------------------
    // [Validation - Part 3 (B - scenario)]:
    // [ONCE THE PRESENCE OF blocksConfigSrcCodeFolder OVERRIDES _default.srcCodeFolder]
    // -----------
    // Add this error to existing error message, when:
    // A "root folder" in the user app matches blocksConfigSrcCodeFolder (i.e. the
    // srcCodeFolder coming from the blocks.config.ts file at the root of the user
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
