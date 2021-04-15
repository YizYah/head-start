import {installDevPackagesTaskList} from './setup/installDevPackagesTaskList'
import {SetupSequence} from 'magicalstrings'
import {installMainPackagesTaskList} from './setup/installMainPackagesTaskList'
import {preCommandsTaskList} from './setup/preCommandsTaskList'
import {interactiveSequence} from './setup/interactiveSequence'
import {checkFolder} from './checkFolder'

const {docPages, links} = require('magicalstrings').constants
const Listr = require('listr')

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

  if (removeExistingStarter) await checkFolder(starterDir)
  if (interactive) await interactiveSequence(interactive, starterDir)

  const starterCreationTaskList = [
    {
      title: 'Execute Pre-Commands',
      task: async () => {
        if (!preCommands) return
        const preCommandsTasks = preCommandsTaskList(
          preCommands, starterDir, session
        ).filter(x => x !== null)

        return new Listr(preCommandsTasks)
      },
    },
  ]

  const dependenciesInstallationTasks = [
    {
      title: 'Install General Packages...',
      task: async () => {
        if (!mainInstallation) return
        return new Listr(installMainPackagesTaskList(mainInstallation, starterDir))
      },
    },
    {
      title: 'Install Dev Packages...',
      task: async () => {
        if (!devInstallation) return
        return new Listr(installDevPackagesTaskList(devInstallation, starterDir))
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
