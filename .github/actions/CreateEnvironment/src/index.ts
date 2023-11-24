import { setFailed } from "@actions/core";
import * as github from "@actions/github";

const octokit = github.getOctokit(process.env.TOKEN_PAT as string);
const owner = github.context.repo.owner;
const repo = github.context.repo.repo;
const environmentName = 'QA';

async function checkAndCreateEnvironment() {
    try {
        // Check if the environment already exists
        const getEnvironment = await octokit.rest.repos.getEnvironment({
            owner,
            repo,
            environment_name: environmentName,
        });

        if (getEnvironment.data.protection_rules === undefined ) throw new Error('Environment is not protected'); 

        // Checking protection rules
        console.log(`Protection rules length: ${getEnvironment.data.protection_rules.length}`);


        // If the environment exists, log a message
        console.log(`Environment "${getEnvironment.data.name}" already exists.`);
    } catch (error) {
        // If the environment does not exist, create it
        try {
            const newEnvironment = await octokit.rest.repos.createOrUpdateEnvironment({
                owner,
                repo,
                environment_name: environmentName,
                reviewers: [{ type: 'User', id: 143590393 }],
            });

            console.log(`Environment "${newEnvironment.data.name}" created successfully.`);
        } catch (error) {
            setFailed((error as Error).message);
        }
    }
}

checkAndCreateEnvironment()