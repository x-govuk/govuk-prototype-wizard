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

  it('Gets original query string', () => {
    const req1 = { originalUrl: '/admin/new?sort=desc' }
    const req2 = { originalUrl: '/admin/new?sort=desc&page=1' }

    assert.equal(utils.getOriginalQuery(req1), '?sort=desc')
    assert.equal(utils.getOriginalQuery(req2), '?sort=desc&page=1')
  })
})
