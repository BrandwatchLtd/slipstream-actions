const { dockerCommand } = require('docker-cli-js');
const metadata = require('../lib');

async function buildImage(input) {
  const args = [
    'build',
    '--tag', input.repoTag,
    '--file', input.dockerfile,
  ];

  if (input.pull) {
    args.push('--pull');
  }

  if (input.buildArgs) {
    const buildArgs = input.buildArgs.split(',');
    for (let i = 0; i < buildArgs.length; i += 1) {
      args.push('--build-arg', buildArgs[i]);
    }
  }

  args.push(input.path);

  await dockerCommand(args.join(' '));
}

async function pushImage(input) {
  await dockerCommand(`push ${input.repoTag}`);
}

async function buildMetadata(input) {
  const data = {
    type: 'image',
    service: input.service,
  };

  data.commit = await metadata.getCommitData();
  data.build = metadata.getBuildData(input.event);
  data.labels = metadata.getLabels(input.labels);

  const dockerInspect = await dockerCommand(`inspect ${input.repoTag}`, { echo: false });
  data.dockerInspect = dockerInspect.object;

  return data;
}

module.exports = {
  buildImage,
  pushImage,
  buildMetadata,
};
