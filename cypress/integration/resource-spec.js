/* eslint-env mocha */
/* global cy, expect */
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

  it('sets headers in callback', () => {
    let wasCalled = false
    cy.route({
      url: '/app.css',
      response: 'body { color: green }',
      headers: () => {
        wasCalled = true
        return {
          'content-type': 'text/css; charset=UTF-8'
        }
      }
    })
    cy.visit('index.html')
    cy.contains('nothing').should('have.css', 'color', 'rgb(0, 128, 0)')
    cy.then(() => {
      // eslint-disable-next-line no-unused-expressions
      expect(wasCalled).to.be.true
    })
  })

  it('sets headers in callback based on request', () => {
    const urls = []
    const headers = req => {
      urls.push(req.url)
    }

    cy.route({
      url: '/app.js',
      response: 'window.foo = 42',
      headers
    })
    cy.route({
      url: '/app.css',
      response: 'body { color: green }',
      headers
    })
    cy.visit('index.html')
    cy.then(() => {
      expect(urls).to.include('/app.js').and.to.include('/app.css')
    })
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
