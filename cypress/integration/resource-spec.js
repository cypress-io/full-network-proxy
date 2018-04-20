const sanitizeHtml = require("sanitize-html")

/* eslint-env mocha */
/* global cy, expect */
describe("Stubbing static resources", () => {
  beforeEach(() => {
    // force collecting network rules
    cy.server()
  })

  it.skip("can spy on a resource")

  it.skip("detects if the script has not been loaded", () => {
    // cy.route({
    //   url: "/not-found.js",
    //   status: undefined
    // })
    // TODO spy on a resource "not-found.js"
    // and make an assertion that it returns 404
    // https://github.com/cypress-io/traffic-rules-demo/issues/1
    cy.visit("missing-resource.html")
  })

  it("can mock the index.html itself", () => {
    const mock = `
    <head>
      <script>document.domain = 'localhost';
      var Cypress = window.Cypress = parent.Cypress;
      Cypress.action('app:window:before:load', window);
      </script>
    </head>
    <p>hi there</p>
    `
    cy.route("/index.html", mock)
    cy.visit("index.html")
    cy.contains("hi there")
    // TODO maybe allow mocking even the "index.html" itself ...
    // https://github.com/cypress-io/traffic-rules-demo/issues/2
  })

  it.only("can modify index.html", () => {
    const mock = `
    <head>
      <script>document.domain = 'localhost';
      var Cypress = window.Cypress = parent.Cypress;
      Cypress.action('app:window:before:load', window);
      </script>
    </head>
    <p>hi there</p>
    `
    cy.route({
      url: "/has-scripts.html",
      response: r => {
        // TODO need actual response body!
        console.log(sanitizeHtml("<a onerror=alert('img') href='foo'>go</a>"))
        console.log(r)
        return r
      }
    })
    cy.visit("has-scripts.html")
    // https://github.com/cypress-io/traffic-rules-demo/issues/3
  })

  it("runs mock app.js script", () => {
    cy.route("/app.js", "window.foo = 42")
    cy.visit("index.html")
    cy
      .window()
      .its("foo")
      .should("equal", 42)
  })

  it("mocks app.css", () => {
    cy.route({
      url: "/app.css",
      response: "body { color: red }",
      headers: {
        "content-type": "text/css; charset=UTF-8"
      }
    })
    cy.visit("index.html")
    cy.contains("nothing").should("have.css", "color", "rgb(255, 0, 0)")
  })

  it("sets headers in callback", () => {
    let wasCalled = false
    cy.route({
      url: "/app.css",
      response: "body { color: green }",
      headers: () => {
        wasCalled = true
        return {
          "content-type": "text/css; charset=UTF-8"
        }
      }
    })
    cy.visit("index.html")
    cy.contains("nothing").should("have.css", "color", "rgb(0, 128, 0)")
    cy.then(() => {
      // eslint-disable-next-line no-unused-expressions
      expect(wasCalled).to.be.true
    })
  })

  it("sets headers in callback based on request", () => {
    const urls = []
    const headers = req => {
      urls.push(req.url)
    }

    cy.route({
      url: "/app.js",
      response: "window.foo = 42",
      headers
    })
    cy.route({
      url: "/app.css",
      response: "body { color: green }",
      headers
    })
    cy.visit("index.html")
    cy.then(() => {
      expect(urls)
        .to.include("/app.js")
        .and.to.include("/app.css")
    })
  })

  it("returns script with headers", () => {
    cy.route({
      method: "GET",
      url: "/app.js",
      response: "window.foo = 42",
      headers: {
        "Content-Type": "application/javascript"
      }
    })
    cy.visit("index.html")
    cy
      .window()
      .its("foo")
      .should("equal", 42)
  })

  it("applies last matching rule", () => {
    cy.route({
      url: "/app.js",
      response: "window.foo = 1"
    })
    cy.route({
      url: "/app.js",
      response: "window.foo = 2"
    })
    cy.route({
      url: "/app.js",
      response: "window.foo = 3"
    })
    cy.visit("index.html")
    cy
      .window()
      .its("foo")
      .should("equal", 3)
  })
})
