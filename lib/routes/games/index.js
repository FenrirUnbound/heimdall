var datastore = require('../../datastore');

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply([
        'totoro'
      ]);
    }
  });

  server.route({
    method: 'GET',
    path: '/totoro',
    handler: function (request, reply) {
      datastore.get('totoro', 'count')
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
