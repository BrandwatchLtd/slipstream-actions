const core = require('@actions/core');
const exec = require('@actions/exec');
const push = require('./push');
const util = require('./util');

async function run() {
  const service = core.getInput('service');
  const tag = process.env.GITHUB_RUN_ID;
  const repoTag = `eu.gcr.io/bw-prod-artifacts/${service}:${tag}`;

  try {
    core.startGroup("Configuring Docker authentication");
    await exec.exec('gcloud', ['auth', 'configure-docker', 'eu.gcr.io', '--quiet'], {});
    core.endGroup();

    core.startGroup(`Building Docker image: ${repoTag}`);
    await push.buildImage({
        dockerFile: core.getInput('dockerFile'),
        contextPath: core.getInput('contextPath'),
        repoTag,
    })
    core.endGroup();

    core.startGroup(`Pushing Docker image: ${repoTag}`);
    await push.pushImage({
        repoTag,
    })
    core.endGroup();

    core.startGroup("Pushing Slipstream metadata");
    const data = await push.buildMetadata({
      event: require(process.env.GITHUB_EVENT_PATH),
      service: core.getInput('service'),
      repoTag,
      labels: core.getInput('labels'),
    })
    await push.pushMetadata(data);
    core.endGroup();

    core.setOutput('imageDigest', util.getImageDigest(data.dockerInspect));
    core.info('success');
    core.info(`Run 'slipstream list images -s ${service}' to view service images`);

  } catch ( error ) {
      core.setFailed(error.message);
  }
}

run();
