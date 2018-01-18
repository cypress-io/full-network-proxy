/* eslint-env mocha */
/* global cy */
describe('Network traffic rules', () => {
  beforeEach(() => {
    // force collecting network rules
    cy.server()
  })

  it('runs mock app.js script', () => {
    cy.route('/app.js', 'window.foo = 42')
    cy.visit('index.html')
    cy.window().its('foo').should('equal', 42)
  })

  it('mocks app.css', () => {
    cy.route({
      url: '/app.css',
      response: 'body { color: red }',
      headers: {
        'content-type': 'text/css; charset=UTF-8'
      }
    })
    cy.visit('index.html')
    cy.contains('nothing').should('have.css', 'color', 'rgb(255, 0, 0)')
  })

  it('returns script with headers', () => {
    cy.route({
      method: 'GET',
      url: '/app.js',
      response: 'window.foo = 42',
      headers: {
        'Content-Type': 'application/javascript'
      }
    })
    cy.visit('index.html')
    cy.window().its('foo').should('equal', 42)
  })

  it('applies last matching rule', () => {
    cy.route({
      url: '/app.js',
      response: 'window.foo = 1'
    })
    cy.route({
      url: '/app.js',
      response: 'window.foo = 2'
    })
    cy.route({
      url: '/app.js',
      response: 'window.foo = 3'
    })
    cy.visit('index.html')
    cy.window().its('foo').should('equal', 3)
  })

  context('delay', () => {
    it('by constant period', () => {
      const timings = {
        started: +new Date(),
        elapsed: 0
      }
      cy.route({
        url: '/app.js',
        response: 'window.foo = 42',
        delay: 1000
      })
      cy.visit('index.html')
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
        url: '/app.js',
        response: 'window.foo = 42',
        delay: () => {
          console.log('returning delay of 500ms')
          return 500
        }
      })
      cy.visit('index.html')
      cy.window().its('foo').should('equal', 42).then(() => {
        const finished = +new Date()
        timings.elapsed = finished - timings.started
        console.log('computed elapsed', timings.elapsed)
      })
      cy.wrap(timings).its('elapsed').should('be.gt', 500)
    })
  })

  // it('first', () => {
  //   cy.route('foo', 404)
  // })
  // it('second', () => {
  //   cy.route('POST', 'bar', [])
  // })
})
