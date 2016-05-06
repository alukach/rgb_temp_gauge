var Gpio = require('pigpio').Gpio,
    Sensor = require('./lib/sensor'),
    config = require('./lib/cli'),
    Led = require('./lib/led'),
    logging = require('./lib/logging'),
    Sheet = require('./lib/sheet'),
    Phant = require('./lib/phant');

if (config.sheetkey) {
    sheet = require('./lib/sheet')(config.sheetkey, config.google_keys);
}
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
  //logging.debug("Button state:", level);
  led.toggleIntensity();
});

/*
 * Sensor
 */
logging.debug("Initializing sensor");
var options = {
    sheet: new Sheet(config.sheetkey, config.google_keys),
    phant: new Phant(config.phant)
}
var sensor = new Sensor(TEMPSENSOR_PIN, options).scheduleReading(INTERVAL * 1000);

