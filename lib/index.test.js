const exec = require('@actions/exec');
jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

const {
  pushFilesToBucket,
  pushMetadata,
  getLabels,
} = require('./index');

beforeEach(() => {
  exec.exec.mockReset();
});

test('pushFilesToBucket calls gsutil correctly', async () => {
  await pushFilesToBucket('dir', 'gs://bucket/path/');

  expect(exec.exec.mock.calls.length).toBe(1);
  expect(exec.exec).toHaveBeenCalledWith('gsutil',
    [
      '-m',
      '-h',
      'Cache-Control:public, max-age=31536000',
      'cp', '-r', '.',
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

    const expectedBucketRegex = new RegExp(/^gs:\/\/random-bucket\/a-service\/github-build\.1234\..{3}\.json$/);

    expect(exec.exec.mock.calls.length).toBe(1);
    expect(exec.exec.mock.calls[0][0]).toBe('gsutil');
    expect(exec.exec.mock.calls[0][1][0]).toBe('cp');
    expect(exec.exec.mock.calls[0][1][1]).toBe('./tmp-slipstream-metadata.json');
    expect(exec.exec.mock.calls[0][1][2]).toMatch(expectedBucketRegex);
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
