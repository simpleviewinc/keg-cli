const fs = require('fs')
const path = require('path')

/**
 * Copy a file from one location to another
 * @function
 * @param {*} oldPath - Copy from location
 * @param {*} newPath - Copy to location
 *
 * @returns {Promise|*} - Success response of fs.rename method
 */
const movePath = (oldPath, newPath) => {
  return new Promise((res, rej) => {
    fs.rename(oldPath, newPath, (err, success) => err ? rej(err) : res(success))
  })
}

/**
 * Makes a directory at the passed in folderPath
 * @function
 * @param {string} folderPath - Folder path to create
 *
 * @returns {Promise|boolean} - Success creating the directory
 */
const mkDir = filePath => {
  return new Promise((res, rej) => {
    fs.mkdir(filePath, { recursive: true }, err => {
      err ? rej(err) : res(true)
    })
  })
}

/**
 * Writes a file to the local HHD
 * @function
 * @param {string} filePath - Path to where the file should be written
 * @param {*} data - Contents to be written to the file
 * @param {string} [format=utf8] - Format of the file
 *
 * @returns {Promise|boolean} - True if the file was written successfully
 */
const writeFile = (filePath, data, format='utf8') => {
  return new Promise((res, rej) => {
    // Write the temp config file
    fs.writeFile(filePath, data, format, (err) => err ? rej(err) : res(true))
  })
}

/**
 * Writes a file to the local HHD synchronously
 * @function
 * @param {string} filePath - Path to where the file should be written
 * @param {*} data - Contents to be written to the file
 * @param {string} [format=utf8] - Format of the file
 *
 * @returns {Promise|boolean} - True if the file was written successfully
 */
const writeFileSync = (filePath, data, format='utf8') => {
  return fs.writeFileSync(filePath, data, format)
}

/**
 * Gets the content of a folder based on passed in options
 * @function
 * @param {string} fromPath - Path to get the content from
 * @param {Object} [opts={}] - Options for filtering the found contnet
 * @param {boolean} opts.full - Should return the full path
 * @param {string} opts.type - Type of content to return (folder || file)
 *
 * @returns {Promise|Array} - Array of found items
 */
const getFolderContent = async (fromPath, opts={}) => {

  const { full, type } = opts
  const allContent = await fs.readdir(fromPath)

  return Promise.all(
    allFiles.reduce(async (allFound, file) => {

      // Check if we should use the full path
      const found = full ? path.join(fromPath, file) : file

      // If no type, then add and return
      if(!type) return allFound.concat([ found ])
      
      // Check if the path is a directory
      const isDir = await fs.stat(found).isDirectory()

      // Check the type and return based on type
      return (type === 'folder' && isDir) || (type !== 'folder' && !isDir)
        ? allFound.concat([ found ])
        : allFound

    }, [])
  )

}

/**
 * Gets all files in a directory path
 * @function
 * @param {string} fromPath - Path to find the folders in
 * @param {boolean} full - Should return the full path
 *
 * @returns {Array} - All files found in the path
 */
const getFiles = (fromPath, full=false) => {
  return getFolderContent(fromPath, { type: 'file', full })
}

/**
 * Gets all folders in a directory path
 * @function
 * @param {string} fromPath - Path to find the folders in
 * @param {boolean} full - Should return the full path
 *
 * @returns {Array} - All folders found in the path
 */
const getFolders = (fromPath, full=false) => {
  return getFolderContent(fromPath, { type: 'folder', full })
}

/**
 * Gets all folders in a directory path synchronously
 * @function
 * @param {string} fromPath - Path to find the folders in
 *
 * @returns {Array} - All folders found in the path
 */
const getFoldersSync = fromPath => {
  return fs.readdirSync(fromPath)
    .filter(f => fs.statSync(path.join(fromPath, f)).isDirectory())
}

/**
 * Gets all files in a directory path synchronously
 * @function
 * @param {string} fromPath - Path to find the files in
 *
 * @returns {Array} - All files found in the path
 */
const getFilesSync = fromPath => {
  return fs.readdirSync(fromPath)
    .filter(f => !fs.statSync(path.join(fromPath, f)).isDirectory())
}

/**
 * Checks if a file path exists on the local HHD
 * @function
 * @param {string} checkPath - Path to check if exists
 *
 * @returns {Promise|boolean} - True if the path exists, false if not
 */
const pathExists = checkPath => {
  return new Promise((res, rej) => {
    return res(fs.existsSync(checkPath))
  })
}

/**
 * Checks if a file path exists on the local HHD
 * @function
 * @param {string} checkPath - Path to check if exists
 *
 * @returns {Promise|boolean} - True if the path exists, false if not
 */
const pathExistsSync = checkPath => fs.existsSync(checkPath)

/**
 * Reads a file from local HHD, and returns the contents
 * @function
 * @param {string} filePath - Path of the file to read
 * @param {string} [format=utf8] - Format of the file
 *
 * @returns {Promise|string} - Content of the file
 */
const readFile = (filePath, format='utf8') => {
  return new Promise((res, rej) => {
    fs.readFile(filePath, format, (err, data) => {
      err ? rej(err) : res(data)
    })
  })
}

/**
 * Reads a file from local HHD, and returns the contents synchronously
 * @function
 * @param {string} filePath - Path of the file to read
 * @param {string} [format=utf8] - Format of the file
 *
 * @returns {Promise|string} - Content of the file
 */
const readFileSync = (filePath, format='utf8') => {
  return fs.readFileSync(filePath, format='utf8')
}

/**
 * Copies from one file path to another
 * @function
 * @param {string} from - Path to copy from
 * @param {string} to - Path to copy to
 * @param {string} [format=utf8] - Format of the file
 *
 * @returns {void} - Content of the file
 */
const copyStream = (from, to, format='utf8') => {
  return fs.createReadStream(from, { encoding: format }).pipe(fs.createWriteStream(to))
}

module.exports = {
  copyStream,
  getFiles,
  getFilesSync,
  getFolders,
  getFoldersSync,
  getFolderContent,
  mkDir,
  movePath,
  pathExists,
  pathExistsSync,
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
}