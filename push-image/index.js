const core = require('@actions/core');
const exec = require('@actions/exec');
const { pushMetadata } = require('../lib');
const push = require('./push');
const util = require('./util');
const githubEvent = require(process.env.GITHUB_EVENT_PATH);

async function run() {
  const service = core.getInput('service');
  const registry = core.getInput('dockerRegistry');
  const metadataBucket = core.getInput('metadataBucket');
  const tag = process.env.GITHUB_RUN_ID;
  const repoTag = `${registry}/${service}:${tag}`;

  try {
    core.startGroup('Configuring Docker authentication');
    await exec.exec('gcloud', ['auth', 'configure-docker', 'eu.gcr.io', '--quiet'], {});
    core.endGroup();

    core.startGroup(`Building Docker image: ${repoTag}`);
    await push.buildImage({
      dockerFile: core.getInput('dockerFile'),
      contextPath: core.getInput('contextPath'),
      repoTag,
    });
    core.endGroup();

    core.startGroup(`Pushing Docker image: ${repoTag}`);
    await push.pushImage({
      repoTag,
    });
    core.endGroup();

    core.startGroup('Pushing Slipstream metadata');
    const data = await push.buildMetadata({
      event: githubEvent,
      service: core.getInput('service'),
      repoTag,
      labels: core.getInput('labels'),
    });
    await pushMetadata(metadataBucket, data);
    core.endGroup();

    core.setOutput('imageDigest', util.getImageDigest(data.dockerInspect));
    core.info('success');
    core.info(`Run 'slipstream list images -s ${service}' to view service images`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
