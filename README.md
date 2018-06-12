This is a demo repo with Cypress Specs showing features of the new network layer stubbing.

See Cypress issue [#687](https://github.com/cypress-io/cypress/issues/687) and pull request [#1563](https://github.com/cypress-io/cypress/pull/1563/)

## Main idea

Allow tests to specify values or callback functions that modify request and response objects. For example to reject a response to `GET /app.js` with 500 code one could simply do

```js
cy.route({
  url: "/app.js",
  status: 500
})
cy.visit("index.html")
```

Tests can have additional logic to inspect the request object (or maybe response as well?) using a callback function

```js
const name = "/app.js"
cy.route({
  status: req => {
    if (req.url === name) {
      // returned value is defined should be the status
      return 404
    }
    // otherwise let the request go through
  }
})
```

Notice that a callback function _is allowed to use variables in its parent scope_, like `name` here. Thus even as we "ship" callback functions from the browser into the proxy layer of Cypress, we need to handle this correctly.

## Organization

This repo shows different types of tests as if a "normal" user would write them. Thus there are a few example pages the [/pages](/pages) folder. There are different spec files showing different working features

- [custom delays](cypress/integration/delay-spec.js)
- [stubbed `fetch`](cypress/integration/fetch-spec.js)
- [stubbing static resources like stylesheets](cypress/integration/resource-spec.js)
- [custom response statuses](cypress/integration/status-spec.js)
- [XHR stubbing](cypress/integration/xhr-spec.js)
