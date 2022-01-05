const core = require('@actions/core');
const githubEvent = require(process.env.GITHUB_EVENT_PATH);
const {
  pushMetadata,
  directoryExists
} = require('../lib');
const push = require('./push');

async function run() {
  try {
    const bundleId = core.getInput('bundleId');
    const version = core.getInput('version');
    const hash = core.getInput('hash');
    const service = core.getInput('service');
    const bucket = core.getInput('artifactBucket');
    const metadataBucket = core.getInput('metadataBucket');
    
    const bucketAddress = `${bucket}/${service}/${hash}/`;

    const existsAlready = await directoryExists(bucketAddress);

    if (existsAlready) {
      core.info(`Skip: ${bundleId} already exists`);
      core.setOutput('artifactID', hash);
      core.setOutput('skipped', 'true');
      return;
    }

    core.startGroup('Pushing Slipstream metadata');
    const data = await push.buildMetadata({
      event: githubEvent,
      service: service,
      id: bundleId,
      version: version
    });
    await pushMetadata(metadataBucket, data);
    core.endGroup();

    core.setOutput('artifactID', hash);
    core.info('success');
    core.info(`Run 'slipstream list files -s ${service}' to view service images`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
