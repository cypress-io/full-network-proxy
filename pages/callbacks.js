const debug = require('debug')('callbacks')

// how to call callbacks across JS contexts

// plain value
function getA () {
  return {
    name: 'foo'
  }
}

const a = getA()
console.log('a.name', a.name) // "foo"

// sync callback
function getB () {
  return {
    name: () => 'b'
  }
}

const b = getB()
console.log('b.name', b.name()) // "b"

// async callback
function getC () {
  return {
    name: () => Promise.resolve('c')
  }
}

const c = getC()
c.name().then(console.log) // 'c

// async callback we CANNOT call directly - instead should go through a message
const getNameD = msg => Promise.resolve('d' + msg)
function callFn (callbackId, ...args) {
  console.log('calling fn with id', callbackId)
  if (args.length) {
    console.log('and args', args)
  }
  const callbacks = {
    getNameD: getNameD
  }
  return callbacks[callbackId](...args)
}

function getD () {
  return {
    // instead of callback, call proxy and give it function id
    name: (...args) => callFn('getNameD', ...args)
  }
}
const d = getD()
d.name(' name').then(console.log) // 'd name'

// special serialize methods
// context 1
const uuid = require('uuid/v4')
const callbacks = {}
const isCallbackMessage = s => s.startsWith('__message-callback')
const toCallbackMessage = key => {
  const id = uuid()
  return ['__message-callback', key, id].join(':')
}
const getCallback = id => {
  console.assert(isCallbackMessage(id), id)
  return callbacks[id]
}
const getCallbackFunction = id => {
  debug('getting callback function from id', id)
  return getCallback(id)
}
const onCall = (id, ...args) => {
  debug('onCall', id)
  const fn = getCallbackFunction(id)
  return fn(...args)
}
// context 2
const setupProxyFunction = id => {
  // TODO go through message passing if needed
  return (...args) => Promise.resolve().then(() => onCall(id, ...args))
}

const serialize = o => {
  const r = {}
  Object.keys(o).forEach(key => {
    if (typeof o[key] === 'function') {
      const id = toCallbackMessage(key)
      callbacks[id] = o[key]
      r[key] = id
    } else {
      r[key] = o[key]
    }
  })
  return JSON.stringify(r, null, 2)
}
const parse = o => {
  const r = {}
  Object.keys(o).forEach(key => {
    if (isCallbackMessage(o[key])) {
      r[key] = setupProxyFunction(o[key])
    } else {
      r[key] = o[key]
    }
  })
  return r
}

// example that goes through serialization
function getE () {
  return {
    name: () => 'e'
  }
}
// our serialize that replaces all callbacks with special ids
const e = serialize(getE())
console.log(e)
console.log('callbacks', callbacks)

// restore puts a proxy method that can send a message to
// call the actual function from its special id
const e1 = parse(JSON.parse(e))
console.log('restored e', e1)
e1.name().then(s => console.log('restored e name:', s)) // e
