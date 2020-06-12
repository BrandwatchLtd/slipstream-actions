const core = require('@actions/core');
const exec = require('@actions/exec');

const { deploy } = require('./deploy')

async function run() {
  try {
    const environment = core.getInput('environment');
    const service = core.getInput('service');
    const id = core.getInput('id');
    await deploy(environment, service, id)
  } catch ( error ) {
      core.setFailed(error.message);
  }
}

run();
