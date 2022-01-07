const exec = require('@actions/exec');

async function deploy(environment, service, id, version) {
  let args;
  if (version === 'none') {
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
      '--version', `${version}`,
      '--quiet',
      '--wait',
    ];
  }

  await exec.exec('slipstream', args, { silent: false });
}

module.exports = {
  deploy,
};
