const request = require('supertest');
const {User}  = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/users/', () => {
  beforeEach(() => { server = require('../../server'); });
  afterEach(async () => { 
    server.close(); 
    await User.deleteOne({ screenname: 'Utest1'});
    await User.deleteOne({ screenname: 'Utest2'});
    await User.deleteOne({ screenname: 'Utest3'});
    await User.deleteOne({ screenname: 'Utest4'});
    await User.deleteOne({ screenname: 'Utest7'});
  });

  describe('Get /', () => {
    it('should return all users', async () => {
      await User.collection.insertMany([
        { first: 'John', 
          last: 'Doe', 
          DoB: "1991-01-01",
          email: 'testing@gmail.com', 
          screenname: 'Utest1', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest22',
          discord: 'Dtest1' },
         { first: 'Jane', 
           last: 'Doe', 
           DoB: "1991-02-01",
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
          DoB: "1991-03-01",
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

    it('should return 404 if no user with given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get('/users/id/' + id);

      expect(res.status).toBe(404);
    });

  });  

  describe('POST /', () => {
  
    /* sample of re-usable function from MOSH course ... we are not using AUTH same way here
       so only here as an example of what we might use in the future

    let token;   // define token var to be used in exec calls to vary
    let screenname;
    const exec = async () => {
      return await request(server)
      .post('/users')
      .set('x-auth-token', token)
      .send({ screenname: screenname });
    }  

    beforeEach(() => {
      token = new User().generateAuthToken();
      screenname = 'Utest4';
    });
    */

    /* following test assumes middleware auth is part of POST to test if user is logged in
    it('should return 401 if client is not logged in', async () => {
      token = '';   // not logged in as token is empty
      screenname = 'Utest1';
      const res = await exec();
      //const res = await request(server).post('/users').send({ screenname: screenname });
      expect(res.status).toBe(401);
    });
    */
 
    it('should return 400 if user screenname is less than 5 characters', async () => {
      /* if auth was part of post ... using the exec function defined above
      screenname = '1234';
      const res = await exec(); ... this instead of the const res below
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

      const res = await request(server).post('/users').send({ email: 'Art@gmail.com', 
        screenname: 'Utest7', 
        phone: '9161112237', 
        gender: 'Male',
        password: 'PWtest37',
        discord: 'Dtest7',
        DoB: "1997-07-01",
        "name":
          {"first": "Jorge",
          "last": "Sport"
        }
      });

      expect(res.status).toBe(400);
    });

    it('should save the user if it is valid', async () => {

      const res = await request(server).post('/users').send({ screenname: 'Utest3'});

      const user = await User.find({ screenname: 'Utest3' });

      expect(user).not.toBeNull();
    });

    it('should return the user email if it is valid', async () => {

      /* sample of AUTH and exec function if it was done the same way in User routes 
      const token = new User().generateAuthToken();
      await exec();
      */

      const res = await request(server).post('/users').send({ email: 'testing4@gmail.com', 
        screenname: 'Utest4', 
        phone: '9161112230', 
        gender: 'Male',
        password: 'PWtest30',
        discord: 'Dtest4',
        DoB: "1991-04-01",
        "name":
          {"first": "Jack",
          "last": "Sprat"
        }
     });

      expect(res.status).toBe(200); 
      //don't care what _id is ... just that we got one
      expect(res.body).toHaveProperty('_id');   
      //testing for specific screenname
      expect(res.body).toHaveProperty('email', 'testing4@gmail.com'); 
    });





  });

});