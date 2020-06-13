#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT="${DIR}/../"
cd $ROOT

cd $ROOT && cd deploy && npm run package
cd $ROOT && cd install-cli && npm run package
#cd $ROOT && cd push-files && npm run package
cd $ROOT && cd push-image && npm run package
