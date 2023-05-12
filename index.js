const core = require('@actions/core');
const github = require('@actions/github');
const GITHUB_TOKEN_KEY = 'github-token'

 async function run() {
  try {
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
    const token = core.getInput(GITHUB_TOKEN_KEY);
    const octokit = github.getOctokit(token)

    // const commits = await octokit.rest.repos.listCommits({
    //   owner: github.context.payload.repository.owner.login,
    //   repo: github.context.payload.repository.name,
    //   sha: github.context.payload.pull_request.base.sha,
    //   since: github.context.payload.repository.created_at
    // })  

    //loop through commits and log the author name
    // commits.data.forEach((commit) => {
    //   console.log("here")
    //   console.log(commit.committer.login)
    // })

    //console.log(commits)

    // octokit.rest.issues.addAssignees({
    //   owner: github.context.payload.repository.owner.login,
    //   repo: github.context.payload.repository.name,
    //   issue_number: github.context.payload.pull_request.number,
    //   assignees: ['dcrelling']
    // });
    const commits = await getCommits(github, octokit, core)
    const authors = await getAuthors(commits)
    await assignAuthors(github, octokit, core, authors)
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

//create a async function to return a list of commits
async function getCommits(github, octokit, core) {
  const token = core.getInput(GITHUB_TOKEN_KEY);
  const octokit = github.getOctokit(token)
  const commits = await octokit.rest.repos.listCommits({
    owner: github.context.payload.repository.owner.login,
    repo: github.context.payload.repository.name,
    sha: github.context.payload.pull_request.base.sha,
    since: github.context.payload.repository.created_at
  })  
  return commits
}

//create a function that takes in a list of commits and returns a commit.author.login if the commit.author.login is not equal rkcrowdinadmin
async function getAuthors(commits) {
  const authors = []
  commits.data.forEach((commit) => {
    if (commit.author.login != 'rkcrowdinadmin') {
      authors.push(commit.author.login)
    }
  })
  return authors
}

//create a async function assign the authors to the pull request
async function assignAuthors(github, octokit, core, authors) {
  const token = core.getInput(GITHUB_TOKEN_KEY);
  const octokit = github.getOctokit(token)
  octokit.rest.issues.addAssignees({
    owner: github.context.payload.repository.owner.login,
    repo: github.context.payload.repository.name,
    issue_number: github.context.payload.pull_request.number,
    assignees: authors[0]
  });
}



run();