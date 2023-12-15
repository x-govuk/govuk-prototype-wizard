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
        if (includedValues.some((v) => sessionData.indexOf(v) >= 0)) {
          return key
        }
      }

      if (fork.excludedValue || fork.excludedValues) {
        const excludedValues = toPath(
          fork.excludedValue ? fork.excludedValue : fork.excludedValues
        )

        if (!excludedValues.some((v) => sessionData.indexOf(v) >= 0)) {
          return key
        }
      }
    }
  }

  return false
}

/**
 * Get path with combined search params
 * @param {string} originalUrl - Original URL path
 * @param {string} path - Path to add params to
 * @returns {string} Path with combined search params
 */
const getPathWithSearchParams = (originalUrl, path) => {
  if (!path) {
    return ''
  }

  // Add any path params to params on original URL
  const originalParams = getSearchParams(originalUrl)
  const pathParams = getSearchParams(path)
  for (const [key, value] of originalParams.entries()) {
    pathParams.append(key, value)
  }

  // Remove query string from path
  path = path.split('?')[0]

  return pathParams.size ? `${path}?${pathParams.toString()}` : path
}

/**
 * Get search parameters
 * @param {string} originalUrl - Original URL path
 * @returns {URLSearchParams} Search parameters
 */
const getSearchParams = (originalUrl) => {
  const queryString = originalUrl.split('?')[1]
  const searchParams = new URLSearchParams(queryString)

  return searchParams
}

module.exports = {
  getFork,
  getPathWithSearchParams,
  getSearchParams
}
