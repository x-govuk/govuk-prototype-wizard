const assert = require('node:assert/strict')
const { describe, it } = require('node:test')
const utils = require('../lib/utils.js')

describe('Utility functions', () => {
  it('Gets path to fork', async (t) => {
    const req = { session: { data: { country: 'England' } } }

    await t.test('and returns `false`', () => {
      const forks = {
        '/country': false
      }

      assert.equal(utils.getFork(forks, req), false)
    })

    await t.test('and redirects if `true`', () => {
      const forks = {
        '/country': true
      }

      assert.equal(utils.getFork(forks, req), '/country')
    })

    await t.test('and redirects with shorthand', () => {
      const forks = {
        '/country': req.session.data.country == 'England'
      }

      assert.equal(utils.getFork(forks, req), '/country')
    })

    await t.test('and redirects if function returns `true`', () => {
      const forks = {
        '/country': () => req.session.data.country == 'England'
      }

      assert.equal(utils.getFork(forks, req), '/country')
    })

    await t.test('and redirects if data.key is not in given array', () => {
      const forks = {
        '/country': {
          data: 'country',
          excludedValues: ['Northern Ireland', 'Scotland', 'Wales']
        }
      }

      assert.equal(utils.getFork(forks, req), '/country')
    })

    await t.test('and redirects if data.key does not equal value', () => {
      const forks = {
        '/country': {
          data: 'country',
          excludedValue: 'Northern Ireland'
        }
      }

      assert.equal(utils.getFork(forks, req), '/country')
    })

    await t.test('and redirects if data.key is in given array', () => {
      const forks = {
        '/country': {
          data: 'country',
          values: ['England', 'Scotland', 'Wales']
        }
      }

      assert.equal(utils.getFork(forks, req), '/country')
    })

    await t.test('and redirects if data.key equals value', () => {
      const forks = {
        '/country': {
          data: 'country',
          value: 'England'
        }
      }

      assert.equal(utils.getFork(forks, req), '/country')
    })
  })

  it('Gets path with combined search params', async (t) => {
    await t.test('when path has search params', () => {
      const originalUrl = '/filter/location'
      const path = '/list?success=1'
      const result = utils.getPathWithSearchParams(originalUrl, path)

      assert.equal(result, '/list?success=1')
    })

    await t.test('when original url has search params', () => {
      const originalUrl = '/filter/location?page=2&sort=asc'
      const path = '/list'
      const result = utils.getPathWithSearchParams(originalUrl, path)

      assert.equal(result, '/list?page=2&sort=asc')
    })

    await t.test('when original url and path both have search params', () => {
      const originalUrl = '/filter/location?page=2&sort=asc'
      const path = '/list?success=1'
      const result = utils.getPathWithSearchParams(originalUrl, path)

      assert.equal(result, '/list?success=1&page=2&sort=asc')
    })
  })

  it('Gets search parameters', () => {
    const result = utils.getSearchParams('/admin/new?sort=desc&page=1')

    assert.equal(result.get('sort'), 'desc')
    assert.equal(result.get('page'), '1')
  })
})
