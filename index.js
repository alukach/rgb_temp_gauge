var sensor = require('./lib/sensor'),
    config = require('./lib/cli'),
    led = require('./lib/led');

if (config.sheetkey) {
    sheet = require('./lib/sheet')(config.sheetkey, config.creds);
}

var INTERVAL = config.interval;
var VERBOSITY = config.verbose;


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
led.initialize(R_PIN, G_PIN, B_PIN)
var button = new Gpio(BUTN_PIN, {
        mode: Gpio.INPUT,
        pullUpDown: Gpio.PUD_DOWN,
        edge: Gpio.EITHER_EDGE
    });
button.on('interrupt', function (level) {
  led.toggleIntensity();
});

if (sensor.initialize(TEMPSENSOR_PIN, {sheet: doc})) {
    sensor.scheduleReading(INTERVAL * 1000);
} else {
    throw new Error('Failed to initialize sensor');
}
