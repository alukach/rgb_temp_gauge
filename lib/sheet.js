var GoogleSpreadsheet = require("google-spreadsheet");

module.exports = (key, creds) => {
    if (key && creds) {
        var doc = new GoogleSpreadsheet(key);
        doc.useServiceAccountAuth(GOOGLE_CREDS, console.error);
        return doc
    }
}