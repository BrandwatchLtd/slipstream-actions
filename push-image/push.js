const { dockerCommand } = require('docker-cli-js');
const metadata = require('../lib');

async function buildImage(input) {
  await dockerCommand(`build -t ${input.repoTag} -f ${input.dockerFile} ${input.contextPath}`);
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
