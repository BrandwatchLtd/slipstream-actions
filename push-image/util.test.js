const { getImageDigest } = require('./util');

const fakeImageDigest = [{
  RepoDigests: [
    'eu.gcr.io/bw-prod-artifacts/service@sha256:1234',
  ],
}];

test('gets image digest from docker inspect', async () => {
  const digest = getImageDigest(fakeImageDigest);
  expect(digest).toBe('sha256:1234');
});
