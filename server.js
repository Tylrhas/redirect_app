require('dotenv').config()
const models = require('./app/models')
const app = require('./app/lib/index.js')

const {
  GREENLOCK_SERVER: server,
  GREENLOCK_DIR: configDir,
  GREENLOCK_EMAIL: email
} = process.env

let approveDomains = async (options, certs, cb) => {
  // Check that the hosting domain exists in the database.
  (await models.domain.findAll({
    where: { domain: options.domain }
  })).length
    ? cb(null, { options, certs })
    : cb(new Error(`no config found for ${options.domain}`))
}

const glx = require('greenlock-express').create({
  version: 'draft-11', // Let's Encrypt v2 is ACME draft 11
  server, // If at first you don't succeed, stop and switch to staging
  configDir, // You MUST have access to write to directory where certs are saved.
  approveDomains, // Greenlock's wraps around tls.SNICallback. Check the domain name here and reject invalid ones
  app: (req, res) => app(req, res),
  email, // Email for Let's Encrypt account and Greenlock Security
  agreeTos: true, // Accept Let's Encrypt ToS
  communityMember: true, // Join Greenlock to get important updates, no spam
  debug: true
})

//Sync the Database
models.sequelize
  .sync()
  .then(() => {
    const server = glx.listen(80, 443)
    server.on('listening', () =>
      console.info(`${server.type} listening on ${server.address()}`)
    )
  })
  .catch(console.error)

// [SECURITY]
// Since v2.4.0+ Greenlock proactively protects against
// SQL injection and timing attacks by rejecting invalid domain names,
// but it's up to you to make sure that you accept opts.domain BEFORE
// an attempt is made to issue a certificate for it.
