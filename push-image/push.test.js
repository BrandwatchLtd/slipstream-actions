const docker = require('docker-cli-js');
const { buildMetadata } = require('./push');

jest.mock('docker-cli-js');
docker.dockerCommand.mockResolvedValue({
  object: [{"dummy": "inspect"}]
});

test('builds correct metadata', async() => {
  data = await buildMetadata({
    event: {
      pull_request: {
        number: 1,
      },
    },
    repoTag: 'eu.gcr.io/bw-prod-artifacts/test-service:test',
    service: 'test-service',
    labels: 'k1=v1,k2=v2',
  });

  expect(data.type).toBe('image');
  expect(data.service).toBe('test-service');
  expect(data.labels.k1).toBe('v1');
  expect(data.labels.k2).toBe('v2');
  expect(data.service).toBe('test-service');
  expect(typeof data.dockerInspect[0]).toBe('object');
  expect(data.commit.author).not.toBe(undefined);
  expect(data.commit.message).not.toBe(undefined);
  expect(data.commit.sha).not.toBe(undefined);
  expect(data.commit.url).not.toBe(undefined);
  expect(data.build.id).not.toBe(undefined);
  expect(data.build.url).not.toBe(undefined);
});
