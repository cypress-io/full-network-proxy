/* eslint-env mocha */
/* global cy, expect */
describe('Response status', () => {
  beforeEach(() => {
    // force collecting network rules
    cy.server()
  })

  it('sets constant status', () => {
    cy.route({
      url: '/app.js',
      response: '',
      status: 404
    })
    cy.visit('pages/index.html')
  })

  it.skip('can inspect every request', () => {
    const name = '/app.js'
    cy.route({
      // notice that we have omitted "url" parameter
      // we want to inspect _every_ request
      status: req => {
        if (req.url === name) {
          return 404
        }
      }
    })
    cy.visit('pages/index.html')
  })

  // note: this and other tests for example work in isolation
  // but fail when working together, I think we are not resetting the
  // proxy state correctly between the tests.
  it.skip('uses variable outside of the callback', () => {
    const name = '/pages/app.js'
    cy
      .route({
        url: '/pages/app.js',
        status: req => {
          if (req.url === name) {
            return 404
          }
        }
      })
      .as('app')
    cy.visit('pages/index.html')
    // note how we force response check AFTER cy.visit() completes
    // by using cy.then ...
    cy.then(() => {
      cy.get('@app').its('response.status').should('be.equal', 404)
    })
  })

  it.skip('allows inspecting status of the response alias', () => {
    const name = '/pages/app.js'
    cy
      .route({
        url: '/pages/app.js',
        status: req => {
          if (req.url === name) {
            return 404
          }
        }
      })
      .as('app')
    cy.visit('pages/index.html')
    // notice that "@app" is null initially!
    // but we want to get the route response.status and assert that it was 404
    cy.get('@app').its('status').should('be.equal', 404)
  })

  it('returns status in callback', () => {
    const status = cy.stub().returns(404).as('status')
    cy.route({
      url: '/pages/app.js',
      status
    })
    cy.visit('pages/index.html')
    cy.get('@status').should('have.been.calledOnce')
  })

  it('gets request object', () => {
    const urls = []
    const status = req => {
      urls.push(req.url)
      return 404
    }

    cy.route({
      url: '/pages/app.js',
      response: 'window.foo = 42',
      status
    })
    cy.route({
      url: '/pages/app.css',
      response: 'body { color: green }',
      status
    })
    cy.visit('pages/index.html')
    cy.then(() => {
      expect(urls).to.include('/pages/app.js').and.to.include('/pages/app.css')
    })
  })

  it('has method, url on request', () => {
    let reqReference
    const status = req => {
      reqReference = req
      return 404
    }
    cy.route({
      url: '/pages/app.js',
      status
    })
    cy.visit('pages/index.html')
    cy.then(() => {
      expect(reqReference).deep.equal({
        method: 'GET',
        url: '/pages/app.js'
      })
    })
  })
})
