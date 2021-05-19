import {SetupSequence} from 'magicalstrings';
const del = require('del');
const installistModule = require('installist');
import {DepType} from 'installist';
const {installist} = installistModule;
const bashFool = require('bash-fool');
const Listr = require('listr');
const interactiveSequence = require('interactic')

const {docPages, links} = require('magicalstrings').constants

export async function createStarter(
    setupSequence: SetupSequence,
    starterDir: string,
    session: any,
    removeExistingStarter = true
) {
    if (!setupSequence) throw new Error('\'generate\' cannot run because ' +
        '\'setupSequence\' is undefined in the config of the template.' +
        ` See ${links.DOCUMENTATION}/${docPages.SETUP}.`)

    const {mainInstallation, devInstallation, preCommands, interactive} = setupSequence

    if (removeExistingStarter) await del([starterDir], {force: true})//removeFolder(starterDir)
    if (interactive) await interactiveSequence(interactive, starterDir)

    const starterCreationTaskList = [
        {
            title: 'Execute Pre-Commands',
            task: async () => {
                return bashFool(preCommands, starterDir, session);
            },
        },
    ]

    const dependenciesInstallationTasks = [
        {
            title: 'Install General Packages...',
            task: async () => {
                if (mainInstallation===undefined) return
                const mainList = await installist(mainInstallation, starterDir, DepType.MAIN)
                return mainList
            },
        },
        {
            title: 'Install Dev Packages...',
            task: async () => {
                if (devInstallation===undefined) return
                return installist(devInstallation, starterDir, DepType.DEV)
            },
        },
    ]

    const installDependencies = new Listr(dependenciesInstallationTasks)
    const setup = new Listr(starterCreationTaskList)
    try {
        await setup.run()
    } catch (error) {
        throw new Error(`cannot run setup at ${starterDir}: ${error}`)
    }

    try {
        await installDependencies.run()
    } catch (error) {
        throw new Error(`cannot install dependencies at ${starterDir}: ${error}`)
    }
}
