const request = require('supertest');
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');

let server;

describe('auth middleware', () => {

  beforeEach(() => { server = require('../../../server'); });
  afterEach(async () => { 
    server.close(); 
  });

  let token;
  
  /* failing to work ... get res.status not function errors
     need to learn more before this will work for us
  it('should return 401 if no token is provided', async () => {
    
    token = '';

    const req = {
      header: jest.fn().mockReturnValue(token)
    };
    const res = jest.fn();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toBe(401);

  });

  /*
  it('should return 400 if token is invalid', async () => {

    token = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
    
  });
  */

});