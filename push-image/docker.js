const core = require('@actions/core');

const { execFileSync } = require('child_process');

function docker(command, ...args) {
  const out = execFileSync('docker', [command, ...args], { env: process.env }).toString('utf-8');

  core.group(`::group::> docker ${command} ${args.join(' ')}`, () => {
    core.info(out);
  });

  return out;
}

function dockerJSON(command, ...args) {
  const out = docker(command, ...args);

  try {
    return JSON.parse(out);
  } catch (err) {
    core.error(`Failed to parse json output for "docker ${command} ${args.join(' ')}"`);
    throw err;
  }
}

module.exports = {
  docker,
  dockerJSON,
};
