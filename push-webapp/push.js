const fs = require('fs').promises;
const path = require('path');

const {
  getCommitData,
  getBuildData,
  getLabels,
} = require('../lib');

async function buildSlipstreamMetadata(input) {
  const data = {
    type: 'webapp',
    service: input.service,
    webapp: {
      sha: input.version,
    },
    release: input.release,
  };

  data.commit = await getCommitData();
  data.build = getBuildData(input.event);
  data.labels = getLabels(input.labels);

  return data;
}

async function writeMetadataFile(id, dir, index, templated) {
  const file = path.resolve(dir, 'metadata.json');
  const data = {
    version: id,
    index,
    templated,
  };

  await fs.access(path.resolve(dir, index), fs.F_OK);

  try {
    await fs.writeFile(file, JSON.stringify(data));
  } catch (err) {
    throw Error(`failed to write metdata file: ${err.message}`);
  }
}

module.exports = {
  buildSlipstreamMetadata,
  writeMetadataFile,
};
