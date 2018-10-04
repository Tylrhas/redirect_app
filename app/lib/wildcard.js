var models = require('../models')
module.exports = {
    getDestination
}
async function getDestination(host, path) {
    // get all wildcards for this domain
    var wildcards = await getWildcards(host)
    
    if (wildcards.length > 0) {
        //look for a partial string match on the path
        for (i = 0; i < wildcards[0].redirects.length; i++) {
            let redirect_path = wildcards[0].redirects[i].path
            if (redirect_path.charAt(redirect_path.length - 1) !== "/") {
                // add / to the end of the path so that dirs with a partial name match are not matched 
                // eg. domain.com/wildcards != domain.com/wildcardsstuff
                redirect_path = redirect_path + '/'
            }
            if (path.indexOf(redirect_path) >= 0) {
                return {
                    domain: wildcards[0].domain,
                    redirects: [
                        wildcards[0].redirects[i].dataValues
                    ]
                }
            }
        }
    }
    return null
}

function getWildcards(host) {
    return models.domain.findAll({
        where: {
            domain: host
        },
        include: [
            {
                model: models.redirect,
                where: {
                    wildcard: true
                }
            }
        ],
        order: [['updatedAt', 'DESC']]
    })
}