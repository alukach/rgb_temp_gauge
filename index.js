var GPIO = require('onoff').Gpio,
    sensorLib = require('node-dht-sensor');
    argv = require('minimist')(process.argv.slice(2), {
        default: {
            // Defaults
            log: true,
            publish: true
        }
    });

// GPIO Pins
var R_PIN = 25,
    G_PIN = 24,
    B_PIN = 23,
    TEMP_PIN = 18,
    BUTN_PIN = 17;

var r_led = new GPIO(R_PIN, 'out'),
    g_led = new GPIO(G_PIN, 'out'),
    b_led = new GPIO(B_PIN, 'out'),
    button = new GPIO(BUTN_PIN, 'in', 'both');
/*
 * Lights
 */
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
    initialize: function (pin) {
        return sensorLib.initialize(22, pin);
    },
    logReading: function(readout) {
        msg = 'Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
            'humidity: ' + readout.humidity.toFixed(2) + '%';
        console.log(msg);
    },
    publishSubtitle: function(readout) {
        msg =  "text=" + readout.temperature.toFixed(1) + '\u00B0 C, ' +
               readout.humidity.toFixed(1) + '%' + "\n";
        msg += "pt=14" + "\n";
        msg += "font_name=FreeMono:style=Bold" + "\n";
        msg += "vertical_margin=40" + "\n";
        msg += "horizontal_margin=10" + "\n";
        msg += "stroke_width=1.4" + "\n";
        msg += "layout_align=bottom,right" + "\n";
        msg += "duration=5" + "\n";
        // fs.writeFile('/run/shm/hooks/subtitle', msg, console.error);
    },
    scheduleReading(interval) {
        var _this = this;
        this.interval = setInterval(function () {
            var readout = sensorLib.read();
            if (!readout.temperature && !readout.humidity && readout.errors) {
                return console.warn("Bad data, temperature sensor likely still initializing...")
            }
            if (argv.log) _this.logReading(readout);
            if (argv.publish) _this.publishSubtitle(readout);
        }, interval);
        console.log("Scheduled readings once every " + interval + " milliseconds");
    },
    cancelReading: function () {
        clearInterval(this.interval);
        console.log("Cancelled scheduled readings");
    }
};

if (sensor.initialize(TEMP_PIN)) {
    sensor.scheduleReading(2000);
} else {
    console.warn('Failed to initialize sensor');
}

