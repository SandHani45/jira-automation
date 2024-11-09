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

// Helper function to make requests to Jira
const makeJiraRequest = async (url, method = "GET", data = null) => {
  try {
    const response = await axios({
      method,
      url: `${jiraUrl}${url}`,
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${jiraUsername}:${jiraApiToken}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
      httpsAgent: new require("https").Agent({
        rejectUnauthorized: false, // This disables certificate verification
      }),
      data,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error interacting with Jira:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Function to fetch issues from a Jira project
const getIssues = async (projectKey) => {
  const url = `${jiraUrl}/rest/api/3/search`;
  // JQL query to fetch tasks from the given project key
  const jql = `project = "${projectKey}" AND issuetype = Task ORDER BY created DESC`;
  const params = {
    jql: jql,
    fields: 'summary', 
    maxResults: 10, // Number of issues to fetch
  };

  try {
    const response = await axios.get(url, {
      params,
      auth,
      headers: {
        'Accept': 'application/json',
      },
    });
       // Extract the issues from the response
       const issues = response.data.issues;
        // Return a list of issue titles (summaries)
    return issues.map(issue => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,  // Story title (summary)
    }));
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

const commentIssue = async (issueKey, comment) => {
  try {
    // Make the API call to add a comment
    const response = await makeJiraRequest(
      `/rest/api/2/issue/${issueKey}/comment`,
      "POST",
      {
        body: comment, // The body of the comment
      },
    );
    console.log('Comment added successfully:', response);
    return response
  } catch (error) {
    console.error('Error adding comment:', error.response ? error.response.data : error.message);
  }
}

module.exports = { getIssues, createIssue, getIssue, commentIssue };
