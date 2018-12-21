const wildcard = require("./wildcard");
const models = require("../models");
/**
 *
 *
 * @param {*} host
 * @param {*} path
 * @returns {{destination: string}}
 */
async function get(host, path) {
  const destinations = await getDestination(host, path);

  if (destinations.length > 1) {
    throw new Error("multiple domains have been found");
  }

  if (destinations.length === 1) {
    return format(destinations[0].redirects);
  }

  const wildcards = await wildcard.getDestination(host, path);
  return wildcards ? format(wildcards.redirects) : forward(host, path);
}

function format([redirect, ...extras]) {
  if (extras.length || !redirect) {
    throw new Error(
      `Found an invalid number of redirects, count: ${extras.length +
      (redirect ? 1 : 0)}`
    );
  }
  return {
    destination: `http${redirect.secure_destination ? "s" : ""}://${
      redirect.destination
      }`
  };
}

function getDestination(domain, path) {
  return models.domain.findAll({
    where: { domain },
    include: [
      {
        model: models.redirect,
        where: { path }
      }
    ]
  });
}

function forward(host, path) {
  // check root domain is the same as the host
  var [rootdomain] = host.match(
    /[^.]+(?:(?:[.](?:com|co|org|net|edu|gov)[.][^.]{2})|([.][^.]+))$/
  );
  // forward to the http://www. incase a site went live without an SSL attached
  if (rootdomain !== host)
    throw new Error("Redirects are not configured for this subdomain");

  return { destination: `http://www.${host}${path}` };
}

module.exports = {
  get,
  format,
  getDestination
};
