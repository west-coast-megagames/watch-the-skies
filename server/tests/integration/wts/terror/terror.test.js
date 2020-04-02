const request = require('supertest');
const { Zone }  = require('../../../../models/zone');
const { Country }  = require('../../../../models/country');
const { Site, CitySite }  = require('../../../../models/sites/site');
const { Team, National }  = require('../../../../models/team/team');
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
    await Zone.deleteOne({ zoneCode: 'Z5'});
    await Zone.deleteOne({ zoneCode: 'Z6'});
    await Zone.deleteOne({ zoneCode: 'Z7'});
    await Zone.deleteOne({ zoneCode: 'Z8'});
    await Zone.deleteOne({ zoneCode: 'Z9'});
    await Zone.deleteOne({ zoneCode: 'Q1'});
    await Zone.deleteOne({ zoneCode: 'Q2'});
    await Zone.deleteOne({ zoneCode: 'Q3'});
    await Zone.deleteOne({ zoneCode: 'Q4'});
    await Zone.deleteOne({ zoneCode: 'Q5'});
    await Zone.deleteOne({ zoneCode: 'Q6'});
    await Zone.deleteOne({ zoneCode: 'Q7'});
    await Zone.deleteOne({ zoneCode: 'Q8'});
    await Zone.deleteOne({ zoneCode: 'Q9'});
    await Zone.deleteOne({ zoneCode: 'K1'});
    await Zone.deleteOne({ zoneCode: 'K2'});
    await Country.deleteOne({ code: 'C1'});
    await Country.deleteOne({ code: 'C2'});
    await Country.deleteOne({ code: 'C3'});
    await Country.deleteOne({ code: 'C4'});
    await Country.deleteOne({ code: 'C5'});
    await Country.deleteOne({ code: 'C6'});
    await Country.deleteOne({ code: 'C7'});
    await Country.deleteOne({ code: 'C8'});
    await Country.deleteOne({ code: 'C9'});
    await Country.deleteOne({ code: 'Q1'});
    await Country.deleteOne({ code: 'Q2'});
    await Country.deleteOne({ code: 'Q3'});
    await Country.deleteOne({ code: 'Q4'});
    await Country.deleteOne({ code: 'Q5'});
    await Country.deleteOne({ code: 'Q6'});
    await Country.deleteOne({ code: 'Q7'});
    await Country.deleteOne({ code: 'Q8'});
    await Country.deleteOne({ code: 'Q9'});
    await Country.deleteOne({ code: 'K1'});
    await Country.deleteOne({ code: 'K2'});
    await CitySite.deleteOne({ siteCode: 'test site 1'});
    await CitySite.deleteOne({ siteCode: 'test site 2'});
    await CitySite.deleteOne({ siteCode: 'test site 3'});
    await CitySite.deleteOne({ siteCode: 'test site 4'});
    await CitySite.deleteOne({ siteCode: 'test site K1'});
    await CitySite.deleteOne({ siteCode: 'test site K2'});
    await National.deleteOne({ teamCode: 'TT1'});
    await National.deleteOne({ teamCode: 'TT2'});
    await National.deleteOne({ teamCode: 'TT2'});
    await National.deleteOne({ teamCode: 'TK1'});
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
      let reason = await crisis(zone._id, crisisObj);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + d6
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
      let reason = await crisis(country._id, crisisObj);

      expect(reason).toMatch(/Zone not available/);

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
      let reason = await battle(country._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 10
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(15);
      expect(reason).toMatch(/A battle/);

    });    

    it('It should send message if invalid country passed in', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      let reason = await battle(testId);
      
      // starts out at 0  + 10
      expect(reason).toMatch(/Country not available/);

    });

    it('It should send message if country does not have valid zone ', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      const country = new Country(
        { code: 'Q5', 
          name: 'Country Test Q5' ,
          zone: testId
        });
     
      await country.save();
     
      let reason = await battle(country._id);
     
      // starts out at 0  + 10
      expect(reason).toMatch(/Zone not available/);

    });

  });
  // end of battle tests

  describe('invasion', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Z4', 
          zoneName: 'Zone Test 4',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'C4', 
          name: 'Country Test 4' ,
          zone: zone._id
        });
      
      await country.save();
      
      let saveId = zone._id;
      let reason = await invasion(country._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 2
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(7);
      expect(reason).toMatch(/An invasion/);

    });    

    it('It should send message if invalid country passed in', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      let reason = await invasion(testId);
      
      // starts out at 0  + 2
      expect(reason).toMatch(/Country not available/);

    });

    it('It should send message if country does not have valid zone ', async () => {
      
       // pass in invalid id ... don't need to create a record
       testId = new mongoose.Types.ObjectId();
      const country = new Country(
        { code: 'C5', 
          name: 'Country Test 5' ,
          zone: testId
        });
      
      await country.save();
      
      let reason = await invasion(country._id);
      
      // starts out at 0  + 2
      expect(reason).toMatch(/Zone not available/);

    });

  });
  // end of invasion tests

  describe('publicAnnouncement', () => {

    it('it should return message and zone terror updated', async () => {
      const zone = new Zone(
        { zoneCode: 'Z6', 
          zoneName: 'Zone Test 6',
          terror: 5 
        });
      await zone.save();
      
      let saveId = zone._id;
      let reason = await publicAnnouncement();
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + Math.trunc((250 - zone.terror) * 0.25) which is 5 + 61;
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(66);
      expect(reason).toMatch(/public announcement of aliens/);

    });    
  });
  // end of publicAnnouncement tests
  
  describe('coverage', () => {

    it('it should return message and zone terror updated', async () => {
      const zone = new Zone(
        { zoneCode: 'Z7', 
          zoneName: 'Zone Test 7',
          terror: 5,
          satellite: []
        });
      await zone.save();
      
      let saveId = zone._id;
      let reason = await coverage();
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 10;
      expect(zoneUpd.terror).toBe(15);
      expect(reason).toMatch(/satellite coverage/);

    });    
  });
  // end of coverage tests

  describe('nuclearStrike', () => {
  
    it('it should return message and zone terror updated', async () => {
      const zone = new Zone(
        { zoneCode: 'Z8', 
          zoneName: 'Zone Test 8',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'C8', 
          name: 'Country Test 8' ,
          zone: zone._id
        });
      await country.save();
      const team = new National(
        { name: "Test Team 1",
          shortName: "TT 1",
          teamCode: "TT1",
          teamType: "N",
          homeCountry: country._id
        }
      )
      await team.save();
      const citySite = new CitySite(
        { siteCode: 'test site 1',
          name: "City of Screams",
          country: country._id,
          zone: zone._id
        }
      )
      await citySite.save();

      let saveId = zone._id;
      let reason = await nuclearStrike(citySite._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 15;
      expect(zoneUpd.terror).toBe(20);
      expect(reason).toMatch(/A nuclear strike/);

    });    

    it('it should return error message if site id invalid', async () => {
      
      testId = new mongoose.Types.ObjectId();
      let reason = await nuclearStrike(testId);

      expect(reason).toMatch(/Site not available/);

    });    

    it('it should return error message if zone id invalid', async () => {
      testId = new mongoose.Types.ObjectId();
      const citySite = new CitySite(
        { siteCode: 'test site 2',
          name: "City of Ashes",
          zone: testId
        }
      )
      await citySite.save();

      let reason = await nuclearStrike(citySite._id);

      expect(reason).toMatch(/Zone not available/);

    });    

  });
  // end of nuclearStrike tests

  describe('cityDestruction', () => {
  
    it('it should return message and zone terror updated', async () => {
      const zone = new Zone(
        { zoneCode: 'Z9', 
          zoneName: 'Zone Test 9',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'C9', 
          name: 'Country Test 9' ,
          zone: zone._id
        });
      await country.save();
      const team = new National(
        { name: "Test Team 2",
          shortName: "TT 2",
          teamCode: "TT2",
          teamType: "N",
          homeCountry: country._id
        }
      )
      await team.save();
      const citySite = new CitySite(
        { siteCode: 'test site 3',
          name: "City of Dust",
          country: country._id,
          zone: zone._id
        }
      )
      await citySite.save();

      let saveId = zone._id;
      let reason = await cityDestruction(citySite._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 20;
      expect(zoneUpd.terror).toBe(25);
      expect(reason).toMatch(/The destruction of/);

    });    

    it('it should return error message if site id invalid', async () => {
      
      testId = new mongoose.Types.ObjectId();
      let reason = await cityDestruction(testId);

      expect(reason).toMatch(/Site not available/);

    });    

    it('it should return error message if zone id invalid', async () => {
      testId = new mongoose.Types.ObjectId();
      const citySite = new CitySite(
        { siteCode: 'test site 4',
          name: "City of Shadows",
          zone: testId
        }
      )
      await citySite.save();

      let reason = await cityDestruction(citySite._id);

      expect(reason).toMatch(/Zone not available/);

    });    

  });
  // end of cityDestruction tests

  describe('industryDestruction', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Q1', 
          zoneName: 'Zone Test Q1',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'Q1', 
          name: 'Country Test Q1' ,
          zone: zone._id
        });
      
      await country.save();
      
      let saveId = zone._id;
      let reason = await industryDestruction(country._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 15
      expect(zoneUpd.terror).toBe(20);
      expect(reason).toMatch(/destruction of industry/);

    });    

    it('It should send message if invalid country passed in', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      let reason = await industryDestruction(testId);
      
      expect(reason).toMatch(/Country not available/);

    });

    it('It should send message if country does not have valid zone ', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      const country = new Country(
        { code: 'Q2', 
          name: 'Country Test Q2' ,
          zone: testId
        });
      
      await country.save();
      
      let reason = await industryDestruction(country._id);
      
      expect(reason).toMatch(/Zone not available/);

    });

  });
  // end of industryDestruction tests

  
  describe('alienActivity', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Q3', 
          zoneName: 'Zone Test Q3',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'Q3', 
          name: 'Country Test Q3' ,
          zone: zone._id
        });
      
      await country.save();
      
      let saveId = zone._id;
      let reason = await alienActivity(country._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 1 or 2
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(6);
      expect(reason).toMatch(/Alien activity/);

    });    

    it('It should send message if invalid country passed in', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      let reason = await alienActivity(testId);
      
      expect(reason).toMatch(/Country not available/);

    });

    it('It should send message if country does not have valid zone ', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      const country = new Country(
        { code: 'Q4', 
          name: 'Country Test Q4' ,
          zone: testId
        });
      
      await country.save();
      
      let reason = await alienActivity(country._id);
      
      expect(reason).toMatch(/Zone not available/);

    });

  });
  // end of alienActivity tests

  describe('alienRaid', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Q6', 
          zoneName: 'Zone Test Q6',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'Q6', 
          name: 'Country Test Q6' ,
          zone: zone._id
        });
      
      await country.save();
      
      let saveId = zone._id;
      let reason = await alienRaid(country._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 2 or 3
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(7);
      expect(reason).toMatch(/Alien raid/);

    });    

    it('It should send message if invalid country passed in', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      let reason = await alienRaid(testId);
      
      expect(reason).toMatch(/Country not available/);

    });

    it('It should send message if country does not have valid zone ', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      const country = new Country(
        { code: 'Q7', 
          name: 'Country Test Q7' ,
          zone: testId
        });
      
      await country.save();
      
      let reason = await alienRaid(country._id);
      
      expect(reason).toMatch(/Zone not available/);

    });

  });
  // end of alienRaid tests

  
  describe('alienGroundForces', () => {

    it('it should return updated terror', async () => {
      const zone = new Zone(
        { zoneCode: 'Q8', 
          zoneName: 'Zone Test Q8',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'Q8', 
          name: 'Country Test Q8' ,
          zone: zone._id
        });
      
      await country.save();
      
      let saveId = zone._id;
      let reason = await alienGroundForces(country._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 3 or 4
      expect(zoneUpd.terror).toBeGreaterThanOrEqual(8);
      expect(reason).toMatch(/Alien ground troops/);

    });    

    it('It should send message if invalid country passed in', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      let reason = await alienGroundForces(testId);
      
      expect(reason).toMatch(/Country not available/);

    });

    it('It should send message if country does not have valid zone ', async () => {
      
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      const country = new Country(
        { code: 'Q9', 
          name: 'Country Test Q9' ,
          zone: testId
        });
      
      await country.save();
      
      let reason = await alienGroundForces(country._id);
      
      expect(reason).toMatch(/Zone not available/);

    });

  });
  // end of alienGroundForces tests

  describe('orbitalStrike', () => {
  
    it('it should return message and zone terror updated', async () => {
      const zone = new Zone(
        { zoneCode: 'K1', 
          zoneName: 'Zone Test K1',
          terror: 5 
        });
      await zone.save();
      const country = new Country(
        { code: 'K1', 
          name: 'Country Test K1' ,
          zone: zone._id
        });
      await country.save();
      const team = new National(
        { name: "Test Team K1",
          shortName: "TT K1",
          teamCode: "TK1",
          teamType: "N",
          homeCountry: country._id
        }
      )
      await team.save();
      const citySite = new CitySite(
        { siteCode: 'test site K1',
          name: "City of Groans",
          country: country._id,
          zone: zone._id
        }
      )
      await citySite.save();

      let saveId = zone._id;
      let reason = await orbitalStrike(citySite._id);
      
      zoneUpd = await Zone.findById(saveId);

      // starts out at 5  + 20;
      expect(zoneUpd.terror).toBe(25);
      expect(reason).toMatch(/An orbital strike/);

    });    

    it('it should return error message if site id invalid', async () => {
      
      testId = new mongoose.Types.ObjectId();
      let reason = await orbitalStrike(testId);

      expect(reason).toMatch(/Site not available/);

    });    

    it('it should return error message if zone id invalid', async () => {
      testId = new mongoose.Types.ObjectId();
      const citySite = new CitySite(
        { siteCode: 'test site K2',
          name: "City of Moans",
          zone: testId
        }
      )
      await citySite.save();

      let reason = await orbitalStrike(citySite._id);

      expect(reason).toMatch(/Zone not available/);

    });    

  });
  // end of orbitalStrike tests  

});  
