process.env.GITHUB_RUN_NUMBER = '2345';

const { execFileSync } = require('child_process');
const { docker, dockerJSON } = require('./docker');

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));

const { env: ENV } = process;

beforeEach(() => {
  execFileSync.mockReset();
  execFileSync.mockReturnValue(Buffer.alloc(0));

  jest.spyOn(global.console, 'error').mockImplementation(() => {});
  jest.spyOn(global.console, 'log').mockImplementation(() => {});

  process.env = { FOO: 'bar' };
});

afterAll(() => {
  process.env = ENV;
});

describe('docker())', () => {
  it('should pass process.env to process', async () => {
    docker('build', '.');

    expect(execFileSync).toBeCalledWith('docker', ['build', '.'], { env: { FOO: 'bar' } });
  });
});

describe('dockerJSON())', () => {
  it('should return json object', async () => {
    execFileSync.mockReturnValue(Buffer.from('{ "test": 1 }'));

    expect(dockerJSON('docker', 'context', 'inspect')).toEqual({ test: 1 });
  });

  it('should fail if docker response is not valid json', async () => {
    execFileSync.mockReturnValue(Buffer.from('{'));

    expect(() => dockerJSON('docker', 'context', 'inspect')).toThrow();
    expect(global.console.error).toBeCalledWith(
      ':error::Failed to parse json output for "docker docker context inspect"',
    );
  });
});
