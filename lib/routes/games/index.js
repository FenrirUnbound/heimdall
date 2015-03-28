var boom = require('boom');
var datastore = require('../../datastore');
var whitelist = [
  'totoro'
];

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply(whitelist);
    }
  });

  server.route({
    method: 'GET',
    path: '/{game}',
    handler: function (request, reply) {
      var game = request.params.game;

      if (whitelist.indexOf(game) < 0) {
        return reply(boom.notFound());
      }

      datastore.get(game, 'count')
        .then(function (value) {
          return reply({count: value || 0});
        });
    }
  });

  next();
};

exports.register.attributes = {
  name: 'games',
  version: '1.0.0'
};
