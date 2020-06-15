const crypto = require('crypto');
const exec = require('@actions/exec');
const {
  getCommitData,
  getBuildData,
  getLabels
} = require('../lib');

async function buildMetadata(input) {
  const data = {
    type: 'files',
    service: input.service,
    files: {
      sha: `sha256:${await getHashOfFiles(input.filesDir)}`,
      stageUrl: input.filesStageUrl,
      prodUrl: input.filesProdUrl,
    },
  }

  data.commit = await getCommitData();
  data.build = getBuildData(input.event);
  data.labels = getLabels(input.labels);

  return data
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
    }
  };
  await exec.exec(
    'tar', ['-c', '.'],
    options
  );

  var hash = crypto.createHash('sha256');
  hash.write(tard);
  hash.end();

  return hash.digest('hex');
}

module.exports = {
  buildMetadata,
  getHashOfFiles
}
