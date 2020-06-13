const git = require('simple-git/promise');

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
    url: `https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${commit.commit}`,
  }
}

function getBuildData(githubEvent) {
  const repositoryUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const checkSuffix = `checks?check_suite_id=${process.env.GITHUB_RUN_ID}`;
  let buildUrl = `${repositoryUrl}/commit/${process.env.GITHUB_SHA}/${checkSuffix}`;
  if (githubEvent.pull_request && githubEvent.pull_request.number) {
    buildUrl = `${repositoryUrl}/pull/${githubEvent.pull_request.number}/${checkSuffix}`
  }
  return {
    id: `${process.env.GITHUB_RUN_NUMBER}`,
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
      }
    });
  }
  return labels;
}

module.exports = {
  getCommitData,
  getBuildData,
  getLabels,
}
