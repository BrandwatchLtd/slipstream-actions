#!/usr/bin/env bash

if [[ $(git status --porcelain) != "" ]]; then
  for f in $(git diff --name-only); do
    echo "::error file=$f,line=1::Build out-of-date: $f"
  done
  exit 1
fi

