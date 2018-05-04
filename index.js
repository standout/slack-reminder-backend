const crypto = require('crypto')
const express = require('express')
const url = require ('url')
const redis = require('redis')
const githubAPI = require("./src/github/api")

const appState = crypto.randomBytes(32).toString('hex')

const client = redis.createClient()
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

const app = express()
const unauthenticated = (res) => res.sendStatus(401)

app.get('/providers/github/login', async (req, res) => {
  const token = await getAsync('token')
  console.log('token', token)
  if (token) { return res.sendStatus(200) }

  const url = new URL('/login/oauth/authorize', 'https://github.com')
  url.search = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'user:email read:org',
    state: appState,
    redirect_uri: 'http://ee559d2d.ngrok.io/providers/github/authorize',
  })

  res.redirect(url)
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
app.listen(3000, () => console.log('Server started on port 3000'))
