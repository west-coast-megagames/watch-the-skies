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
    await Country.deleteOne({ code: 'C1'});
    /*
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
    */
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
      let crisisObj = {name: "Bio-Scare"};
      let {terror, reason} = await crisis(zone._id, crisisObj);
      
      zoneUpd = await Zone.findById(saveId);
      const res = await request(server).get('/api/zones/id/' + zone._id);

      // starts out at 5  + d6
      expect(terror).toBeGreaterThanOrEqual(1);
      expect(terror).toBeLessThanOrEqual(6);
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(6);
      expect(zoneUpd.terror).toBeLessThanOrEqual(11);
      expect(reason).toMatch(/Current Terror/);

    });
  });

});  

