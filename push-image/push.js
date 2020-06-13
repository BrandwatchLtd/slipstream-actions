const exec = require('@actions/exec');
const fs  = require('file-system');
const metadata = require('../lib');
const { default: ShortUniqueId } = require('short-unique-id');
const { dockerCommand } = require('docker-cli-js');

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
  data.build = metadata.getBuildData(input);
  data.labels = metadata.getLabels(input.labels);

  const dockerInspect = await dockerCommand(`inspect ${input.repoTag}`, {echo: false});
  data.dockerInspect = dockerInspect.object;

  return data;
}

async function pushMetadata(data) {
  fs.writeFile("metadata.json", JSON.stringify(data, null, '  '), function (err) {
    if (err) {
      throw Error(`failed to write temp JSON metadata file because ${err.message}`);
    }
  })

  // Github uses the same build number for re-runs, so we add an extra id to the
  // generated filenames, so re-runs don't cause files to be overwritten.
  const uid = new ShortUniqueId({length: 3});
  const filename = `github-build.${data.build.id}.${uid()}.json`;
  await exec.exec('gsutil', ['cp', './metadata.json', `gs://bw-prod-artifacts-metadata/${data.service}/${filename}`], {});
}

module.exports = {
  buildImage,
  pushImage,
  buildMetadata,
  pushMetadata,
}
