const request = require('supertest');
const {User}  = require('../../models/user');

let server;

describe('/users/', () => {
  beforeEach(() => { server = require('../../server'); });
  afterEach(async () => { 
    server.close(); 
    await User.deleteOne({ screenname: 'Utest1'});
    await User.deleteOne({ screenname: 'Utest2'});
    await User.deleteOne({ screenname: 'Utest3'});
  });

  describe('Get /', () => {
    it('should return all users', async () => {
      await User.collection.insertMany([
        { first: 'John', 
          last: 'Doe', 
          email: 'testing.gmail.com', 
          screenname: 'Utest1', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest22',
          discord: 'Dtest1' },
         { first: 'Jane', 
           last: 'Doe', 
           email: 'testing2.gmail.com', 
           screenname: 'Utest2', 
           phone: '9161112223', 
           gender: 'Female',
           password: 'PWtest23',
           discord: 'Dtest2' },   
      ])
      const res = await request(server).get('/users');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body.some(u => u.screenname === 'Utest1')).toBeTruthy();
      expect(res.body.some(u => u.screenname === 'Utest2')).toBeTruthy();
      expect(res.body.some(u => u.screenname === 'HOS UK')).toBeTruthy();
    });
  });

  describe('Get /:id', () => {
    it('should return a user if valid id is passed', async () => {
      const user = new User(
        { email: 'testing3.gmail.com', 
          screenname: 'Utest3', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest23',
          discord: 'Dtest3' 
        });
        user.name.first = 'John';
        user.name.last  = 'Doe';
        await user.save();

        console.log('User ID', user._id);
        const res = await request(server).get('/users/id/' + user._id);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('screenname', user.screenname);
    });
  });  


});