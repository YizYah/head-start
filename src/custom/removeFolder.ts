const fs = require('fs-extra')

export async function removeFolder(dirPath: string) {
  const pathExists = await fs.pathExists(dirPath)
  if (pathExists) {
    try {
      await fs.remove(dirPath)
      return true
    } catch (error) {
      throw new Error(
          `cannot remove the folder ${dirPath}:
           ${error}`
      )
    }
  }
  return false
}
