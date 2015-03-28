var async = require('async');
var env = require('node-env-file');
var expect = require('chai').expect;
var q = require('q');
var path = require('path');

describe('Server', function describeServer() {
  var server;

  before(function onceBefore() {
    env(path.resolve(__dirname, '..', '.env'), {raise:false});
  });

  beforeEach(function beforeAll(done) {
    var me = require('../lib/server');
    me().then(function startedServer(serverInstance) {
      server = serverInstance;
      done();
    });
  });

  afterEach(function afterAll(done) {
    server.stop(done);
    server = null;
  });

  function sendRequest(options, expectedStatusCode) {
    var promise = q.defer();

    server.inject(options, function handleResponse(response) {
      var data;
      expect(response.statusCode).to.equal(expectedStatusCode);
      data = JSON.parse(response.payload);
      promise.resolve(data);
    });

    return promise.promise;
  }

  it('should create and start a server', function testStart(done) {
    server.stop(done);
  });

  describe('-- Status', function describeStatus() {
    it('should serve an OK status', function testStatus(done) {
      sendRequest({
        method: 'GET',
        url: '/api/status'
      }, 200).then(function verify(data) {
        expect(data).to.deep.equal({status:'OK'});
        done();
      });
    });
  });

  describe('-- Games', function describeGames() {
    it('should list the gameIds', function testGameList(done) {
      sendRequest({
        method: 'GET',
        url: '/api/games'
      }, 200).then(function verify(data) {
        expect(data).to.deep.equal([
          'totoro'
        ]);
        done();
      });
    });

    it('should get the current number of games', function testGameCount(done) {
      sendRequest({
        method: 'GET',
        url: '/api/games/totoro'
      }, 200).then(function verify(data) {
        expect(data).to.have.property('count')
          .that.is.at.least(0);
          done();
      });
    });

    it('saves data for a reserved game', function testGameSave(done) {
      async.series([
        function initialCount(next) {
          sendRequest({
            method: 'GET',
            url: '/api/games/totoro'
          }, 200).then(function completed(data) {
            next(null, data.count);
          });
        },
        function reserveGame(next) {
          sendRequest({
            method: 'POST',
            url: '/api/games/totoro'
          }, 201).then(function completed(data) {
            next(null, data.gameId);
          });
        }
      ], function verify(error, data) {
        var testData = {'test': 123, 'data': '456'};
        expect(error).to.not.be.ok;
        expect(data[0]).to.be.lessThan(data[1]);

        async.series([
          function saveGameData(next) {
            sendRequest({
              method: 'PUT',
              payload: JSON.stringify(testData),
              url: '/api/games/totoro/' + data[1]
            }, 200).then(function completed(result) {
              expect(result).to.deep.equal(testData);
              next(null, result);
            });
          },
          function fetchGameData(next) {
            sendRequest({
              method: 'GET',
              url: '/api/games/totoro/' + data[1]
            }, 200).then(function completed(result) {
              next(null, result);
            });
          }
        ], function validate(lastError, result) {
          expect(lastError).to.not.be.ok;
          expect(result[0]).to.deep.equal(testData);
          expect(result[1]).to.deep.equal(testData);
          done();
        });
      });
    });

    describe('Failures', function describeGameFailures() {
      it('should miss if requesting a non-existent game', function failMissingGame(done) {
        sendRequest({
          method: 'GET',
          url: '/api/games/fakeGame'
        }, 404).then(function finish() {
          done();
        });
      });
    });
  });
})
