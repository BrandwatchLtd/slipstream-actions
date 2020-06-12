const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
    const environment = core.getInput('environment');
    const service = core.getInput('service');
    const id = core.getInput('id');

    const args = [
      'deploy',
      environment,
      service,
      '--id', `${id}`,
      '--quiet',
      '--wait',
    ]

    await exec.exec('slipstream', args, {})
  } catch ( error ) {
      core.setFailed(error.message);
  }
}

run();
