const mockData = require('./data')
const {
  dockerData,
  dockerObjLabels,
  dockerOutput
} = mockData

const docker = {
  container: {
    get: jest.fn(container => {
      return dockerData.containers[container] ||
        Object.values(dockerData.containers)
          .reduce((found, data) => {
            return found
              ? found
              : data.id === container || data.image === container || data.name === container
                ? data
                : found
          }, false)
    }),
    exists: jest.fn(container => {
      return Boolean(dockerData.containers[container]) ||
        Object.values(dockerData.containers)
          .find((data) => {
            return data.id === container || data.image === container || data.name === container
          })
    }),
    list: jest.fn(() => {
      return Object.values(dockerData.containers)
    }),
    port: jest.fn((args) => {
      return args.format === 'json'
        ? { '19006': '80' }
        : `19006/tcp -> 0.0.0.0:80`
    }),
    ps: jest.fn((args) => {
      return Object.values(dockerData.containers)
        .filter(container => container.status.indexOf(`Up`) !== 0)
    }),
    inspect: jest.fn(({ container, item }) => {
      const refItem = container || item
      const labels = dockerObjLabels[refItem || `keg-${refItem}`]
      
      return {
        ...dockerData.images[refItem || `keg-${refItem}`],
        config: {
          Labels: labels
        }
      }
    }),
  },
  image: {
    getCmd: jest.fn(async ({ image }) => {
      return dockerOutput.image.getCmd[image]
    }),
    get: jest.fn(imgCheck => {
      const [ image, tag ] = imgCheck.includes(':')
        ? imgCheck.split(':')
        : [ imgCheck ]

      return dockerData.images[image] ||
        Object.values(dockerData.images)
          .find((data) => {
            return data.id === image ||
               data.image === image ||
               data.repository === image ||
               data.rootId === image
          })
    }),
    list: jest.fn(() => {
      return Object.values(dockerData.images)
    }),
    exists: jest.fn(image => {
      return dockerData.images[image] ||
        Object.values(dockerData.images)
          .find((data) => {
            return data.id === image || data.image === image || data.name === image
          })
    }),
    inspect: jest.fn(({ image, item }) => {
      const refItem = image || item
      const labels = dockerObjLabels[refItem || `keg-${refItem}`]
      
      return {
        ...dockerData.images[image || item],
        Config: {
          Labels: labels
        }
      }
    }),
    tag: jest.fn(({ image, log, provider, tag }) => {
    
    }),
  },
  inspect: jest.fn(({ item, type='image' }) => {
    return dockerData.inspect[type][item] || {}
  }),
  isDockerId: jest.fn(toTest => {
    try {
      let parsed = parseInt(toTest, 16).toString(16)
      parsed = toTest[0] === '0' ? `0${parsed}` : parsed

      return Boolean(parsed === toTest) && toTest.length === 12
    }
    catch(err){
      return false
    }
  }),
}

module.exports = {
  ...mockData,
  docker
}
