#!/bin/bash

# watchall.sh starts a file watcher for each action app, and
# rebuilds the `/dist/index.js` file on each change.
# The dist/index.js files must be checked in to git as these are
# the entry points for each action.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT="${DIR}/../"

cd $ROOT/deploy && npm run dev &
cd $ROOT/install-cli && npm run dev &
cd $ROOT/push-files && npm run dev &
cd $ROOT/push-image && npm run dev
