import test from 'ava';
import {checkFolder} from '../../src/custom/checkFolder'
import {createStarter} from '../../src/custom/createStarter'
import {SetupSequence} from 'magicalstrings'

const mockFs = require('mock-fs')
const fs = require('fs-extra')
const path = require('path')

const SAMPLE_CODE = 'sampleCode'
const codeDir = __dirname + '/' + SAMPLE_CODE

test('createStarter', async t => {
  const setupSequence: SetupSequence = {
    "preCommands": [
      {
        "title": "run git",
        "file": "git",
        "arguments": [
          "init",
          codeDir,
        ]
      },
      {
        "title": "create file",
        "file": "touch",
        "arguments": [
          codeDir + "/temp.txt",
        ]
      },
    ],
    // "mainInstallation": [
    //   "barbells"
    // ],
    // "devInstallation": [
    //   "cogs-box"
    // ]
  }
  const session = {codeDir}


  // mockFs({
  //   [codeDir]: {/* empty directory */},
  //   'node_modules': mockFs.load(path.resolve(__dirname, '../../node_modules')),
  // })

  await checkFolder(codeDir)
  t.false(await fs.pathExists(codeDir))

  // const generatedDirContents = fs.readdirSync(codeDir).sort()
  // console.log(JSON.stringify(generatedDirContents))
  // t.true(generatedDirContents.length>0)

  let removeExistingStarter=false
  await createStarter(setupSequence, codeDir, session, removeExistingStarter)
  t.true(await fs.pathExists(codeDir))
  t.true(await fs.pathExists(codeDir + '/temp.txt'))
  t.true(await fs.pathExists(codeDir + '/.git'))

  // mockFs.restore()
  await checkFolder(codeDir)
  t.false(await fs.pathExists(codeDir))

});
