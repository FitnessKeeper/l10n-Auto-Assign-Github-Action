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
  //get the login of the user who made the last commit with this action
  const { data: commit } = await octokit.repos.getCommit({  owner: github.context.repo.owner, repo: github.context.repo.repo, ref: github.context.sha }); 
  const commitAuthor = commit.author.login;
  console.log(`commit author: ${commitAuthor}`);

} catch (error) {
  core.setFailed(error.message);
}