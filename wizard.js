const utils = require('./lib/utils.js')

/**
 * Get next, back and current paths in user journey.
 *
 * @param {Object} journey - Sequence of paths in user journey
 * @param {Object} req - Express request
 * @returns {Object} Next and back paths
 */
const wizard = (journey, req) => {
  const { data } = req.session
  const paths = Object.keys(journey)
  const currentPath = req.path
  const query = utils.getOriginalQuery(req)
  const index = paths.indexOf(currentPath)
  let fork
  let next
  let back

  if (index !== -1) {
    fork = utils.getFork(journey[currentPath], req)
    next = fork || paths[index + 1] || ''
    back = paths[index - 1] || ''
  }

  // Point back to where we forked from
  if (currentPath === data['forked-to']) {
    back = data['forked-from']
  }

  // Remove the saved fork if we return to it
  if (currentPath === data['forked-from'] && req.method === 'GET') {
    delete data['forked-from']
    delete data['forked-to']
  }

  // Add a new fork
  if (fork && req.method === 'POST') {
    data['forked-from'] = currentPath
    data['forked-to'] = fork
  }

  return {
    next: next && next + query,
    back: back && back + query,
    current: currentPath + query
  }
}

module.exports = wizard
