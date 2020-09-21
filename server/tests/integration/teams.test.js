const request = require('supertest');
const { Team, getPR }  = require('../../models/team');
const mongoose = require('mongoose');

let server;

describe('/teams/', () => {
  beforeEach(() => { server = require('../../server'); });
  afterEach(async () => { 
    await Team.deleteOne({ teamCode: 'C1'});
    await Team.deleteOne({ teamCode: 'C2'});
    await Team.deleteOne({ teamCode: 'C3'});
    await Team.deleteOne({ teamCode: 'C4'});
    await Team.deleteOne({ teamCode: 'C5'});
    await Team.deleteOne({ teamCode: 'C6'});
    await Team.deleteOne({ teamCode: 'C7'});
    await Team.deleteOne({ teamCode: 'C8'});
    await Team.deleteOne({ teamCode: 'C9'});
    await Team.deleteOne({ teamCode: 'T1'});
    await Team.deleteOne({ teamCode: 'T2'});
    await Team.deleteOne({ teamCode: 'T3'});
    await Team.deleteOne({ teamCode: 'T4'});
    await Team.deleteOne({ teamCode: 'T5'});
    await Team.deleteOne({ teamCode: 'T6'});
    server.close(); 
  });

  describe('Get /', () => {
    it('should return all teams', async () => {
      await Team.collection.insertMany([
        { teamCode: 'C1', 
          name: 'Team Test 1',
          shortName: "Test 1",
          teamType: "N"},
        { teamCode: 'C2', 
          name: 'Team Test 2',
          shortName: "Test 2",
          teamType: "N"
        }
      ])
      const res = await request(server).get('/api/team');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body.some(t => t.teamCode === 'C1')).toBeTruthy();
      expect(res.body.some(t => t.teamCode === 'C2')).toBeTruthy();
      expect(res.body.some(t => t.teamCode === 'USA')).toBeTruthy();
    });
  });

  describe('Get /:id', () => {
    it('should return a team if valid id is passed', async () => {
      const team = new Team(
      { teamCode: 'C3', 
        name: 'Team Test 3',
        shortName: "Test 3",
        teamType: "N"
      });
      //console.log("jeff here in get id test ... teamCode", team.teamCode);
      await team.save();

      const res = await request(server).get('/api/team/id/' + team._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', team.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      const res = await request(server).get('/api/team/id/' + testId);
      expect(res.status).toBe(404);
    });

  });

  describe('Get /:teamCode', () => {
    it('should return a team if valid teamCode is passed', async () => {
      const team = new Team(
      { teamCode: 'C4', 
        name: 'Team Test 4',
        shortName: "Test 4",
        teamType: "N"
      });
      await team.save();

      const res = await request(server).get('/api/team/code/' + team.teamCode);
      expect(res.status).toBe(200);
      //returns array of 1 object
      const returnedCode = res.body[0].teamCode;
      const returnedName = res.body[0].name;
      expect(returnedCode).toMatch(/C4/);
      expect(returnedName).toMatch(/Team Test 4/);
    });

    it('should return 404 if invalid teamCode is passed', async () => {
      // pass in invalid teamCode ... don't need to create a record
      const res = await request(server).get('/api/team/code/01');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
  
    // sample of re-usable function from MOSH course 
    let newName;
    let newCode;
    let newShortName;
    let newType;
    let newPrLevel;
    let newSciRate;
    let newRoles;
    let newPrTrack;
    const exec = async () => {
      return await request(server)
      .post('api/team/')
      .send({ teamCode: newCode, name: newName, prLevel: newPrLevel, prTrack: newPrTrack, 
              shortName: newShortName, teamType: newType, sciRate: newSciRate, roles: newRoles });
    }  

    beforeEach(() => {
      newCode = 'C5';
      newName = 'Post Team Test 1';
      newShortName = "Test 1"
      newType = "N";
      newPrLevel = 10;
      newShortName = 15;
      newRoles =  [ 
        {"role": "President", "type" : "Head of State"},
      ];
      newPrTrack = [0, 5, 10, 15, 20, 25, 30, 35, 40];
    });

    it('should return 400 if team teamCode is less than 2 characters', async () => {
      const res = await request(server).post('/api/team').send({ teamCode: "C", name: 'Test Team Val 1', teamType: "N" });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });
    
    it('should return 400 if team teamCode is greater than 3 characters', async () => {
      const res = await request(server).post('/api/team').send({ teamCode: "C125", name: 'Test Team Val 2', teamType: "N" });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 500 if team code already exists', async () => {
      newRoles = [ 
        {"role": "President", "type" : "Head of State"},
      ];

      const team = new Team(
        { teamCode: 'C5', 
          name: 'Team Test 5',
          shortName: "Test 5",
          teamType: "N"
      });
      team.roles = newRoles;
      await team.save();

      const res = await request(server).post('/api/team').send({ teamCode: "C5", name: 'Team Test 6', teamType: "N" });
      expect(res.status).toBe(500);
      expect(res.text).toMatch(/duplicate key/);
    });

    it('should return 400 if team name is less than 2 characters', async () => {
      const res = await request(server).post('/api/team').send({ teamCode: "C6", name: '1', teamType: "N" });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 400 if team name is more than 50 characters', async () => {
      // generate a string from array number of elements minus 1 ... so 51 chars > 50 in joi validation
      const testName = new Array(52).join('a');
      const res = await request(server).post('/api/team').send({ teamCode: "C6", name: testName, teamType: "N" });
      expect(res.status).toBe(400);
    });

    it('should return 400 if team name already exists', async () => {
      const team = new Team(
        { teamCode: 'C5', 
          name: 'Team Test 5',
          shortName: "Test 5",
          teamType: "N"
      });
      await team.save();

      const res = await request(server).post('/api/team').send({ teamCode: "C6", name: 'Team Test 5', teamType: "N" });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/already exists/);
    });

    it('should return 400 if team shortName is less than 2 characters', async () => {
      const res = await request(server).post('/api/team')
        .send({ teamCode: "C7", name: 'Test Team Val 4 ', teamType: "N", shortName: "7" });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 400 if team shortName is more than 30 characters', async () => {
      // generate a string from array number of elements minus 1 ... so 31 chars > 30 in joi validation
      const testName = new Array(32).join('a');
      const res = await request(server).post('/api/team')
        .send({ teamCode: "C7", name: "Test Team Val 5", teamType: "N", shortName: testName });
      expect(res.status).toBe(400);
    });

    it('should return 500 if teamType Not in enum list of values', async () => {
        const res = await request(server).post('/api/team').send({ teamCode: "C8", name: 'Test Team Val 8', teamType: "Q" });
        expect(res.status).toBe(500);
        expect(res.text).toMatch(/not a valid enum value/)
    });
  
    it('should return 500 if role.Type Not in enum list of values', async () => {
      const res = await request(server).post('/api/team')
         .send({ teamCode: "C8", name: 'Test Team Val 8', teamType: "N",
         "roles" : [ {"role": "President", "type" : "Head of Testing" } ] });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/must be one of/)
    });

    it('should save the team if it is valid', async () => {

      const res = await request(server).post('/api/team')
        .send({ teamCode: "C8", name: 'Test Team Post 8', shortName: "Post 8", teamType: "N" });

      const team = await Team.find({ teamCode: 'C8' });

      expect(team).not.toBeNull();
      expect(res.status).toBe(200); 
      //don't care what _id is ... just that we got one
      expect(res.body).toHaveProperty('_id');   
      //testing for specific name
      expect(res.body).toHaveProperty('name', 'Test Team Post 8'); 
    });
    
  });

  describe('PUT /:id', () => {
    
    it('should return 400 if team teamCode is less than 2 characters', async () => {
      //create a team 
      const res0 = await request(server).post('/api/team').send({ teamCode: "C8", name: 'Test Team PUT 1' });
      const team = await Team.findOne({ teamCode: 'C8' });

      id = team._id;   
      newCode = 'T'; 
      
      const res = await request(server).put('/api/team/' + id).send({ teamCode: newCode, name: team.name});

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });
    
    it('should return 400 if team teamCode is greater than 3 characters', async () => {
      //create a team 
      const res0 = await request(server).post('/api/team').send({ teamCode: "C8", name: 'Test Team PUT 2' });
      const team = await Team.findOne({ teamCode: 'C8' });

      id = team._id;   
      newCode = 'T234'; 
      
      const res = await request(server).put('/api/team/' + id).send({ teamCode: newCode, name: team.name});

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 500 if team code already exists', async () => {
      const res0 = await request(server).post('/api/team').send({ teamCode: "C8", name: 'Test Team PUT 3' });
    
      const team = new Team(
        { teamCode: 'C9', 
          name: 'Team Test 9',
          shortName: "Test 9",
          teamType: "N"
      });
      await team.save();

      id = team._id;   
      newCode = 'C8'; 
      
      const res = await request(server).put('/api/team/' + id).send({ teamCode: newCode, name: team.name});

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/duplicate key/);
    });

    it('should return 400 if name is less than 2 characters', async () => {
      //create a team 
      const res0 = await request(server).post('/api/team').send({ teamCode: "C8", name: 'Test Team PUT 1' });
      const team = await Team.findOne({ teamCode: 'C8' });
 
      id = team._id;   
      newName = 'T'; 
       
      const res = await request(server).put('/api/team/' + id).send({ teamCode: team.teamCode, name: newName });
  
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
      
    });
  
    it('should return 400 if name is more than 50 characters', async () => {
      //create a team 
      // generate a string from array number of elements minus 1 ... so 77 chars > 75 in joi validation
      const res0 = await request(server).post('/api/team/').send({ teamCode: "C9", name: 'Test Team PUT 2' });

      const team = await Team.findOne({ teamCode: 'C9' });
  
      id = team._id;   
      newName = new Array(77).join('a');
        
      const res = await request(server).put('/api/team/' + id).send({ teamCode: "C9", name: newName });
  
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });
  
    it('should return 400 if team name already exists', async () => {
      const res0 = await request(server).post('/api/team').send({ teamCode: "C8", name: 'Test Team PUT 8' });

      const team = new Team(
        { teamCode: 'C9', 
          name: 'Team Test 9',
          shortName: "Test 9",
          teamType: "N"
      });
      await team.save();

      id = team._id;   
      newName = 'Test Team PUT 8'; 
      
      const res = await request(server).put('/api/team/' + id).send({ teamCode: team.teamCode, name: newName });

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/duplicate key/);
    });

    it('should return 400 if shortName is less than 2 characters', async () => {
      //create a team 
      const res0 = await request(server).post('/api/team')
        .send({ teamCode: "C8", name: 'Test Team PUT 1', shortName: "Team Put 1" } );
      const team = await Team.findOne({ teamCode: 'C8' });
 
      id = team._id;   
      newName = 'T'; 
       
      const res = await request(server).put('/api/team/' + id)
        .send({ teamCode: team.teamCode, name: team.name, shortName: newName });
  
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
      
    });
  
    it('should return 400 if shortName is more than 30 characters', async () => {
      //create a team 
      // generate a string from array number of elements minus 1 ... so 31 chars > 30 in joi validation
      const res0 = await request(server).post('/api/team/')
        .send({ teamCode: "C9", name: 'Test Team PUT 2', shortName: "Test Put 2" });

      const team = await Team.findOne({ teamCode: 'C9' });
  
      id = team._id;   
      newName = new Array(32).join('a');
        
      const res = await request(server).put('/api/team/' + id)
        .send({ teamCode: team.teamCode, name: team.name, shortName: newName });
  
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 404 if id is invalid', async () => {
      //create a team 
      team = new Team({ name: 'Test Team Put 3',
        teamCode: 'T1'
      });
      await team.save();
  
      let id = 1;   
      newName = team.name;
        
      const res = await request(server).put('/api/team/' + id).send({ name: newName});
  
      expect(res.status).toBe(404);
      expect(res.text).toMatch(/Invalid ID/);
    });

    it('should return 404 if team with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();
      newName = "Team Put Test 4";
  
      const res = await request(server).put('/api/team/' + id).send({ name: newName,
        teamCode: "T1"
      });
  
      expect(res.status).toBe(404);
      expect(res.text).toMatch(/was not found/);
    });

    /* enum tests do not seem to trigger on PUT ????
    it('should return 400 if teamType Not in enum list of values', async () => {
      //create a team 
      team = new Team({ name: 'Test Team Put 3',
                        teamCode: 'T1',
                        shortName: "Test Put 3",
                        teamType: "N"
      });
      await team.save();

      let id = team._id;   
      newType = "Q";
 
      const res = await request(server).put('/api/team/' + id)
        .send({ teamType: newType, teamCode: team.teamCode, name: team.name });

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/not a valid enum value/)
    });
  
    it('should return 400 if role.Type Not in enum list of values', async () => {
      //create a team 
      team = new Team({ name: 'Test Team Put 3',
                        teamCode: 'T1',
                        shortName: "Test Put 3",
                        teamType: "N"
      });
      await team.save();

      let id = team._id;   
       
      const res = await request(server).put('/api/team/' + id)
        .send({ name: team.name, teamCode: team.teamCode, 
            "roles": [ {"role": "President", "type" : "Head of Testing" } ]});

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/not a valid enum value/)
    });
    skipped enum test on PUT */

    it('should update the team if input is valid', async () => {
    
      //create a team 
      team = new Team({ name: 'Team Put Test 5',
        teamCode: "T1",
        name: "Test PUT Update 5",
        teamType: "N",
        shortName: "Put Upd 5"
      });
      await team.save();
  
      newName = "UpdPutZone";
        
      const res = await request(server).put('/api/team/' + team._id)
        .send({ name: newName, teamCode: team.teamCode
      });      
  
      const updatedZone = await Team.findById(team._id);
  
      expect(updatedZone.name).toBe(newName);
    });

  
    it('should return the updated team if it is valid', async () => {
      
      //create a team 
      team = new Team({ name: 'Team Put Test 6',
        teamCode: "T6",
        shortName: "Put Test 6",
        teamType: "N",
      });
      await team.save();
  
      newName = "UpdPutTeam6";
  
      const res = await request(server).put('/api/team/' + team._id)
        .send({ name: newName, teamCode: team.teamCode
      });
  
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newName);
    });
  
  });  

  describe('DELETE /:id', () => { 
    let team; 
    let id; 

    const exec = async () => {
      return await request(server)
        .delete('/api/team/' + id)
        .send();
    }

    beforeEach(async () => {
      // Before each test we need to create a team and 
      // put it in the database.      
      team = new Team({ name: 'Delzone1',
        teamCode: "T3"
      });
      await team.save();
      
      id = team._id;  
    })

    it('should return 404 if id is invalid', async () => {
      id = 1; 
      
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/Invalid ID/);
    });
    
    it('should return 404 if no team with the given id was found', async () => {
      id = mongoose.Types.ObjectId();

      res = await request(server)
        .delete('/api/team/' + id)
        .send();

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/No team/);
    });

    it('should delete the team if input is valid', async () => {
      
      team2 = new Team({ name: 'Delzone22',
                        teamCode: "T22"
      });
      await team2.save();
      
      id = team2._id;  

      await request(server)
        .delete('/api/team/' + id)
        .send();

      let teamInDb = await Team.findById(id);

      expect(teamInDb).toBeNull();
    });

    /*

    it('should return the removed team', async () => {
      const res = await exec();

      expect(res.json).toHaveProperty('_id', team._id.toHexString());
      expect(res.json).toHaveProperty('name', team.name);
    });
    */
    
  });  

  /*
  describe('Patch /Team/DeleteAll', () => {
    
    it('should be no teams if successful', async () => {

      const res = await request(server).patch('/api/team/deleteAll');

      expect(res.status).toBe(200);
      
      const teamAny = await Team.find();
      expect(teamAny.length).toEqual(0);
    });    
  });
  */
});