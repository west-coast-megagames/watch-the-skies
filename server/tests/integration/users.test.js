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
    await User.deleteOne({ screenname: 'Utest4'});
  });

  describe('Get /', () => {
    it('should return all users', async () => {
      await User.collection.insertMany([
        { first: 'John', 
          last: 'Doe', 
          email: 'testing@gmail.com', 
          screenname: 'Utest1', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest22',
          discord: 'Dtest1' },
         { first: 'Jane', 
           last: 'Doe', 
           email: 'testing2@gmail.com', 
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
        { email: 'testing3@gmail.com', 
          screenname: 'Utest3', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest23',
          discord: 'Dtest3' 
        });
        user.name.first = 'John';
        user.name.last  = 'Doe';
        await user.save();

        const res = await request(server).get('/users/id/' + user._id);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('screenname', user.screenname);
    });

    it('should return 404 if invalid id is passed', async () => {
        // pass in invalid id ... don't need to create a record
        const res = await request(server).get('/users/id/1');
        expect(res.status).toBe(404);
    });
  });  

  describe('POST /', () => {
  
    /* following test assumes middleware auth is part of POST to test if user is logged in
    it('should return 401 if client is not logged in', async () => {
      const res = await request(server).post('/users').send({ screenname: 'Utest1'});
      expect(res.status).toBe(401);
    });
    */
 
    it('should return 400 if user screenname is less than 5 characters', async () => {
      /* if auth was part of post
      const token = new User().generateAuthToken();

      and add to const res below between .post and .send
      .set('x-auth-token', token)
      */

      const res = await request(server).post('/users').send({ screenname: '1234'});
      expect(res.status).toBe(400);
    });

    it('should return 400 if user screenname is more than 15 characters', async () => {

      // generate a string from array number of elements minus 1 ... so 16 chars > 15 in joi validation
      const testScreenname = new Array(17).join('a');
      const res = await request(server).post('/users').send({ screenname: testScreenname});
      expect(res.status).toBe(400);
    });

    it('should return 400 if user email is already used (in database)', async () => {

      const res = await request(server).post('/users').send({ email: 'Art@gmail.com'});
      expect(res.status).toBe(400);
    });

    it('should save the user if it is valid', async () => {

      const res = await request(server).post('/users').send({ screenname: 'Utest3'});

      const user = await User.find({ screenname: 'Utest3' });

      expect(user).not.toBeNull();
    });

    /*
    it('should return the user email if it is valid', async () => {

      const res = await request(server).post('/users').send({ email: 'testing4@gmail.com', 
        screenname: 'Utest4', 
        phone: '9161112230', 
        gender: 'Male',
        password: 'PWtest30',
        discord: 'Dtest4',
        first: "Jack",
        last: "Sprat"
     });

      //don't care what _id is ... just that we got one
      expect(res.header).toHaveProperty('_id');   
      //testing for specific screenname
      expect(res.header).toHaveProperty('email', 'testing4@gmail.com'); 
    });
    */

  });

});