"use strict";
var fs = require('fs'),
    GoogleSpreadsheet = require("google-spreadsheet"),
    logging = require('./logging');

module.exports = class Sheet {
    constructor(key, configPath) {
        let creds = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if ([key, creds].some((x) => typeof x === 'undefined')) {
            throw new Error('Missing args, can\'t initialize Sheet');
        }
        logging.debug("Initializing GoogleSpreadsheet data handler")
        this.sheet = new GoogleSpreadsheet(key);
        this.sheet.useServiceAccountAuth(creds, console.error);
    }
    upload(data) {
        this.sheet.addRow(1, data, (err) => {
            if (err) return logging.warn("Failed to upload to GoogleSpreadsheet", err);
            logging.debug("Uploaded reading to GoogleSpreadsheet")
        });
    }
}