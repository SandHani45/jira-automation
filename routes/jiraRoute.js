const express = require("express");
const router = express.Router();
const { getIssues, createIssue, getIssue } = require("../controller/jiraService");
/**
 * @swagger
 * /test:
 *   get:
 *     summary: "Get test data"
 *     description: "Returns example data from the API"
 *     responses:
 *       200:
 *         description: "Example data"
 *         content:
 *           routerlication/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello, world!"
 */


router.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

router.get("/test", (req, res) => {
  res.json({ message: "Test endpoint working!" });
});

// Route to get issues from a Jira project
router.get("/getIssues", async (req, res) => {
  const projectKey = "AUTOMATION";

  if (!projectKey) {
    return res.status(400).json({ error: "Project key is required" });
  }

  try {
    const issues = await getIssues(projectKey);
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/**
 * @swagger
 * /api/getIssues:
 *   get:
 *     summary: "Get getIssues data"
 *     description: "Returns example data from the API"
 *     responses:
 *       200:
 *         description: "Example data"
 *         content:
 *           routerlication/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello, world!"
 */
// Route to get issues from a Jira project
router.get("/getIssue", async (req, res) => {
  const projectKey = "AUTOMATION";

  if (!projectKey) {
    return res.status(400).json({ error: "Project key is required" });
  }

  try {
    const issues = await getIssue(projectKey);
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to create a new issue in Jira
router.post("/createIssue", async (req, res) => {
  const { projectKey, summary, description } = req.body;

  if (!projectKey || !summary || !description) {
    return res
      .status(400)
      .json({ error: "Project key, summary, and description are required" });
  }

  try {
    const issue = await createIssue(projectKey, summary, description);
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
