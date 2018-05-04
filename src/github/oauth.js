const crypto = require('crypto')
const https  = require('https')
const querystring = require('querystring')

const request = (options, callback) => {
  const defaultOptions = {
    host: 'api.github.com',
    port: 443,
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  }

  https
  .request(Object.assign(defaultOptions, options), response(callback))
  .end()
}

const response = (callback) => {
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
  request({
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
