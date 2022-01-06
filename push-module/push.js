const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {
  getCommitData,
  getBuildData
} = require('../lib');

async function buildMetadata(input) {

  const { stdout, stderr } = await exec(`npm v "${input.id}@${input.version}" --json`);

  const data = {
    type: 'module',
    service: input.id,
    module: JSON.parse(stdout)
  };

  data.commit = await getCommitData();
  data.build = getBuildData(input.event);
  data.labels = {};

  return data;
}


module.exports = {
  buildMetadata
};
