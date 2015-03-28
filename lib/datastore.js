var redis = require('redis');
var client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {auth_pass: process.env.REDIS_PASS});
var q = require('q');

function get(gameName, keyName) {
  var promise = q.defer();

  client.get(gameName + '.' + keyName, function (error, data) {
    promise.resolve(data);
  });

  return promise.promise;
}

function set(gameName, keyName, value) {
  var promise = q.defer();

  client.set(gameName + '.' + keyName, value, function (error) {
    promise.resolve(value);
  });

  return promise.promise;
}

module.exports = {
  get: get,
  set: set
};
