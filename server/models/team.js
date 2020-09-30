const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const RoleSchema = new Schema({
	role: { type: String },
	type: {
		type: String,
		enum: ['Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military']
	},
	user: { type: ObjectId, ref: 'User' }
});

// Team type is (N)ational, (A)lien, (M)edia, (C)ontrol, non-(P)layer-character
const TeamSchema = new Schema({
	model: { type: String, default: 'Team' },
	name: {
		type: String,
		required: true,
		unique: true,
		minlength: 2,
		maxlength: 50
	},
	shortName: { type: String, minlength: 2, maxlength: 30 },
	code: {
		type: String,
		required: true,
		unique: true,
		minlength: 2,
		maxlength: 3
	},
	type: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 1,
		default: 'N',
		enum: ['N', 'A', 'M', 'C', 'P']
	},
	homeCountry: { type: ObjectId, ref: 'Country' },
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	gameState: [],
	trades: [{ type: ObjectId, ref: 'Trades' }],
	treaties: [{ type: ObjectId, ref: 'Treaties' }]
});

TeamSchema.methods.validateTeam = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);

	const schema = {
		name: Joi.string().min(2).max(50).required(),
		shortName: Joi.string().min(2).max(30),
		code: Joi.string().min(2).max(3).required().uppercase(),
		type: Joi.string().min(1).max(1).uppercase()
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	// TODO: Add discriminator switch to validation
	// TODO: Add document check validation errors
	// TODO: Add sub-document validation checks
};

const Team = mongoose.model('Team', TeamSchema);

const National = Team.discriminator(
	'National',
	new Schema({
		type: { type: String, default: 'National' },
		roles: [RoleSchema],
		prTrack: [Number],
		agents: { type: Number, min: 0, default: 0 },
		prLevel: { type: Number },
		sciRate: { type: Number, default: 25 }
	})
);

const Alien = Team.discriminator(
	'Alien',
	new Schema({
		type: { type: String, default: 'Alien' },
		roles: [RoleSchema],
		actionPts: { type: Number, default: 25 },
		agents: { type: Number, min: 0, default: 0 },
		sciRate: { type: Number, default: 25 }
	})
);

const Control = Team.discriminator(
	'Control',
	new Schema({
		type: { type: String, default: 'Control' },
		sciRate: { type: Number, default: 25 },
		roles: [RoleSchema]
	})
);

const Media = Team.discriminator(
	'Media',
	new Schema({
		type: { type: String, default: 'Media' },
		agents: { type: Number }
	})
);

const Npc = Team.discriminator(
	'Npc',
	new Schema({
		type: { type: String, default: 'Npc' }
	})
);

async function getTeam (team_id) {
	const team = await Team.findOne({ _id: team_id });
	return team;
}

module.exports = { Team, getTeam, National, Alien, Control, Media, Npc };
