"use strict";
var Gpio = require('pigpio').Gpio,
    watch = require("watchjs").watch,
    colorful = require('colorful'),
    color = require('onecolor'),
    logging = require('./logging');

module.exports = class Led {
    constructor(red_pin, green_pin, blue_pin) {
        if ([red_pin, green_pin, blue_pin].some((x) => typeof x === 'undefined')) {
            throw new Error('Missing args, can\'t initialize Sheet');
        }
        this.r_led = new Gpio(red_pin, {mode: Gpio.OUTPUT});
        this.g_led = new Gpio(green_pin, {mode: Gpio.OUTPUT});
        this.b_led = new Gpio(blue_pin, {mode: Gpio.OUTPUT});

        this.intensity = 1;
        this.intensityMultiplier = 3;

        this.r = 0;
        this.g = 0;
        this.b = 0;

        this.fadeTotalTimespan = 1;
        this.fadeStepLength = .05;

        // Watch properties for change, update lights accordingly
        watch(this, ["r", "g", "b", "intensity"], function () {
            let r_val = Math.round(255-(this.r * this.intensity));
            let g_val = Math.round(255-(this.g * this.intensity));
            let b_val = Math.round(255-(this.b * this.intensity));
            this.r_led.pwmWrite(r_val);
            this.g_led.pwmWrite(g_val);
            this.b_led.pwmWrite(b_val);
            return this;
        });
    }

    /*
     * RGB colors should be values between 0 & 255.
     * Intensity should be between 0 and 1.
     */
    _setColor(r_val, g_val, b_val, _current_step, _total_steps, _step_r, _step_g, _step_b) {
        _current_step = _current_step || 0;
        _total_steps = _total_steps || this.fadeTotalTimespan / this.fadeStepLength;
        if (!_step_r) {
            _step_r = (r_val - this.r) / _total_steps;
            _step_g = (g_val - this.g) / _total_steps;
            _step_b = (b_val - this.b) / _total_steps;
        }

        if (_current_step < _total_steps) {
            // Limit value to below / equal to 255
            this.r = this._formatLedRgbVal(this.r + _step_r);
            this.g = this._formatLedRgbVal(this.g + _step_g);
            this.b = this._formatLedRgbVal(this.b + _step_b);
            return setTimeout(
                this._setColor.bind(this, r_val, g_val, b_val, _current_step+1, _total_steps, _step_r, _step_g, _step_b),
                this.fadeStepLength
            );
        } else {
            this.r = r_val;
            this.g = g_val;
            this.b = b_val;
            return
        }
    }

    _formatLedRgbVal(val) {
        if (val > 255) return 255;
        if (val < 0) return 0;
        return val
    }

    toggleIntensity() {
        if (this.intensity < 1) {
            // Increase by multiple, max of 1
            let new_intensity = this.intensity * this.intensityMultiplier;
            this.intensity = new_intensity > 1 ? 1 : new_intensity;
        } else {
            // Reset to .01
            this.intensity = .01
        }
        return this.intensity
    }

    _valueFromTemp(t) {
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
        if ((goal_low <= t) && (t <= goal_high)) {
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

    /*
     * Value should be between 0 and 1
     */
    _setColorFromValue(value) {
        // value from 0 to 1
        let range = 240;
        let hue = ((1-value)*range).toString(10);
        let hsv = new color.HSV(hue/range, 1, 100);
        let rgb = hsv.rgb();
        return this._setColor(rgb.red() * 255, rgb.green() * 255, rgb.blue() * 255)
    }

    colorFromTemp(t) {
        let colorValue = this._valueFromTemp(t);
        logging.debug("Color value:", colorValue);
        return this._setColorFromValue(colorValue);
    }
}
