const { directoryExists } = require('./lib');

/* eslint-disable no-console */
directoryExists('s3://com.brandwatch.appscdn/something/1234')
  .then(console.log);
