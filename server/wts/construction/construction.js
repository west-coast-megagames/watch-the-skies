const { Aircraft } = require('../../models/ops/aircraft');
const { Facility } = require('../../models/gov/facility/facility');
const { Squad } = require('../../models/ops/squad');
const { Military } = require('../../models/ops/military/military');
const { FacilityBlueprint, Blueprint } = require('../../models/gov/blueprint');

const { loadBlueprints } = require('../../wts/construction/blueprintLoad');

//construction function for building Squads, Military(?), and Aircraft
async function newUnit (name, facility, code, team,){

}

//construction function for making a new upgrade
async function newUpgrade (blueprint){

}

async function newFacility (name, site, targetCode, team){
    await loadBlueprints(); //this can me taken out when you implement the init loadBlueprints
    try{
        let x = await Blueprint.find();
        let blue = await FacilityBlueprint.findOne({ code: targetCode }); //findOne({ name: iData.name });
        if (!blue)
            return err = "Could not find Facility Blueprint"

        let facility = new Facility(blue);

        facility.name = name;
        facility.site = site;
        //facility.code = code;
        facility.team = team;
        facility = await facility.save();

        return facility;
    }
    catch(err){
        return err;
    }

}
module.exports = {newUnit, newUpgrade, newFacility};
