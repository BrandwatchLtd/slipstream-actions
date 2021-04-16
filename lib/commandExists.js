const exec = require('@actions/exec');

async function commandExists(command) {
  return exec.exec(command, [], { silent: true }).then(() => true).catch(() => false);
}

module.exports = commandExists;
