var logging = require('./logging');

module.exports = {
    initialize: (creds) => {
        if (creds && creds.inputUrl && creds.privateKey) {
            logging.debug("Initializing Phant data handler")
            this.inputUrl = creds.inputUrl;
            this.privateKey = creds.privateKey;
            return this
        } else {
            return false
        }
    },
    upload: (data) => {
        var params = querystring.stringify(data);
        var url = `${this.inputUrl}?private_key=${this.privateKey}&${params}`
        (url.startsWith('https') ? https : http).get(url, (res) => {
            logging.debug("Uploaded reading to Phant")
        }).on('error', (e) => {
            logging.error("Failed to upload to Phant", e);
        });
    }
}
