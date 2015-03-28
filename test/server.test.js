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

    it('should reserve a game session', function testGameReserve(done) {
      async.series({
        before: function initialCount(next) {
          server.inject({
            method: 'GET',
            url: '/api/games/totoro'
          }, function fetchedInitialCount(response) {
            var data = JSON.parse(response.payload);
            next(null, data.count);
          });
        },
        after: function reserveGame(next) {
          server.inject({
            method: 'POST',
            url: '/api/games/totoro'
          }, function reservedGameId(response) {
            var data = JSON.parse(response.payload);
            next(null, data.gameId);
          });
        }
      }, function verify(error, data) {
        expect(error).to.not.be.ok;
        expect(data.before).to.be.lessThan(data.after);
        done();
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
