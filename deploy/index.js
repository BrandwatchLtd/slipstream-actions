const core = require('@actions/core');
const { installSlipstreamCLI } = require('../lib');

const { deploy } = require('./deploy');

async function run() {
  try {
    const environment = core.getInput('environment');
    const service = core.getInput('service');
    const id = core.getInput('id');
    const idKey = core.getInput('idKey');
    const downloadURL = core.getInput('slipstream-cli-url');

    await installSlipstreamCLI(downloadURL);

    core.startGroup('Deploy new image');
    await deploy(environment, service, id, idKey);
    core.endGroup();
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
