const crypto = require('crypto')
const express = require('express')
const redis = require('redis')
const querystring = require('querystring')
const githubAPI = require("./src/github/api")

const appState = crypto.randomBytes(32).toString('hex')

const client = redis.createClient({
  host: process.env.DATA_REDIS_HOST || '127.0.0.1',
  port: 6379
})

const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

const app = express()
const unauthenticated = (res) => res.sendStatus(401)

app.get('/providers/github/login', async (req, res) => {
  const token = await getAsync('token')
  if (token) { return res.sendStatus(200) }

  const url = 'https://github.com/login/oauth/authorize'
  const query = querystring.stringify({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'user:email read:org',
    state: appState,
    redirect_uri: `${process.env.SLACK_REMINDER_REDIRECT_BASE_URL}/providers/github/authorize`,
  })

  res.redirect(`${url}?${query}`)
})

app.get('/providers/github/requested_reviewers', async (req, res) => {
  const token = await getAsync('token')
  if (!token) { return res.sendStatus(401) }
  const result = githubAPI.getRequestedReviewers(token, 'standout')
  result.then(data => res.send(data)).catch(err => res.send(err))
})

app.get('/providers/github/authorize', (req, res) => {
  const { code, state } = req.query
  if (appState !== state) { return unauthenticated(res) }
  githubAPI.accessToken(code, state, (err, json) => {
    if (err) { return unauthenticated(res) }
    client.set('token', json.access_token)
    res.sendStatus(200)
  })
})

app.use(express.static('public'))
app.listen(process.env.APP_PORT, () => console.log(`Server started on port ${process.env.APP_PORT}`))
