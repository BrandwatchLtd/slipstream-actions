const core = require('@actions/core');
const githubEvent = require(process.env.GITHUB_EVENT_PATH);
const {
  pushMetadata,
  directoryExists,
  pushFilesToBucket,
  getHashOfFiles,
} = require('../lib');
const {
  writeMetadataFile,
  buildSlipstreamMetadata,
} = require('./push');

async function run() {
  try {
    const service = core.getInput('service');
    const indexFile = core.getInput('indexFile');
    const templated = core.getInput('templated') === 'true';
    const labels = core.getInput('labels');
    const webappDir = core.getInput('staticRoot');
    const bucket = core.getInput('artifactBucket');
    const metadataBucket = core.getInput('metadataBucket');

    const hash = await getHashOfFiles(webappDir);
    const bucketAddress = `${bucket}/${service}/${hash}/`;

    const existsAlready = await directoryExists(bucketAddress);

    if (existsAlready) {
      core.info(`Skip: ${bucketAddress} already exists`);
      core.setOutput('artifactID', hash);
      core.setOutput('skipped', 'true');
      return;
    }

    core.startGroup(`Pushing files to Bucket: ${bucketAddress}`);
    await writeMetadataFile(hash, webappDir, indexFile, templated);
    await pushFilesToBucket(webappDir, bucketAddress);
    core.endGroup();

    core.startGroup('Pushing Slipstream metadata');
    const data = await buildSlipstreamMetadata({
      event: githubEvent,
      service,
      labels,
      hash,
    });
    await pushMetadata(metadataBucket, data);
    core.endGroup();

    core.setOutput('artifactID', hash);
    core.setOutput('skipped', 'false');
    core.info('success');
    core.info(`Run 'slipstream list webapps -s ${service}' to view webapp versions`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
