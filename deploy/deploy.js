const exec = require('@actions/exec');

async function deploy(environment, service, id, idKey) {
  const args = [
    'deploy',
    environment,
    service,
    `--${idKey.toLowerCase()}`, `${id}`,
    '--quiet',
    '--wait',
  ];

  await exec.exec('slipstream', args, { silent: false });
}

module.exports = {
  deploy,
};
