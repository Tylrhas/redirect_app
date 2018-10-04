var wildcard = require('./wildcard')
var forward = require('./forward')
var models = require('../models')

module.exports = {
    get,
    format
}

async function get(protocol, host, path) {
    var redirect = await getDestination(host, path)
    if (redirect.length === 1) {
        return format(redirect[0])
    } else if (redirect.length > 1) {
        // the database is not right there should never be more than one of each domain in the domain table
        return { error: 'multiple domains have been found' }
    } else {
        // look for all wildcard redirects for this domain and find the first one that matches
        let wildcards = await wildcard.getDestination(host, path)
        if (wildcards !== null) {
            return format(wildcards)
        } else {
            // no wildcards were found so forward the domain to the http://www.
            return forward.go(host, path)
        }
    }
}

function format(domain) {
    console.log('we are formatting now')
    if (domain.redirects.length > 1) {
        // there is more than one redirect for the domain and path this should never happen when edited through the UI
        return { error: 'more than one redirect for this domain and path' }
    } else if (domain.redirects.length === 1) {
        // only one redirect found 
        var redirect = domain.redirects[0]
        console.log(redirect)
        let destination = redirect.destination
        // is the desination secure or not
        if (redirect.secure_destination === true) {
            destination = 'https://' + destination
        } else {
            destination = 'http://' + destination
        }
        return { destination }
    } else {
        // there is no redirect for this - this code should not be reachable -
        // if there is not redirects it should have already been forwarded
        return { error: 'There is no redirect for this domain' }
    }
}
function getDestination(host, path) {
    return models.domain.findAll({
        where: {
            domain: host
        },
        include: [
            {
                model: models.redirect,
                where: {
                    path: path
                }
            }
        ]
    })
}
