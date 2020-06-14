const core = require('@actions/core');
const exec = require('@actions/exec');
const { pushMetadata, pushFilesToBucket } = require('../lib');
const push = require('./push');

async function run() {
  try {
    const service = core.getInput('service');
    const filesDir = core.getInput('filesDir');
    const bucket = core.getInput('artifactBucket');
    const hash = await push.getHashOfFiles(filesDir);
    const bucketAddress = `${bucket}/${service}/${hash}/`;

    core.startGroup(`Pushing files to GCR: ${bucketAddress}`);
    await pushFilesToBucket(filesDir, bucketAddress)
    core.endGroup();


    core.startGroup("Pushing Slipstream metadata");
    const data = await push.buildMetadata({
      event: require(process.env.GITHUB_EVENT_PATH),
      service: core.getInput('service'),
      labels: core.getInput('labels'),
      filesDir: core.getInput('filesDir'),
      filesStageUrl: core.getInput('stageVersionCheckURL'),
      filesProdUrl: core.getInput('productionVersionCheckURL'),
    })
    await pushMetadata(data);
    core.endGroup();

    core.setOutput('artifactID', hash);
    core.info('success');
    core.info(`Run 'slipstream list files -s ${service}' to view service images`);

  } catch ( error ) {
      core.setFailed(error.message);
  }
}

run();
