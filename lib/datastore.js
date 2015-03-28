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

function incr(gameName) {
  var promise = q.defer();
  var key = gameName + '.count';
  var expireTime = 60 * 60 * 24 * 7 * 2;  // 2 weeks

  client.incr(key, function (incrError, gameId) {
    client.expire(key, expireTime, function (expireError) {
      promise.resolve(gameId);
    })
  });

  return promise.promise;
}

function set(gameName, keyName, value) {
  var promise = q.defer();
  var expireTime = 60 * 60 * 24 * 7;

  client.set(gameName + '.' + keyName, JSON.stringify(value), 'EX', expireTime, function (error) {
    promise.resolve(value);
  });

  return promise.promise;
}

module.exports = {
  get: get,
  incr: incr,
  set: set
};
