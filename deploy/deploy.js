const exec = require('@actions/exec');

async function deploy(environment, service, id) {
  const args = [
    'deploy',
    environment,
    service,
    '--id', `${id}`,
    '--quiet',
    '--wait',
    '--ci=slipstream-actions',
  ];

  await exec.exec('slipstream', args, {});
}

module.exports = {
  deploy,
};
