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
