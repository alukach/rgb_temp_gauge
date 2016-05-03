var sensorLib = require('node-dht-sensor');
var logging = require('./logging');

module.exports = {
    initialize: function (pin, opts) {
        this.sheet = opts.sheet;
        this.subtitle = opts.subtitle;
        return sensorLib.initialize(22, pin);
    },
    scheduleReading: function(interval) {
        this.interval = setInterval(this.getReading.bind(this), interval);
        logging.debug("Scheduled readings once every " + interval + " milliseconds");
    },
    cancelScheduledReading: function () {
        clearInterval(this.interval);
        logging.debug("Cancelled scheduled readings");
    },
    getReading: function() {
        var readout = sensorLib.read();
        if (!readout.temperature && !readout.humidity && readout.errors) {
            return logging.warn("Bad data, temperature sensor likely still initializing...")
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
        return logging.info(msg);
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
        fs.writeFile('/run/shm/hooks/subtitle', msg, logging.error);
    },
    publishGoogleSheet: function(readout) {
        this.sheet.addRow(1, readout, function(err) {
            if (err) throw new Error(err);
        });
    }
};