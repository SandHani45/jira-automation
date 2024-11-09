const express = require("express");
const { getIssues, createIssue, getIssue } = require("../controller/jiraService");
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jiraRoute = require('./../routes/jiraRoute');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

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

// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'This is a simple API documentation example using Swagger and Express.',
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL for the Swagger UI
      },
    ],
  };
  
  // Options for swagger-jsdoc
const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'], // Path to the API routes (you will document these later)
  };

  // Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Import and use routes
app.use('/api', jiraRoute);

// Endpoint to receive Jira webhook
app.post("/webhook", async (req, res) => {
  try {
    // Log the incoming webhook payload (the issue data from Jira)
    const issueData = req.body;
    // Extract the relevant fields from the payload
    const issue = req.body.issue;
    const issueType = issue.fields.issuetype.name;
    const projectKey = issue.fields.project.key;
    const issueKey = issue.key;
    console.log("Webhook received:", issueType);


    // Check if the issue is a Story (optional check, depending on your use case)
    if (issueType) {
      const summary = issue.fields.summary;       // Story title
      const description = issue.fields.description; // Story description
      try {
        const comment = `Automation comppleted: vist below URL`;
        // Add a comment to the newly created Story using the Jira API
        await axios.post(`${jiraUrl}/rest/api/3/issue/${issueKey}/comment`, {
          body: comment
        }, {
          auth: auth,
          // headers: {
          //   'Accept': 'application/json',
          //   'Content-Type': 'application/json'
          // }
        });
        console.log(`Comment added successfully to ${issueKey}`);
        res.status(200).send('Webhook processed and comment added.');
      } catch (error) {
        console.error(`Error adding comment to ${issueKey}:`, error.response ? error.response.data : error.message);
        res.status(500).send('Error processing webhook.');
      }

      // Log or process the extracted information
      console.log('Story Title:', summary);
      console.log('Story Description:', description);
      // Send a response back to Jira (status 200)
      res.status(200).send('Webhook received');
    } else {
      // If it's not a Story, respond with a 200 status but no further processing
      res.status(200).send('Not a Story, ignoring');
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});
app.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Jira API service running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});

module.exports = app;