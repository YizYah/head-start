
[//]: # ( ns__file unit: standard, comp: README.md )

[//]: # ( ns__custom_start beginning )

[//]: # ( ns__custom_end beginning )

[//]: # ( ns__start_section intro )

[//]: # ( ns__custom_start description )
head-start
======
project creator: execute a set of standard processes and installations into a directory

[//]: # ( ns__custom_end description )

[//]: # ( ns__custom_start afterDescription )

[//]: # ( ns__custom_end afterDescription )

[//]: # ( ns__custom_start badges )

[//]: # ( ns__start_section usageSection )

[![Version](https://img.shields.io/npm/v/head-start.svg)](https://npmjs.org/package/head-start)
[![Downloads/week](https://img.shields.io/npm/dw/head-start.svg)](https://npmjs.org/package/head-start)
[![License](https://img.shields.io/npm/l/head-start.svg)](https://github.com/YizYah/head-start/blob/master/package.json)

[![Geenee](https://img.shields.io/badge/maintained%20by-geenee-brightgreen)](https://npmjs.org/package/geenee)
[![Template](https://img.shields.io/badge/template-ts--packrat-blue)](https://npmjs.org/package/ts-packrat)

# Why
If you want to create (or let others create) a type project multiple times, you probably execute some common commands and install the latest version of several packages.

# What
An engine for executing a startup sequence.  The sequence is specified within a json that includes 
 specify a set of commands that you normally execute.

You can add this to any sequence. 

# How
Install:
```
npm i head-start
```
Then call directly:
```
const createStarter = require('head-start')

const setupSequence = {
  "preCommands": [
    {
      "title": "run git",
      "file": "git",
      "arguments": [
        "init",
        "$codeDir"
      ]
    },
    {
      "title": "create package.json",
      "file": "npm",
      "arguments": [
        "init",
        "-y"
      ],
      "options": {
        "cwd": "$codeDir"
      }
    }
  ],
  "mainInstallation": [
    "@types/node@14.14.19",
    "tslib@2.0.3",
    "typescript@4.1.3",
    "path"
  ],
  "devInstallation": [
    "@typescript-eslint/eslint-plugin@4.12.0",
    "@typescript-eslint/parser@4.12.0",
    "eslint@7.17.0",
    "prettier@2.2.1",
    "nyc@14.1.1",
    "ava",
    "ts-node"
  ]
}

const codeDir = '~/temp/mySample'
const session = {
  "notWin": true,
  "userName": "YizYah",
  "defaultProjectName": "mySample"
}

await createStarter(
  setupSequence, codeDir, session
)
```

## Arguments
* `setupSequence` is a SetupSequence from the Configuration type exposed in [magicalstrings](https://www.npmjs.com/package/magicalstrings#types)
* `codeDir` is the path to the directory to create.  If it exists already, an error is thrown.
* session is a dynamically declared mapping of keys and string values used with [dynamapping](https://www.npmjs.com/package/dynamapping) to replace any instances in `setupSequence`.  Note that `$codeDir` is a special reserved string for the value of `codeDir`.

# Example
It is used inside [geenee](https://www.npmjs.com/package/geenee) templates, where `setupSequence` is including in the `config.yml` file.

[//]: # ( ns__custom_end badges )

[//]: # ( ns__end_section intro )


[//]: # ( ns__start_section api )


[//]: # ( ns__custom_start APIIntro )
# API

[//]: # ( ns__custom_end APIIntro )


[//]: # ( ns__custom_start constantsIntro )
## General Constants and Commands

[//]: # ( ns__custom_end constantsIntro )



[//]: # ( ns__start_section types )


[//]: # ( ns__end_section types )


[//]: # ( ns__end_section api )

