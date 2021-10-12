const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const core = require('@actions/core');
const walk = require('walk');

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

async function getHashOfFiles(filesDir) {
  return new Promise((resolve, reject) => {
    const walker = walk.walk(filesDir);

    let output = '';

    walker.on('file', async (root, fileStats, next) => {
      const filename = path.join(root, fileStats.name);
      core.debug(`Read content of ${filename}`);

      const fileContent = await fs.readFile(filename);
      output += fileContent.toString('hex');
      next();
    });

    walker.on('errors', (root, nodeStatsArray) => {
      reject(nodeStatsArray);
      core.setFailed('Hash generation failed');
    });

    walker.on('end', () => {
      core.endGroup();
      const hash = crypto.createHash('sha256').update(output).digest('hex');
      const short = hash.slice(0, 20);

      core.debug(`Hash long ${hash}`);
      core.debug(`Hash short ${short}`);

      resolve(short);
    });
  });
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
  getHashOfFiles,
  writeSlipstreamCheckFile,
};
