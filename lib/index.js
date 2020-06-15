const git = require('simple-git/promise');
const fs  = require('file-system');
const exec = require('@actions/exec');
const { default: ShortUniqueId } = require('short-unique-id');

const githubRepo = process.env.GITHUB_REPOSITORY;
const githubRunID = process.env.GITHUB_RUN_ID;
const githubRunNumber = process.env.GITHUB_RUN_NUMBER;
const githubSHA = process.env.GITHUB_SHA;

async function getCommitData() {
  const log = await git()
    .raw([
      'log',
      '-1',
      `--pretty=format:{%n  "commit": "%H",%n  "author": "%an",%n  "author_email": "%ae",%n  "date": "%ad",%n  "message": "%s"%n}`
    ], (err, res) => {
      return res
    });
  const commit = JSON.parse(log);

  return {
    author: commit.author,
    message: commit.message,
    sha: commit.commit,
    url: `https://github.com/${githubRepo}/commit/${commit.commit}`,
  }
}

function getBuildData(githubEvent) {
  const repositoryUrl = `https://github.com/${githubRepo}`;
  const checkSuffix = `checks?check_suite_id=${githubRunID}`;
  let buildUrl = `${repositoryUrl}/commit/${githubSHA}/${checkSuffix}`;
  if (githubEvent.pull_request && githubEvent.pull_request.number) {
    buildUrl = `${repositoryUrl}/pull/${githubEvent.pull_request.number}/${checkSuffix}`
  }
  return {
    id: githubRunNumber,
    url: buildUrl,
  }
}

function getLabels(l) {
  let labels = {};
  if (l) {
    let labelPairs = l.split(',');
    labelPairs.forEach(labelPair => {
      const kv = labelPair.split('=');
      if (kv.length == 2) {
        labels[kv[0]] = kv[1];
      } else {
        throw new Error('Baldy formed labels field. Should be `key=value,key=value`');
      }
    });
  }
  return labels;
}

async function pushMetadata(data, bucket) {
  const tmpFile = 'tmp-slipstream-metadata.json';
  fs.writeFile(tmpFile, JSON.stringify(data, null, '  '), (err) => {
    if (err) {
      throw Error(`failed to write temp JSON metadata file: ${err.message}`);
    }
  })

  // Github uses the same build number for re-runs, so we add an extra id to the
  // generated filenames, so re-runs don't cause files to be overwritten.
  const uid = new ShortUniqueId({length: 3});
  const filename = `github-build.${data.build.id}.${uid()}.json`;
  await exec.exec('gsutil', ['cp', `./${tmpFile}`, `${bucket}/${data.service}/${filename}`], {});
  await fs.unlink(tmpFile, (err) => {
    if (err) {
      throw Error(`failed to delete temp JSON metadata file: ${err.message}`);
    }
  })
}

async function pushFilesToBucket(files, bucketAddress) {
  await exec.exec('gsutil', [
    '-m',
    '-h', 'Cache-Control:public, max-age=31536000',
    'cp', '-r', '.',
    bucketAddress
   ], {
     cwd: files,
   });
}

module.exports = {
  getCommitData,
  getBuildData,
  getLabels,
  pushMetadata,
  pushFilesToBucket,
}
