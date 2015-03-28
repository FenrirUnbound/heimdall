var boom = require('boom');
var datastore = require('../../datastore');
var whitelist = require('./whitelist');

function createGame(request, reply) {
  var game = request.params.game;

  datastore.incr(game)
    .then(function (gameId) {
      return reply({
        gameId: gameId
      });
    });
}

function getGame(request, reply) {
  var game = request.params.game;

  datastore.get(game, 'count')
    .then(function (value) {
      return reply({count: value || 0});
    });
}

function getGameData(request, reply) {
  var game = request.params.game;
  var gameId = request.params.gameId;
  var data = request.payload;

  datastore.get(game, gameId)
    .then(function (gameData) {
      return reply(gameData);
    });
}

function getWhitelist(request, reply) {
  return reply(whitelist);
}

function updateGameData(request, reply) {
  var game = request.params.game;
  var gameId = request.params.gameId;
  var data = request.payload;

  datastore.set(game, gameId, data)
    .then(function (saveData) {
      return reply(saveData);
    });
}

function validateAgainstWhitelist(method, request, reply) {
  var game = request.params.game;

  if (whitelist.indexOf(game) < 0){
    return reply(boom.notFound());
  }

  method.call(method, request, reply);
}

exports.register = function (server, options, next) {
  var routes = [
    {
      method: 'GET',
      path: '/',
      handler: getWhitelist
    },
    {
      method: 'GET',
      path: '/{game}',
      handler: validateAgainstWhitelist.bind(this, getGame)
    },
    {
      method: 'POST',
      path: '/{game}',
      handler: validateAgainstWhitelist.bind(this, createGame)
    },
    {
      method: 'PUT',
      path: '/{game}/{gameId}',
      handler: validateAgainstWhitelist.bind(this, updateGameData)
    },
    {
      method: 'GET',
      path: '/{game}/{gameId}',
      handler: validateAgainstWhitelist.bind(this, getGameData)
    }
  ];

  routes.forEach(function assignRoutes(route) {
    server.route(route);
  });

  next();
};

exports.register.attributes = {
  name: 'games',
  version: '1.4.0'
};
