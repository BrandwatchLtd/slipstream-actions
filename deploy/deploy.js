const exec = require('@actions/exec');
const core = require('@actions/core');

async function deploy(environment, service, id, idKey) {
  const args = [
    'deploy',
    environment,
    service,
    `--${idKey.toLowerCase()}`, `${id}`,
    '--quiet',
    '--wait',
  ];

  core.notice(JSON.stringify(args, null, 2));

  await exec.exec('slipstream', args, { silent: false });
}

module.exports = {
  deploy,
};
