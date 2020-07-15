const { deepFreeze, deepMerge } = require('@ltipton/jsutils')
const { images } = require('./values')

// TODO: some of these values are duplicated in containers.js
// Need to clean this up at some point
const DEFAULT = {
  VALUES: {
    port: '-p 80:19006 -p 19002:19002',
    clean: '--rm',
    attached: '-it',
    detached: '-d',
  },
  DEFAULTS: {
    port: true,
    attached: true,
    clean: true,
    network: true,
  }
}

// TODO: Inject into the RUN object
// Setup rebuild to work like CONTAINERS property
// This way it will call a method to get the RUN items

module.exports = deepFreeze({
  RUN: images.reduce((data, image) => {
    data[image.toUpperCase()] = deepMerge(DEFAULT, {})

    return data
  }, {})
})