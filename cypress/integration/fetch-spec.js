/* eslint-env mocha */
/* global cy */
describe('window.fetch', () => {
  beforeEach(() => {
    // force collecting network rules
    cy.server()
  })

  it('stubs cross-domain fetch', () => {
    cy.route({
      url: '/users?_limit=3',
      response: [1, 2, 3],
      headers: {
        'access-control-allow-origin': '*'
      }
    })
    cy.visit('has-fetch.html')
  })
})
