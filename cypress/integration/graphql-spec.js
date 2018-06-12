/* eslint-env mocha */
/* global cy */
describe('Delay', () => {
  beforeEach(() => {
    // force collecting network rules
    cy.server()
    // GraphiQL is enabled at the port 3000
    cy.visit('http://localhost:3000')
  })

  it('stubs a POST with GraphQL response', () => {
    const post = { id: '1', title: 'Lorem Ipsum', views: 254, user_id: '123' }
    cy.route({
      method: 'POST',
      url: '/?',
      response: {
        data: {
          Post: post
        }
      }
    })
    cy.get('.execute-button').click()
    cy.contains('.result-window', '"Lorem Ipsum"')
  })
})
