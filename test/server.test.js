var async = require('async');
var env = require('node-env-file');
var expect = require('chai').expect;
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

  it('should create and start a server', function testStart(done) {
    server.stop(done);
  });

  describe('-- Status', function describeStatus() {
    it('should serve an OK status', function testStatus(done) {
      server.inject({
        method: 'GET',
        url: '/api/status'
      }, function (response) {
        var data = JSON.parse(response.payload);
        expect(response.statusCode).to.deep.equal(200);
        expect(data).to.deep.equal({status:'OK'});
        done();
      });
    });
  });

  describe('-- Games', function describeGames() {
    it('should list the gameIds', function testGameList(done) {
      server.inject({
        method: 'GET',
        url: '/api/games'
      }, function verify(response) {
        var data = JSON.parse(response.payload);
        expect(response.statusCode).to.deep.equal(200);
        expect(data).to.deep.equal([
          'totoro'
        ]);
        done();
      });
    });

    it('should get the current number of games', function testGameCount(done) {
      server.inject({
        method: 'GET',
        url: '/api/games/totoro'
      }, function verify(response) {
        var data;
        expect(response.statusCode).to.deep.equal(200);
        data = JSON.parse(response.payload);
        expect(data).to.have.property('count')
          .that.is.at.least(0);
        done();
      });
    });

    it('saves data for a reserved game', function testGameSave(done) {
      async.series([
        function initialCount(next) {
          server.inject({
            method: 'GET',
            url: '/api/games/totoro'
          }, function fetchedInitialCount(response) {
            var data = JSON.parse(response.payload);
            next(null, data.count);
          });
        },
        function reserveGame(next) {
          server.inject({
            method: 'POST',
            url: '/api/games/totoro'
          }, function reservedGameId(response) {
            var data = JSON.parse(response.payload);
            next(null, data.gameId);
          });
        }
      ], function verify(error, data) {
        var testData;
        expect(error).to.not.be.ok;
        expect(data[0]).to.be.lessThan(data[1]);

        testData = {'test': 123, 'data': '456'};
        async.series([
          function saveGameData(next) {
            server.inject({
              method: 'PUT',
              payload: JSON.stringify(testData),
              url: '/api/games/totoro/' + data[1]
            }, function saveGameResult(response) {
              var result;
              expect(response.statusCode).to.deep.equal(200);
              result = JSON.parse(response.payload);
              expect(result).to.deep.equal(testData);
              next(null, result);
            });
          },
          function fetchGameData(next) {
            server.inject({
              method: 'GET',
              url: '/api/games/totoro/' + data[1]
            }, function gameDataResult(response) {
              var result;
              expect(response.statusCode).to.deep.equal(200);
              result = JSON.parse(response.payload);
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
        server.inject({
          method: 'GET',
          url: '/api/games/fakeGame'
        }, function verify(response) {
          expect(response.statusCode).to.equal(404);
          done();
        });
      });
    });
  });
})
