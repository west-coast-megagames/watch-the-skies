const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

const RoleSchema = new Schema({
	role: { type: String },
	type: {
		type: String,
		enum: ['Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military']
	},
	user: { type: Schema.Types.ObjectId, ref: 'User' }
});

// teamType is (N)ational, (A)lien, (M)edia, (C)ontrol, non-(P)layer-character
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
	teamCode: {
		type: String,
		required: true,
		unique: true,
		minlength: 2,
		maxlength: 3
	},
	teamType: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 1,
		default: 'N',
		enum: ['N', 'A', 'M', 'C', 'P']
	},
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }],
	gameState: [],
	trades: [{ type: Schema.Types.ObjectId, ref: 'Trades' }],
	treaties: [{ type: Schema.Types.ObjectId, ref: 'Treaties' }]
});

TeamSchema.methods.validateTeam = async function () {
	const schema = {
		name: Joi.string().min(2).max(50).required(),
		shortName: Joi.string().min(2).max(30),
		teamCode: Joi.string().min(2).max(3).required().uppercase(),
		teamType: Joi.string().min(1).max(1).uppercase()
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
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

function validateNational (national) {
	// modelDebugger(`Validating ${national.name}...`);

	const schema = {
		teamCode: Joi.string().min(2).max(3).required().uppercase(),
		name: Joi.string().min(2).max(50).required(),
		shortName: Joi.string().min(2).max(30),
		teamType: Joi.string().min(1).max(1).uppercase()
	};

	return Joi.validate(national, schema, { allowUnknown: true });
}

function validateRoles (roles) {
	const schema = Joi.object().keys({
		type: Joi.string().valid(
			'Head of State',
			'Diplomat',
			'Ambassador',
			'Scientist',
			'Military'
		)
	});

	return Joi.validate(roles, schema, { allowUnknown: true });
}

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

function validateAlien (alien) {
	// modelDebugger(`Validating ${alien.name}...`);

	const schema = {
		teamCode: Joi.string().min(2).max(3).required().uppercase(),
		name: Joi.string().min(2).max(50).required(),
		shortName: Joi.string().min(2).max(30),
		teamType: Joi.string().min(1).max(1).uppercase()
	};

	return Joi.validate(alien, schema, { allowUnknown: true });
}

const Control = Team.discriminator(
	'Control',
	new Schema({
		type: { type: String, default: 'Control' },
		sciRate: { type: Number, default: 25 },
		roles: [RoleSchema]
	})
);

function validateControl (control) {
	// modelDebugger(`Validating ${control.name}...`);

	const schema = {
		teamCode: Joi.string().min(2).max(3).required().uppercase(),
		name: Joi.string().min(2).max(50).required(),
		shortName: Joi.string().min(2).max(30),
		teamType: Joi.string().min(1).max(1).uppercase()
	};

	return Joi.validate(control, schema, { allowUnknown: true });
}

const Media = Team.discriminator(
	'Media',
	new Schema({
		type: { type: String, default: 'Media' },
		agents: { type: Number }
	})
);

function validateMedia (media) {
	// modelDebugger(`Validating ${media.name}...`);

	const schema = {
		teamCode: Joi.string().min(2).max(3).required().uppercase(),
		name: Joi.string().min(2).max(50).required(),
		shortName: Joi.string().min(2).max(30),
		teamType: Joi.string().min(1).max(1).uppercase()
	};

	return Joi.validate(media, schema, { allowUnknown: true });
}

const Npc = Team.discriminator(
	'Npc',
	new Schema({
		type: { type: String, default: 'Npc' }
	})
);

function validateNpc (npc) {
	// modelDebugger(`Validating ${npc.name}...`);

	const schema = {
		teamCode: Joi.string().min(2).max(3).required().uppercase(),
		name: Joi.string().min(2).max(50).required(),
		shortName: Joi.string().min(2).max(30),
		teamType: Joi.string().min(1).max(1).uppercase()
	};

	return Joi.validate(npc, schema, { allowUnknown: true });
}

async function getTeam (team_id) {
	const team = await Team.findOne({ _id: team_id });
	return team;
}

module.exports = {
	Team,
	getTeam,
	National,
	validateNational,
	Alien,
	validateAlien,
	Control,
	validateControl,
	Media,
	validateMedia,
	Npc,
	validateNpc,
	validateRoles
};
