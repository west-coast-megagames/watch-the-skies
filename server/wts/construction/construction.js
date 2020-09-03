const { Aircraft } = require('../../models/ops/aircraft');
const { Facility } = require('../../models/gov/facility/facility');
const { Squad } = require('../../models/ops/squad');
const { Military } = require('../../models/ops/military/military');
const { FacilityBlueprint, AircraftBlueprint, Blueprint } = require('../../models/gov/blueprint');

const { loadBlueprints } = require('../../wts/construction/blueprintLoad');

//construction function for building Squads, Military(?), and Aircraft
async function newUnit (name, facility, type, team,){
    await loadBlueprints(); //this can me taken out when you implement the init loadBlueprints
    
    
    switch(type){
        case "Fighter":
            let x = await AircraftBlueprint.find();
            let blue = await AircraftBlueprint.findOne({ type: type});
            let fighter = new Aircraft(blue);
            fighter.name = name;
            fighter.site = facility;//maybe I don't need this? I dunno I'm just a pipe layer
            fighter.origin = facility;
            fighter.ready = false;
            fighter.building = true;
            fighter.team = team;

            return fighter;
        default:
            return err = `Could not determine what type of unit was wanted for construction...`;
            
    }

}

//construction function for making a new upgrade
async function newUpgrade (blueprint){

}

async function newFacility (name, site, team){
    await loadBlueprints(); //this can me taken out when you implement the init loadBlueprints
    try{
        let blue = await FacilityBlueprint.findOne({ code: "BS-1" }); //findOne({ name: iData.name });
        if (!blue)
            return err = "Could not find Facility Blueprint"

        let facility = new Facility(blue);

        facility.name = name;
        facility.site = site;
        //facility.code = code;
        facility.team = team;
        //facility = await facility.save();

        return facility;
    }
    catch(err){
        return err;
    }

}
module.exports = {newUnit, newUpgrade, newFacility};
