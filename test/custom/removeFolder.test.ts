import test from 'ava';
const mock = require('mock-fs');
const fs = require('fs-extra');

const dir = 'accessible'
const forbiddenDir = 'inaccessible'
const nonexistentDir = 'nonexistantDir'

const {removeFolder} = require('../../src/custom/removeFolder');


test.before(t => {
  mock({
    [dir]: mock.directory({
      items: {
        file1: 'file one content',
        file2: Buffer.from([8, 6, 7, 5, 3, 0, 9])
      }
    }),
    [forbiddenDir]: mock.directory({
      mode: 755,
      items: {
        file1: 'file one content',
      }
    })
  });
});

test('removeFolder', async t => {
  // check for accessible file

  t.true(await fs.pathExists(dir))
  const result = await removeFolder(dir);
  t.true(result)
  t.false(await fs.pathExists(dir))

  // check that inaccessible file gives an error
  const error = await t.throwsAsync(async () => {
    await removeFolder(forbiddenDir);
  });
  t.regex(error.message, /cannot remove/);
  t.regex(error.message, /Error: EACCES, permission denied/);

  t.false(await fs.pathExists(nonexistentDir))
  const nonexistentDirRemoved = await removeFolder(nonexistentDir);
  t.false(nonexistentDirRemoved)
});

test.after('cleanup', t => {
  mock.restore
});
