const {
    pushMetadata,
    directoryExists,
    pushFilesToBucket,
    getHashOfFiles,
} = require('./lib');

directoryExists("s3://com.brandwatch.appscdn/something/1234")
    .then(console.log);