const exec = require('@actions/exec');
const crypto = require('crypto');

async function deploy(environment, service, id, idKey) {
  const args = [
    'deploy',
    environment,
    service,
    `--${idKey.toLowerCase()}`, `${id}`,
    '--quiet',
    '--wait',
  ];

  const resumeToken = crypto.randomBytes(30).toString('base64');
  console.log('::group::Event JSON');
  console.log(`::stop-commands::${resumeToken}`);

  console.log(JSON.stringify(args, null, 2));

  console.log(`::${resumeToken}::`);
  console.log('::endgroup::');

  await exec.exec('slipstream', args, { silent: false });
}

module.exports = {
  deploy,
};
