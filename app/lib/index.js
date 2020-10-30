const express = require('express')
const app = express()
const redirects = require('./redirect')
const greenlock = require('../../greenlock')
const models = require('../models')
// respond to all GET requests
app.get('*', ({ path, hostname, protocol }, res) => {
  redirects
    .get(hostname, path)
    .then(redirect => {
      if (!redirect.destination.match(new RegExp(`https?://${hostname}${path}/?`))) {
        // check for redirect loop
        res.redirect(301, redirect.destination)
      }
      else {
        res
          .status(404)
          .send(
            `${hostname} is incorrectly configured creating a redirect loop`
          )
      }
    })
    .catch(err => {
      res.status(404).send(err.toString())
    })
})
  app.post('/api/v1/backfill',express.json(), async (req, res) => {
    const domain = models.domain.findOne({
      where: { domain: req.body.domain }
    })
    const domains = await greenlock.add({
      subject: req.body.domain,
      altnames: [req.body.domain]
    })
    res.sendStatus(200)
  })
app.post('/api/v1/redirects', express.json(), async (req, res) => {
  const { body } = req
  for (let i = 0; i < body.length; i++) {
    const {
      domain,
      path,
      destination,
      secure_destination,
      wildcard
    } = body[i]

    const domains = await greenlock.add({
      subject: domain,
      altnames: [domain]
    })
    const dbDomain = await models.domain.findOrCreate({
      where: { domain },
      defaults: { domain }
    })
    .catch(err => console.log(err))
    console.log({ domain: domain })
    const redirect = await models.redirect.create({
      domain_id: dbDomain.dataValues.id,
      path,
      destination,
      secure_destination,
      wildcard
    })
    .catch(err => console.log(err))
    console.log({ redirect: redirect })
  }
  res.sendStatus(200)
})
app.delete('/api/v1/redirects', express.json(), async (req, res) => {
  const { domain } = req.body
  const domains = await greenlock.manager.remove({ subject: domain })
  console.log(domains)
  res.sendStatus(200)
})

module.exports = app
