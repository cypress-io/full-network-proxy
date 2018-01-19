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
    cy.visit('index.html')
  })

  it('returns status in callback', () => {
    const status = cy.stub().returns(404).as('status')
    cy.route({
      url: '/app.js',
      status
    })
    cy.visit('index.html')
    cy.get('@status').should('have.been.calledOnce')
  })

  it('gets request object', () => {
    const urls = []
    const status = req => {
      urls.push(req.url)
      return 404
    }

    cy.route({
      url: '/app.js',
      response: 'window.foo = 42',
      status
    })
    cy.route({
      url: '/app.css',
      response: 'body { color: green }',
      status
    })
    cy.visit('index.html')
    cy.then(() => {
      expect(urls).to.include('/app.js').and.to.include('/app.css')
    })
  })

  it('has method, url on request', () => {
    let reqReference
    const status = req => {
      reqReference = req
      return 404
    }
    cy.route({
      url: '/app.js',
      status
    })
    cy.visit('index.html')
    cy.then(() => {
      expect(reqReference).deep.equal({
        method: 'GET',
        url: '/app.js'
      })
    })
  })
})
