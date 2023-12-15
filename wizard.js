const utils = require('./lib/utils.js')

/**
 * Get next, back and current paths in user journey.
 *
 * @param {Object} journey - Sequence of paths in user journey
 * @param {Object} req - Express request
 * @returns {Object} Next and back paths
 */
const wizard = (journey, req) => {
  const { method, path, session } = req
  const { data } = session
  const paths = Object.keys(journey)
  const query = utils.getOriginalQuery(req)
  const index = paths.indexOf(path)
  let fork
  let next
  let back

  if (index !== -1) {
    fork = utils.getFork(journey[path], req)
    next = fork || paths[index + 1] || ''
    back = paths[index - 1] || ''
  }

  // Point back to where we forked from
  if (path === data['forked-to']) {
    back = data['forked-from']
  }

  // Remove the saved fork if we return to it
  if (path === data['forked-from'] && method === 'GET') {
    delete data['forked-from']
    delete data['forked-to']
  }

  // Add a new fork
  if (fork && method === 'POST') {
    data['forked-from'] = path
    data['forked-to'] = fork
  }

  return {
    next: next && next + query,
    back: back && back + query,
    current: path + query
  }
}

module.exports = wizard
