const { execFileSync } = require('child_process');

function docker(command, ...args) {
  const out = execFileSync('docker', [command, ...args], { env: process.env }).toString('utf-8');

  /* eslint-disable no-console */
  console.log(`::group::> docker ${command} ${args.join(' ')}`);
  console.log(out);
  console.log('::endgroup::');
  /* eslint-enable no-console */

  return out;
}

function dockerJSON(command, ...args) {
  const out = docker(command, ...args);

  try {
    return JSON.parse(out);
  } catch (err) {
    console.error(`:error::Failed to parse json output for "docker ${command} ${args.join(' ')}"`);
    throw err;
  }
}

module.exports = {
  docker,
  dockerJSON,
};
