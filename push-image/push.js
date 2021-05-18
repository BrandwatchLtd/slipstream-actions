const { dockerCommand } = require('docker-cli-js');
const metadata = require('../lib');

async function buildImage(input) {
  const args = [
    'build',
    '--tag', input.repo,
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

async function tagImage(repo, tag) {
  await dockerCommand(`tag ${repo} ${repo}:${tag}`);
}

async function pushImage(input) {
  await dockerCommand(`push ${input.repo}`);
}

async function buildMetadata(input) {
  const data = {
    type: 'image',
    service: input.service,
  };

  data.commit = await metadata.getCommitData();
  data.build = metadata.getBuildData(input.event);
  data.labels = metadata.getLabels(input.labels);
  data.release = input.release;

  const dockerInspect = await dockerCommand(`inspect ${input.repo}`, { echo: false });
  data.dockerInspect = dockerInspect.object;

  return data;
}

function getTags() {
  const tags = [];
  if (process.env.GITHUB_RUN_NUMBER) {
    tags.push(`build.${process.env.GITHUB_RUN_NUMBER}`);
  }
  if (typeof process.env.GITHUB_SHA === 'string') {
    tags.push(`sha.${process.env.GITHUB_SHA.substring(0, 7)}`);
  }
  if (typeof process.env.GITHUB_REF === 'string') {
    const [, type, r] = process.env.GITHUB_REF.split('/');
    const ref = r.replace('/', '-');
    switch (type) {
      case 'pull':
        tags.push(`pr.${ref}`);
        break;
      case 'tags':
        tags.push(`tag.${ref}`);
        break;
      case 'heads':
        tags.push(`branch.${ref}`);
        break;
      default:
        tags.push(`${type}.${ref}`);
    }
  }
  return tags;
}

module.exports = {
  buildImage,
  tagImage,
  pushImage,
  buildMetadata,
  getTags,
};
