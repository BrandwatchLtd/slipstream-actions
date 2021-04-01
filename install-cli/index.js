const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');

async function run() {
  try {
    core.startGroup('Installing the Slipstream CLI');
    const downloadURL = core.getInput('url');
    const fileType = downloadURL.substr(-4);
    const slipstreamPath = await tc.downloadTool(downloadURL);
    const destPath = `${slipstreamPath}${fileType}`;
    const slipstreamExtractedFolder = await tc.extractTar(slipstreamPath, destPath);
    const cachedPath = await tc.cacheDir(slipstreamExtractedFolder, 'slipstream', 'latest');
    core.addPath(cachedPath);
    await exec.exec('slipstream', ['version'], {});
    core.info('Success');
    core.endGroup();
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
