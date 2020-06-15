const core = require('@actions/core');

const { deploy } = require('./deploy');

async function run() {
  try {
    const environment = core.getInput('environment');
    const service = core.getInput('service');
    const id = core.getInput('id');
    await deploy(environment, service, id);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
