const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterceptorSchema = new Schema({
  designation: { type: String, required: true },
  type: { type: String, default: "Interceptor"} ,
  team: { type: String },
  stats: {
    hull: { type: Number, default: 2 },
    hullMax: { type: Number, default: 2 },
    damage: { type: Number, default: 1 },
    passiveRolls: [Number],
    activeRolls: [Number]
  },
  location: { 
    zone: { type: String }, 
    country: {type:String }, 
    poi: { type: String }
  },
  status: { 
    aggressive: { type: Boolean, default: true },
    passive: { type: Boolean, default: false },
    disengage: { type: Boolean, default: false },
    damaged: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    ready: { type: Boolean, default: true },
    upgrade: { type: Boolean, default: false },
    repair: { type: Boolean, default: false },
    mission: { type: Boolean, default: false }
  }
});

let Interceptor = mongoose.model('interceptor', InterceptorSchema);

const { getTeam } = require('../team');
const banking = require('../../util/systems/banking/banking');


async function launch (aircraft) {
  try {
    console.log(`Attempting to launch ${aircraft.designation}`)
    aircraft.status.deployed = true;
    aircraft.status.ready = false;
    aircraft.status.mission = true;

    console.log(aircraft);

    let team = await getTeam('5dc3ba7d79f57e32c40bf6b4');

    let account = banking.withdrawl(team.accounts, 'Operations', 1, `Deployment of ${aircraft.designation}`)
    team.accounts = account;

    await team.save();
    await aircraft.save();
    console.log(`Aircraft ${aircraft.designation} deployed...`);
    return 0;
  } catch {

  }
}

module.exports = { Interceptor, launch }