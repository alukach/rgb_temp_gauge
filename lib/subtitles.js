/*
For use w/ PiCam https://github.com/iizukanao/picam
*/
var fs = require('fs'),
    logging = require('./logging');

module.exports = publishSubtitle(readout) {
    msg = `text=${readout.temperature} \u00B0 C, ${readout.humidity}%\n`;
    msg += "pt=14" + "\n";
    msg += "font_name=FreeMono:style=Bold" + "\n";
    msg += "vertical_margin=40" + "\n";
    msg += "horizontal_margin=10" + "\n";
    msg += "stroke_width=1.4" + "\n";
    msg += "layout_align=bottom,right" + "\n";
    msg += "duration=5" + "\n";
    fs.writeFile('/run/shm/hooks/subtitle', msg, logging.error);
}