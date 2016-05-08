"use strict";
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    querystring = require('querystring'),
    logging = require('./logging');

module.exports = class Phant {
    constructor(configPath) {
        let creds = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if ([creds, creds.inputUrl, creds.privateKey].some((x) => typeof x === 'undefined')) {
            throw new Error('Bad credentials, can\'t initialize Phant');
        }
        logging.debug("Initializing Phant data handler")
        this.inputUrl = creds.inputUrl;
        this.privateKey = creds.privateKey;
    }
    upload(reading) {
        let data = {
            temperature: reading.temperature,
            humidity: reading.humidity,
            timestamp: reading.timestamp
        };
        let params = querystring.stringify(data);
        var url = `${this.inputUrl}?private_key=${this.privateKey}&${params}`;
        (url.startsWith('https') ? https : http).get(url, (res) => {
            if (res.statusCode != 200) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    logging.error("Phant Issue:", res.statusCode, res.statusMessage, chunk)
                  });
            }
            logging.debug("Uploaded reading to Phant")
        }).on('error', (e) => {
            logging.warn("Failed to upload to Phant:", e.message);
        });
    }
}
