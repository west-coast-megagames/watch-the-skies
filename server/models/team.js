const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
// const { logger } = require('../middleware/log/winston'); // Loging midddleware
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
	serviceRecord: [{ type: ObjectId, ref: 'Log' }],
	gameState: [],
	trades: [{ type: ObjectId, ref: 'Trades' }],
	treaties: [{ type: ObjectId, ref: 'Treaties' }]
});

TeamSchema.methods.validateTeam = async function () {
	const { validTrade, validTreaty, validLog } = require('../middleware/util/validateDocument');
	// validUser   no using yet

	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
	}
	for await (const tradeId of this.trades) {
		await validTrade(tradeId);
	}
	for await (const treatyId of this.treaties) {
		await validTreaty(treatyId);
	}

	let schema = {};
	switch(this.type) {

	case('National'):
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			shortName: Joi.string().min(2).max(30),
			code: Joi.string().min(2).max(3).required().uppercase(),
			type: Joi.string().min(1).max(10),
			prTrack: Joi.array().items(Joi.number().min(0).max(100)),
			agents: Joi.number().min(0),
			prLevel: Joi.number(),
			sciRate: Joi.number(),
			roles: Joi.array().items(Joi.object({ role: Joi.string(), type: Joi.string().valid('Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military') }))
		});
		/* not using user roles currently
		for await (const userId of this.roles.user) {
			await validUser(userId);
		}
		*/

		break;

	case('Alien'):
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			shortName: Joi.string().min(2).max(30),
			code: Joi.string().min(2).max(3).required().uppercase(),
			type: Joi.string().min(1).max(10),
			actionPts: Joi.number(),
			agents: Joi.number().min(0),
			sciRate: Joi.number()
		});
		/* not using user roles currently
		for await (const userId of this.roles.userId) {
			await validUser(userId);
		}
		*/

		break;

	case('Control'):
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			shortName: Joi.string().min(2).max(30),
			code: Joi.string().min(2).max(3).required().uppercase(),
			type: Joi.string().min(1).max(10),
			sciRate: Joi.number()
		});
		/* not using user roles currently
		for await (const userId of this.roles.user) {
			await validUser(userId);
		}
		*/
		break;

	case('Media'):
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			shortName: Joi.string().min(2).max(30),
			code: Joi.string().min(2).max(3).required().uppercase(),
			type: Joi.string().min(1).max(10),
			agents: Joi.number().min(0)
		});
		break;

	case('Npc'):
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			shortName: Joi.string().min(2).max(30),
			code: Joi.string().min(2).max(3).required().uppercase(),
			type: Joi.string().min(1).max(10)
		});
		// no further validation for NPC currently
		break;

	default:
		nexusError('Invalid Team Type ${this.type} ', 404);

	}

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

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
		agents: { type: Number, min: 0, default: 0 }
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
