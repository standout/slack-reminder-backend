const crypto = require('crypto')
const express = require('express')
const url = require ('url')
const oauth = require('./src/github/oauth')
const githubAPI = require("./src/github/api")
const appState = crypto.randomBytes(32).toString('hex')

const app = express()
const unauthenticated = (res) => res.sendStatus(401)

app.get('/providers/github/login', (req, res) => {
  const url = new URL('/login/oauth/authorize', 'https://github.com')
  url.search = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'user:email read:org',
    state: appState,
    redirect_uri: 'http://3d298c42.ngrok.io/providers/github/authorize',
  })

  res.redirect(url)
})

app.get('/providers/github/requested_reviewers', (req, res) => {
  const result = githubAPI.getRequestedReviewers('standout')
  result.then(data => res.send(data)).catch(err => res.send(err))
})

app.get('/providers/github/authorize', (req, res) => {
  const { code, state } = req.query
  if (appState !== state) { return unauthenticated(res) }
  oauth.accessToken(code, state, (err, json) => {
    if (err) { return unauthenticated(res) }
    res.send(json.access_token)
  })
})

app.use(express.static('public'))
app.listen(3000, () => console.log('Server started on port 3000'))
