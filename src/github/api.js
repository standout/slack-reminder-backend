const { request, GraphQLClient } = require('graphql-request')
const queries = require('./queries')

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: 'Bearer insert_token_here',
  }
})

exports.getRequestedReviewers = function(owner) {
  return client.request(queries.getRequestedReviewers(owner))
    .then((data) => {
      const result = { pullRequests: [] }
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
