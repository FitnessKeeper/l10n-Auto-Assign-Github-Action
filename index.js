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

    const commits = await octokit.rest.repos.listCommits({
      owner: github.context.payload.repository.owner.login,
      repo: github.context.payload.repository.name,
      sha: github.context.payload.pull_request.base.sha,
      since: github.context.payload.repository.created_at
    })  

    //loop through commits and log the author name
    commits.data.forEach((commit) => {
      console.log(commit.author.name)
      console.log(commit.committer.name)
    })

    console.log(commits)

    octokit.rest.issues.addAssignees({
      owner: github.context.payload.repository.owner.login,
      repo: github.context.payload.repository.name,
      issue_number: github.context.payload.pull_request.number,
      assignees: ['dcrelling']
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();