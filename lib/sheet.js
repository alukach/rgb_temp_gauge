"use strict";
var GoogleSpreadsheet = require("google-spreadsheet"),
    logging = require('./logging');

module.exports = class Sheet {
    constructor(key, creds) {
        if ([key, creds].some((x) => typeof x === 'undefined')) {
            throw new Error('Missing args, can\'t initialize Sheet');
        }
        logging.debug("Initializing GoogleSpreadsheet data handler")
        this.sheet = new GoogleSpreadsheet(key);
        this.sheet.useServiceAccountAuth(GOOGLE_CREDS, console.error);
    }
    upload(data) {
        this.sheet.addRow(1, data, (err) => {
            if (err) return logger.error("Failed to upload to Phant", err);
            logger.debug("Uploaded reading to Phant")
        });
    }
}