/* eslint-env mocha */
/* global cy */
describe('XHR', () => {
  beforeEach(() => {
    // force collecting network rules
    cy.server()
  })

  it('allows inspecting response', () => {
    cy
      .route({
        url: '/users',
        response: [1, 2, 3]
      })
      .as('users')
    cy.visit('pages/has-xhr.html')
    cy.wait('@users').its('response.body').should('have.length', 3)
  })
})
