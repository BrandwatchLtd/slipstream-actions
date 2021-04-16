const exec = require('@actions/exec');
jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

jest.mock('@actions/tool-cache');
const core = require('@actions/core');
jest.mock('@actions/core');

jest.mock('simple-git/promise', () => {
  const mGit = {
    raw: jest.fn(() => new Promise((resolve) => {
      resolve('09415108c57b1bcdeeae4a2992de00580c074f27\nbw-hubot\nEscape "double quotes"');
    })),
  };
  return jest.fn(() => mGit);
});

jest.mock('./commandExists', () => jest.fn(() => Promise.resolve(true)));
const commandExists = require('./commandExists');

const {
  pushFilesToBucket,
  pushMetadata,
  getCommitData,
  getLabels,
  installSlipstreamCLI,
} = require('./index');

beforeEach(() => {
  exec.exec.mockReset();
  commandExists.mockReset();
  core.startGroup.mockReset();
});

test('pushFilesToBucket calls gsutil correctly', async () => {
  await pushFilesToBucket('dir', 'gs://bucket/path/');

  expect(exec.exec.mock.calls.length).toBe(1);
  expect(exec.exec).toHaveBeenCalledWith('gsutil',
    [
      '-m',
      '-h',
      'Cache-Control:public, max-age=31536000',
      'cp', '-rnz', 'css,html,js,json,svg', '.',
      'gs://bucket/path/',
    ],
    {
      cwd: 'dir',
    });
});

describe('pushMetadata', () => {
  const data = {
    service: 'a-service',
    build: {
      id: '1234',
    },
  };
  test('throws if bucket string not set', async () => {
    const bucket = undefined;
    await expect(pushMetadata(bucket, data)).rejects.toThrow(/metadataBucket/);
  });
  test('throws if bucket string does not include gs:// prefix', async () => {
    const bucket = 'bucketname';
    await expect(pushMetadata(bucket, data)).rejects.toThrow(/gs:\/\//);
  });
  test('calls gsutil correctly', async () => {
    const bucket = 'gs://random-bucket';
    await pushMetadata(bucket, data);

    expect(exec.exec.mock.calls.length).toBe(1);
    expect(exec.exec).toHaveBeenCalledWith(
      'gsutil',
      expect.arrayContaining([
        'cp',
        '-z',
        'json',
        expect.stringContaining(
          'gs://random-bucket/a-service/github-build.1234.',
        ),
      ]),
      {},
    );
  });
});

describe('getLabels returns correct JSON', () => {
  test('for single key/value pair', () => {
    expect(getLabels('k1=v1')).toStrictEqual({ k1: 'v1' });
  });
  test('for multiple key/value pairs', () => {
    expect(getLabels('k1=v1,k2=v2')).toStrictEqual({ k1: 'v1', k2: 'v2' });
  });
  test('for empty string', () => {
    expect(getLabels('')).toStrictEqual({});
  });
});

describe('getLabels throws', () => {
  test('with badly formed key/value pairs', () => {
    expect(() => getLabels('k1=v1,k2v2')).toThrow(Error);
  });
  test('with non delimited pairs', () => {
    expect(() => getLabels('k1=v1k2=v2')).toThrow(Error);
  });
});

describe('getCommitData', () => {
  test('with non delimited pairs', async () => {
    process.env.GITHUB_REPOSITORY = 'foo/bar';

    const json = await getCommitData();
    expect(json).toStrictEqual({
      author: 'bw-hubot',
      message: 'Escape "double quotes"',
      sha: '09415108c57b1bcdeeae4a2992de00580c074f27',
      url:
        'https://github.com/foo/bar/commit/09415108c57b1bcdeeae4a2992de00580c074f27',
    });
  });
});

describe('installSlipstreamCLI', () => {
  test('when command exists', async () => {
    commandExists.mockResolvedValue(true);
    core.startGroup.mockImplementation(() => {});
    await installSlipstreamCLI('downloadURL');
    expect(commandExists).toHaveBeenCalled();
    expect(core.startGroup).not.toHaveBeenCalled();
  });
});

describe('installSlipstreamCLI', () => {
  test('when command does not exist', async () => {
    commandExists.mockResolvedValue(false);
    core.startGroup.mockImplementation(() => {});
    await installSlipstreamCLI('downloadURL');
    expect(commandExists).toHaveBeenCalled();
    expect(core.startGroup).toHaveBeenCalledWith('Installing the Slipstream CLI');
  });
});
