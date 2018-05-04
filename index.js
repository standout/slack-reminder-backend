var githubAPI = require("./src/github/api.js")

const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.get('/providers/github/requested_reviewers', (req, res) => {
  const result = githubAPI.getRequestedReviewers('standout')

  result.then(data => res.send(data)).catch(err => res.send(err))
})

app.listen(3000, () => console.log('Server started on port 3000'))
