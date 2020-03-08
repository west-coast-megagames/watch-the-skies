const { d6 } = require('../../util/systems/dice');

const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
require ('winston-mongodb');

let gonePublic = false;

async function crisis(zoneId, crisis) {
  let terror = d6(); // Initial Terror caused by this event
  let newTerror = 0;

  zone = await Zone.findById(zoneId);
  if (zone) {
    zone.terror += terror;
    newTerror = zone.terror;
    zone = await zone.save(); 
    await console.log(`${crisis.name} has caused ${terror}pts in ${zone.zoneName}.`);
    return {newTerror, terror, reason: `${crisis.name} has caused ${terror}pts in ${zone.zoneName}. Current Terror: ${zone.terror}`};
  } else {
    logger.error(`Zone not available for terror crisis function for crisis: ${crisis.name} terror change ${terror}pts `);    
    await console.log(`Zone not available for terror crisis function for crisis: ${crisis.name} terror change ${terror}pts `);    
    return {newTerror, terror, reason: `Zone not available for teror update for crisis: ${crisis.name} terror change ${terror}pts `};
  }
};

async function battle(countryId) {
    
  let terror = 10; // Initial Terror caused by this event
  let newTerror = 0;
    
  country = await Country.findById(countryId);
  if (country) {
    let zoneId = country.zone;
    zone = await Zone.findById(zoneId);
    if (zone) {
      zone.terror += terror;
      newTerror = zone.terror;
      zone = await zone.save();
      await console.log(`A battle in ${country.name} has caused ${terror}pts of terror in ${zone.zoneName}.`);
      return {newTerror, terror, reason:`A battle in ${country.name} has caused ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`};
    } else {
      logger.error(`Zone not available for terror battle function: terror change ${terror}pts `);    
      await console.log(`Zone not available for terror battle function terror change ${terror}pts `);    
      return {newTerror, terror, reason: `Zone not available for battle terror change ${terror}pts `};          
    }
  } else {
    logger.error(`Country not available for terror battle function: terror change ${terror}pts `);    
    await console.log(`Country not available for terror battle function terror change ${terror}pts `);    
    return {newTerror, terror, reason: `Country not available for battle terror change ${terror}pts `};        
  }
};

async function invasion(countryId) {
    let terror = 2 // Initial Terror caused by this event
    country = Country.findById(countryId).populate('zone');
    let zone = country.zone;
    zone.terror += terror; // Assigns terror to zone
    zone = await zone.save(); // Saves Terror to Database
    return {zone, terror, reason:`An Invasion in ${country.name} has caused ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`};
};

async function publicAnnouncement() {
    let report = 'The public announcement of aliens has caused terror in all zones!'
    gonePublic = true;
    for (let zone in await Zone.find()) {
        let terror = Math. trunc((250 - zone.terror) * 0.25); // Initial Terror caused by this event
        zone.terror += terror
        zone = await zone.save(); // Saves Terror to Database
        console.log(`The public announcement of aliens has caused ${terror}pts of terror in ${zone.zoneName}.`);
        report = `${report} Terror in ${zone.name} increased by ${terror}pts. Current Terror: ${zone.terror}`
    }
    return {terror, reason: report};
};

async function coverage() {
    let terror = 10 // Initial Terror caused by this event
    for (let zone of await Zone.find()) {
        if (zone.satillites.length = 0) {
            zone.terror += terror
            zone = await zone.save(); // Saves Terror to Database
            console.log(`Lack of satillite coverage over has cause ${terror}pts of terror in ${zone.zoneName}.`);
            report = `${report} Lack of satillite coverage over has cause ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`
        }
    }
    return {terror, reason: report};
};

async function nuclearStrike(site) {
    let terror = 15 // Initial Terror caused by this event
    site = Site.findById(site).populate('zone').populate('country');
    let zone = site.zone;
    let country = site.country;
    zone.terror += terror; // Assigns terror to zone
    zone = await zone.save(); // Saves Terror to Database
    return {zone, terror, reason:`A nuclear strike on the ${site.name} in ${country.name} has caused ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`};
};

async function cityDestruction(site) {
    let terror = 20 // Initial Terror caused by this event
    site = Site.findById(site).populate('zone').populate('country');
    let zone = site.zone;
    zone.terror += terror; // Assigns terror to zone
    zone = await zone.save(); // Saves Terror to Database
    return {zone, terror, reason:`The destruction of ${site.name} has caused ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`};
};

async function industryDestruction(country) {
    let terror = 15 // Initial Terror caused by this event
    country = Country.findById(country).populate('zone');
    let zone = country.zone;
    zone.terror += terror; // Assigns terror to zone
    zone = await zone.save(); // Saves Terror to Database
    return {zone, terror, reason:`The destruction industry in ${country.name} has caused ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`};
};

async function alienActivity (country) {
    let terror = gonePublic ? 2 : 1; // Initial Terror caused by this event
    country = Country.findById(country).populate('zone');
    let zone = country.zone;
    zone.terror += terror; // Assigns terror to zone
    zone = await zone.save(); // Saves Terror to Database
    return {zone, terror, reason:`Alien activity in ${country.name} has caused ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`};
};

async function alienRaid (country) {
    let terror = gonePublic ? 3 : 2; // Initial Terror caused by this event
    country = Country.findById(country).populate('zone');
    let zone = country.zone;
    zone.terror += terror; // Assigns terror to zone
    zone = await zone.save(); // Saves Terror to Database
    return {zone, terror, reason:`Alien activity in ${country.name} has caused ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`};
};

async function alienGroundForces (country) {
    let terror = gonePublic ? 4 : 3; // Initial Terror caused by this event
    country = Country.findById(country).populate('zone');
    let zone = country.zone;
    zone.terror += terror; // Assigns terror to zone
    zone = await zone.save(); // Saves Terror to Database
    return {zone, terror, reason:`Alien ground troops in ${country.name} has caused ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`};
}

async function orbitalStrike (site) {
    let terror = 20; // Initial Terror caused by this event
    site = Site.findById(site).populate('zone').populate('country');
    let zone = site.zone;
    zone.terror += terror; // Assigns terror to zone
    zone = await zone.save(); // Saves Terror to Database
    return {zone, terror, reason:`An orbital strike on ${site.name} has caused ${terror}pts of terror in ${zone.zoneName}. Current Terror: ${zone.terror}`};
}

let terror = { battle, coverage, crisis, cityDestruction, nuclearStrike, industryDestruction, alienActivity, alienRaid, alienGroundForces, orbitalStrike, invasion, publicAnnouncement }

module.exports = terror