var GoogleSpreadsheet = require("google-spreadsheet"),
    logging = require('./logging');

module.exports = {
    initialize: (key, creds) => {
        if (key && creds) {
            logging.debug("Initializing GoogleSpreadsheet data handler")
            this.sheet = new GoogleSpreadsheet(key);
            this.sheet.useServiceAccountAuth(GOOGLE_CREDS, console.error);
            return this
        } else {
            return false
        }
    },
    upload: (data) => {
        this.sheet.addRow(1, data, (err) => {
            if (err) return logger.error("Failed to upload to Phant", err);
            logger.debug("Uploaded reading to Phant")
        });
    }
}