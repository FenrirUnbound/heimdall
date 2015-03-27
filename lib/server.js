var Hapi = require('hapi');
var Items = require('items');
var Q = require('q');
var Routes = require('./routes');

function registerRoutes(server) {
  var promise = Q.defer();
  var routes = [
    {
      register: Routes.status,
      options: {
        routes: {
          prefix: '/api/status'
        }
      }
    },
    {
      register: Routes.games,
      options: {
        routes: {
          prefix: '/api/games'
        }
      }
    }
  ];

  Items.serial(routes, function routeRegistration(item, next) {
    server.register({
      register: item.register
    }, item.options, next);
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
  var server = new Hapi.Server();
  server.connection({
    port: process.env.PORT | 0
  });

  registerRoutes(server)
    .then(startServer)
    .then(deferred.resolve);

  return deferred.promise;
};
