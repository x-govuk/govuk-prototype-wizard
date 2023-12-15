# GOV.UK Prototype Wizard · [![test](https://github.com/x-govuk/govuk-prototype-wizard/actions/workflows/test.yml/badge.svg)](https://github.com/x-govuk/govuk-prototype-wizard/actions/workflows/test.yml)

Build and iterate ‘one thing per page’ user journeys when prototyping GOV.UK services.

Use it with the [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk/docs/).

## Requirements

Node.js v18 or later.

## Installation

```shell
npm install @x-govuk/govuk-prototype-wizard
```

## Usage

The `wizard` helper takes two parameters:

1. A journey object, which defines the default user journey and any branching rules
2. The express request object (`req`)

It returns a `paths` object with paths for the next, back and the current pages. Any query parameters are kept.

For the following journey:

```js
const journey = {
  '/': {},
  '/name': {},
  '/where-do-you-live': {},
  '/nationality': {},
  '/check-answers': {},
  '/confirm': {}
}

wizard(journey, req)
```

If the request was made from `/nationality`, the helper returns:

```js
{
  back: '/where-do-you-live',
  current: '/nationality',
  next: '/check-answers'
}
```

### Forking a journey

By default a user will progress through the journey in the order set out.

You can fork from that journey by giving a list of paths and conditions – if the conditions are met the user will follow the fork.

```js
{
  '/path': {
    // Redirect if session.data.key equals 'Some value'
    '/path-to-fork-to': { data: 'key', value: 'Some value' },

    // Redirect if session.data.key is in the given array
    '/path-to-fork-to': { data: 'key', values: ['A value', 'Another value'] },

    // Redirect if session.data.key does not equal 'Some value'
    '/path-to-fork-to': { data: 'key', excludedValue: 'Some value' },

    // Redirect if session.data.key is not in the given array
    '/path-to-fork-to': { data: 'key', excludedValues: ['A value', 'Another value'] },

    // Redirect if the given function evaluates to true
    '/path-to-fork-to': () => {
      return req.session.data.key == 'Something else'
    },

    // Shorthand
    '/path-to-fork-to': () => req.session.data.key == 'Something else',

    // Always redirect
    '/path-to-fork-to': true
  }
}
```

Each path can have multiple forks, they are evaluated in order – the user will be redirected to the first page that meets the conditions.

```js
{
  // Go to different pages based on the country chosen
  '/pick-a-country': {
    '/scotland': { data: 'country', value: 'Scotland' },
    '/wales': { data: 'country', value: 'Wales' },
    '/ireland': { data: 'country', values: ['Ireland', 'Northern Ireland'] },
    '/asia': () => isCountryInAsia(data),
    '/other-countries': true
  }
}
```

## An example

In this example we:

- ask the user their name
- ask if they have a National Insurance number, then:
  - skip the ‘What is your National Insurance number?’ question if they do not have a number
  - continue to the ‘What is your National Insurance number?’ question if they do
- ask for their email address

```js
{
  '/name': {},
  '/do-you-have-a-national-insurance-number': {
    '/email': { data: 'have-nino', value: 'No' }
  },
  '/what-is-your-national-insurance-number': {},
  '/email': {}
}
```

## How to get a wizard working

### Create a user journey

```js
const wizard = require('@x-govuk/govuk-prototype-wizard')
const exampleWizard = (req) => {
  const journey = {
    '/wizard/start': {},
    '/wizard/email': {},
    '/wizard/name': {},
    '/wizard/where-do-you-live': {},
    '/wizard/nationality': {},
    '/wizard/check-answers': {},
    '/wizard/confirm': {}
  }
  return wizard(journey, req)
}
module.exports = exampleWizard
```

### Set up the routes

1. Make the paths available in the view using routes
2. Post each form back to itself, evaluate the paths and redirect to the calculated next page

```js
const exampleWizard = require('example-wizard.js')

router.all('/wizard/:view', (req, res, next) => {
  res.locals.paths = exampleWizard(req)
  next()
})

router.post('/wizard/:view', (req, res) => {
  res.redirect(res.locals.paths.next)
})
```

### Use a layout which uses the paths object

An example Nunjucks layout extending the default GOV.UK layout:

```njk
{% extends "layout.html" %}
{% block pageNavigation %}
  {{ govukBackLink({
    href: paths.back
  }) }}
{% endblock %}

{% block content %}
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <form method="post" novalidate>
        {% block form %}{% endblock %}
        {{ govukButton({
          text: 'Continue'
        }) }}
      </form>
    </div>
  </div>
{% endblock %}
```

### Build your question pages

```njk
{% extends "layouts/wizard.html" %}
{% block form %}
  {{ govukInput({
    label: {
      text: "Your email address",
      classes: "govuk-label--xl",
      isPageHeading: true
    },
    id: "email",
    name: "email"
  }) }}
{% endblock %}
```

## Releasing a new version

`npm run release`

This command will ask you what version you want to use. It will then publish a new version on NPM, create and push a new git tag and then generate release notes ready for posting on GitHub.

> [!NOTE]
> Releasing a new version requires permission to publish packages to the `@x-govuk` organisation.
