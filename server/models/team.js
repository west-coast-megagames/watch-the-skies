const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
// const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID

const { Account } = require('./account');

const clock = require('../wts/gameClock/gameClock');
const die = require('../util/systems/dice');

const RoleSchema = new Schema({
	role: { type: String },
	type: {
		type: String,
		enum: ['Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military']
	},
	user: { type: String }
});

const AgreementSchema = new Schema({
	type: {
		type: String,
		enum: ['Defense', 'Base', 'Science', 'Open Borders']
	},
	with: { type: String } // or some other name probably
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
	tags: [{ type: String, enum: ['']} ],
	roles: [RoleSchema],
	users:  [{ type: String, minlength: 2, maxlength: 30 }],
	agreements: [ AgreementSchema ]
});

// METHOD - prRoll
// IN - VOID
// OUT: Modified Team Object
// PROCESS: This method rolls and assigns a new PR level for the team
TeamSchema.methods.prRoll = async function () {
	if (this.type !== 'National') throw Error('Only National teams have PR');
	const { turnNum } = clock.getTimeStamp();
	const prRoll = die.d8();
	let prLevel = this.prLevel;

	console.log(`Current PR: ${this.prLevel}`);
	console.log(`PR Roll: ${prRoll}`);

	if (turnNum > 1) {
		if (prRoll < this.prLevel) {
			prLevel = this.prLevel + this.prModifier - Math.floor(((this.prLevel - prRoll) / 1.5));
		}
		else if (prRoll > this.prLevel) {
			prLevel = this.prLevel + this.prModifier + 1;
		}
		else {
			prLevel = this.prLevel + this.prModifier;
		}

		prLevel = prLevel > 8 ? 8 : prLevel;
		prLevel = prLevel < 1 ? 1 : prLevel;
	}
	this.prLevel = prLevel;

	const team = await this.save();

	console.log(`PR Level: ${prLevel}`);

	// TODO - Socket update for client

	return team;
};

// METHOD - assignIncome
// IN - VOID | OUT: VOID
// PROCESS: This method gives the treasury for the team income based on the PR level
TeamSchema.methods.assignIncome = async function () {
	if (this.type !== 'National') throw Error('Only National teams have PR based income');
	const { turnNum } = clock.getTimeStamp();

	console.log(`Assigning income for ${this.shortName}... turn ${turnNum} income...`);

	const account = await Account.findOne({ name: 'Treasury', 'team': this._id });

	const income = this.prTrack[this.prLevel]; // Finds the current income value
	await account.deposit({ to: account._id, amount: income, resource: 'Megabucks', note: `Turn ${turnNum} income.` });

	return;
};

TeamSchema.methods.assignUser = async function (user) {
	if (!this.users.some(el => el === user)) {
		this.users.push(user);
		this.markModified('users');
	}

	const team = await this.save();
	nexusEvent.emit('request', 'update', [ team ]);
	return team;
};

// METHOD - endTurn
// IN - VOID | OUT: VOID
// PROCESS: Standard WTS method for end of turn maintanance for the team object
TeamSchema.methods.endTurn = async function () {
	await this.prRoll(); // Activates the roll for PR method of the team model
	await this.assignIncome(); // Activates the assign income method of the team model

	return;
};

TeamSchema.methods.populateMe = async function () {
	return this;
}

TeamSchema.methods.validateTeam = async function () {
	const { validLog } = require('../middleware/util/validateDocument');

	for await (const servRec of this.serviceRecord) {
		await validLog(servRec);
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
			tags: Joi.array().items(Joi.string().valid('')),
			roles: Joi.array().items(Joi.object({ role: Joi.string(), type: Joi.string().valid('Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military') })),
			users: Joi.array().items(Joi.string().min(2).max(30))
		});

		break;

	case('Alien'):
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			shortName: Joi.string().min(2).max(30),
			code: Joi.string().min(2).max(3).required().uppercase(),
			type: Joi.string().min(1).max(10),
			actionPts: Joi.number(),
			agents: Joi.number().min(0),
			sciRate: Joi.number(),
			tags: Joi.array().items(Joi.string().valid('')),
			roles: Joi.array().items(Joi.object({ role: Joi.string(), type: Joi.string().valid('Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military') })),
			users: Joi.array().items(Joi.string().min(2).max(30))
		});

		break;

	case('Control'):
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			shortName: Joi.string().min(2).max(30),
			code: Joi.string().min(2).max(3).required().uppercase(),
			type: Joi.string().min(1).max(10),
			sciRate: Joi.number(),
			tags: Joi.array().items(Joi.string().valid('')),
			roles: Joi.array().items(Joi.object({ role: Joi.string(), type: Joi.string().valid('Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military') })),
			users: Joi.array().items(Joi.string().min(2).max(30))
		});
		break;

	case('Media'):
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			shortName: Joi.string().min(2).max(30),
			code: Joi.string().min(2).max(3).required().uppercase(),
			type: Joi.string().min(1).max(10),
			agents: Joi.number().min(0),
			tags: Joi.array().items(Joi.string().valid('')),
			roles: Joi.array().items(Joi.object({ role: Joi.string(), type: Joi.string().valid('Head of State', 'Diplomat', 'Ambassador', 'Scientist', 'Military') })),
			users: Joi.array().items(Joi.string().min(2).max(30))
		});
		break;

	case('Npc'):
		schema = Joi.object({
			name: Joi.string().min(2).max(50).required(),
			shortName: Joi.string().min(2).max(30),
			code: Joi.string().min(2).max(3).required().uppercase(),
			tags: Joi.array().items(Joi.string().valid('')),
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
		prTrack: [Number],
		agents: { type: Number, min: 0, default: 0 },
		prLevel: { type: Number },
		sciRate: { type: Number, default: 25 },
		users:  [{ type: String, minlength: 2, maxlength: 30 }]
	})
);

const Alien = Team.discriminator(
	'Alien',
	new Schema({
		type: { type: String, default: 'Alien' },
		roles: [RoleSchema],
		actionPts: { type: Number, default: 25 },
		agents: { type: Number, min: 0, default: 0 },
		sciRate: { type: Number, default: 25 },
	})
);

const Control = Team.discriminator(
	'Control',
	new Schema({
		type: { type: String, default: 'Control' },
		sciRate: { type: Number, default: 25 },
	})
);

const Media = Team.discriminator(
	'Media',
	new Schema({
		type: { type: String, default: 'Media' },
		agents: { type: Number, min: 0, default: 0 },
	})
);

const Npc = Team.discriminator(
	'Npc',
	new Schema({
		type: { type: String, default: 'Npc' }
	})
);

async function getTeam(team_id) {
	const team = await Team.findOne({ _id: team_id });
	return team;
}

module.exports = { Team, getTeam, National, Alien, Control, Media, Npc };
