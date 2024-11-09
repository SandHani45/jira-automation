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
app.post("/webhook", (req, res) => {
  try {
    // Log the incoming webhook payload (the issue data from Jira)
    const issueData = req.body;

    console.log("Webhook received:", issueData);

    // Example: You can now trigger an action based on the issue created
    if (issueData.issue.fields.issuetype.name === "Story") {
      // If it's a Story, trigger your API logic here
      console.log("A Story has been created:", issueData.issue.key);
      // Call your custom API logic here
    }

    // Respond with a 200 OK status to acknowledge receipt of the webhook
    res.status(200).send("Webhook received successfully");
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