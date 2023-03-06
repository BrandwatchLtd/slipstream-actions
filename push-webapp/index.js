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
    const compressed = core.getInput('compressed') === 'true';
    const labels = core.getInput('labels');
    const webappDir = core.getInput('staticRoot');
    const bucket = core.getInput('artifactBucket');
    const metadataBucket = core.getInput('metadataBucket');
    const release = core.getInput('release') === 'true';
    const prBuild = core.getInput('prBuild') === 'true';

    if (prBuild && release) {
      core.setFailed('You must set only one of release and prBuild to true');
    }

    let version;
    if (prBuild) {
      const prNumber = core.getInput('prNumber');
      if (!prNumber) {
        throw new Error('prBuild true, but prNumber not set...');
      }
      const prPrefix = core.getInput('prPrefix');

      version = `${prPrefix}${prNumber}`;
      core.setOutput('pr', prNumber);
      core.info(`PR Build: ${prNumber}`);
    } else {
      version = await getHashOfFiles(webappDir);
    }

    const bucketAddress = `${bucket}/${service}/${version}/`;

    if (!prBuild) {
      const existsAlready = await directoryExists(bucketAddress);

      if (existsAlready) {
        core.info(`Skip: ${bucketAddress} already exists`);
        core.setOutput('artifactID', version);
        core.setOutput('skipped', 'true');
        return;
      }
    }

    core.startGroup(`Pushing files to Bucket: ${bucketAddress}`);
    await writeMetadataFile(version, webappDir, indexFile, templated, compressed);
    await pushFilesToBucket(webappDir, bucketAddress);
    core.endGroup();

    core.startGroup('Pushing Slipstream metadata');
    const data = await buildSlipstreamMetadata({
      event: githubEvent,
      service,
      labels,
      version,
      release,
    });
    await pushMetadata(metadataBucket, data);
    core.endGroup();

    core.setOutput('artifactID', version);
    core.setOutput('skipped', 'false');
    core.info('success');

    let cmd = `slipstream list webapps -s ${service}`;
    if (!release) {
      cmd = `${cmd} --dev`;
    }

    core.info(`Run '${cmd}' to view webapp versions`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
