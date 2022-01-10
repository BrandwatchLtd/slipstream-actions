const exec = require('@actions/exec');
const core = require('@actions/core');

async function deploy(environment, service, id, idKey) {
  const args = [
    'deploy',
    environment,
    service,
    '--version', `${id}`,
    '--quiet',
    '--wait',
  ];

  console.log(idKey);

  core.warning(JSON.stringify(args, null, 2));

  await exec.exec('slipstream', args, { silent: false });
}

module.exports = {
  deploy,
};
