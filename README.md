# Prototype wizard

Easily build and iterate a ‘one thing per page’ user journey when prototyping GOV.UK services.

Use it with the [govuk-prototype-kit](https://github.com/alphagov/govuk-prototype-kit). It’s included by default with the [govuk-prototype-rig](https://github.com/paulrobertlloyd/govuk-prototype-rig).

## Install

```
npm install govuk-prototype-wizard
```

## Usage

The `wizard` helper takes two parameters:

1. A journey object, which defines the default user journey and any branching rules
2. The express request object ('req')

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

## Examples

### Create a user journey

```js
const wizard = require('govuk-prototype-wizard')
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

### Make the paths available in the view using routes

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

```
{% extends "layout.html" %}
{% block pageTitle %}{{ title }}{% endblock %}

{% block pageNavigation %}
  {{ govukBackLink({
    href: paths.back
  }) }}
{% endblock %}

{% block content %}
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      {% block beforeForm %}{% endblock %}

      <form method="post" novalidate>
        {% block form %}{% endblock %}

        {{ govukButton({
          html: buttonText if buttonText else 'Continue'
        }) }}
      </form>
    </div>
  </div>
{% endblock %}
```

### Build your question pages

```
{% extends "layouts/wizard.html" %}
{% set title = "Your email address" %}

{% block form %}
  {{ govukInput({
    label: {
      text: title,
      classes: "govuk-label--xl",
      isPageHeading: true
    },
    id: "email",
    name: "email"
  }) }}
{% endblock %}
```
