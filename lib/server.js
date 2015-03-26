var hapi = require('hapi');
var Q = require('q');

function registerRoutes(server) {
  var promise = Q.defer();

  server.register({
    register: require('./routes/status')
  }, {
    routes: {
      prefix: '/api/status'
    }
  }, function () {
    promise.resolve(server);
  });

  return promise.promise;
}

function startServer(server) {
  var promise = Q.defer();

  server.start(function serverStarted() {
    console.log('Server running at: ' + server.info.uri);
    promise.resolve(server);
  });

  return promise.promise;
}

module.exports = function () {
  var deferred = Q.defer();
  var server = new hapi.Server();
  server.connection({
    port: process.env.PORT | 0
  });

  registerRoutes(server)
    .then(startServer)
    .then(deferred.resolve);

  return deferred.promise;
};
