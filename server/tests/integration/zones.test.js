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
    server.close(); 
  });

  describe('Get /', () => {
    it('should return all zones', async () => {
      await Zone.collection.insertMany([
        { zoneCode: 'Z1', 
          zoneName: 'Zone Test 1'},
        { zoneCode: 'Z2', 
          zoneName: 'Zone Test 2'}
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
        zoneName: 'Zone Test 3' 
      });
      await zone.save();

      const res = await request(server).get('/api/zones/id/' + zone._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('zoneName', zone.zoneName);
    });
  });

  describe('Get /:code', () => {
    it('should return a zone if valid code is passed', async () => {
      const zone = new Zone(
      { zoneCode: 'Z4', 
        zoneName: 'Zone Test 4' 
      });
      await zone.save();

      const res = await request(server).get('/api/zones/code/' + zone.zoneCode);
      expect(res.status).toBe(200);
      //returns array of 1 object
      const returnedZoneCode = res.body[0].zoneCode;
      const returnedZoneName = res.body[0].zoneName;
      expect(returnedZoneCode).toMatch(/Z4/);
      expect(returnedZoneName).toMatch(/Zone Test 4/);
    });
  });
});