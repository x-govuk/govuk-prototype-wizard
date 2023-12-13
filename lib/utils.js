const get = require('lodash.get')
const toPath = require('lodash.topath')

/**
 * Get path to fork
 * @param {object} forks - All the possible forks for a given path
 * @param {object} req - Express request
 * @returns {string} Path to fork to if conditions are met
 */
const getFork = (forks, req) => {
  for (const key of Object.keys(forks)) {
    const fork = forks[key]

    if (fork === true) {
      return key
    }

    if (typeof fork === 'function' && fork()) {
      return key
    }

    if (typeof fork === 'object' && fork.data) {
      const sessionData = toPath(get(req.session.data, fork.data))

      if (fork.value || fork.values) {
        const includedValues = toPath(fork.value ? fork.value : fork.values)
        if (includedValues.some(v => sessionData.indexOf(v) >= 0)) {
          return key
        }
      }

      if (fork.excludedValue || fork.excludedValues) {
        const excludedValues = toPath(fork.excludedValue
          ? fork.excludedValue
          : fork.excludedValues)

        if (!excludedValues.some(v => sessionData.indexOf(v) >= 0)) {
          return key
        }
      }
    }
  }

  return false
}

/**
 * Get original query string
 * @param {object} req - Express request
 * @returns {string} Original query string
 */
const getOriginalQuery = (req) => {
  const originalQueryString = req.originalUrl.split('?')[1]

  return originalQueryString ? `?${originalQueryString}` : ''
}

module.exports = {
  getFork,
  getOriginalQuery
}
