process.env.GITHUB_RUN_NUMBER = '2345';

const core = require('@actions/core');
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
  const hash = await getHashOfFiles('./fixtures');
  expect(hash).toBe('775de5a308edde41f9ad');
});

test('throws an error if content hash genertion fails', async () => {
  const setFailedSpy = jest.spyOn(core, 'setFailed');

  return getHashOfFiles('./fixtures/does-not-exist').catch((error) => {
    expect(error[0].error.code).toBe('ENOENT');
    expect(error[0].error.path).toBe('./fixtures/does-not-exist');
    expect(setFailedSpy).toHaveBeenCalled();
    expect(setFailedSpy).toHaveBeenCalledWith('Hash generation failed');
  });
});
