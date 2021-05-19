import test from 'ava';
import {CommandSpec, SetupSequence} from 'magicalstrings';
import {DepType} from 'installist';

const Listr = require('listr');
const mock = require('mock-require');

// fakeInteractic
const fakeExecutedInteractions: string[] = []
async function fakeInteractic(commandSpecs: CommandSpec[], codeDir: string) {
    commandSpecs.map((commandSpec: CommandSpec)=>{
        fakeExecutedInteractions.push(commandSpec.file)
    })
}
mock('interactic', fakeInteractic);


// fakeBashFool
const fakeExecutedCommands: string[] = []
const fakeFiles: string[] = []

interface ListrElement {
    title: string;
    task: Function;
}
interface CommandsToListrElements {
    [command: string]: ListrElement;
}
const commandsToListrElements: CommandsToListrElements = {
    git: {
        title: 'run git',
        task: async () => {
            fakeExecutedCommands.push('git')
            fakeFiles.push('.git')
        }
    },
    npm: {
        title: 'run npm init',
        task: async () => {
            fakeExecutedCommands.push('npm init')
            fakeFiles.push('package.json')
        }
    },
    touch: {
        title: 'create temp.txt',
        task: async () => {
            fakeExecutedCommands.push('touch')
            fakeFiles.push('temp.txt')
        }
    },
    error: {
        title: 'will throw error',
        task: async () => {
            fakeExecutedCommands.push('error')
            throw new Error('error during setup')
        }
    },
    else: {
        title: 'unknown command',
        task: async () => {
            fakeExecutedCommands.push('unknown')
        }
    },
}
const fakeBashFool = async (commands: CommandSpec[] | undefined, targetDir: string, session: any) => {
    if (commands === undefined) return;
    const listrItems = commands.map((command: CommandSpec) => {
        let listrElement: any
        if (!command.file) {
            return commandsToListrElements['else']
        }

        listrElement = commandsToListrElements[command.file]
        if (!listrElement) listrElement = commandsToListrElements['else']
        return listrElement
    })
    return new Listr(listrItems)
}
mock('bash-fool', fakeBashFool);

const fakeInstalledMainPackages: string[] = []
const fakeInstalledDevPackages: string[] = []
const fakeInstallist = async (packages: string[], dir: string, depType: DepType) => {
    const listItems = packages.map((packageName: string) => {
        if (packageName.includes('_'))
            return {
                title: 'erring ' + packageName,
                task: async () => {
                    throw new Error(`faulty package name ${packageName}`)
                }
            }
        if (depType===DepType.MAIN) {
            return {
                title: 'fake ' + packageName,
                task: async () => {
                    fakeInstalledMainPackages.push(packageName)
                }
            }
        }
        return {
            title: 'fake ' + packageName,
            task: async () => {
                fakeInstalledDevPackages.push(packageName)
            }
        }

    })
    return new Listr(listItems)
}
mock('installist', {installist: fakeInstallist, DepType});

const {createStarter} = require('../../src/custom/createStarter');

const mockFs = require('mock-fs');
const fs = require('fs-extra');
const path = require('path');

const codeDir = '/tmp/foobar';
const noInstallationDir = '/tmp/noInstallation'

test('erring setup', async t => {
    const erringSetup: SetupSequence = {
        'preCommands': [
            {
                'title': 'error',
                'file': 'error',
                'arguments': [
                    'init',
                    codeDir,
                ],
            },
        ]
    };
    let removeExistingStarter = false;

    console.log(`create without installation follows...`)

    const error = await t.throwsAsync(async () => {
        await createStarter(
            erringSetup,
            noInstallationDir,
            {codeDir: noInstallationDir},
            removeExistingStarter
        );
    });
    t.regex(error.message,/error during setup/)
})

test('createStarter no dev', async t => {

    const noInstallation: SetupSequence = {
    };

    let removeExistingStarter = false;

    await createStarter(
        noInstallation,
        noInstallationDir,
        {codeDir: noInstallationDir},
        removeExistingStarter
    );
    t.is(fakeInstalledDevPackages.length,0)
    t.is(fakeInstalledMainPackages.length,0)

});




test('createStarter interactive', async t => {

    const interactiveSetup: SetupSequence = {
        interactive: [
            {
                title: 'create package.json',
                file: 'npm',
                arguments: [
                    'init',
                ],
                options: {cwd: codeDir},
            },
        ]
    };

    let removeExistingStarter = false;

    await createStarter(
        interactiveSetup,
        noInstallationDir,
        {codeDir: noInstallationDir},
        removeExistingStarter
    );
    t.true(fakeExecutedInteractions.includes('npm'))

    // t.false(await fs.pathExists(noInstallationDir))
});


test('createStarter main installation', async t => {
    const setupSequence: SetupSequence = {
        'preCommands': [
            {
                'title': 'run git',
                'file': 'git',
                'arguments': [
                    'init',
                    codeDir,
                ],
            },
            {
                title: 'create package.json',
                file: 'npm',
                arguments: [
                    'init',
                    '-y',
                ],
                options: {cwd: codeDir},
            },
            {
                'title': 'create file',
                'file': 'touch',
                'arguments': [
                    codeDir + '/temp.txt',
                ],
            },
            // {
            //   'title': 'install magical strings',
            //   'file': 'npm',
            //   'arguments': ['install', '--prefix', codeDir, 'barbells'],
            //   // options: { cwd: codeDir },
            // }
        ],
        'mainInstallation': [
            'barbells',
        ],
        'devInstallation': [
            'cogs-box',
        ],
    };

    console.log(`starting createStarter main test...`)
    const session = {codeDir};

    mockFs({
        [codeDir]: {/* empty directory */},
        'node_modules': mockFs.load(path.resolve(__dirname, '../../node_modules')),
    })


    let removeExistingStarter = false;
    // const installistStub = sinon.stub(installist, 'installist').callsFake(installistFake)

    console.log(`main run...`)
    // await removeFolder(codeDir);
    // t.false(await fs.pathExists(codeDir)); // this is just a sanity check of course

    // if (setupSequence.mainInstallation)
    //     console.log(`${JSON.stringify(fakeInstallist(setupSequence.mainInstallation,'foo'))}`)
    await createStarter(setupSequence, codeDir, session, removeExistingStarter);
    t.true(fakeInstalledMainPackages.includes('barbells'))
    t.false(fakeInstalledDevPackages.includes('barbells'))
    t.true(fakeInstalledDevPackages.includes('cogs-box'))
    t.false(fakeInstalledMainPackages.includes('cogs-box'))

    console.log(`fakeFiles=${JSON.stringify(fakeFiles)}`)
    t.true(fakeFiles.includes('temp.txt'))
    t.true(fakeFiles.includes('.git'))
    // t.true(await fs.pathExists(codeDir));
    // t.true(await fs.pathExists(codeDir + '/temp.txt'));
    // t.true(await fs.pathExists(codeDir + '/.git'));

    // await checkFolder(codeDir);
    // t.false(await fs.pathExists(codeDir));

});


test('erring installation', async t => {
    const erringInstallation: SetupSequence = {
        'mainInstallation': [
            'foo_',
        ],
    };

    console.log(`starting erring installation...`)
    const session = {codeDir};

    let removeExistingStarter = false;
    const tempDir='tempDir'

    mockFs({
        [tempDir]: mockFs.directory({
            items: {
                file1: 'file one content',
            }
        }),
        'node_modules': mockFs.load(path.resolve(__dirname, '../../node_modules')),

    });
    const error = await t.throwsAsync(async () => {
        await createStarter(
            erringInstallation,
            tempDir,
            {codeDir: tempDir},
        );
    });
    t.regex(error.message,/faulty package name/)

});

test('no setup sequence', async t => {
    const session = {codeDir};

    let removeExistingStarter = false;

    const error = await t.throwsAsync(async () => {
        await createStarter(
            null,
            noInstallationDir,
            {codeDir: noInstallationDir},
        );
    });
    t.regex(error.message,/cannot run because/)

});

test('remove folder', async t => {
    const simpleSetup: SetupSequence = {
        'mainInstallation': [
            'barbells',
        ],
    };

    let removeExistingStarter = true;

    mockFs({
        [codeDir]: mockFs.directory({
            items: {
                file1: 'file one content',
                file2: Buffer.from([8, 6, 7, 5, 3, 0, 9])
            }
        }),
        'node_modules': mockFs.load(path.resolve(__dirname, '../../node_modules')),

    });

    t.true(await fs.pathExists(codeDir))
    await createStarter(
        simpleSetup,
        codeDir,
        {codeDir},
        removeExistingStarter
    );
    t.false(await fs.pathExists(codeDir))

    // t.false(await fs.pathExists(noInstallationDir))
});



test.after(t => {
    mock.stop('installist')
    mockFs.restore()
})

