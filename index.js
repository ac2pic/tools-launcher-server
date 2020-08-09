const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');

const fetch = require('node-fetch');

const app = express();

const port = 4000;

const {pathToCrossCode} = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const { Redirect, AssetsOverride } = require('./override.js');


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(express.static(pathToCrossCode));

const resourceOverride = new Map;

app.post('/api/redirect/clear', (req, res) => {
    resourceOverride.clear();
    res.status(200).send('Success');
});

app.get('/api/get-tools', (req, res) => {
    // check path 
    const files = fs.readdirSync(path.join(pathToCrossCode, 'tools'));
    const tools = [];
    for (const file of files) {
        try {
            const relativePath = path.posix.join('tools', file + '/');
            const toolConfigPath = path.posix.join(pathToCrossCode, relativePath, 'tool.config.json');
            const toolConfig = JSON.parse(fs.readFileSync(toolConfigPath, 'utf8'));
            toolConfig.path = '/' + relativePath;
            tools.push(toolConfig);
        } catch (e) {}
    }
    res.status(200).json(tools);

});

const ccmods = {};

app.get('*', async (req, res, next) => {
    if (req.url.includes('.ccmod/')) {
        // check if mod found
        // if not found, logic to unzip
        // logic to 
    }
    next();
});

app.post('/api/redirect/set', (req, res) => {
    // format: [{"url": string, "redirect": string}]
    if (!Array.isArray(req.body)) {
        res.status(500).send('Body must be an array ');
        return;
    }

    let failed = false;
    const tempResourceMapping = new Map;
    for (const { url, redirect } of req.body) {
        if (!url || !redirect) {
            failed = true;
            break;
        }
        tempResourceMapping.set(url, new Redirect(redirect));
    }

    if (failed) {
        res.status(500).send('Body array objects must be in format {"url": "", "redirect": ""}');
    } else {
        for (const [key, value] of tempResourceMapping) {
            resourceOverride.set(key, value);
        }
        res.status(200).send('Success');
    }
});

app.get('*', (req, res, next) => {
    if (resourceOverride.has(req.path)) {
        resourceOverride.get(req.path).sendResponse(res);
    } else {
        next();
    }
});


// EXPERIMENTAL
app.post('/api/make-dir/*', (req, res, next) => {
    const savePath = req.path.split("/").slice(3).join('/');
    if (savePath.length) {
        fs.mkdir(path.join(pathToCrossCode, savePath));
    }

    res.sendStatus(200);
});

app.post('/api/save/*', (req, res, next) => {
    const savePath = req.path.split("/").slice(3).join('/');
    if (savePath.length) {
        fs.writeFileSync(path.join(pathToCrossCode, savePath), JSON.stringify(req.body));
    }

    res.sendStatus(200);
});


app.use(express.static(pathToCrossCode));

app.listen(port, () => console.log(`Server listening on port ${port}!`));