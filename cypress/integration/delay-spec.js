/* eslint-env mocha */
/* global cy */
describe('Delay', () => {
  beforeEach(() => {
    // force collecting network rules
    cy.server()
  })
  it('by constant period', () => {
    const timings = {
      started: +new Date(),
      elapsed: 0
    }
    cy.route({
      url: '/pages/app.js',
      response: 'window.foo = 42',
      delay: 1000
    })
    cy.visit('pages/index.html')
    cy.window().its('foo').should('equal', 42).then(() => {
      const finished = +new Date()
      timings.elapsed = finished - timings.started
    })
    cy.wrap(timings).its('elapsed').should('be.gt', 1000)
  })

  it('by callback returning constant period', () => {
    const timings = {
      started: +new Date(),
      elapsed: 0
    }
    cy.route({
      url: '/pages/app.js',
      response: 'window.foo = 42',
      delay: () => {
        console.log('returning delay of 500ms')
        return 500
      }
    })
    cy.visit('pages/index.html')
    cy.window().its('foo').should('equal', 42).then(() => {
      const finished = +new Date()
      timings.elapsed = finished - timings.started
      console.log('computed elapsed', timings.elapsed)
    })
    cy.wrap(timings).its('elapsed').should('be.gt', 500)
  })

  it('by taking request into account', () => {
    const delay = req => {
      console.log('returning delay for request', req)
      return req.url === '/app.js' ? 500 : 100
    }
    cy.route({
      url: '/pages/app.js',
      response: 'window.foo = 42',
      delay
    })
    cy.route({
      url: '/pages/app.css',
      response: 'body { color: red }',
      headers: {
        'content-type': 'text/css; charset=UTF-8'
      },
      delay
    })
    cy.visit('pages/index.html')
  })
})
