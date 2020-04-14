const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');

const fetch = require('node-fetch');

const app = express();

const port = 4000;

const pathToCrossCode = String.raw`C:\Program Files (x86)\Steam\steamapps\common\CrossCode`;


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


app.listen(port, () => console.log(`Server listening on port ${port}!`));