"use strict";
var sensorLib = require('node-dht-sensor'),
    logging = require('./logging');

module.exports = class Sensor {
    constructor(pin, opts) {
        if ([pin, opts].some((x) => typeof x === 'undefined')) {
            throw new Error('Missing args, can\'t initialize Sensor');
        }
        this.subtitle = opts.subtitle;
        this.sheet = opts.sheet;
        this.phant = opts.phant;
        if (!sensorLib.initialize(22, pin)) {
            throw new Error('Failed to initialize sensor');
        }
    }
    scheduleReading(interval) {
        this.interval = setInterval(this.getReading.bind(this), interval);
        logging.debug("Scheduled readings once every " + interval + " milliseconds");
    }
    cancelScheduledReading() {
        clearInterval(this.interval);
        logging.debug("Cancelled scheduled readings");
    }
    getReading() {
        var readout = sensorLib.read();
        if (!readout.temperature && !readout.humidity && readout.errors) {
            return logging.warn("Bad data, temperature sensor likely still initializing...")
        }
        readout = this.processReading(readout);
        if (this.subtitle) this.publishSubtitle(readout);
        if (this.sheet) this.sheet.upload(readout);
        if (this.phant) this.phant.upload(readout);
        return this.logResults(readout);

    }
    processReading(readout) {
        readout.timestamp = new Date().toISOString();
        readout.temperature = readout.temperature.toFixed(1);
        readout.humidity = readout.humidity.toFixed(1);
        return readout;
    }
    logResults(readout) {
        var msg = 'Temperature: ' + readout.temperature + 'C, ' +
            'humidity: ' + readout.humidity + '%';
        return logging.info(msg);
    }
    publishSubtitle(readout) {
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
    }
};
