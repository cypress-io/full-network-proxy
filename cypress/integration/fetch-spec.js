/* eslint-env mocha */
/* global cy, expect */
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

  it('stubs fetch with alias', () => {
    cy
      .route({
        url: '/users?_limit=3',
        response: [1, 2, 3],
        headers: {
          'access-control-allow-origin': '*'
        }
      })
      .as('users')
    cy.visit('has-fetch.html')
  })

  it('returns mock data', () => {
    cy
      .route({
        url: '/users?_limit=3',
        response: [1, 2, 3],
        headers: {
          'access-control-allow-origin': '*'
        }
      })
      .as('users')
    cy.visit('has-fetch.html')
  })

  it.skip('allows inspecting response', () => {
    cy
      .route({
        url: '/users?_limit=3',
        response: [1, 2, 3],
        headers: {
          'access-control-allow-origin': '*'
        }
      })
      .as('users')
    cy.visit('has-fetch.html')
    cy.get('@users').its('response.body').should('have.length', 3)
  })

  it('returns data based on response', () => {
    let req
    cy
      .route({
        url: '/users?_limit=3',
        response: r => {
          req = r
          return [1, 2, 3]
        },
        headers: {
          'access-control-allow-origin': '*'
        }
      })
      .as('users')
    cy.visit('has-fetch.html')
    cy.wait('@users').then(() => {
      expect(req).to.deep.equal({
        method: 'GET',
        url: '/users?_limit=3'
      })
    })
  })
})
