process.env.GITHUB_RUN_NUMBER = '2345';

const { buildMetadata } = require('./push');

jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

test('builds correct metadata', async () => {
  const data = await buildMetadata({
    event: {
      pull_request: {
        number: 1,
      },
    },
    filesDir: '../.github',
    filesStageUrl: 'https://stage.com',
    filesProdUrl: 'https://prod.com',
    service: 'test-service',
    labels: 'k1=v1,k2=v2',
  });

  expect(data.type).toBe('files');
  expect(data.service).toBe('test-service');
  expect(data.labels.k1).toBe('v1');
  expect(data.labels.k2).toBe('v2');
  expect(data.files.sha).toMatch(/^sha256:.{64}$/);
  expect(data.files.stageUrl).toBe('https://stage.com');
  expect(data.files.prodUrl).toBe('https://prod.com');
  expect(data.commit.author).not.toBeUndefined();
  expect(data.commit.message).not.toBeUndefined();
  expect(data.commit.sha).not.toBeUndefined();
  expect(data.commit.url).not.toBeUndefined();
  expect(data.build.id).toBe('2345');
  expect(data.build.url).not.toBeUndefined();
});
