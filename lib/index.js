const git = require('simple-git/promise');
const fs = require('fs');
const util = require('util');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');
const {default: ShortUniqueId} = require('short-unique-id');
const commandExists = require('./commandExists');

const writeFile = util.promisify(fs.writeFile);

const githubRepo = process.env.GITHUB_REPOSITORY;
const githubRunID = process.env.GITHUB_RUN_ID;
const githubRunNumber = process.env.GITHUB_RUN_NUMBER;
const githubSHA = process.env.GITHUB_SHA;

async function getCommitData() {
  const prettyArg = `--pretty=format:${'%H %an %s'.split(' ').join('%n')}`;
  const log = await git()
    .raw([
      'log',
      '-1',
      prettyArg,
    ]);
  const [sha, author, message] = log.split('\n');

  return {
    author,
    message,
    sha,
    url: `https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${sha}`,
  };
}

function getBuildData(githubEvent) {
  const repositoryUrl = `https://github.com/${githubRepo}`;
  const checkSuffix = `checks?check_suite_id=${githubRunID}`;
  let buildUrl = `${repositoryUrl}/commit/${githubSHA}/${checkSuffix}`;
  if (githubEvent.pull_request && githubEvent.pull_request.number) {
    buildUrl = `${repositoryUrl}/pull/${githubEvent.pull_request.number}/${checkSuffix}`;
  }
  return {
    id: githubRunNumber,
    url: buildUrl,
  };
}

function getLabels(l) {
  const labels = {};
  if (l) {
    const labelPairs = l.split(',');
    labelPairs.forEach((labelPair) => {
      const kv = labelPair.split('=');
      if (kv.length === 2) {
        const [key, val] = kv;
        labels[key] = val;
      } else {
        throw new Error('Baldy formed labels field. Should be `key=value,key=value`');
      }
    });
  }
  return labels;
}

async function pushMetadata(bucket, data) {
  if (!bucket) {
    throw new Error('metadataBucket input for artifact metadata not set');
  }
  if (!bucket.startsWith('gs://')) {
    throw new Error('metadataBucket input must start with gs://');
  }

  const tmpFile = 'tmp-slipstream-metadata.json';
  try {
    await writeFile(tmpFile, JSON.stringify(data, null, '  '));
  } catch (err) {
    throw Error(`failed to write temp JSON metadata file: ${err.message}`);
  }

  // Github uses the same build number for re-runs, so we add an extra id to the
  // generated filenames, so re-runs don't cause files to be overwritten.
  const uid = new ShortUniqueId({length: 3});
  const filename = `github-build.${data.build.id}.${uid()}.json`;
  await exec.exec('gsutil', ['cp', '-z', 'json', `./${tmpFile}`, `${bucket}/${data.service}/${filename}`], {});
  await fs.unlink(tmpFile, (err) => {
    if (err) {
      throw Error(`failed to delete temp JSON metadata file: ${err.message}`);
    }
  });
}

async function pushFilesToBucket(files, bucketAddress) {
  const args = '-rnz'; // recursive, no-overwrite, zip
  const zipExtensions = 'css,html,js,json,svg';

  await exec.exec('gsutil', [
    '-m',
    '-h', 'Cache-Control:public, max-age=31536000',
    'cp', args, zipExtensions, '.',
    bucketAddress,
  ], {
    cwd: files,
  });
}

async function directoryExists(url) {
  return exec.exec('gsutil', [
    'ls',
    url,
  ]).then(() => true).catch(() => false);
}

async function installSlipstreamCLI(downloadURL) {
  const commandExistsAlready = await commandExists('slipstream', ['--quiet']);

  if (commandExistsAlready) {
    core.info('Slipstream CLI is already installed');
    return;
  }

  // install cli
  core.startGroup('Installing the Slipstream CLI');
  const fileType = downloadURL.substr(-4);
  const slipstreamPath = await tc.downloadTool(downloadURL);
  const destPath = `${slipstreamPath}${fileType}`;
  const slipstreamExtractedFolder = await tc.extractTar(slipstreamPath, destPath);
  const cachedPath = await tc.cacheDir(slipstreamExtractedFolder, 'slipstream', 'latest');
  core.addPath(cachedPath);
  core.info('Success');
  core.endGroup();
}

const setupAWSRepository = async (repository, registry) => {
  core.info('Setup AWS docker login');
  await exec.exec(`/bin/bash -c "aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin ${registry}" `);

  // Check if repository exist
  const ret = await exec.exec(`aws ecr describe-repositories --repository-names ${repository}`, [], {ignoreReturnCode: true});
  core.info(`return code:  ${ret}`);
  if (ret !== 0) {
    core.startGroup(`Create AWS ${repository} repository in ${registry}`);
    // Create repository
    core.info(`Create ${repository} repository`);
    await exec.exec(`/bin/bash -c "aws ecr create-repository --repository-name ${repository} --image-tag-mutability MUTABLE --image-scanning-configuration scanOnPush=true" `);

    // Export default policy
    core.info('Export default policy');
    await exec.exec('/bin/bash -c "aws ecr get-repository-policy --repository-name default | jq -r .policyText > access_policy.json"');

    // Apply the access policy to the new repository
    core.info(`Apply the access policy to ${repository} repository`);
    await exec.exec(`/bin/bash -c "aws ecr set-repository-policy --repository-name ${repository} --policy-text file://access_policy.json"`);
    core.endGroup();
  }
};

module.exports = {
  getCommitData,
  getBuildData,
  getLabels,
  directoryExists,
  pushMetadata,
  pushFilesToBucket,
  commandExists,
  installSlipstreamCLI,
  setupAWSRepository,
};
