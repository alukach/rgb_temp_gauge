"use strict";
var Gpio = require('pigpio').Gpio,
    Sensor = require('./lib/sensor'),
    config = require('./lib/cli'),
    Led = require('./lib/led'),
    logging = require('./lib/logging'),
    Sheet = require('./lib/sheet'),
    Phant = require('./lib/phant');

const INTERVAL = config.interval;

/*
 * GPIO Pins
 */
const R_PIN = 25,
    G_PIN = 24,
    B_PIN = 23,
    TEMPSENSOR_PIN = 18,
    BUTN_PIN = 17;

/*
 * Lights
 */
logging.debug("Initializing LED");
var led = new Led(R_PIN, G_PIN, B_PIN);

/*
 * Button
 */
logging.debug("Configuring button");
var button = new Gpio(BUTN_PIN, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.FALLING_EDGE
});
button.on('interrupt', (level) => {
  logging.debug("Button state:", level);
  led.toggleIntensity();
});

/*
 * Reading Handlers
 */
var sheet = (config.sheetkey) ? new Sheet(config.sheetkey, config.google_keys) : undefined;
var phant = (config.phant) ? new Phant(config.phant) : undefined;
var subtitle = (config.subtitle) ? require('./lib/subtitle') : undefined;
function readingHandler (readout) {
    let msg = `temperature: ${readout.temperature}\u00B0C, ` +
              `humidity: ${readout.humidity}%`;
    logging.info(msg);
    if (subtitle) subtitle(readout);
    if (sheet) sheet.upload(readout);
    if (phant) phant.upload(readout);
}

/*
 * Sensor
 */
var sensor = new Sensor(TEMPSENSOR_PIN);
sensor.scheduleReading(INTERVAL * 1000, readingHandler);
