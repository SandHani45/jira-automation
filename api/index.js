// const express = require('express');
// const { getIssues, createIssue } = require('./jiraService');
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 3000;

// // Middleware to parse JSON bodies
// app.use(express.json());

// app.get('/', (req, res) => {
//     res.json({ message: 'Hello, world!' });
//   });
//   app.get('/api/test', (req, res) => {
//     res.json({ message: 'Test endpoint working!' });
//   });
  
// // Route to get issues from a Jira project
// app.get('/api/getIssues', async (req, res) => {
//   const { projectKey } = req.query || 'AUTOMATION';

//   if (!projectKey) {
//     return res.status(400).json({ error: 'Project key is required' });
//   }

//   try {
//     const issues = await getIssues('AUTOMATION');
//     res.status(200).json(issues);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Route to create a new issue in Jira
// app.post('/api/createIssue', async (req, res) => {
//   const { projectKey, summary, description } = req.body;

//   if (!projectKey || !summary || !description) {
//     return res.status(400).json({ error: 'Project key, summary, and description are required' });
//   }

//   try {
//     const issue = await createIssue(projectKey, summary, description);
//     res.status(201).json(issue);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Jira API service running on http://localhost:${port}`);
// });

// module.exports = app;

const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;