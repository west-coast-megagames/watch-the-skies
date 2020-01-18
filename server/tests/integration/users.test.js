const request = require('supertest');
const {User}  = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/user/', () => {
  beforeEach(() => { server = require('../../server'); });
  afterEach(async () => { 
    server.close(); 
    await User.deleteOne({ username: 'Utest1'});
    await User.deleteOne({ username: 'Utest2'});
    await User.deleteOne({ username: 'Utest3'});
    await User.deleteOne({ username: 'Utest3a'});
    await User.deleteOne({ username: 'Utest3b'});
    await User.deleteOne({ username: 'Utest3c'});
    await User.deleteOne({ username: 'Utest3d'});
    await User.deleteOne({ username: 'Utest4'});
    await User.deleteOne({ username: 'Utest7'});
    await User.deleteOne({ username: 'Putuser1'});
    await User.deleteOne({ username: 'Putuser2'});
    await User.deleteOne({ username: 'Putuser3'});
    await User.deleteOne({ username: 'Putuser4'});
    await User.deleteOne({ username: 'UpdPutUser4'});
    await User.deleteOne({ username: 'Putuser5'});
    await User.deleteOne({ username: 'UpdPutUser5'});
    await User.deleteOne({ username: 'Deluser1'});
  });

  describe('Get /', () => {
    it('should return all users', async () => {
      await User.collection.insertMany([
        { first: 'John', 
          last: 'Doe', 
          dob: "1991-01-01",
          email: 'testing@gmail.com', 
          username: 'Utest1', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest22',
          discord: 'Dtest1' },
         { first: 'Jane', 
           last: 'Doe', 
           dob: "1991-02-01",
           email: 'testing2@gmail.com', 
           username: 'Utest2', 
           phone: '9161112223', 
           gender: 'Female',
           password: 'PWtest23',
           discord: 'Dtest2' },   
      ])
      const res = await request(server).get('/user');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body.some(u => u.username === 'Utest1')).toBeTruthy();
      expect(res.body.some(u => u.username === 'Utest2')).toBeTruthy();
      expect(res.body.some(u => u.username === 'HOS UK')).toBeTruthy();
    });
  });


  describe('Get /:id', () => {
    it('should return a user if valid id is passed', async () => {
      const user = new User(
        { email: 'testing3@gmail.com', 
          username: 'Utest3', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest23',
          dob: "1991-03-01",
          discord: 'Dtest3' 
        });
        user.name.first = 'John';
        user.name.last  = 'Doe';
        await user.save();

        const res = await request(server).get('/user/id/' + user._id);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('username', user.username);
    });

    it('should return 404 if invalid id is passed', async () => {
        // pass in invalid id ... don't need to create a record
        const res = await request(server).get('/user/id/1');
        expect(res.status).toBe(404);
        expect(res.text).toMatch(/Invalid ID/);
    });

    it('should return 404 if no user with given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get('/user/id/' + id);

      expect(res.status).toBe(404);
    });

  });  

/*   NOT READY YET
  describe('Get /me', () => {
    it('should return a user if valid id/token is passed', async () => {
      const user = new User(
        { email: 'testing3a@gmail.com', 
          username: 'Utest3a', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest23a',
          dob: "1991-03-01",
          discord: 'Dtest3a' 
        });
        user.name.first = 'John';
        user.name.last  = 'Doe';
        const token = user.generateAuthToken();
        await user.save();

        const res = await request(server).get('/user/me')
          .set('x-auth-token', token)
          .send({ user });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('username', user.username);
    });

    it('should return 404 if invalid id is passed', async () => {
        
      const user = new User(
        { email: 'testing3b@gmail.com', 
          username: 'Utest3b', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest23b',
          dob: "1991-03-01",
          discord: 'Dtest3b' 
        });
        user.name.first = 'John';
        user.name.last  = 'Doeb';
        const token = user.generateAuthToken();
        await user.save();
        user._id = "3b"
        const res = await request(server).get('/user/me')
          .set('x-auth-token', token)
          .send({ user });
        expect(res.status).toBe(404);
        expect(res.text).toMatch(/Invalid ID/);
    });

    it('should return 404 if no user with given id exists', async () => {
      const id = mongoose.Types.ObjectId();

      const user = new User(
        { email: 'testing3c@gmail.com', 
          username: 'Utest3c', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest23c',
          dob: "1991-03-01",
          discord: 'Dtest3c' 
        });
        user.name.first = 'John';
        user.name.last  = 'Doec';
        const token = user.generateAuthToken();
        await user.save();
        user._id = id;
        const res = await request(server).get('/user/me')
          .set('x-auth-token', token)
          .send({ user });

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/not found/);
    });

    it('should return 401 if no token is passed', async () => {
      const user = new User(
        { email: 'testing3d@gmail.com', 
          username: 'Utest3d', 
          phone: '9161112222', 
          gender: 'Male',
          password: 'PWtest23d',
          dob: "1991-03-01",
          discord: 'Dtest3d' 
        });
        user.name.first = 'John';
        user.name.last  = 'Doed';
        const token = "";    //user.generateAuthToken();
        await user.save();
        
        const res = await request(server).get('/user/me')
          .send({ user });
          // .set('x-auth-token', token)

        expect(res.status).toBe(401);
        expect(res.text).toMatch(/denied/);
    });
    
  });
*/

  describe('POST /', () => {
  
    /* sample of re-usable function from MOSH course ... we are not using AUTH same way here
       so only here as an example of what we might use in the future

    let token;   // define token var to be used in exec calls to vary
    let username;
    const exec = async () => {
      return await request(server)
      .post('/user')
      .set('x-auth-token', token)
      .send({ username: username });
    }  

    beforeEach(() => {
      token = new User().generateAuthToken();
      username = 'Utest4';
    });
    */

    /* following test assumes middleware auth is part of POST to test if user is logged in
    it('should return 401 if client is not logged in', async () => {
      token = '';   // not logged in as token is empty
      username = 'Utest1';
      const res = await exec();
      //const res = await request(server).post('/user').send({ username: username });
      expect(res.status).toBe(401);
    });
    */
 
    it('should return 400 if user username is less than 5 characters', async () => {
      /* if auth was part of post ... using the exec function defined above
      username = '1234';
      const res = await exec(); ... this instead of the const res below
      */

      const res = await request(server).post('/user').send({ username: '1234'});
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 400 if user username is more than 15 characters', async () => {

      // generate a string from array number of elements minus 1 ... so 16 chars > 15 in joi validation
      const testScreenname = new Array(17).join('a');
      const res = await request(server).post('/user').send({ username: testScreenname});
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 400 if user email is already used (in database)', async () => {

      const res = await request(server).post('/user').send({ email: 'Art@gmail.com', 
        username: 'Utest7', 
        phone: '9161112237', 
        gender: 'Male',
        password: 'PWtest37',
        discord: 'Dtest7',
        dob: "1997-07-01",
        "name":
          {"first": "Jorge",
          "last": "Sport"
        }
      });

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/already registered/);
    });

    it('should save the user if it is valid', async () => {

      const res = await request(server).post('/user').send({ username: 'Utest3'});

      const user = await User.find({ username: 'Utest3' });

      expect(user).not.toBeNull();
    });

    it('should return the user email if it is valid', async () => {

      /* sample of AUTH and exec function if it was done the same way in User routes 
      const token = new User().generateAuthToken();
      await exec();
      */

      const res = await request(server).post('/user').send({ email: 'testing4@gmail.com', 
        username: 'Utest4', 
        phone: '9161112230', 
        gender: 'Male',
        password: 'PWtest30',
        discord: 'Dtest4',
        dob: "1991-04-01",
        "name":
          {"first": "Jack",
          "last": "Sprat"
        }
     });

      expect(res.status).toBe(200); 
      //don't care what _id is ... just that we got one
      expect(res.body).toHaveProperty('_id');   
      //testing for specific username
      expect(res.body).toHaveProperty('email', 'testing4@gmail.com'); 
    });
  });

  describe('PUT /:id', () => {
    
    /*
    it('should return 401 if client is not logged in', async () => {
      token = ''; 
  
      const res = await exec();
  
      expect(res.status).toBe(401);
    });
    */

    it('should return 400 if user is less than 5 characters', async () => {
      token = new User().generateAuthToken();    
      //create a user 
      user = new User({ username: 'Putuser1',
        email: 'puttest1@gmail.com', 
        phone: '9161112240', 
        gender: 'Male',
        password: 'PWtest40',
        dob: "1991-12-01",
        discord: 'Dtest40' 
      });
      user.name.first = 'Alan';
      user.name.last  = 'Atwood';
      await user.save();
  
      id = user._id;   
      newScreenname = '1234'; 
        
      const res = await request(server).put('/user/' + user._id).send({ username: newScreenname});
  
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 400 if user is more than 15 characters', async () => {

      token = new User().generateAuthToken();    
      //create a user 
      user = new User({ username: 'Putuser2',
        email: 'puttest2@gmail.com', 
        phone: '9161112240', 
        gender: 'Male',
        password: 'PWtest40',
        dob: "1991-12-01",
        discord: 'Dtest40' 
      });
      user.name.first = 'Alan';
      user.name.last  = 'Atwood';
      await user.save();
  
      id = user._id;   
      newScreenname = new Array(17).join('a');
        
      const res = await request(server).put('/user/' + user._id).send({ username: newScreenname});
  
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 404 if id is invalid', async () => {
      token = new User().generateAuthToken();    
      //create a user 
      user = new User({ username: 'Putuser3',
        email: 'puttest3@gmail.com', 
        phone: '9161112240', 
        gender: 'Male',
        password: 'PWtest40',
        dob: "1991-12-01",
        discord: 'Dtest40' 
      });
      user.name.first = 'Alan';
      user.name.last  = 'Atwood';
      await user.save();
  
      let id = 1;   
      newScreenname = user.username;
        
      const res = await request(server).put('/user/' + id).send({ username: newScreenname});
  
      expect(res.status).toBe(404);
      expect(res.text).toMatch(/Invalid ID/);
    });

    it('should return 404 if user with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();
      newScreenname = "HOS USA";
  
      const res = await request(server).put('/user/' + id).send({ username: newScreenname,
        email: "PutUser99@hotmail.com",
        phone: '9161112237', 
        gender: 'Male',
        password: 'PWtest37',
        discord: 'Dtest7',
        dob: "1997-07-01",
        "name":
          {"first": "Jorge",
          "last": "Sport"
        }
      });
  
      expect(res.status).toBe(404);
    });
    
    it('should update the user if input is valid', async () => {
    
      token = new User().generateAuthToken();    
      //create a user 
      user = new User({ username: 'Putuser4',
        email: 'puttest4@gmail.com', 
        phone: '9161112240', 
        gender: 'Male',
        password: 'PWtest40',
        dob: "1991-12-01",
        discord: 'Dtest40' 
      });
      user.name.first = 'Alan';
      user.name.last  = 'Atwood';
      await user.save();
  
      newScreenname = "UpdPutUser4";
        
      const res = await request(server).put('/user/' + user._id).send({ username: newScreenname,
        email: user.email,
        phone: user.phone, 
        gender: user.gender,
        password: user.password,
        discord: user.discord,
        dob: user.dob,
        "name":
          {"first": user.name.first,
          "last": user.name.last
        }      
      });      
  
      const updatedUser = await User.findById(user._id);
  
      expect(updatedUser.username).toBe(newScreenname);
    });

    it('should return the updated user if it is valid', async () => {
      
      token = new User().generateAuthToken();    
      //create a user 
      user = new User({ username: 'Putuser5',
        email: 'puttest5@gmail.com', 
        phone: '9161112240', 
        gender: 'Male',
        password: 'PWtest40',
        dob: "1991-12-01",
        discord: 'Dtest40' 
      });
      user.name.first = 'Alan';
      user.name.last  = 'Atwood';
      await user.save();
  
      newScreenname = "UpdPutUser5";
  
      const res = await request(server).put('/user/' + user._id).send({ username: newScreenname,
        email: user.email,
        phone: user.phone, 
        gender: user.gender,
        password: user.password,
        discord: user.discord,
        dob: user.dob,
        "name":
          {"first": user.name.first,
          "last": user.name.last
        }      
      });
  
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username', newScreenname);
    });

  });

  describe('DELETE /:id', () => {
    let token; 
    let user; 
    let id; 

    const exec = async () => {
      return await request(server)
        .delete('/user/' + id)
        .set('x-auth-token', token)
        .send();
    }

    beforeEach(async () => {
      // Before each test we need to create a user and 
      // put it in the database.      
      user = new User({ username: 'Deluser1',
        email: 'deltest2@gmail.com', 
        phone: '9161112240', 
        gender: 'Male',
        password: 'PWtest40',
        dob: "1991-12-01",
        discord: 'Dtest40' 
      });
      user.name.first = 'Alan';
      user.name.last  = 'Atwood';
      await user.save();
      
      id = user._id; 
      token = new User().generateAuthToken();     
    })

    it('should return 404 if id is invalid', async () => {
      id = 1; 
      
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/Invalid ID/);
    });

    it('should return 404 if no user with the given id was found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/was not found/);
    });

    it('should delete the user if input is valid', async () => {
      await exec();

      const userInDb = await User.findById(id);

      expect(userInDb).toBeNull();
    });

    it('should return the removed user', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', user._id.toHexString());
      expect(res.body).toHaveProperty('username', user.username);
    });
    
  });  

  describe('Patch /User/DeleteAll', () => {
    
    it('should be no users if successful', async () => {

      const res = await request(server).patch('/user/deleteAll');

      expect(res.status).toBe(200);
      
      const userAny = await User.find();
      expect(userAny.length).toEqual(0);
    });    

  });
});