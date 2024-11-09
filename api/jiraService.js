const axios = require('axios');
require('dotenv').config();

// Jira API URL and Authentication details from environment variables
const jiraUrl = process.env.JIRA_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraApiToken = process.env.JIRA_API_TOKEN;

// Basic authentication for Jira API
const auth = {
  auth: {
    username: jiraUsername,
    password: jiraApiToken,
  },
};

// Function to fetch issues from a Jira project
const getIssues = async (projectKey) => {
  const url = `${jiraUrl}/rest/api/3/search`;
  const jql = `project="${projectKey}"`; // JQL query to filter issues by project key
  const params = {
    jql: jql,
    // fields: 'summary,status,assignee', // You can specify more fields here
    maxResults: 10, // Number of issues to fetch
  };

  try {
    const response = await axios.get(url, { ...auth });
    return response.data; // Return the list of issues
  } catch (error) {
    throw new Error(`Error fetching issues from Jira: ${error.response?.data || error.message}`);
  }
};

// Function to fetch issues from a Jira project
const getIssue = async (projectKey, issueKey) => {
  const url = `${jiraUrl}/rest/api/2/issue/${issueKey}`;
  const jql = `project="${projectKey}"`; // JQL query to filter issues by project key
  const params = {
    jql: jql,
    fields: 'summary,status,assignee', // You can specify more fields here
    maxResults: 10, // Number of issues to fetch
  };

  try {
    const response = await axios.get(url, params, { ...auth });
    return response.data; // Return the list of issues
  } catch (error) {
    throw new Error(`Error fetching issues from Jira: ${error.response?.data || error.message}`);
  }
};

// Function to create a new issue in Jira
const createIssue = async (projectKey, summary, description) => {
  const url = `${jiraUrl}/rest/api/3/issue`;
  const issueData = {
    fields: {
      project: {
        key: projectKey,
      },
      summary: summary,
      description: description,
      issuetype: {
        name: 'Task', // You can change this to another issue type like "Bug"
      },
    },
  };

  try {
    const response = await axios.post(url, issueData, auth);
    return response.data; // Return the newly created issue details
  } catch (error) {
    throw new Error(`Error creating issue in Jira: ${error.response?.data || error.message}`);
  }
};

module.exports = { getIssues, createIssue, getIssue };
