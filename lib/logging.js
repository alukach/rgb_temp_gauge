const VERBOSITY = require('./cli').verbose;

module.exports = {
    warn: () => {
        VERBOSITY >= 0 && console.log.apply(console, arguments);
    },
    info: () => {
        VERBOSITY >= 1 && console.log.apply(console, arguments);
    },
    debug: () => {
        VERBOSITY >= 2 && console.log.apply(console, arguments);
    }
}

