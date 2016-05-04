var Gpio = require('pigpio').Gpio,
    sensor = require('./lib/sensor'),
    config = require('./lib/cli'),
    led = require('./lib/led'),
    logging = require('./lib/logging'),
    sheet;

if (config.sheetkey) {
    sheet = require('./lib/sheet')(config.sheetkey, config.creds);
}
var INTERVAL = config.interval;

/*
 * GPIO Pins
 */
var R_PIN = 25,
    G_PIN = 24,
    B_PIN = 23,
    TEMPSENSOR_PIN = 18,
    BUTN_PIN = 17;

/*
 * Lights
 */
logging.debug("Initializing LED");
led.initialize(R_PIN, G_PIN, B_PIN)

/*
 * Button
 */
logging.debug("Configuring button");
var button = new Gpio(BUTN_PIN, {
        mode: Gpio.INPUT,
        pullUpDown: Gpio.PUD_DOWN,
        edge: Gpio.FALLING_EDGE
    });
button.on('interrupt', function (level) {
  logging.debug("Button state:", level);
  led.toggleIntensity();
});

/*
 * Sensor
 */
logging.debug("Initializing sensor");
if (sensor.initialize(TEMPSENSOR_PIN, {sheet: sheet})) {
    sensor.scheduleReading(INTERVAL * 1000);
} else {
    throw new Error('Failed to initialize sensor');
}

