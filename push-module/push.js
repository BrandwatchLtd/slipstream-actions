const fs = require('fs').promises;
const path = require('path');

const {
  getCommitData,
  getBuildData
} = require('../lib');

async function buildMetadata(input) {
  const data = {
    type: 'module',
    service: input.service,
    module: {
      sha: input.hash,
      artifactID: input.id,
      version: input.version,
    },
  };

  data.commit = await getCommitData();
  data.build = getBuildData(input.event);
  data.labels = {};

  return data;
}


module.exports = {
  buildMetadata
};
