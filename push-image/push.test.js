process.env.GITHUB_RUN_NUMBER = '2345';

const docker = require('docker-cli-js');
const { buildImage, buildMetadata } = require('./push');

jest.mock('docker-cli-js', () => ({
  dockerCommand: jest.fn(),
}));

beforeEach(() => {
  docker.dockerCommand.mockReset();
});

describe('passes corrects args to docker build', () => {
  test('with no optional args', async () => {
    await buildImage({
      repoTag: 'thing1',
      dockerfile: 'dockf1',
      path: 'path1',
    });
    expect(docker.dockerCommand)
      .toHaveBeenCalledWith('build --tag thing1 --file dockf1 path1');
  });
  test('with pull arg', async () => {
    await buildImage({
      repoTag: 'thing1',
      dockerfile: 'dockf1',
      path: 'path1',
      pull: true,
    });
    expect(docker.dockerCommand)
      .toHaveBeenCalledWith('build --tag thing1 --file dockf1 --pull path1');
  });
  test('with buildArgs arg', async () => {
    await buildImage({
      repoTag: 'thing1',
      dockerfile: 'dockf1',
      path: 'path1',
      buildArgs: 'k1=v1,k2=v2',
    });
    expect(docker.dockerCommand)
      .toHaveBeenCalledWith('build --tag thing1 --file dockf1 --build-arg k1=v1 --build-arg k2=v2 path1');
  });
});

test('builds correct metadata', async () => {
  docker.dockerCommand.mockResolvedValue({
    object: [{ dummy: 'inspect' }],
  });
  const data = await buildMetadata({
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
  expect(data.commit.author).not.toBeUndefined();
  expect(data.commit.message).not.toBeUndefined();
  expect(data.commit.sha).not.toBeUndefined();
  expect(data.commit.url).not.toBeUndefined();
  expect(data.build.id).not.toBeUndefined();
  expect(data.build.url).not.toBeUndefined();
});
