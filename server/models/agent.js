const mongoose = require('mongoose'); // Mongo DB object modeling module

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
/*
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

const banking = require('../wts/banking/banking'); // WTS Banking system
const { Account } = require('./account'); // Import of Account model [Mongoose]
const { Facility } = require('./facility'); // Import of Facility model [Mongoose]
const { Upgrade } = require('./upgrade'); // Import of Upgrade model [Mongoose]
const randomCords = require('../util/systems/lz');
*/
// Agent Schema
const AgentSchema = new Schema({
	model: { type: String, default: 'Agent' },
	name: { type: String, required: true, min: 2, maxlength: 50 },
	team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	location: {
		lat: { type: Number },
		lng: { type: Number }
	},
	site: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
	origin: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
	missionType: { type: String, default: 'Awaiting Mission', enum: ['Awaiting Mission', 'Counter-Espionage', 'Gather Intel', 'Sabotage', 'Heist'] },
	mission: {
		priorities: [{ type: String, enum: ['clandestine', 'effectiveness', 'survivability'] }]
	},
	status: {
		deployed: { type: Boolean, default: false },
		destroyed: { type: Boolean, default: false },
		ready: { type: Boolean, default: true },
		upgrade: { type: Boolean, default: false },
		captured: { type: Boolean, default: false }
	},
	upgrades: [{ type: Schema.Types.ObjectId, ref: 'Upgrade' }],
	stats: {
		clandestine: { type: Number, default: 0 },
		effectiveness: { type: Number, default: 0 },
		survivability: { type: Number, default: 0 }
	},
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }]
});

const Agent = mongoose.model('Agent', AgentSchema);

module.exports = { Agent };
