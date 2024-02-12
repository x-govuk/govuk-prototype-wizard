const assert = require('node:assert/strict')
const { describe, it } = require('node:test')
const wizard = require('../wizard.js')

describe('GOV.UK Prototype Wizard (with baseUrl)', () => {
  const journey = {
    '/name': {},
    '/do-you-have-a-national-insurance-number': {
      '/email': { data: 'have-nino', value: 'No' }
    },
    '/what-is-your-national-insurance-number': {},
    '/email': {}
  }

  it('Returns current, next and previous paths', () => {
    const req = {
      baseUrl: '/questions',
      method: 'POST',
      originalUrl: '/questions/do-you-have-a-national-insurance-number',
      path: '/do-you-have-a-national-insurance-number',
      session: { data: { 'have-nino': 'No' } }
    }

    assert.deepEqual(wizard(journey, req), {
      back: '/questions/name',
      current: '/questions/do-you-have-a-national-insurance-number',
      next: '/questions/email'
    })
  })

  it('Returns next path with modified query string', () => {
    const journey = {
      '/filter/location': {},
      '/list?success=1': {}
    }

    const req = {
      baseUrl: '/results',
      method: 'POST',
      originalUrl: '/results/filter/location?page=2&sort=asc',
      path: '/filter/location',
      query: {
        page: '2',
        sort: 'asc'
      },
      session: { data: {} }
    }

    assert.deepEqual(wizard(journey, req), {
      back: '',
      current: '/results/filter/location?page=2&sort=asc',
      next: '/results/list?success=1&page=2&sort=asc'
    })
  })

  it('Adds fork data pointing back to where user forked from', () => {
    const req = {
      baseUrl: '/questions',
      method: 'GET',
      originalUrl: '/questions/email',
      path: '/email',
      session: {
        data: {
          'forked-to': '/email',
          'forked-from': '/do-you-have-a-national-insurance-number'
        }
      }
    }

    assert.deepEqual(wizard(journey, req), {
      back: '/questions/do-you-have-a-national-insurance-number',
      current: '/questions/email',
      next: ''
    })
  })

  it('Removes fork data when returning to page that created it', () => {
    const req = {
      baseUrl: '/questions',
      method: 'GET',
      session: {
        data: {
          'forked-from': '/do-you-have-a-national-insurance-number',
          'forked-to': '/email'
        }
      },
      originalUrl: '/questions/do-you-have-a-national-insurance-number',
      path: '/do-you-have-a-national-insurance-number'
    }

    wizard(journey, req)

    assert.equal(req.session.data['forked-from'], undefined)
    assert.equal(req.session.data['forked-to'], undefined)
  })
})
