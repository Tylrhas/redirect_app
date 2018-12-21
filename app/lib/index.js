const app = require('express')()
const redirects = require('./redirect')
const Honeybadger = require('honeybadger')
const { honeybadgerAPIKey } = process.env
Honeybadger.configure({
  apiKey: honeybadgerAPIKey
})

app.use(require('helmet')())

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
        Honeybadger.notify(`${hostname} is incorrectly configured creating a redirect loop`)
        res
          .status(404)
          .send(
            `${hostname} is incorrectly configured creating a redirect loop`
          )
      }
    })
    .catch(err => {
      Honeybadger.notify(err)
      res.status(404).send(err.toString())
    })
})

module.exports = app
