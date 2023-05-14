const core = require('@actions/core');
const github = require('@actions/github');
const GITHUB_TOKEN_KEY = 'github-token'


function isPullRequest() {
  return github.context.payload.pull_request != null
}

function hasExistingAssignees() {
  return github.context.payload.pull_request.assignees.length > 0
}

async function getCommits(octokit) {
  const since = getThirtyDaysAgo();
  const msg = `Getting commits since ${since}`
  console.log(msg)
  const commits = await octokit.rest.repos.listCommits({
    owner: github.context.payload.repository.owner.login,
    repo: github.context.payload.repository.name,
    sha: github.context.payload.pull_request.base.sha,
    since: since
  })
  return commits
}

function getThirtyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  const since = date.toISOString();
  return since;
}

function getAuthors(commits, l10nLogin) {
  console.log('Getting authors.')
  const authors = []
  commits.data.forEach((commit) => {
    if (commit.author.login != l10nLogin) {
      authors.push(commit.author.login)
    }
  })
  return authors
}

async function assignAuthors(octokit, authors) {
  console.log('Assigning authors.')
  octokit.rest.issues.addAssignees({
    owner: github.context.payload.repository.owner.login,
    repo: github.context.payload.repository.name,
    issue_number: github.context.payload.pull_request.number,
    assignees: authors[0]
  });
}

const run = async () => {
    try {
  
      console.log('Running auto-assign action.')
  
      const time = (new Date()).toTimeString();
      core.setOutput("time", time);
  
      const token = core.getInput(GITHUB_TOKEN_KEY);
      if (token == null || token == '') {
        throw new Error('No github token found. The auto-assign action requires a token.')
      }
  
      const octokit = github.getOctokit(token)
  
      if (!isPullRequest()) {
        throw new Error(
          'No pull request found. The auto-assign action only works for pull requests.'
        )
      }
  
      if (hasExistingAssignees()) {
        console.log(`Pull request has existing assignees. Skipping.`)
        return
      }
  
      const l10nLogin = core.getInput('l10n-github-login');
      if (l10nLogin == null || l10nLogin == '') {
        throw new Error('No l10n login found. The auto-assign action requires a l10n login.')
      }
  
      const commits = await getCommits(octokit)
      if (commits.data.length == 0) {
        throw new Error('No commits found. The auto-assign action only works for pull requests with commits.')
      }
  
      const authors = getAuthors(commits, l10nLogin)
      if (authors.length == 0) {
        throw new Error('No authors found. The auto-assign action only works for pull requests with authors.')
      }
  
      await assignAuthors(octokit, authors)
    } catch (error) {
      core.setFailed(error.message);
    }
  }

exports.run = run;



