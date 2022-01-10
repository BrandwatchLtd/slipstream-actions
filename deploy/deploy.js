const exec = require('@actions/exec');

async function deploy(environment, service, id, idKey) {
  let args;
  if (idKey === 'ID') {
    args = [
      'deploy',
      environment,
      service,
      '--id', `${id}`,
      '--quiet',
      '--wait',
    ];
  } else {
    args = [
      'deploy',
      environment,
      id,
      '--version', `${idKey}`,
      '--quiet',
      '--wait',
    ];
  }

  await exec.exec('slipstream', args, { silent: false });
}

module.exports = {
  deploy,
};
