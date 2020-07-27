process.env.GITHUB_RUN_NUMBER = '2345';

jest.mock('@actions/exec', () => ({
  exec: jest.fn((cmd, args, options) => {
    options.listeners.stdout('638b46454a5u95520e07');
  }),
}));

const exec = require('@actions/exec');
const { buildMetadata, getHashOfFiles } = require('./push');

test('builds correct metadata', async () => {
  const data = await buildMetadata({
    event: {
      pull_request: {
        number: 1,
      },
    },
    hash: 'a1b2',
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
  expect(data.files.sha).toBe('a1b2');
  expect(data.files.stageUrl).toBe('https://stage.com');
  expect(data.files.prodUrl).toBe('https://prod.com');
  expect(data.commit.author).not.toBeUndefined();
  expect(data.commit.message).not.toBeUndefined();
  expect(data.commit.sha).not.toBeUndefined();
  expect(data.commit.url).not.toBeUndefined();
  expect(data.build.id).toBe('2345');
  expect(data.build.url).not.toBeUndefined();
});

test('generates a content hash', async () => {
  const hash = await getHashOfFiles('./dir');

  expect(hash).toBe('638b46454a5u95520e07');
  expect(exec.exec).toHaveBeenCalledTimes(1);
  expect(exec.exec.mock.calls[0][0]).toBe('/bin/bash -c');
  expect(exec.exec.mock.calls[0][1]).toStrictEqual(['find . -type f -exec cat {} + | shasum | cut -c1-20']);
  expect(exec.exec.mock.calls[0][2].cwd).toBe('./dir');
});
