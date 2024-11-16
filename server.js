const express = require('express');
const fs = require('fs');
const path = require('path');
const natural = require('natural');
const cors = require('cors')

const app = express();
app.use(cors())
const port = 3001;

// Path to the directory containing feature files
const featureDirPath = path.join(__dirname, 'src', 'feature');

// Parse a feature file and extract scenarios and steps
const parseFeatureFile = (filePath) => {
  const featureContent = fs.readFileSync(filePath, 'utf-8');
  const scenarios = [];

  let currentScenario = null;
  featureContent.split('\n').forEach(line => {
    line = line.trim();
    if (line.startsWith('Scenario:')) {
      // If there's an ongoing scenario, push it to the array
      if (currentScenario) scenarios.push(currentScenario);
      currentScenario = {
        name: line.replace('Scenario:', '').trim(),
        steps: []
      };
    } else if (line.startsWith('Given') || line.startsWith('When') || line.startsWith('Then')) {
      if (currentScenario) {
        currentScenario.steps.push(line);
      }
    }
  });

  // Add the last scenario
  if (currentScenario) scenarios.push(currentScenario);

  return scenarios;
};

// Read all feature files in the directory and parse them
const getAllScenarios = () => {
  const featureFiles = fs.readdirSync(featureDirPath);
  const allScenarios = [];

  featureFiles.forEach(file => {
    const filePath = path.join(featureDirPath, file);
    if (filePath.endsWith('.feature')) {
      const scenarios = parseFeatureFile(filePath);
      allScenarios.push(...scenarios);
    }
  });

  return allScenarios;
};


const getBestMatch = (inputName, scenarios) => {
  const highestMatch = scenarios.reduce((bestMatch, scenario) => {
    const similarity = natural.JaroWinklerDistance(inputName, scenario.name);
    if (similarity > bestMatch.similarity) {
      return { name: scenario.name, steps: scenario.steps, similarity };
    }
    return bestMatch;
  }, { similarity: 0 });

  return highestMatch.similarity > 0.7 ? highestMatch : null;
};


app.post('/getScenarioSteps', express.json(), (req, res) => {
  const { scenarioName } = req.body;

  const scenarios = getAllScenarios();
  const bestMatch = getBestMatch(scenarioName, scenarios);

  if (bestMatch) {
    return res.json({ steps: bestMatch.steps });
  } else {
    return res.status(404).send('Scenario not found');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
