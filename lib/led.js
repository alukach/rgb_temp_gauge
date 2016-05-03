var Gpio = require('pigpio').Gpio,
    watch = require("watchjs").watch,
    colorful = require('colorful'),
    color = require('onecolor');

module.exports = {
    initialize: function (red_pin, green_pin, blue_pin) {
        this.r_led = new Gpio(red_pin, {mode: Gpio.OUTPUT});
        this.g_led = new Gpio(green_pin, {mode: Gpio.OUTPUT});
        this.b_led = new Gpio(blue_pin, {mode: Gpio.OUTPUT});
        this.r = 100;
        this.g = 100;
        this.b = 100;
        this.intensity = 1;

        // Watch properties for change, update lights accordingly
        watch(this, ["r", "g", "b", "intensity"], this.update);
        return true;
    },
    setColor: function (r_val, g_val, b_val, intensity) {
        this.r = r_val;
        this.g = g_val;
        this.b = b_val;
        this.intensity = intensity;
        return this;
    },
    update: function () {
        this.r_led.pwmWrite(Math.round(255-(this.r * this.intensity)));
        this.g_led.pwmWrite(Math.round(255-(this.g * this.intensity)));
        this.b_led.pwmWrite(Math.round(255-(this.b * this.intensity)));
        return this;
    },
    state: function () {
        return [this.r, this.g, this.b, this.intensity];
    },
    toggleIntensity: function () {
        if (this.intensity < 1) {
            this.intensity += .1
        } else {
            this.intensity = .1
        }
    },
    colorFromValue: function (value){
        // value from 0 to 1
        var range = 240;
        var hue = ((1-value)*range).toString(10);
        var hsv = new color.HSV(hue/range, 1, 100);
        var rgb = hsv.rgb();
        return setColor(rgb.red() * 255, rgb.green() * 255, rgb.blue() * 255, .5)
    }
}

