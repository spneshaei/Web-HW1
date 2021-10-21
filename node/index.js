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

// TODO: Error code on return!!!

app.post('/node/sha', jsonParser, (req, res) => {
    try {
        const string = req.body.string; // Error check
        if (string.length < 8) {
            res.send(JSON.stringify(
                {"error": "input string is shorter than 8 characters",}
            ));
        }
        const hash = crypto.createHash('sha256').update(string).digest('hex');
        client.set(hash, string, (err, reply) => {
            if (reply == "OK") {
                res.send(JSON.stringify(
                    {"result": hash,}
                ));
            } else {
                res.send(JSON.stringify(
                    {"error": err.message,}
                ));
            }
        });
    } catch (error) {
        res.send(JSON.stringify(
            {"error": error,}
        ));
    }
});

app.get('/node/sha', jsonParser, (req, res) => {
    try {
        const hash = req.query.sha256; // Error check
        client.get(hash, (err, result) => {
            if (err != null) {
                res.send(JSON.stringify(
                    {"error": err.message,}
                ));
            } else if (result == undefined || result == null) {
                res.send(JSON.stringify(
                    {"error": "value not found",}
                ));
            } else {
                res.send(JSON.stringify(
                    {"result": result,}
                ));
            }
        });
    } catch (error) {
        res.send(JSON.stringify(
            {"error": error,}
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
