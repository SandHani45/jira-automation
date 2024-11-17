const express = require('express');
const { exec, spawn } = require('child_process');
const { rimrafSync } = require('rimraf');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const app = express();
const port = 3007;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
const package = require('./package.json');
const path = require('path');
const simpleGit = require('simple-git')
const readline = require('readline');
let commongProd;

const runCommand = async (req, res, command) => {
  const npmPath = process.platform === 'win32' ? 'npm.cmd' : 'npm';
   commongProd = spawn(npmPath, [command], {
    shell: true,
  });
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
  commongProd.stdout.on('data', (data) => {
    res.write(data.toString());
  });

  commongProd.stderr.on('data', (data) => {
    res.write(data.toString());
  });

  commongProd.on('close', (code) => {
    res.write('closed');
  });
  commongProd.on('error', (error) => {
    res.send(error);
  });
};

app.post('/run-cucumber', async (req, res) => {
  const { tag } = req.body;
  rimrafSync('./results/*', { glob: true });
  const command = `run test:${tag}`;
  await runCommand(req, res, command);
});

app.post('/git-clone', async (req, res) => {
  const { url } = req.body;
  const cloneDir = path.join(__dirname,'clones', Date.now().toString());
  if(!url){
    return res.status(400).json({
      error: "Repository URL is required"
    })
  }
  simpleGit().clone(url, cloneDir, (err)=>{
    if(err){
      return res.status(500).json({
        error:"Failed to clone repository"
      })
    }
    res.status(200).json({
      message: "Repository clone successfully", path: cloneDir
    })
  })
  if(!fs.existsSync(path.join(__dirname, 'clones'))){
    fs.mkdirSync(path.join(__dirname, 'clones'))
  }
});

app.post('/kill', async (req, res) => {
    if(commongProd){
      commongProd.kill();
      commongProd = null;
      res.send('Process killed')
    }else{
      res.status(400).send('No Process to kill')
    }
});

const server = http.createServer(app);
server.timeout = 3600000;

app.get('/get-report', async (req, res) => {
  await runCommand(req, res, 'start allure.serve');
});

app.get('/getScriptTags', async (req, res) => {
  const keysList = [];
  Object.keys(package.scripts).map((keyName) => {
    if (keyName.includes('test:')) {
      keysList.push(keyName.split(':')[1]);
    }
  });
  res.status(200).json({
    data: keysList,
  });
});

function removeBeforeAtTag(str) {
  const atIndex = str.indexOf('@');
  if (atIndex === 0) {
    return str;
  }
}

// Read file based on tag
async function findLinesWithTag(directory, extension = '.feature', tag = '@') {
  let linesWithTag = [];
  async function readFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readFiles(filePath);
      } else {
        if (path.extname(file) !== extension) return;
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line) => {
          if (line.includes(tag)) {
            const lineParse = removeBeforeAtTag(line.trim())?.split(' ');
            !!lineParse && linesWithTag.push(...lineParse);
          }
        });
      }
    });
  }
  await readFiles(directory);
  return [...new Set(linesWithTag)];
}

app.get('/getTags', async (req, res) => {
  const directoryPath = path.join(__dirname + '/src/features');
  const lines = await findLinesWithTag(directoryPath);
  res.json(lines);
});

app.post('/updateTag', async (req, res) => {
  const { tag } = req.body;
  const jsFilePath = path.join(__dirname, '/package-scripts.js');

  if (!tag) {
    return res.status(400).json({ error: 'Both searchString and tag must be provided' });
  }
  const content = fs.readFileSync(jsFilePath, 'utf8');
  const lines = content.split('\n');
  let lineUpdated = false;

  // Find and update the line containing the search string
  for (let i = 0; i < lines.length; i++) {
    if (i == 20) {
      try {
        // Replace the old line string with the updated one
        lines[i] =
          '        script:' +
          '`cucumber-js --config ./cucumber.mjs **/*.feature --tags=' +
          tag +
          ' --format @cucumber/pretty-formatter --exit` ,';
        lineUpdated = true;
      } catch (parseErr) {
        return res.status(500).json({ error: 'Failed to parse JSON content in the line' });
      }
      break;
    }
  }

  if (!lineUpdated) {
    return res.status(404).json({ error: 'No line containing the search string found' });
  }

  // Write the updated content back to the JavaScript file
  fs.writeFileSync(jsFilePath, lines.join('\n'), 'utf8');
  rimrafSync('./results/*', { glob: true });
  const command = `run test:ui`;
  await runCommand(req, res, command);
});

server.listen(port, () => {
  console.log(`cucumber server running in http://localhost:${port}`);
});




  //   fetch("http://localhost:3007/run-cucumber", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       tag: tagName,
  //     }),
  //   })
  //     .then((res) => {
  //       const reader = res.body.getReader();
  //       const decoder = new TextDecoder("utf-8");
  //       return reader.read().then(function processtext({ done, value }) {
  //         if (done) {
  //           setLoading(false);
  //           return;
  //         }
  //         const chunk = decoder.decode(value, { stream: true });
  //         if (chunk === "closed") {
  //           setLoading(false);
  //           return;
  //         }
  //         setLogs((prevLogs) => prevLogs + chunk);
  //         return reader.read().then(processtext);
  //       });
  //     })
  //     .catch((error) => {
  //       setLoading(false);
  //       setLogs("error", error);
  //     });
  // };

  // const getReport = () => {
  //   fetch("http://localhost:3007/get-report", {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((res) => {
  //       const reader = res.body.getReader();
  //       const decoder = new TextDecoder("utf-8");
  //       return reader.read().then(function processtext({ done, value }) {
  //         if (done) {
  //           setLoading(false);
  //           return;
  //         }
  //         const chunk = decoder.decode(value, { stream: true });
  //         if (chunk === "closed") {
  //           setLoading(false);
  //           return;
  //         }
  //         setLogs((prevLogs) => prevLogs + chunk);
  //         return reader.read().then(processtext);
  //       });
  //     })
  //     .catch((error) => {
  //       setLoading(false);
  //       setLogs("error", error);
  //     });
  // };
