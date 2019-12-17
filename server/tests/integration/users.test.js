const request = require('supertest');

let server;

describe('/users/', () => {
  beforeEach(() => { server = require('../../server'); });
  afterEach(() => { server.close(); });

  describe('Get /', () => {
    it('should return all users', async () => {
      const res = await request(server).get('/users');
      expect(res.status).toBe(200);
    });
  });


});