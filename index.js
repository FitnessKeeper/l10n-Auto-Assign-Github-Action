const core = require('@actions/core');
const github = require('@actions/github');
const GITHUB_TOKEN_KEY = 'github-token'

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
  const token = core.getInput(GITHUB_TOKEN_KEY);
  const octokit = github.getOctokit(token)
  octokit.rest.issues.addAssignees({
    owner: github.context.payload.repository.owner.login,
    repo: github.context.payload.repository.name,
    issue_number: github.context.payload.pull_request.number,
    assignees: ['dcrelling']
  });
} catch (error) {
  core.setFailed(error.message);
}