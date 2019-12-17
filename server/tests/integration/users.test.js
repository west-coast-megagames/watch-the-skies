const request = require('supertest');

let serverObj;

describe('/api/users', () => {
  beforeEach(() => { serverObj = requie('../../server'); });
  afterEach(() => { serverObj.close(); });

  describe('Get /', () => {
    it('should return all users', async () => {
      const res = await request(serverObj).get('/api/users');
      expect(res.status).toBe(200);
    });
  });


});