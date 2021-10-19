const exec = require('@actions/exec');
const { deploy } = require('./deploy');

jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

test('calls slipstream command with correct arguments', async () => {
  deploy('env', 'service', 'digest');
  expect(exec.exec.mock.calls.length).toBe(1);
  expect(exec.exec).toHaveBeenCalledWith('slipstream',
    [
      'deploy',
      'env',
      'service',
      '--id', 'digest',
      '--quiet',
      '--wait',
    ],
    {
      silent: false,
    });
});
