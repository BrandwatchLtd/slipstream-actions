const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const path = require('path');
const exec = require('@actions/exec');
const {
  getCommitData,
  getBuildData,
  getLabels,
} = require('../lib');

const writeFile = util.promisify(fs.writeFile);

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

// getHashOfFiles is a badly implemented way of hashing the file contents. The tar
// isn't reproducible across different systems, so this is pretty pointless.
async function getHashOfFiles(filesDir) {
  let tard = '';
  const options = {
    silent: true,
    cwd: filesDir,
  };
  options.listeners = {
    stdout: (data) => {
      tard += data.toString();
    },
  };
  await exec.exec(
    'tar', ['-c', '.'],
    options,
  );

  const hash = crypto.createHash('sha256');
  hash.write(tard);
  hash.end();

  return `sha256:${hash.digest('hex')}`;
}

async function writeSlipstreamCheckFile(id, filesDir) {
  const file = path.resolve(filesDir, 'slipstreamz');
  const data = {
    id,
  };

  try {
    await writeFile(file, JSON.stringify(data));
  } catch (err) {
    throw Error(`failed to write slipstreamz file: ${err.message}`);
  }
}

module.exports = {
  buildMetadata,
  getHashOfFiles,
  writeSlipstreamCheckFile,
};
