const core = require('@actions/core');
const { installSlipstreamCLI } = require('../lib');

const { deploy } = require('./deploy');

async function run() {
  try {
    const environment = core.getInput('environment');
    const service = core.getInput('service');
    const id = core.getInput('id');

    await installSlipstreamCLI();

    core.startGroup('Deploy new image');
    await deploy(environment, service, id);
    core.endGroup();
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
