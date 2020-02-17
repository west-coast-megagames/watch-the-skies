const { d6 } = require('../../util/systems/dice');

const { Zone } = require('../../models/zone');
const { Country } = require('../../models/country');

async function crisis(zone, crisis) {
    let terror = d6();
    let zone = await Zone.findById(zone);
    zone.terror += terror;
    zone = await zone.save(); 
    console.log(`${crisis.name} has caused ${terror}pts in ${zone.zoneName}.`);
    return (`Terror in ${zone.name} increased by ${terror}pts. Current Terror: ${zone.terror}`);
}

async function war(country) {
    let terror = 10;
    let country = Country.findById(country).populate('zone');
    let zone = country.zone;
    zone.terror += terror;
    zone = await zone.save();
    console.log(`A war in ${country.name} has caused ${terror}pts of terror in ${zone.zoneName}.`);
    return(`Terror in ${zone.name} increased by ${terror}pts. Current Terror: ${zone.terror}`);
}

async function invasion() {
    // Each invasion of a non-played country by a played country | +5 per turn of the war
    return
}

async function publicAnnouncement() {
    let report = ''
    for (let zone in await Zone.find()) {
        let terror =  Math. trunc((250 - zone.terror) * 0.25);
        zone.terror += terror;
        console.log(`The public announcementof aliens has caused ${terror}pts of terror in ${zone.zoneName}.`);
        report = `${report}Terror in ${zone.name} increased by ${terror}pts. Current Terror: ${zone.terror}`
    }
    return report;
}

async function coverage() {
    // No Satellite Cover over the Regional Zone| +10 per turn
    return
}

async function nuclearStrike() {
    // Each nuclear strike | +15
    return
}

async function cityDestruction() {
    // Each city destroyed | +20
    return
}

async function industryDestruction() {
    // Each Industrial Hit by nuclear strike | +10
    return
}

// Certain Technologies are deployed | Varies

// Deployment of a NIT (whatever the result) +1
// Any Specimen Harvest or Abduction that collects items for the Aliens+1
// Each Decoy Mission not intercepted | +1 (+2 after gone public)
// Each successful Psyops/ Terror Raid/Exploitation/Abduction | +2 (+3 after gone public)
// Each turn an Alien Ground Forces is planetside |+3 (+4 after gone public)
// Alien Battleships and Cruisers cause per PAD strike |+20 +more
let terror = { crisis, war, invasion, publicAnnouncement, }

module.exports = terror