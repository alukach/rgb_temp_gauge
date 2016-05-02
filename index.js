var GPIO = require('onoff').Gpio,
    sensorLib = require('node-dht-sensor'),
    GoogleSpreadsheet = require("google-spreadsheet"), // TODO: Only import if creds provided
    argv = require('yargs')
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

var GOOGLE_CREDS = argv.creds;
var GOOGLE_SHEETKEY = argv.sheetkey;
var INTERVAL = argv.interval;
var VERBOSITY = argv.verbose;

/*
 * Utils
 */
function WARN()  { VERBOSITY >= 0 && console.log.apply(console, arguments); }
function INFO()  { VERBOSITY >= 1 && console.log.apply(console, arguments); }
function DEBUG() { VERBOSITY >= 2 && console.log.apply(console, arguments); }


/*
 * GPIO Pins
 */
var R_PIN = 25,
    G_PIN = 24,
    B_PIN = 23,
    TEMP_PIN = 18,
    BUTN_PIN = 17;


/*
 * Lights
 */
var r_led = new GPIO(R_PIN, 'out'),
    g_led = new GPIO(G_PIN, 'out'),
    b_led = new GPIO(B_PIN, 'out'),
    button = new GPIO(BUTN_PIN, 'in', 'both');

function off () {
    r_led.writeSync(1);
    g_led.writeSync(1);
    b_led.writeSync(1);
}
function on (r,g,b) {
    r_led.writeSync(r);
    g_led.writeSync(g);
    b_led.writeSync(b);
}
button.watch(function(err, state) {
    DEBUG("Button state: %d", state);
    if (state) {
        on();
    } else {
        off();
    }
});


/*
 * Temp
 */
var sensor = {
    initialize: function (pin, opts) {
        this.sheet = opts.sheet;
        this.subtitle = opts.subtitle;
        return sensorLib.initialize(22, pin);
    },
    scheduleReading: function(interval) {
        this.interval = setInterval(this.getReading.bind(this), interval);
        DEBUG("Scheduled readings once every " + interval + " milliseconds");
    },
    cancelScheduledReading: function () {
        clearInterval(this.interval);
        DEBUG("Cancelled scheduled readings");
    },
    getReading: function() {
        var readout = sensorLib.read();
        if (!readout.temperature && !readout.humidity && readout.errors) {
            return WARN("Bad data, temperature sensor likely still initializing...")
        }
        readout = this.processReading(readout);
        if (this.subtitle) this.publishSubtitle(readout);
        if (this.sheet) this.publishGoogleSheet(readout);
        return this.logResults(readout);

    },
    processReading: function(readout) {
        readout.timestamp = new Date().toISOString();
        readout.temperature = readout.temperature.toFixed(1);
        readout.humidity = readout.humidity.toFixed(1);
        return readout;
    },
    logResults: function(readout) {
        var msg = 'Temperature: ' + readout.temperature + 'C, ' +
            'humidity: ' + readout.humidity + '%';
        return INFO(msg);
    },
    publishSubtitle: function(readout) {
        msg =  "text=" + readout.temperature + '\u00B0 C, ' +
               readout.humidity + '%' + "\n";
        msg += "pt=14" + "\n";
        msg += "font_name=FreeMono:style=Bold" + "\n";
        msg += "vertical_margin=40" + "\n";
        msg += "horizontal_margin=10" + "\n";
        msg += "stroke_width=1.4" + "\n";
        msg += "layout_align=bottom,right" + "\n";
        msg += "duration=5" + "\n";
        fs.writeFile('/run/shm/hooks/subtitle', msg, console.error);
    },
    publishGoogleSheet: function(readout) {
        this.sheet.addRow(1, readout, function(err) {
            if (err) throw new Error(err);
        });
    }
};

var doc;
if (GOOGLE_SHEETKEY) {
    doc = new GoogleSpreadsheet(GOOGLE_SHEETKEY);
    doc.useServiceAccountAuth(GOOGLE_CREDS, console.error);
}

if (sensor.initialize(TEMP_PIN, {sheet: doc})) {
    sensor.scheduleReading(INTERVAL * 1000);
} else {
    throw new Error('Failed to initialize sensor');
}

