"use strict";
var Gpio = require('pigpio').Gpio,
    config = require('./lib/cli'),
    logging = require('./lib/logging'),
    Led = require('./lib/led'),
    Sensor = require('./lib/sensor'),
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
  logging.debug("Luminosity:", led.toggleIntensity());
});

/*
 * Reading Handlers
 */
var sheet = (config.sheetkey) ? new Sheet(config.sheetkey, config.google_keys) : undefined;
var phant = (config.phant) ? new Phant(config.phant) : undefined;
var subtitle = (config.subtitle) ? require('./lib/subtitle') : undefined;
function colorPicker (t) {
    // TODO: Refactor this, move into LED class
    let goal_low = 18.2,
        goal_high = 21.1,
        step_size = .5;

    if (t < goal_low - (step_size * 4)) {
        return .4
    } else
    if (t < goal_low - (step_size * 3)) {
        return .45
    } else
    if (t < goal_low - (step_size * 2)) {
        return .5
    } else
    if (t < goal_low - step_size) {
        return .55
    } else
    if (t < goal_low) {
        return .6
    } else
    if ((goal_low < t) && (t < goal_high)) {
        return .65
    } else
    if (t > goal_high + (step_size * 4)) {
        return .999
    } else
    if (t > goal_high + (step_size * 3)) {
        return .980
    } else
    if (t > goal_high + (step_size * 2)) {
        return .965
    } else
    if (t > goal_high + step_size) {
        return .9
    } else
    if (t > goal_high) {
        return .8
    }
}

function readingHandler (readout) {
    let msg = `Temperature: ${readout.temperature}\u00B0C, ` +
              `Humidity: ${readout.humidity}%`;
    logging.info(msg);
    let colorValue = colorPicker(readout.temperature);
    logging.debug("Color value:", colorValue);
    led.colorFromValue(colorValue);
    if (subtitle) subtitle(readout);
    if (sheet) sheet.upload(readout);
    if (phant) phant.upload(readout);
}

/*
 * Sensor
 */
var sensor = new Sensor(TEMPSENSOR_PIN);
sensor.scheduleReading(INTERVAL * 1000, readingHandler);

