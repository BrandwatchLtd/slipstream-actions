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
  const repo = `${registry}/${service}`;

  try {
    core.startGroup('Configuring Docker authentication');
    await exec.exec('gcloud', ['auth', 'configure-docker', 'eu.gcr.io', '--quiet'], {});
    core.endGroup();

    core.startGroup(`Building Docker image: ${repo}`);
    await push.buildImage({
      dockerfile: core.getInput('dockerfile'),
      path: core.getInput('path'),
      push: core.getInput('push'),
      buildArgs: core.getInput('buildArgs'),
      repo,
    });

    const tags = push.getTags();
    const results = [];
    for (let i = 0; i < tags.length; i += 1) {
      results.push(push.tagImage(repo, tags[i]));
      core.info(`Successfully tagged ${repo}:${tags[i]}`);
    }
    await Promise.all(results);
    core.endGroup();

    core.startGroup(`Pushing Docker image: ${repo}`);
    await push.pushImage({
      repo,
    });
    core.endGroup();

    core.startGroup('Pushing Slipstream metadata');
    const data = await push.buildMetadata({
      event: githubEvent,
      service: core.getInput('service'),
      repo,
      labels: core.getInput('labels'),
    });
    await pushMetadata(metadataBucket, data);
    core.endGroup();

    core.setOutput('imageDigest', util.getImageDigest(data.dockerInspect));
    core.info(`Run 'slipstream list images -s ${service}' to view service images`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
