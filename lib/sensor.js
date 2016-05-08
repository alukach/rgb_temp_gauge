"use strict";
var sensorLib = require('node-dht-sensor'),
    logging = require('./logging');

module.exports = class Sensor {
    constructor(pin, opts) {
        if ([pin].some((x) => typeof x === 'undefined')) {
            throw new Error('Missing args, can\'t initialize Sensor');
        }
        if (!sensorLib.initialize(22, pin)) {
            throw new Error('Failed to initialize sensor');
        }
    }
    scheduleReading(interval, callback) {
        this.interval = setInterval(this.getReading.bind(this, callback), interval);
        logging.debug("Scheduled readings once every " + interval + " milliseconds");
    }
    cancelScheduledReading() {
        clearInterval(this.interval);
        logging.debug("Cancelled scheduled readings");
    }
    getReading(callback) {
        let readout = sensorLib.read();
        if (!readout.temperature && !readout.humidity && readout.errors) {
            return logging.warn("Bad data, temperature sensor likely still initializing...")
        }
        readout = this.processReading(readout)
        return callback(readout);
    }
    processReading(readout) {
        readout.timestamp = new Date().toISOString();
        readout.temperature = readout.temperature.toFixed(1);
        readout.humidity = readout.humidity.toFixed(1);
        return readout;
    }
};
