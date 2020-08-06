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

  // Pipes not working in @actions/exec
  // A workaround is to run the bash programm
  // and pass the commands as an argument.
  // https://github.com/actions/toolkit/issues/359#issuecomment-603065463
  await exec.exec(
    '/bin/bash -c', ['find . -type f -exec cat {} + | shasum | cut -c1-20'],
    options,
  );

  return tard.trim();
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
