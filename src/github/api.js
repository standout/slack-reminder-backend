const { request, GraphQLClient } = require('graphql-request')
const queries = require('./queries')

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: 'Bearer insert_token_here',
  }
})

exports.getRequestedReviewers = function(owner) {
  return client.request(queries.getRequestedReviewers(owner))
    .then(data => data)
    .catch(err => err)
}
