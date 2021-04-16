const core = require('@actions/core');

const { installSlipstreamCLI } = require('../lib');

async function run() {
  try {
    const downloadURL = core.getInput('url');

    await installSlipstreamCLI(downloadURL);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
