const exec = require('@actions/exec');
const { deploy } = require('./deploy');

jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

test('calls slipstream command with correct arguments not for module', async () => {
  deploy('env', 'service', 'digest', 'ID');
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

test('calls slipstream command with correct arguments for module', async () => {
  deploy('env', 'service', '1.2.3', 'version');
  expect(exec.exec.mock.calls.length).toBe(2);
  expect(exec.exec).toHaveBeenCalledWith('slipstream',
    [
      'deploy',
      'env',
      'digest',
      '--version', '1.2.3',
      '--quiet',
      '--wait',
    ],
    {
      silent: false,
    });
});
