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

  it('delays returned script', () => {
    cy.route({
      url: '/app.js',
      response: 'window.foo = 42',
      delay: 1000
    })
    cy.visit('index.html')
    cy.window().its('foo').should('equal', 42)
  })
  // it('first', () => {
  //   cy.route('foo', 404)
  // })
  // it('second', () => {
  //   cy.route('POST', 'bar', [])
  // })
})
