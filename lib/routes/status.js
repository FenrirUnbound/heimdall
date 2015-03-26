exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply({
        'status': 'OK'
      });
    }
  });

  next();
};

exports.register.attributes = {
  name: 'status',
  version: '1.0.0'
};
