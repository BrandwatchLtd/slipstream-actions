const core = require('@actions/core');
const githubEvent = require(process.env.GITHUB_EVENT_PATH);
const {
  pushMetadata,
} = require('../lib');
const push = require('./push');

async function run() {
  try {
    const bundleId = core.getInput('bundleId');
    const version = core.getInput('version');
    const metadataBucket = core.getInput('metadataBucket');

    core.startGroup('Pushing Slipstream metadata');
    const data = await push.buildMetadata({
      event: githubEvent,
      id: bundleId,
      version,
    });
    await pushMetadata(metadataBucket, data);
    core.endGroup();

    core.setOutput('artifactID', bundleId);
    core.info('success');
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
