const VERBOSITY = require('./cli').verbose;

module.exports = {
    warn: function () {
        VERBOSITY >= 0 && console.log.apply(console, arguments);
    },
    info: function () {
        VERBOSITY >= 1 && console.log.apply(console, arguments);
    },
    debug: function () {
        VERBOSITY >= 2 && console.log.apply(console, arguments);
    }
}

