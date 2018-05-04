const { request, GraphQLClient } = require('graphql-request')
const queries = require('./queries')
const crypto = require('crypto')
const https  = require('https')
const querystring = require('querystring')

const doRequest = (options, callback) => {
  const defaultOptions = {
    host: 'api.github.com',
    port: 443,
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  }

  https
  .request(Object.assign(defaultOptions, options), parseResponse(callback))
  .end()
}

const parseResponse = (callback) => {
  return (res) => {
    let body = ''
    res.on('data', (chunk) => body += chunk)
    res.on('end', () => {
      if (res.statusCode >= 200 < 300) {
        callback(null, JSON.parse(body))
      } else {
        callback({
          body: body,
          statusCode: res.statusCode
        }, null)
      }
    })
  }
}

const path = (path, query) =>
  path + ((query && Object.keys(query) !== 0) ? '?' + querystring.stringify(query) : '')

exports.accessToken = (code, state, callback) => {
  doRequest({
    host: 'github.com',
    method: 'POST',
    path: path('/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code,
      state: state,
    })
  }, callback)
}

exports.getRequestedReviewers = function(token, owner) {
  const client = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })

  return client.request(queries.getRequestedReviewers(owner))
    .then((data) => {
      const result = { pull_requests: [] }
      data.organization.repositories.edges.forEach((repo) => {
        repo.node.pullRequests.edges.forEach((pr) => {
          const resp = {
            repository: repo.node.name,
            user: pr.node.author.login,
            title: pr.node.title,
            additions: pr.node.additions,
            deletions: pr.node.deletions,
            created_at: pr.node.createdAt,
            url: `https://github.com${pr.node.resourcePath}`,
            reviewers: pr.node.reviewRequests.edges.map((reviewRequest) => {
              return reviewRequest.node.requestedReviewer.login
            })
          }
          result.pullRequests.push(resp)
        })
      })
      return result
    })
    .catch(err => err)
}
