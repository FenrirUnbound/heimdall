require('node-env-file')(__dirname + './env', {raise: false});
return require('./lib/server')();
