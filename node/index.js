const express = require('express');
const crypto = require('crypto');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()

const port = 8001;

const redis = require('redis');
const client = redis.createClient({
    host: "host.docker.internal",
    port: "6379"
});

client.on('error', function (err) {
  console.log('Error ' + err);
});

app.post('/node/sha', jsonParser, (req, res) => {
    try {
        const string = req.body.string;
        if (string == undefined || string == null) {
            res.status(400).send(JSON.stringify(
                {"error": "wrong format",}
            ));
            return
        }
        if (string.length < 8) {
            res.status(400).send(JSON.stringify(
                {"error": "input string is shorter than 8 characters",}
            ));
            return
        }
        const hash = crypto.createHash('sha256').update(string).digest('hex');
        client.set(hash, string, (err, reply) => {
            if (reply == "OK") {
                res.status(201).send(JSON.stringify(
                    {"result": hash,}
                ));
            } else {
                res.status(500).send(JSON.stringify(
                    {"error": err.message,}
                ));
            }
        });
    } catch (error) {
        res.status(500).send(JSON.stringify(
            {"error": error.message,}
        ));
    }
});

app.get('/node/sha', jsonParser, (req, res) => {
    try {
        const hash = req.query.sha256;
        if (hash == undefined || hash == null) {
            res.status(400).send(JSON.stringify(
                {"error": "wrong format",}
            ));
            return
        }
        client.get(hash, (err, result) => {
            if (err != null) {
                res.status(500).send(JSON.stringify(
                    {"error": err.message,}
                ));
            } else if (result == undefined || result == null) {
                res.status(404).send(JSON.stringify(
                    {"error": "value not found",}
                ));
            } else {
                res.status(200).send(JSON.stringify(
                    {"result": result,}
                ));
            }
        });
    } catch (error) {
        res.status(500).send(JSON.stringify(
            {"error": error.message,}
        ));
    }
});

app.get('*', function(req, res){
    res.status(404).send(JSON.stringify(
        {"error": 'endpoint not found',}
    ));
});

app.post('*', function(req, res){
    res.status(404).send(JSON.stringify(
        {"error": 'endpoint not found',}
    ));
});

app.listen(port, () => {
    console.log('App listening at http://localhost:' + port);
});
