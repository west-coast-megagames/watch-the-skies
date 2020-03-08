const request = require('supertest');
const { Zone }  = require('../../../../models/zone');
const { Country }  = require('../../../../models/country');
const mongoose = require('mongoose');

const { battle, coverage, crisis, cityDestruction, nuclearStrike, industryDestruction, alienActivity, alienRaid, alienGroundForces, orbitalStrike, invasion, publicAnnouncement }
       = require('../../../../wts/terror/terror');

let server;

describe('wts terrror', () => {
  beforeEach(() => { server = require('../../../../server'); });
  afterEach(async () => { 
    await Zone.deleteOne({ zoneCode: 'Z1'});
    await Zone.deleteOne({ zoneCode: 'Z2'});
    await Zone.deleteOne({ zoneCode: 'Z3'});
    await Zone.deleteOne({ zoneCode: 'Z4'});
    await Country.deleteOne({ code: 'C1'});
    await Country.deleteOne({ code: 'C2'});
    await Country.deleteOne({ code: 'C3'});
    await Country.deleteOne({ code: 'C4'});
    
    server.close(); 
    });

  describe('crisis', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Z1', 
          zoneName: 'Zone Test 1',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'C1', 
          name: 'Country Test 1' ,
          zone: zone._id
        });
      await country.save();
      
      let saveId = zone._id;
      crisisObj = {name: "Bio-Scare"};
      let {newTerror, terror, reason} = await crisis(zone._id, crisisObj);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + d6
      expect(terror).toBeGreaterThanOrEqual(1);
      expect(terror).toBeLessThanOrEqual(6);
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(6);
      expect(zoneUpd.terror).toBeLessThanOrEqual(11);
      expect(reason).toMatch(/Current Terror/);

    });    

    it('It should send message if invalid zone passed in', async () => {
      const country = new Country(
        { code: 'C2', 
          name: 'Country Test 2' ,
          zone: zone._id
        });
      await country.save();
      testId = country._id
      
      crisisObj = {name: "Bio-Scare"};
      let {newTerror, terror, reason} = await crisis(country._id, crisisObj);

      expect(terror).toBeGreaterThanOrEqual(1);
      expect(terror).toBeLessThanOrEqual(6);
      expect(reason).toMatch(/not available/);

    });

  });
  // end of crisis tests

  describe('battle', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Z3', 
          zoneName: 'Zone Test 3',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'C3', 
          name: 'Country Test 3' ,
          zone: zone._id
        });
      
      await country.save();
      
      let saveId = zone._id;
      let {newTerror, terror, reason} = await battle(country._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 10
      expect(terror).toBe(10);
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(15);
      expect(reason).toMatch(/A battle/);

    });    

    it('It should send message if invalid country passed in', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      let {newTerror, terror, reason} = await battle(testId);
      
      // starts out at 0  + 10
      expect(terror).toBe(10);
      expect(newTerror).toBe(0);
      expect(reason).toMatch(/not available/);

    });

  });
  // end of battle tests

});  

