const fs = require('fs').promises;
const path = require('path');

const {
  getCommitData,
  getBuildData,
  getLabels,
} = require('../lib');

async function buildMetadata(input) {
  const data = {
    type: 'files',
    service: input.service,
    files: {
      sha: input.hash,
      stageUrl: input.filesStageUrl,
      prodUrl: input.filesProdUrl,
    },
  };

  data.commit = await getCommitData();
  data.build = getBuildData(input.event);
  data.labels = getLabels(input.labels);

  return data;
}

async function writeSlipstreamCheckFile(id, filesDir) {
  const file = path.resolve(filesDir, 'slipstreamz');
  const data = {
    id,
  };

  try {
    await fs.writeFile(file, JSON.stringify(data));
  } catch (err) {
    throw Error(`failed to write slipstreamz file: ${err.message}`);
  }
}

module.exports = {
  buildMetadata,
  writeSlipstreamCheckFile,
};
