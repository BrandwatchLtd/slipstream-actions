process.env.GITHUB_RUN_NUMBER = '2345';

const docker = require('./docker');
const {
  buildImage,
  tagImage,
  getTags,
  buildMetadata,
} = require('./push');

const OLD_ENV = process.env;

jest.mock('./docker', () => ({
  docker: jest.fn(),
  dockerJSON: jest.fn(),
}));

beforeEach(() => {
  docker.docker.mockReset();
  process.env = { FOO: 'bar' };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe('passes corrects args to docker build', () => {
  test('with no optional args', async () => {
    await buildImage({
      repo: 'thing1',
      dockerfile: 'dockf1',
      path: 'path1',
    });
    expect(docker.docker.mock.calls[1])
      .toEqual(['build', '--tag', 'thing1', '--file', 'dockf1', 'path1']);
  });
  test('with pull arg', async () => {
    await buildImage({
      repo: 'thing1',
      dockerfile: 'dockf1',
      path: 'path1',
      pull: true,
    });
    expect(docker.docker.mock.calls[1])
      .toEqual(['build', '--tag', 'thing1', '--file', 'dockf1', '--pull', 'path1']);
  });
  test('with buildArgs arg', async () => {
    await buildImage({
      repo: 'thing1',
      dockerfile: 'dockf1',
      path: 'path1',
      buildArgs: 'k1=v1,k2=v2',
    });
    expect(docker.docker.mock.calls[1])
      .toEqual(['build', '--tag', 'thing1', '--file', 'dockf1', '--build-arg', 'k1=v1', '--build-arg', 'k2=v2', 'path1']);
  });
  test('with additional options', async () => {
    await buildImage({
      repo: 'thing1',
      dockerfile: 'dockf1',
      path: 'path1',
      buildArgs: 'k1=v1,k2=v2',
      additionalOptions: '--secret id=npmrc,src=.npmrc --ssh default=foo',
    });
    expect(docker.docker.mock.calls[1])
      .toEqual(['build', '--tag', 'thing1', '--file', 'dockf1', '--build-arg', 'k1=v1', '--build-arg', 'k2=v2', '--secret', 'id=npmrc,src=.npmrc', '--ssh', 'default=foo', 'path1']);
  });
  // test('passes process.env', async () => {
  //   await buildImage({
  //     repo: 'thing1',
  //     dockerfile: 'dockf1',
  //     path: 'path1',
  //   });
  //   expect(docker.docker.mock.calls[0][1])
  //     .toStrictEqual({ env: { FOO: 'bar' } });
  // });
});

test('calls tagImage correctly', async () => {
  await tagImage('imagerepo', 'newtag');
  expect(docker.docker)
    .toHaveBeenCalledWith('tag', 'imagerepo', 'imagerepo:newtag');
});

describe('getTags', () => {
  test('returns build tag', async () => {
    process.env.GITHUB_RUN_NUMBER = '1234';
    expect(getTags()).toContain('build.1234');
  });
  test('returns sha tag', async () => {
    process.env.GITHUB_SHA = 'eea72dc2f8045993b548a04488172ba88b14ce36';
    expect(getTags()).toContain('sha.eea72dc');
  });
  test('returns refs/pull tag', async () => {
    process.env.GITHUB_REF = 'refs/pull/14/merge';
    expect(getTags()).toContain('pr.14');
  });
  test('returns refs/heads tag', async () => {
    process.env.GITHUB_REF = 'refs/heads/master';
    expect(getTags()).toContain('branch.master');
  });
  test('returns refs/tags tag', async () => {
    process.env.GITHUB_REF = 'refs/tags/v1.0.0.';
    expect(getTags()).toContain('tag.v1.0.0.');
  });
  test('returns unknown refs', async () => {
    process.env.GITHUB_REF = 'refs/unknown/thing';
    expect(getTags()).toContain('unknown.thing');
  });
});

test('builds correct metadata', async () => {
  docker.dockerJSON.mockReturnValue({
    object: [{ dummy: 'inspect' }],
  });
  const data = await buildMetadata({
    event: {
      pull_request: {
        number: 1,
      },
    },
    repo: 'eu.gcr.io/bw-prod-artifacts/test-service',
    service: 'test-service',
    labels: 'k1=v1,k2=v2',
    release: true,
  });

  expect(data.type).toBe('image');
  expect(data.service).toBe('test-service');
  expect(data.labels.k1).toBe('v1');
  expect(data.labels.k2).toBe('v2');
  expect(data.service).toBe('test-service');
  expect(data.release).toBe(true);
  expect(typeof data.dockerInspect[0]).toBe('object');
  expect(data.commit.author).not.toBeUndefined();
  expect(data.commit.message).not.toBeUndefined();
  expect(data.commit.sha).not.toBeUndefined();
  expect(data.commit.url).not.toBeUndefined();
  expect(data.build.id).not.toBeUndefined();
  expect(data.build.url).not.toBeUndefined();
});
