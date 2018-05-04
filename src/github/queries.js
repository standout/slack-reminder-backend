exports.getRequestedReviewers = (owner) => `
  {
    organization(login: "${owner}") {
      login
      repositories(last: 50) {
        edges {
          node {
            name
            pullRequests(states: OPEN, last: 50) {
              edges {
                node {
                  author {
                    login
                  }
                  additions
                  deletions
                  title
                  createdAt
                  resourcePath
                  reviewRequests(last: 50) {
                    edges {
                      node {
                        requestedReviewer {
                          ... on User {
                            login
                          }
                          ... on Team {
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
