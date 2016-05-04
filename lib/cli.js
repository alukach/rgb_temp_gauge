var argv = require('yargs')
        .usage('Usage: $0 [options]')
        .help('h')
        .alias('h', 'help')
        .option('verbose', {
            alias: 'v',
            describe: 'Verbosity level',
            count: true,
        })
        .option('subtitle', {
            describe: 'Write sensor readings to /run/shm/hooks/subtitle for use with picam (https://github.com/iizukanao/picam)',
            boolean: true
        })
        .option('interval', {
            alias: 'i',
            describe: 'Reading interval (seconds)',
            number: true,
            default: 30
        })
        .option('google_keys', {
            describe: 'Google Service Account OAuth Credentials (see https://www.npmjs.com/package/google-spreadsheet#service-account-recommended-method)',
            config: true
        })
        .option('sheetkey', {
            alias: 'k',
            describe: 'The key of the Google Sheet to write data to (the long id in the sheet\'s URL)',
        })
        .option('phant_keys', {
            describe: 'Keys for data.sparkfun.com (or JSON file with Phant inputUrl, publicKey, privateKey)'
            config: true
        })
        .check(argv => {
            if (Boolean(argv.google_keys) != Boolean(argv.sheetkey)){
                throw new Error("Must provide both 'google_keys' and 'sheetkey' arg if data is to be uploaded.")
            }
            return true
        })
        .argv;

module.exports = argv;