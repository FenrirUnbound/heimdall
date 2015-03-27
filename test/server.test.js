var expect = require('chai').expect;

describe('Server', function describeServer() {
  var server;

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
  });
})
