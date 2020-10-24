const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const roleTypeVals = ['Player', 'Control', 'Admin'];
const genderTypeVals = ['Male', 'Female', 'Non-Binary'];

function inArray (array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkUser (runFlag) {
	let uFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initUsers/lean`);
		uFinds = data;
	}
	catch(err) {
		logger.error(`User Get Lean Error (userCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for await (const user of uFinds) {

		if (!Object.prototype.hasOwnProperty.call(user, 'team')) {
			logger.error(`team missing for User ${user.username} ${user._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'model')) {
			logger.error(`model missing for User ${user.username} ${user._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'gameState')) {
			logger.error(`gameState missing for User ${user.username} ${user._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'serviceRecord')) {
			logger.error(
				`serviceRecord missing for User ${user.username} ${user._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'username')) {
			logger.error(`username missing for User ${user.name.first} ${user.name.last} ${user._id}`);
		}
		else if (
			user.username === '' ||
        user.username == undefined ||
        user.username == null
		) {
			logger.error(`username is blank for User ${user.name} ${user._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'name')) {
			logger.error(`name missing for User ${user.username} ${user._id}`);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(user.name, 'first')) {
				logger.error(
					`first name missing for User ${user.username} ${user._id}`
				);
			}
			else if (
				user.name.first === '' ||
          user.name.first == undefined ||
          user.name.first == null
			) {
				logger.error(
					`first name is blank for User ${user.username} ${user._id}`
				);
			}

			if (!Object.prototype.hasOwnProperty.call(user.name, 'last')) {
				logger.error(`last name missing for User ${user.username} ${user._id}`);
			}
			else if (
				user.name.last === '' ||
          user.name.last == undefined ||
          user.name.last == null
			) {
				logger.error(
					`last name is blank for User ${user.username} ${user._id}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'email')) {
			logger.error(`email missing for User ${user.username} ${user._id}`);
		}
		else if (user.email === '' || user.email == undefined || user.email == null) {
			logger.error(`email is blank for User ${user.username} ${user._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'password')) {
			logger.error(`password missing for User ${user.username} ${user._id}`);
		}
		else if (
			user.password === '' ||
        user.password == undefined ||
        user.password == null
		) {
			logger.error(`password is blank for User ${user.username} ${user._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'address')) {
			logger.error(`address missing for User ${user.username} ${user._id}`);
		}
		else {
			if (!Object.prototype.hasOwnProperty.call(user.address, 'street1')) {
				logger.error(
					`street1 address missing for User ${user.username} ${user._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(user.address, 'street2')) {
				logger.error(
					`street2 address missing for User ${user.username} ${user._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(user.address, 'city')) {
				logger.error(
					`city address missing for User ${user.username} ${user._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(user.address, 'state')) {
				logger.error(
					`state address missing for User ${user.username} ${user._id}`
				);
			}
			if (!Object.prototype.hasOwnProperty.call(user.address, 'zipcode')) {
				logger.error(
					`zipcode address missing for User ${user.username} ${user._id}`
				);
			}
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'dob')) {
			logger.error(`dob missing for User ${user.username} ${user._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'gender')) {
			logger.error(`gender missing for User ${user.username} ${user._id}`);
		}
		else if (!inArray(genderTypeVals, user.gender)) {
			logger.error(
				`Invalid gender type ${user.gender} for User ${user.username} ${user._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'discord')) {
			logger.error(`discord missing for User ${user.username} ${user._id}`);
		}

		if (!Object.prototype.hasOwnProperty.call(user, 'roles')) {
			logger.error(`roles missing for User ${user.username} ${user._id}`);
		}
		// has at least one role
		else if (user.roles.length < 1) {
			logger.error(`No Roles Assigned to ${user.username} ${user._id}`);
		}
		else {
			for (let i = 0; i < user.roles.length; ++i) {
				if (!inArray(roleTypeVals, user.roles[i])) {
					logger.error(
						`Invalid role type ${user.roles[i]} for User ${user.username} ${user._id}`
					);
				}
			}
		}


		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initUsers/validate/${user._id}`);
			if (!valMessage.data.username) {
				logger.error(`Validation Error For ${user.username} ${user.email}: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`User Validation Error For ${user.username} ${user.email} Error: ${err.message}`
			);
		}

	}
	runFlag = true;
	return runFlag;
}

module.exports = chkUser;
