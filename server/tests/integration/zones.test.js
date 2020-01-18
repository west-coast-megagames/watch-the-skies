const request = require('supertest');
const { Zone }  = require('../../models/zone');
const mongoose = require('mongoose');

let server;

describe('/zones/', () => {
  beforeEach(() => { server = require('../../server'); });
  afterEach(async () => { 
    await Zone.deleteOne({ zoneCode: 'Z1'});
    await Zone.deleteOne({ zoneCode: 'Z2'});
    await Zone.deleteOne({ zoneCode: 'Z3'});
    await Zone.deleteOne({ zoneCode: 'Z4'});
    await Zone.deleteOne({ zoneCode: 'Z5'});
    await Zone.deleteOne({ zoneCode: 'Z6'});
    await Zone.deleteOne({ zoneCode: 'Z7'});
    await Zone.deleteOne({ zoneCode: 'Z8'});
    await Zone.deleteOne({ zoneCode: 'Z9'});
    await Zone.deleteOne({ zoneCode: 'ZA'});
    await Zone.deleteOne({ zoneCode: 'ZB'});
    await Zone.deleteOne({ zoneCode: 'ZC'});
    await Zone.deleteOne({ zoneCode: 'ZD'});
    await Zone.deleteOne({ zoneCode: 'ZE'});
    await Zone.deleteOne({ zoneCode: 'ZF'});
    await Zone.deleteOne({ zoneCode: 'ZG'});
    server.close(); 
  });

  describe('Get /', () => {
    it('should return all zones', async () => {
      await Zone.collection.insertMany([
        { zoneCode: 'Z1', 
          zoneName: 'Zone Test 1', 
          terror: 5},
        { zoneCode: 'Z2', 
          zoneName: 'Zone Test 2',
          terror: 5}
      ])
      const res = await request(server).get('/api/zones');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body.some(z => z.zoneCode === 'Z1')).toBeTruthy();
      expect(res.body.some(z => z.zoneCode === 'Z2')).toBeTruthy();
      expect(res.body.some(z => z.zoneCode === 'NA')).toBeTruthy();
    });
  });

  describe('Get /:id', () => {
    it('should return a zone if valid id is passed', async () => {
      const zone = new Zone(
      { zoneCode: 'Z3', 
        zoneName: 'Zone Test 3',
        terror: 5 
      });
      await zone.save();

      const res = await request(server).get('/api/zones/id/' + zone._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('zoneName', zone.zoneName);
    });

    it('should return 404 if invalid id is passed', async () => {
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      const res = await request(server).get('/api/zones/id/' + testId);
      expect(res.status).toBe(404);
    });
  });

  describe('Get /:code', () => {
    it('should return a zone if valid code is passed', async () => {
      const zone = new Zone(
      { zoneCode: 'Z4', 
        zoneName: 'Zone Test 4',
        terror: 5 
      });
      await zone.save();

      const res = await request(server).get('/api/zones/code/' + zone.zoneCode);
      expect(res.status).toBe(200);
      //returns array of 1 object
      const returnedZoneCode = res.body[0].zoneCode;
      const returnedZoneName = res.body[0].zoneName;
      const returnedTerror = res.body[0].terror;
      expect(returnedZoneCode).toMatch(/Z4/);
      expect(returnedZoneName).toMatch(/Zone Test 4/);
      expect(returnedTerror).toEqual(5);
    });

    it('should return 404 if invalid code is passed', async () => {
      // pass in invalid code ... don't need to create a record
      const res = await request(server).get('/api/zones/code/01');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
  
    // sample of re-usable function from MOSH course 
    let token; 
    let newZoneName;
    let newZoneCode;
    let newTerror;
    const exec = async () => {
      return await request(server)
      .post('api/zones/')
      .send({ zoneCode: newZoneCode, zoneName: newZoneName, terror: newTerror });
    }  

    beforeEach(() => {
      newZoneCode = 'Z5';
      newZoneName = 'Post Zone Test 1';
      newTerror = 5;
    });

    it('should return 400 if zone zoneCode is less than 2 characters', async () => {
      const res = await request(server).post('/api/zones').send({ zoneCode: "Z", zoneName: 'Test Zone Val 1', terror: 5 });
      expect(res.status).toBe(400);
    });

    it('should return 400 if zone zoneCode is greater than 2 characters', async () => {
      const res = await request(server).post('/api/zones').send({ zoneCode: "Z12", zoneName: 'Test Zone Val 2', terror: 5  });
      expect(res.status).toBe(400);
    });

    it('should return 400 if zone zoneName is less than 3 characters', async () => {
      const res = await request(server).post('/api/zones').send({ zoneCode: "Z6", zoneName: '12', terror: 5 });
      expect(res.status).toBe(400);
    });

    it('should return 400 if zone zoneName is more than 50 characters', async () => {

      // generate a string from array number of elements minus 1 ... so 51 chars > 50 in joi validation
      const testZoneName = new Array(52).join('a');
      const res = await request(server).post('/api/zones').send({ zoneCode: "Z6", zoneName: testZoneName, terror: 5 });
      expect(res.status).toBe(400);
    });

    it('should return 400 if zone terror is less than 0', async () => {
      const res = await request(server).post('/api/zones').send({ zoneCode: "Z6", zoneName: 'Test Zone Terror Post', terror: -1 });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/must be larger than/)
    });

    it('should return 400 if zone terror is greater than 250', async () => {
      const res = await request(server).post('/api/zones').send({ zoneCode: "Z6", zoneName: 'Test Zone Terror Post', terror: 300 });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/must be less than/)
    });

    it('should return 400 if zoneCode is already used (in database)', async () => {

      const res = await request(server).post('/api/zones').send({ zoneCode: "NA", zoneName: 'Test Zone Unique', terror: 5 });
        
      expect(res.status).toBe(400);
    });

    it('should save the zone if it is valid', async () => {

      const res = await request(server).post('/api/zones').send({ zoneCode: "Z7", zoneName: 'Test Zone Post', terror: 5 });

      const zone = await Zone.find({ zoneCode: 'Z7' });

      expect(zone).not.toBeNull();
      expect(res.status).toBe(200); 
      //don't care what _id is ... just that we got one
      expect(res.body).toHaveProperty('_id');   
      //testing for specific zoneName
      expect(res.body).toHaveProperty('zoneName', 'Test Zone Post'); 
    });
  });

  describe('PUT /:id', () => {
    
    it('should return 400 if zoneName is less than 3 characters', async () => {
      //create a zone 
      const res0 = await request(server).post('/api/zones').send({ zoneCode: "Z8", zoneName: 'Test Zone PUT 1', terror: 5 });

      const zone = await Zone.findOne({ zoneCode: 'Z8' });
      
      id = zone._id;   

      newZoneName = 'T1'; 
            
      const res = await request(server).put('/api/zones/' + id).send({ zoneCode: zone.zoneCode, zoneName: newZoneName, terror: zone.terror});
  
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
      
    });

    it('should return 400 if zoneName is more than 50 characters', async () => {
      //create a zone 
      const res0 = await request(server).post('/api/zones/').send({ zoneCode: "Z9", zoneName: 'Test Zone PUT 2', terror: 5 });

      const zone = await Zone.findOne({ zoneCode: 'Z9' });
  
      id = zone._id;  
      // generate a string from array number of elements minus 1 ... so 51 chars > 50 in joi validation 
      newZoneName = new Array(52).join('a');
        
      const res = await request(server).put('/api/zones/' + id).send({ zoneCode: "Z9", zoneName: newZoneName, terror: 5 });
  
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it('should return 400 if zone terror is less than 0', async () => {
      // create a zone
      const res0 = await request(server).post('/api/zones').send({ zoneCode: "ZD", zoneName: 'Test Zone Terror', terror: 5 });
      
      const zone = await Zone.findOne({ zoneCode: 'ZD' });
  
      id = zone._id;  
      newTerror = -1;
     
      const res = await request(server).put('/api/zones/' + id).send({ zoneCode: "ZD", zoneName: zone.zoneName, terror: newTerror });
      
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/must be larger than/)
      
    });

    it('should return 400 if zone terror is greater than 250', async () => {
      // create a zone
      const res0 = await request(server).post('/api/zones').send({ zoneCode: "ZE", zoneName: 'Test Zone Terror 2', terror: 5 });
      
      const zone = await Zone.findOne({ zoneCode: 'ZE' });
  
      id = zone._id;  
      newTerror = 500;
     
      const res = await request(server).put('/api/zones/' + id).send({ zoneCode: "ZE", zoneName: zone.zoneName, terror: newTerror });
      
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/must be less than/)
    });
    
    it('should return 404 if id is invalid', async () => {
      //create a zone 
      zone = new Zone({ zoneName: 'Test Zone Put 3',
        zoneCode: 'ZA'
      });
      await zone.save();
  
      let id = 1;   
      newZoneName = zone.zoneName;
        
      const res = await request(server).put('/api/zones/' + id).send({ zoneName: newZoneName});
  
      expect(res.status).toBe(404);
      expect(res.text).toMatch(/Invalid ID/);
    });

    it('should return 404 if zone with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();
      newZoneName = "Zone Put Test 4";
  
      const res = await request(server).put('/api/zones/' + id).send({ zoneName: newZoneName,
        zoneCode: "ZA"
      });
  
      expect(res.status).toBe(404);
      expect(res.text).toMatch(/was not found/);
    });
    
    it('should update the zone if input is valid', async () => {
    
      //create a zone 
      zone = new Zone({ zoneName: 'Zone Put Test 5',
        zoneCode: "ZA"
      });
      await zone.save();
  
      newZoneName = "UpdPutZone5";
        
      const res = await request(server).put('/api/zones/' + zone._id).send({ zoneName: newZoneName,
        zoneCode: zone.zoneCode
      });      
  
      const updatedZone = await Zone.findById(zone._id);
  
      expect(updatedZone.zoneName).toBe(newZoneName);
    });
    
    it('should return the updated zone if it is valid', async () => {
      
      //create a zone 
      zone = new Zone({ zoneName: 'Zone Put Test 6',
        zoneCode: "ZB"
      });
      await zone.save();
  
      newZoneName = "UpdPutZone6";
  
      const res = await request(server).put('/api/zones/' + zone._id).send({ zoneName: newZoneName,
        zoneCode: zone.zoneCode
      });
  
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('zoneName', newZoneName);
    });
    
  });

  describe('DELETE /:id', () => { 
    let zone; 
    let id; 

    const exec = async () => {
      return await request(server)
        .delete('/api/zones/' + id)
        .send();
    }

    beforeEach(async () => {
      // Before each test we need to create a zone and 
      // put it in the database.      
      zone = new Zone({ zoneName: 'Delzone1',
        zoneCode: "ZC"
      });
      await zone.save();
      
      id = zone._id;  
    })

    it('should return 404 if id is invalid', async () => {
      id = 1; 
      
      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/Invalid ID/);
    });
    
    it('should return 404 if no zone with the given id was found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/was not found/);
    });

    it('should delete the zone if input is valid', async () => {
      await exec();

      const zoneInDb = await Zone.findById(id);

      expect(zoneInDb).toBeNull();
    });

    it('should return the removed zone', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id', zone._id.toHexString());
      expect(res.body).toHaveProperty('zoneName', zone.zoneName);
    });
    
  });  

  describe('Patch /Zone/DeleteAll', () => {
    
    it('should be no zones if successful', async () => {

      const res = await request(server).patch('/api/zones/deleteAll');

      expect(res.status).toBe(200);
      
      const zoneAny = await Zone.find();
      expect(zoneAny.length).toEqual(0);
    });    
  });

});