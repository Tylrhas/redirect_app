const models = require('../models')

let getDestination = async (host, path) => {
  const [wildcard] = await getWildcards(host)
  if (typeof wildcard == 'undefined') {
    return
  }

  for (const redirect of wildcard.redirects) {
    let redirectPath = redirect.path
    if (redirectPath.split('').pop() !== '/') {
      redirectPath += '/'
    }
    if (path.includes(redirectPath)) {
      return {
        domain: wildcard.domain,
        redirects: [redirect.dataValues]
      }
    }
  }
  throw new Error('No matching redirect found')
}

const getWildcards = domain =>
  models.domain.findAll({
    where: { domain },
    include: [
      {
        model: models.redirect,
        where: { wildcard: true }
      }
    ],
    order: [['updatedAt', 'DESC']]
  })

module.exports = {
  getDestination
}
