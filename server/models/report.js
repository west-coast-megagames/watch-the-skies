const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const nexusError = require('../middleware/util/throwError'); // Costom error handler util

const Schema = mongoose.Schema;

const ReportSchema = new Schema({
	date: { type: Date },
	code: { type: String },
	timestamp: { type: Schema.Types.Mixed },
	model: { type: String, default: 'Report', required: true },
	team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
	aircraft: { type: Schema.Types.ObjectId, ref: 'Aircraft' },
	unit: { type: Schema.Types.ObjectId, ref: 'Military' },
	squad: { type: Schema.Types.ObjectId, ref: 'Squad' },
	facility: { type: Schema.Types.ObjectId, ref: 'Facility' },
	site: { type: Schema.Types.ObjectId, ref: 'Site' },
	organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
	zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
	tags: [{ type: String, enum: [''] }],
	status: [{ type: String, enum: ['complete', 'hidden'] }]
}, { timestamps: true });

ReportSchema.methods.createTimestamp = function () {
	const Gameclock = require('../wts/gameClock/gameClock');
	this.timestamp = Gameclock.getTimeStamp();
	this.date = Date.now();

	return;
};

ReportSchema.methods.validateReport = async function () {
	const schema = Joi.object({
		model: Joi.string().min(1).max(3),
		tags: Joi.array().items(Joi.string().valid('')),
		status: Joi.array().items(Joi.string().valid('complete', 'hidden'))
	});

	const { error } = schema.validate(this, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

};

ReportSchema.methods.populateMe = function () {
	return this
		.populate('team', 'name code shortName')
		.populate('organization', 'name')
		.populate('zone')
		.populate('project')
		.populate('lab')
		.populate('theory')
		.populate('units')
		.populate('aircraft', 'name')
		.populate('site', 'name team')
		.execPopulate();
};

const Report = mongoose.model('Report', ReportSchema);

const AgentAction = Report.discriminator('AgentAction', new Schema({
	missionType: { type: String, default: 'Awaiting Mission', enum: ['Awaiting Mission', 'Counter-Espionage', 'Gather Intel', 'Sabotage', 'Heist'] },
	priorities: [{ type: String, enum: ['clandestine', 'effectiveness', 'survivability'] }],
	result: { type: Number }
}));

const AircraftAction = Report.discriminator('AircraftAction', new Schema({
	type: { type: String, required: true, enum: ['Launch', 'Repair', 'Transfer', 'Equip'] },
	transfer: {
		origin: { type: Schema.Types.ObjectId, ref: 'Site' },
		destination: { type: Schema.Types.ObjectId, ref: 'Site' }
	},
	equipt: {
		upgradesRemove: [{ type: Schema.Types.ObjectId, ref: 'Upgrade' }],
		upgradesAdd: [{ type: Schema.Types.ObjectId, ref: 'Upgrade' }]
	},
	dmgRepaired: { type: Number },
	cost: { type: Number }
}));

const AirMission = Report.discriminator('AirMission', new Schema({
	type: { type: String, default: 'After Action Report', enum: ['After Action Report', 'Interception', 'Recon', 'Transport', 'Diversion', 'Patrol', 'Escort', 'Failure'] },
	position: { type: String, required: true, enum: ['offense', 'defense'] },
	report: { type: String, required: true },
	rolls: [Number],
	unit: { type: Schema.Types.Mixed },
	opponent: { type: Schema.Types.Mixed },
	targetAircraft: { type: Schema.Types.Mixed },
	targetSite: { type: Schema.Types.Mixed },
	interception: { type: Schema.Types.Mixed },
	recon: {
		intel: [{ type: Schema.Types.Mixed }]
	},
	transport: {
		units: [{ type: Schema.Types.ObjectId, ref: 'Military' }],
		squads: [{ type: Schema.Types.Mixed }],
		cargo: [{ type: Schema.Types.Mixed }]
	}
}));

const CrashReport = Report.discriminator('CrashReport', new Schema({
	type: { type: String, default: 'Crash' },
	salvage: [{ type: Schema.Types.ObjectId, ref: 'Upgrade' }]
}));

const MilitaryAction = Report.discriminator('MilitaryAction', new Schema({
	type: { type: String, required: true, enum: ['Deploy', 'Repair', 'Transfer', 'Equip'] },
	transfer: {
		origin: { type: Schema.Types.ObjectId, ref: 'Site' },
		destination: { type: Schema.Types.ObjectId, ref: 'Site' }
	},
	equipt: {
		upgradesRemove: [{ type: Schema.Types.ObjectId, ref: 'Upgrade' }],
		upgradesAdd: [{ type: Schema.Types.ObjectId, ref: 'Upgrade' }]
	},
	cost: { type: Number },
	dmgRepaired: { type: Number, default: 0 }
}));

const MilitaryMission = Report.discriminator('MilitaryMission', new Schema ({
	type: { type: String, default: 'After Action Report', enum: ['After Action Report', 'Invade', 'Support', 'Assist', 'Battle'] },
	attackers: [{ type: Schema.Types.Mixed }],
	attackingTeams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
	defenders: [{ type: Schema.Types.Mixed }],
	winner: { type: String },
	spoils: [{ type: Schema.Types.Mixed }],
	results: [{ type: Schema.Types.Mixed }],
	battleRecord: { type: String }
}));

const ResearchReport = Report.discriminator('ResearchReport', new Schema({
	type: { type: String, default: 'Research' },
	lab: { type: Schema.Types.ObjectId, ref: 'Facility' },
	project: { type: Schema.Types.ObjectId, ref: 'Research' },
	funding: { type: Number },
	stats: {
		sciRate: { type: Number },
		sciBonus: { type: Number },
		completed: { type: Boolean },
		breakthroughCount: { type: Number },
		finalMultiplyer: { type: Number }
	},
	progress: {
		startingProgress: { type: Number },
		endingProgress: { type: Number }
	},
	rolls: [Number],
	outcomes: [String]
}));

const TerrorReport = Report.discriminator('TerrorReport', new Schema({
	type: { type: String, default: 'Terror' },
	targetSite: { type: Schema.Types.ObjectId, ref: 'Site' },
	startTerror: { type: Number },
	addTerror: { type: Number },
	endTerror: { type: Number },
	terrorMessage: { type: String }
}));

const TheoryReport = Report.discriminator('TheoryReport', new Schema({
	type: { type: String, default: 'Theory' },
	lab: { type: Schema.Types.ObjectId, ref: 'Facility' },
	theory: { type: Schema.Types.ObjectId, ref: 'Research' }
}));

const TradeReport = Report.discriminator('TradeReport', new Schema({
	type: { type: String, default: 'Trade' },
	trade: { type: Schema.Types.ObjectId, ref: 'Trade' }
}));

const Transaction = Report.discriminator('TransactionReport', new Schema({
	type: { type: String, default: 'Transaction' },
	transaction: { type: String, enum: ['Deposit', 'Withdrawal', 'Expense'] },
	counterparty:{ type: Schema.Types.ObjectId, ref: 'Team' },
	resource: { type: String, required: true, default: 'Megabucks', enum: ['Megabucks', 'Red Mercury', 'Rare Crustal Minerals'] },
	account: { type: String, required: true },
	amount: { type: Number, required: true },
	note: { type: String }
}));

module.exports = { Report, AgentAction, AircraftAction, AirMission, CrashReport, MilitaryAction, MilitaryMission, ResearchReport, TerrorReport, TheoryReport, TradeReport, Transaction };