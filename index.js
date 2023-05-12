const core = require('@actions/core');
const github = require('@actions/github');
const GITHUB_TOKEN_KEY = 'github-token'


function isPullRequest() {
  return github.context.payload.pull_request != null
}

function hasExistingAssignees() {
  return context.payload.pull_request.assignees.length > 0
}

 async function run() {
  try {

    if (!isPullRequest()) {
      throw new Error(
        'No pull request found. The auto-assign action only works for pull requests.'
      )
    }

    if (hasExistingAssignees()) {
      core.info(`Pull request has existing assignees. Skipping.`)
      return
    }




    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
    
    const token = core.getInput(GITHUB_TOKEN_KEY);
    const octokit = github.getOctokit(token)

    const commits = await getCommits(octokit)
    if (commits.data.length == 0) {
     throw new Error( 'No commits found. The auto-assign action only works for pull requests with commits.')
    }

    const authors = await getAuthors(commits)
    if (authors.length == 0) {
      throw new Error( 'No authors found. The auto-assign action only works for pull requests with authors.')
    }

    await assignAuthors(octokit, authors)
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getCommits(octokit) {
  const commits = await octokit.rest.repos.listCommits({
    owner: github.context.payload.repository.owner.login,
    repo: github.context.payload.repository.name,
    sha: github.context.payload.pull_request.base.sha,
    since: github.context.payload.repository.created_at
  })  
  return commits
}

async function getAuthors(commits) {
  const authors = []
  commits.data.forEach((commit) => {
    if (commit.author.login != 'rkcrowdinadmin') {
      authors.push(commit.author.login)
    }
  })
  return authors
}

async function assignAuthors(octokit, authors) {
  octokit.rest.issues.addAssignees({
    owner: github.context.payload.repository.owner.login,
    repo: github.context.payload.repository.name,
    issue_number: github.context.payload.pull_request.number,
    assignees: authors[0]
  });
}

run();