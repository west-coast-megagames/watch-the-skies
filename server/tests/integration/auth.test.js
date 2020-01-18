const request = require('supertest');
const {User}  = require('../../models/user');

describe('auth middleware', () => {

  beforeEach(() => { server = require('../../server'); });
  afterEach(async () => { 
    await User.deleteOne({ username: 'Utest5'});
    server.close(); 
  });

  let token;

  const exec = () => {
      return request(server)
        .post('/user')
        .set('x-auth-token', token)
        .send({ email: 'testing5@gmail.com', 
          username: 'Utest5', 
          phone: '9161112230', 
          gender: 'Male',
          password: 'PWtest31',
          discord: 'Dtest5',
          DoB: "1991-04-01",
          "name":
            {"first": "Jack",
            "last": "Sprat"
        }
     });

  }   
  
  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  it('should return 200 if token is valid', async () => {
    
    const res = await exec();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');   
    //testing for specific email
    expect(res.body).toHaveProperty('email', 'testing5@gmail.com');

});



});