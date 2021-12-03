const core = require('@actions/core');
const {
  directoryExists,
  removeFilesFromBucket
} = require('../lib');

async function run() {
  try {
    const service = core.getInput('service');
    const bucket = core.getInput('artifactBucket');
    const versionPrefix = core.getInput('versionPrefix')
    const version = core.getInput('version');

    const bucketAddress = `${bucket}/${service}/${versionPrefix}${version}/`;
    const existsAlready = await directoryExists(bucketAddress);

    if (!existsAlready) {
      core.info(`Skip: ${bucketAddress} already removed`);
      core.setOutput('artifactID', `${versionPrefix}${version}`);
      core.setOutput('skipped', 'true');
      return;
    }

    core.startGroup(`Removing files from Bucket: ${bucketAddress}`);
    removeFilesFromBucket(bucketAddress);
    core.endGroup();

    //TODO: we should probably remove the artifact from slipstream?

    core.setOutput('artifactID', `${versionPrefix}${version}`);
    core.setOutput('skipped', 'false');
    core.info('success');
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
