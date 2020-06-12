const { getImageDigest } = require('./util');

fakeImageDigest = [{
  RepoDigests: [
    'eu.gcr.io/bw-prod-artifacts/service@sha256:1234'
  ]
}]

test('gets image digest from docker inspect', async() => {
  digest = getImageDigest(fakeImageDigest);
  expect(digest).toBe('sha256:1234');
})
