const core = require('@actions/core');
const tc = require('@actions/tool-cache');

async function run() {
  try {
    core.info('Installing the Slipstream CLI');
    const downloadURL = 'https://bin.equinox.io/c/cXopLpzLbWK/slipstream-beta-linux-amd64.tgz';
    const fileType = downloadURL.substr(-4);
    const slipstreamPath = await tc.downloadTool(downloadURL);
    const destPath = `${slipstreamPath}${fileType}`;
    const slipstreamExtractedFolder = await tc.extractTar(slipstreamPath, destPath);
    const cachedPath = await tc.cacheDir(slipstreamExtractedFolder, 'slipstream', 'latest');
    core.addPath(cachedPath);
    core.info('Success');
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
