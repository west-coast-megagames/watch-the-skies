const request = require('supertest');
const {User}  = require('../../../models/user');
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');

let server;

describe('auth middleware', () => {

  beforeEach(() => { server = require('../../../server'); });
  afterEach(async () => { 
    await User.deleteOne({ screenname: 'Utest6'});
    server.close(); 
  });

  let token;
  
  // from MOSH ... dropped isAdmin
  it('should populate req.user with the payload of a valid JWT', () => {
    const user = { 
      _id: mongoose.Types.ObjectId().toHexString()
    };
    const token = new User(user).generateAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(token)
    };
    const res = {};
    const next = jest.fn();
    
    auth(req, res, next);

    expect(req.user).toMatchObject(user);
  });
  
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
    expect(req.user).toBeDefined();
  
  });

  /*
  it('should return 400 if token is invalid', async () => {
      
    token = 'a';
    
    const res = await exec();
  
    expect(res.status).toBe(400);
    
  });
  */

});