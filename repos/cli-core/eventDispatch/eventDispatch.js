const { Logger } = require('KegLog')
const {
  pipeline,
  isFunc,
  exists,
  noOpObj,
  deepFreeze,
  deepClone,
  isObj
} = require('@keg-hub/jsutils')

class Dispatcher {

  #events = {}
  
  #store = {}

  getStore = (name) => {
    return name ? this.#store[name] : this.#store
  }

  dispatch(name, payload=noOpObj){
    if(!this.#events[name])
      throw new Error(`Can not dispatch event ${name}. Event does not exist`)

    if(!isObj(payload))
      throw new Error(`Can not dispatch event ${name}. The payload must be of type Object`)

    const [final] = pipeline([
      payload,
      deepFreeze(deepClone(payload)),
      deepFreeze(deepClone(this.#store[name]))
    ], ...this.#events[name])

    this.#store[name] = deepFreeze({ ...this.#store[name], ...final })
  }

  register(name, method, initialStore=noOpObj){
    this.#store[name] = { ...(this.#store[name] || noOpObj), ...initialStore }

    this.#events[name] = this.#events[name] || []
    this.#events[name].push(((args) => {
      const response = method(...args)
      if(exists(response)) return [response, args[1], this.#store[name]]

      throw new Error(`Missing response in event ${name}.\nThe Method ${func.name || func} returned undefined.`)
    }))
  }

}

const KegEvent = new Dispatcher()
module.exports = {
  KegEvent
}