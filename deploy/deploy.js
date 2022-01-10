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

  console.log(`::warning file=deploy.js,line=13,endLine=13,title=isthiscached::${JSON.stringify(args)}`);

  await exec.exec('slipstream', args, { silent: false });
}

module.exports = {
  deploy,
};
