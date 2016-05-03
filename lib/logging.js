var config = require('./cli');

function warn()  { config.VERBOSITY >= 0 && console.log.apply(console, arguments); }
function info()  { config.VERBOSITY >= 1 && console.log.apply(console, arguments); }
function debug() { config.VERBOSITY >= 2 && console.log.apply(console, arguments); }
