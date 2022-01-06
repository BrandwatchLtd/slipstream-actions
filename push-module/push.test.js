process.env.GITHUB_RUN_NUMBER = '2345';

const { buildMetadata } = require('./push');

test('builds correct metadata', async () => {
  const data = await buildMetadata({
    event: {
      pull_request: {
        number: 1,
      },
    },
    id: 'test-app1',
    version: '1.5.1',
  });

  expect(data.type).toBe('module');
  expect(data.service).toBe('test-app1');
  expect(data.commit.author).not.toBeUndefined();
  expect(data.commit.message).not.toBeUndefined();
  expect(data.commit.sha).not.toBeUndefined();
  expect(data.commit.url).not.toBeUndefined();
  expect(data.build.id).toBe('2345');
  expect(data.build.url).not.toBeUndefined();
});
