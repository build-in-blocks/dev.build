import path from 'path';
import { _default } from '@build-in-blocks/dev.resources';

const blocksConfigTemplateCode = ({ exampleSrcFolderRoot, exampleEntryFileName }) => `
import { BlocksConfig } from '@build-in-blocks/dev.resources';

const blocksConfig: BlocksConfig = {
  devBuild: {
    srcFolderRoot: '${exampleSrcFolderRoot}',
    entryFileName: '${exampleEntryFileName}',
  },
};

export default blocksConfig;
`;

export const validationErrorMessage = ({ blocksConfigFileName }) => {
  const exampleSrcFolderRoot = 'app';
  const exampleEntryFileName = 'main';
  const exampleMainFile = path.join(exampleSrcFolderRoot, exampleEntryFileName);
  const exampleEntryFileWithTSextension = `${exampleMainFile}${_default.fileExtension}`;
  //-
  console.error(`→ Or if you prefer a different main file path, create e.g. ${exampleEntryFileWithTSextension} file at the root of your project and add code as needed. Create ${blocksConfigFileName} at the root of your project, and add this code inside it to reference your main file:`);
  console.error(blocksConfigTemplateCode({ exampleSrcFolderRoot, exampleEntryFileName }));
};

export const moreDetailsErrorText = `→ More details in our user guide, if you prefer a different main file path.`;
