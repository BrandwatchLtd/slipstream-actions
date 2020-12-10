const core = require('@actions/core');
const githubEvent = require(process.env.GITHUB_EVENT_PATH);
const {
  pushMetadata,
  directoryExists,
  pushFilesToBucket,
} = require('../lib');
const push = require('./push');

async function run() {
  try {
    const service = core.getInput('service');
    const filesDir = core.getInput('filesDir');
    const bucket = core.getInput('artifactBucket');
    const metadataBucket = core.getInput('metadataBucket');
    const hash = await push.getHashOfFiles(filesDir);
    const bucketAddress = `${bucket}/${service}/${hash}/`;

    const existsAlready = await directoryExists(bucketAddress);

    if (existsAlready) {
      core.info(`Skip: ${bucketAddress} already exists`);
      core.setOutput('artifactID', hash);
      core.setOutput('skipped', 'true');
      return;
    }

    core.startGroup(`Pushing files to GCR: ${bucketAddress}`);
    await push.writeSlipstreamCheckFile(hash, filesDir);
    await pushFilesToBucket(filesDir, bucketAddress);
    core.endGroup();

    core.startGroup('Pushing Slipstream metadata');
    const data = await push.buildMetadata({
      event: githubEvent,
      service: core.getInput('service'),
      labels: core.getInput('labels'),
      hash,
      filesDir: core.getInput('filesDir'),
      filesStageUrl: core.getInput('stageVersionCheckURL'),
      filesProdUrl: core.getInput('productionVersionCheckURL'),
    });
    await pushMetadata(metadataBucket, data);
    core.endGroup();

    core.setOutput('artifactID', hash);
    core.setOutput('skipped', 'false');
    core.info('success');
    core.info(`Run 'slipstream list files -s ${service}' to view service images`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
