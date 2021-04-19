jest.resetModules()
jest.resetAllMocks()
jest.clearAllMocks()

const { fsExtraMock } = require('../../../__mocks__/fsExtraMock')
jest.setMock('fs-extra', fsExtraMock)

const {
  copyFile,
  copySync,
  copyFileSync,
  copyStream,
  emptyDirSync,
  ensureDirSync,
  // TODO: Add tests for below methods
  getFiles,
  getFilesSync,
  getFolders,
  getFoldersSync,
  getFolderContent,
  getFolderContentSync,
  mkDir,
  movePath,
  pathExists,
  pathExistsSync,
  readFile,
  readFileSync,
  removeFile,
  removeFileSync,
  requireFile,
  stat,
  writeFile,
  writeFileSync,
} = require('../fileSys')

describe('fileSys', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('copyFile should call the fs.copyFile method', async () => {
    expect(fsExtraMock.copyFile).not.toHaveBeenCalled()
    await copyFile()
    expect(fsExtraMock.copyFile).toHaveBeenCalled()
  })

  test('copySync should call the fs.copySync method', () => {
    expect(fsExtraMock.copySync).not.toHaveBeenCalled()
    copySync()
    expect(fsExtraMock.copySync).toHaveBeenCalled()
  })

  test('copyFileSync should call the fs.copyFileSync method', () => {
    expect(fsExtraMock.copyFileSync).not.toHaveBeenCalled()
    copyFileSync()
    expect(fsExtraMock.copyFileSync).toHaveBeenCalled()
  })

  test('copyStream should call the fs.createWriteStream and fs.createReadStream methods', () => {
    expect(fsExtraMock.createWriteStream).not.toHaveBeenCalled()
    expect(fsExtraMock.createReadStream).not.toHaveBeenCalled()
    copyStream()
    expect(fsExtraMock.createWriteStream).toHaveBeenCalled()
    expect(fsExtraMock.createReadStream).toHaveBeenCalled()
  })

  test('copyStream should call writeStream.on and readStream.pipe methods', () => {
    expect(fsExtraMock.helpers.writeStream.on).not.toHaveBeenCalled()
    expect(fsExtraMock.helpers.readStream.pipe).not.toHaveBeenCalled()
    copyStream()
    expect(fsExtraMock.helpers.writeStream.on).toHaveBeenCalled()
    expect(fsExtraMock.helpers.readStream.pipe).toHaveBeenCalled()
  })

  test('emptyDirSync should call the fs.emptyDirSync method', () => {
    expect(fsExtraMock.emptyDirSync).not.toHaveBeenCalled()
    emptyDirSync()
    expect(fsExtraMock.emptyDirSync).toHaveBeenCalled()
  })

  test('ensureDirSync should call the fs.ensureDirSync method', () => {
    expect(fsExtraMock.existsSync).not.toHaveBeenCalled()
    expect(fsExtraMock.mkdirSync).not.toHaveBeenCalled()
    ensureDirSync()
    expect(fsExtraMock.existsSync).toHaveBeenCalled()
    expect(fsExtraMock.mkdirSync).toHaveBeenCalled()
  })

})