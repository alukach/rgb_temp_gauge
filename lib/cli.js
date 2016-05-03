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
        .option('creds', {
            alias: 'c',
            describe: 'Google Service Account OAuth Credentials (see https://www.npmjs.com/package/google-spreadsheet#service-account-recommended-method)',
            config: true
        })
        .option('sheetkey', {
            alias: 'k',
            describe: 'The key of the Google Sheet to write data to (the long id in the sheet\'s URL)',
        })
        .check(function(argv){
            if (Boolean(argv.creds) != Boolean(argv.sheetkey)){
                throw new Error("Must provide both 'creds' and 'sheetkey' arg if data is to be uploaded.")
            }
            return true
        })
        .argv;

module.exports = argv;