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

  next();
};

exports.register.attributes = {
  name: 'games',
  version: '1.0.0'
};
