"use strict";
var fs = require('fs'),
    logging = require('./logging'),;

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
    upload(data) {
        let params = querystring.stringify(data);
        let url = `${this.inputUrl}?private_key=${this.privateKey}&${params}`
        (url.startsWith('https') ? https : http).get(url, (res) => {
            logging.debug("Uploaded reading to Phant")
        }).on('error', (e) => {
            logging.error("Failed to upload to Phant", e);
        });
    }
}
