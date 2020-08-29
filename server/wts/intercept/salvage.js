const salvageDebugger = require('debug')('app:intercept - salvage');
const { Site, CrashSite } = require('../../models/sites/site')
const { d4 } = require('../../util/systems/dice')
const geo = require('../../util/systems/geo') 

let count = 0;

async function generateSalvage (system, status) {
    const { Team } = require('../../models/team/team');
    if (status === 'Wreckage'|| system.status.damaged === true) {
        let team = await Team.findOne({ teamType: 'C' });
        system.status.salvage = true;
        system.status.team = team._id;
        salvageDebugger(`${system.name} has been turned into wreckage...`);
    } else if (status === 'Damaged' ) {
        system.status.damaged = true;
        salvageDebugger(`${system.name} has been destroyed...`)
    }
    return system;
}

async function generateCrash (salvage, site) {
    let currentSite = await Site.findById({_id: site}).populate('country');

    salvageDebugger(currentSite);
    salvageDebugger(salvage);

    let newDMS = {
        latDMS: decimalCrash(currentSite.geoDecimal.latDecimal, false),
        longDMS: decimalCrash(currentSite.geoDecimal.longDecimal, true) 
    }

    let newDecimal = geo.parseDMS(`${newDMS.latDMS} ${newDMS.longDMS}`)

    let crash = {
        name: `${currentSite.country.name} Crash - ${currentSite.country.code}0${count}`,
        team: currentSite.team,
        country: currentSite.country,
        zone: currentSite.zone,
        siteCode: `${currentSite.country.code}0${count}`,
        geoDMS: newDMS,
        geoDecimal: newDecimal,
        salvage: [...salvage],
        status: {
            public: false,
            secret: true
        }
    }

    console.log(crash)
}


function decimalCrash(dd, isLng) {
    let rand = d4()
    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    
    let dir = dd < 0
      ? isLng ? 'W' : 'S'
      : isLng ? 'E' : 'N';
  
    let absDd = Math.abs(dd);
    let deg = absDd | 0;
    let frac = absDd - deg;
    let min = (frac * 60) | 0;
    let sec = frac * 3600 - min * 60;

    // Round it to 2 decimal points.
    sec = Math.round(sec * 100) / 100;
    return deg + "°" + (min + (rand * plusOrMinus)) + "'" + sec + '"' + dir;
  }

module.exports = { generateSalvage, generateCrash }