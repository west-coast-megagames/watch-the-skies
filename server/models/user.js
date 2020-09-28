const mongoose = require('mongoose'); // Mongo DB object modeling module
const Joi = require('joi'); // Schema description & validation module
const { logger } = require('../middleware/log/winston'); // Loging midddleware
const nexusError = require('../middleware/util/throwError'); // Costom error handler util
const { validTeam } = require('../middleware/util/validateDocument');

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const ObjectId = mongoose.ObjectId; // Destructure of Object ID
const jwt = require('jsonwebtoken');
const config = require('config');

const UserSchema = new Schema({
	model: { type: String, default: 'User' },
	username: {
		type: String,
		required: true,
		unique: true,
		minlength: 5,
		maxlength: 15
	},
	name: {
		first: { type: String, required: true, minlength: 1, maxlength: 25 },
		last: { type: String, required: true, minlength: 1, maxlength: 50 }
	},
	email: { type: String, required: true, minlength: 5, maxlength: 255 },
	phone: { type: String, minlength: 10, maxlength: 14 },
	password: { type: String, required: true, minlength: 5, maxlength: 1024 },
	address: {
		street1: { type: String },
		street2: { type: String },
		city: { type: String },
		state: { type: String, minlength: 2, maxlength: 3 },
		zipcode: { type: String, minlength: 5, maxlength: 10 }
	},
	dob: { type: Date },
	gender: { type: String, enum: ['Male', 'Female', 'Non-Binary'] },
	discord: { type: String },
	team: { type: ObjectId, ref: 'Team' },
	roles: [{ type: String, enum: ['Player', 'Control', 'Admin'] }],
	serviceRecord: [{ type: Schema.Types.ObjectId, ref: 'Log' }],
	gameState: []
});

// validate User method
UserSchema.methods.validateUser = async function () {
	logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
	const nameSchema = {
		first: Joi.string().min(1).max(25),
		last: Joi.string().min(1).max(50)
	};

	const addressSchema = {
		street1: Joi.string().min(1).max(75),
		street2: Joi.string().empty(''),
		city: Joi.string().min(1).max(50),
		state: Joi.string().min(2).max(3),
		zipcode: Joi.string().min(5).max(10)
	};

	const schema = {
		name: Joi.object(nameSchema),
		address: Joi.object(addressSchema),
		username: Joi.string().min(5).max(15).required(),
		email: Joi.string().min(5).max(255).required().email(),
		phone: Joi.string().min(10).max(14),
		password: Joi.string().min(5).max(1024).required(),
		gender: Joi.string(),
		discord: Joi.string()
	};

	const { error } = Joi.validate(this, schema, { allowUnknown: true });
	if (error != undefined) nexusError(`${error}`, 400);

	await validTeam(this.team);
};

UserSchema.methods.generateAuthToken = function () {
	const token = jwt.sign(
		{
			_id: this._id,
			name: this.name,
			username: this.username,
			email: this.email,
			team: this.team
		},
		config.get('jwtPrivateKey')
	);

	return token;
};

const User = mongoose.model('user', UserSchema);

module.exports = { User };
