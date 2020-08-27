const mongoose = require("mongoose");
const modelDebugger = require("debug")("app:facilityModel");
const Schema = mongoose.Schema;
const Joi = require("joi");
const ObjectId = mongoose.ObjectId;

const fs = require('fs')

const file = fs.readFileSync(require.resolve(config.get('initPathWTS') + 'json/facilities/facilities.json'));
const facilData = JSON.parse(file);



const FacilitySchema = new Schema({
  model: { type: String, default: "Facility" },
  type: { type: String, min: 2, maxlength: 50 },
  name: { type: String, required: true, min: 2, maxlength: 50 },
  team: { type: ObjectId, ref: "Team" },
  site: { type: ObjectId, ref: "Site" },
  code: {
    type: String,
    minlength: 2,
    maxlength: 20,
    required: true,
    unique: true,
  },
  status: {
    repair: { type: Boolean, default: true },
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    secret: { type: Boolean, default: false },
    defenses: { type: Boolean, default: false },
  },
  hidden: { type: Boolean, default: false },
  serviceRecord: [{ type: ObjectId, ref: "Log" }],
  gameState: [],
  capability: {
    research: {
      capacity: { type: Number, default: 0 },
      projects: [{ type: ObjectId, ref: "Research" }],
      funding: [Number],
      sciRate: { type: Number, default: 0 },
      sciBonus: { type: Number, default: 0 },
      active: { type: Boolean },
      status: {
        damage: [Boolean],
        pending: [Boolean]
      }
    },
    airMission: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      aircraft: [{ type: ObjectId, ref: "Aircraft" }],
      active: { type: Boolean },
    },
    storage: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      equipment: [{ type: ObjectId, ref: "Equipment" }],
      active: { type: Boolean },
    },
    manufacturing: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      equipment: [{ type: ObjectId, ref: "Equipment" }],
      active: { type: Boolean },
    },
    naval: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      fleet: [{ type: ObjectId, ref: "Military" }],
      active: { type: Boolean },
    },
    ground: {
      capacity: { type: Number, default: 0 },
      damage: [Boolean],
      corps: [{ type: ObjectId, ref: "Military" }],
      active: { type: Boolean },
    },
  },
});

let Facility = mongoose.model("Facility", FacilitySchema);

function validateFacility(facility) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
  };

  return Joi.validate(facility, schema, { allowUnknown: true });
}

// Load function to load all facilitys
async function loadFacilitys () {
  let count = 0;

  await facilData.forEach(facil => {
      facilityDebugger(facil);
      facilitys[count] = new Facility(facil);
      count++;
  });

  return `${count} Facility Templates available in WTS...`
};

module.exports = {
  Facility,
  validateFacility,
};
