
[//]: # ( ns__file unit: standard, comp: README.md )

[//]: # ( ns__custom_start beginning )

[//]: # ( ns__custom_end beginning )

[//]: # ( ns__start_section intro )

[//]: # ( ns__custom_start description )
![](src/custom/images/headstart.gif)
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

<!-- toc -->
* [:clipboard: Why](#clipboard-why)
* [:white_check_mark: What](#white_check_mark-what)
* [:bulb: How](#bulb-how)
* [:wrench: Example](#wrench-example)
* [:zap: Steps to Create a Setup Sequence](#zap-steps-to-create-a-setup-sequence)
* [:heavy_exclamation_mark: API](#heavy_exclamation_mark-api)
<!-- tocstop -->

# <a name="clipboard-why"></a>:clipboard: Why
If you want to create (or let others create) a type project multiple times, you probably execute some common commands and install the latest version of several packages.

In effect, you create a "placeholder" builder for whatever type of app you are templating.  You can think of it as the equivalent of what `create-react-app` is for a React application.

# <a name="white_check_mark-what"></a>:white_check_mark: What
An engine for executing a startup sequence.  The sequence is specified within a json that includes 
 specify a set of commands that you normally execute.

You can add this to any sequence. 

# <a name="bulb-how"></a>:bulb: How
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

# <a name="wrench-example"></a>:wrench: Example
It is used inside [geenee](https://www.npmjs.com/package/geenee) templates, where `setupSequence` is including in the `config.yml` file.

# <a name="zap-steps-to-create-a-setup-sequence"></a> :zap:Steps to Create a Setup Sequence

---
 **_Note_**  You can use [copykat](https://www.npmjs.com/package/copykat) to guide you through the process of creating a full [geenee](https://www.npmjs.com/package/geenee) template, including the the startup sequence.  You can even do that and then copy the `startupSequence` from the config.yml file of the generated template.

---

See the [config file for the sample template](https://github.com/YizYah/basicNsFrontTemplate/blob/master/config.yml) as a model.

There are four keys under `setupSequence`:
1. `interactive`

2. `preCommands`

3. `mainInstallation`

4. `devInstallation`

Each is discussed in its own section.

## **`interactive`**
You may start the process of generating code by running any number of interactive programs. These can even be bash scripts included in your template file.  You specify a list, and they get executed in the same order.  For each, provide:

* `file` the name of the command or bash script that you want to execute.  (Note: `npx` is usually the best option for a released package.  That lets you get the latest version and removes the need for a template user to have something installed globally. So, rather than running `oclif`, you would run `npx` and make `oclif` the first argument)

* `arguments` the list of arguments passed into the command.  These are strings.

  There is currently one general variable that you can use in `arguments`: `$codeDir`.  The value of `$codeDir` is whatever the name of the code base that gets passed by the user to `ns generate`.

* `options` an optional list of the options for [child_process](https://nodejs.org/api/child_process.html).

An example of an `interactive` entry would be this:

```handlebars
setupSequence:
    ...
    interactive:
       - file: npx
         arguments:
           - oclif
           - multi
           - $codeDir
``` 

This list consists of a single command--running `oclif` using `npx`.  The name that gets passed to oclif as an argument should be replaced by the name of your `$SAMPLE` code.

All of the `interactive` list will be executed in order.  The user will have the opportunity to insert anything needed as prompted.

**_Note_** It is actually better to insert any command that is *not* interactive [that executes without user interactions] under `precommands` as specified below.  It is better to have multiple templates that leave as little as possible up to the user running `ns generate`.  The only reason for `interactive` is that some programs do not allow you to specify options programmatically, so you have to run them interactively.

##  **`preCommands`**
This is a list of *un*interactive files or programs that get executed automatically in the order that you place them.
* A `title` will show up when your template user watches the progress from the command prompt.
* The same 3 keys shown in `interactive` above: `file`, `arguments` and perhaps `options`.

The purpose of `preCommands` is to run tools like `createReactApp`.  Note that you could create a bash script, stored in your template directory, to execute.  So you have the ability to run whatever sequence you like.

## **`mainInstallation`**
This is an array of packages that get installed by `npm`. See the [sample config file](https://github.com/YizYah/basicNsFrontTemplate/blob/master/config.yml).

## **`devInstallation`**
An array of packages that get installed by `npm` for dev.

Again, see the [sample config file](https://github.com/YizYah/basicNsFrontTemplate/blob/master/config.yml).

## Leaving Versions Dynamic
A big goal of `geenee` is to let you have the latest of everything in your stack, so we encourage this approach rather than providing a hardcoded `package.json` file. On the debit side, you need to be sure to update any code if conflicts arise with the latest versions of packages used.

If need be, you can of course hardcode the version of a package listed in `mainInstallation` or
`devInstallation`, e.g. `'@apollo/react-hoc@3.1.5'` in the [config file for the sample template](https://github.com/YizYah/basicNsFrontTemplate/blob/master/config.yml).


[//]: # ( ns__custom_end badges )

[//]: # ( ns__end_section intro )


[//]: # ( ns__start_section api )


[//]: # ( ns__custom_start APIIntro )
# <a name="heavy_exclamation_mark-api"></a>:heavy_exclamation_mark: API

[//]: # ( ns__custom_end APIIntro )


[//]: # ( ns__custom_start constantsIntro )
## General Constants and Commands

[//]: # ( ns__custom_end constantsIntro )



[//]: # ( ns__start_section types )


[//]: # ( ns__end_section types )


[//]: # ( ns__end_section api )

