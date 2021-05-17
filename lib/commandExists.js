const exec = require('@actions/exec');

async function commandExists(command, args) {
  return exec.exec(command, args, { silent: true }).then(() => true).catch(() => false);
}

module.exports = commandExists;
