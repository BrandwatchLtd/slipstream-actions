const exec = require('@actions/exec');
const fs  = require('file-system');
const git = require('simple-git/promise');
const { default: ShortUniqueId } = require('short-unique-id');
const { dockerCommand } = require('docker-cli-js');

async function buildImage(input) {
  await dockerCommand(`build -t ${input.repoTag} -f ${input.dockerFile} ${input.contextPath}`);
}

async function pushImage(input) {
  await dockerCommand(`push ${input.repoTag}`);
}

async function buildMetadata(input) {
  const dockerInspect = await dockerCommand(`inspect ${input.repoTag}`, {echo: false});

  const log = await git()
      .raw(['log', '-1', `--pretty=format:{%n  "commit": "%H",%n  "author": "%an",%n  "author_email": "%ae",%n  "date": "%ad",%n  "message": "%s"%n}`], (err, res) => {
      return res });
  const commit = JSON.parse(log);

  const repositoryUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const checkSuffix = `checks?check_suite_id=${process.env.GITHUB_RUN_ID}`;
  let buildUrl = `${repositoryUrl}/commit/${process.env.GITHUB_SHA}/${checkSuffix}`;
  if (input.event.pull_request && input.event.pull_request.number) {
    buildUrl = `${repositoryUrl}/pull/${input.event.pull_request.number}/${checkSuffix}`
   }

  let labels = {}
  if (input.labels) {
      let labelPairs = input.labels.split(',');
      labelPairs.forEach(labelPair => {
          const kv = labelPair.split('=');
          if (kv.length == 2) {
              labels[kv[0]] = kv[1];
          }
      });
   }

  return {
      type: 'image',
      service: input.service,
      commit: {
          author: commit.author,
          message: commit.message,
          sha: commit.commit,
          url: `https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${commit.commit}`,
      },
      build: {
          id: `${process.env.GITHUB_RUN_NUMBER}`,
          url: buildUrl,
      },
      dockerInspect: dockerInspect.object,
      labels,
  };
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
