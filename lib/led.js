"use strict";
var Gpio = require('pigpio').Gpio,
    watch = require("watchjs").watch,
    colorful = require('colorful'),
    color = require('onecolor');

module.exports = class Led {
    constructor(red_pin, green_pin, blue_pin) {
        if ([red_pin, green_pin, blue_pin].some((x) => typeof x === 'undefined')) {
            throw new Error('Missing args, can\'t initialize Sheet');
        }
        this.r_led = new Gpio(red_pin, {mode: Gpio.OUTPUT});
        this.g_led = new Gpio(green_pin, {mode: Gpio.OUTPUT});
        this.b_led = new Gpio(blue_pin, {mode: Gpio.OUTPUT});
        this.r = 100;
        this.g = 100;
        this.b = 100;
        this.intensity = 1;

        // Watch properties for change, update lights accordingly
        watch(this, ["r", "g", "b", "intensity"], function () {
            this.r_led.pwmWrite(Math.round(255-(this.r * this.intensity)));
            this.g_led.pwmWrite(Math.round(255-(this.g * this.intensity)));
            this.b_led.pwmWrite(Math.round(255-(this.b * this.intensity)));
            return this;
        });
    }

    /*
     * RGB colors should be values between 0 & 255.
     * Intensity should be between 0 and 1.
     */
    _setColor(r_val, g_val, b_val, intensity) {
        this.r = r_val;
        this.g = g_val;
        this.b = b_val;
        this.intensity = intensity;
        return this;
    }

    toggleIntensity() {
        if (this.intensity < 1) {
            this.intensity += .1
        } else {
            this.intensity = .1
        }
    }

    /*
     * Value should be between 0 and 1
     */
    colorFromValue(value) {
        // value from 0 to 1
        let range = 240;
        let hue = ((1-value)*range).toString(10);
        let hsv = new color.HSV(hue/range, 1, 100);
        let rgb = hsv.rgb();
        return this._setColor(rgb.red() * 255, rgb.green() * 255, rgb.blue() * 255, .5)
    }
}

