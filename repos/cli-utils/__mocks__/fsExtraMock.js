
const fsCallback = (...args) => {
  const callback = args.pop()
  typeof callback === 'function' && callback()
}

const writeStream = { on: jest.fn() }
const readStream = { pipe: jest.fn() }

const fsExtraMock = {
  rename: jest.fn(),
  mkdir: jest.fn(),
  mkdirSync: jest.fn(),
  writeFile: jest.fn(),
  writeFileSync: jest.fn(),
  readdir: jest.fn(),
  readdirSync: jest.fn(),
  stat: jest.fn(),
  statSync: jest.fn(),
  access: jest.fn(),
  constants: jest.fn(),
  existsSync: jest.fn(),
  readFile: jest.fn(),
  readFileSync: jest.fn(),
  createWriteStream: jest.fn(() => writeStream),
  createReadStream: jest.fn(() => readStream),
  copyFile: jest.fn(fsCallback),
  copyFileSync: jest.fn(),
  unlink: jest.fn(),
  unlinkSync: jest.fn(),
  copySync: jest.fn(),
  emptyDirSync: jest.fn(),
  helpers: {
    readStream,
    writeStream,
  }
}

module.exports = {
  fsExtraMock
}