import { path } from '../../config.root/external.packages.js';
//-
import { _default } from '../../config.root/blocks.packages.js';
//-

const blocksConfigTemplateCode = ({ exampleSrcCodeFolder, exampleEntryFileName }) => `
import { BlocksConfig } from '@build-in-blocks/dev.resources';

const blocksConfig: BlocksConfig = {
  devBuild: {
    srcCodeFolder: '${exampleSrcCodeFolder}',
    entryFileName: '${exampleEntryFileName}',
  },
};

export default blocksConfig;
`;

export const validationErrorMessage = ({ blocksConfigFileName }) => {
  const exampleSrcCodeFolder = 'app';
  const exampleEntryFileName = 'main';
  const exampleMainFile = path.join(exampleSrcCodeFolder, exampleEntryFileName);
  const exampleEntryFileWithTSextension = `${exampleMainFile}${_default.fileExtension}`;
  //-
  console.error(`→ Or if you prefer a different entry file path, create e.g. ${exampleEntryFileWithTSextension} file at the root of your project and add code as needed. Create ${blocksConfigFileName} at the root of your project, and add this code inside it to reference your entry file:`);
  console.error(blocksConfigTemplateCode({ exampleSrcCodeFolder, exampleEntryFileName }));
};

export const moreDetailsErrorText = `→ More details in our user guide, if you prefer a different entry file path.\n`;
