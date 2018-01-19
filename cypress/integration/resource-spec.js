/* eslint-env mocha */
/* global cy */
describe('Stubbing static resources', () => {
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
})
