process.env.GITHUB_RUN_NUMBER = '2345';

const { buildSlipstreamMetadata } = require('./push');

test('builds correct metadata', async () => {
  const data = await buildSlipstreamMetadata({
    event: {
      pull_request: {
        number: 1,
      },
    },
    version: 'a1b2',
    service: 'test-service',
    labels: 'k1=v1,k2=v2',
  });

  expect(data.type).toBe('webapp');
  expect(data.service).toBe('test-service');
  expect(data.labels.k1).toBe('v1');
  expect(data.labels.k2).toBe('v2');
  expect(data.webapp.sha).toBe('a1b2');
  expect(data.commit.author).not.toBeUndefined();
  expect(data.commit.message).not.toBeUndefined();
  expect(data.commit.sha).not.toBeUndefined();
  expect(data.commit.url).not.toBeUndefined();
  expect(data.build.id).toBe('2345');
  expect(data.build.url).not.toBeUndefined();
});
