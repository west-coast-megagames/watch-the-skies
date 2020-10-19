const gameServer = require('../config/config').gameServer;
const axios = require('axios');

const { logger } = require('../middleware/log/winston'); // Import of winston for error logging
require('winston-mongodb');

const fields = [
	'Biology',
	'Computer Science',
	'Electronics',
	'Engineering',
	'Genetics',
	'Material Science',
	'Physics',
	'Psychology',
	'Social Science',
	'Quantum Mechanics'
];
const outcomes = ['Destroy', 'Damage', 'Kill', 'Preserve'];
const techFields = [
	'Military',
	'Infrastructure',
	'Biomedical',
	'Agriculture',
	'Analysis'
];
const typeVals = ['Knowledge', 'Analysis', 'Technology'];

function inArray (array, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) return true;
	}
	return false;
}

async function chkResearch (runFlag) {

	let rFinds = [];
	try {
		const { data } = await axios.get(`${gameServer}init/initResearch/lean`);
		rFinds = data;
	}
	catch(err) {
		logger.error(`Research Get Lean Error (researchCheck): ${err.message}`, { meta: err.stack });
		return false;
	}

	for (const research of rFinds) {

		if (!Object.prototype.hasOwnProperty.call(research, 'model')) {
			logger.error(
				`model missing for Research ${research.name} ${research.code} ${research._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'gameState')) {
			logger.error(
				`gameState missing for Research ${research.name} ${research.code} ${research._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'name')) {
			logger.error(`Research name is missing ${research._id}`);
		}
		else if (
			research.name == undefined ||
        research.name === '' ||
        research.name === null
		) {
			logger.error(
				`Research name is blank for ${research.name} ${research._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'code')) {
			logger.error(
				`Research code is missing  ${research.name} ${research._id}`
			);
		}
		else if (
			research.code == undefined ||
        research.code === '' ||
        research.code === null
		) {
			logger.error(
				`Research code is blank for ${research.name} ${research._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'desc')) {
			logger.error(
				`Research desc is missing  ${research.name} ${research._id}`
			);
		}
		else if (
			research.desc == undefined ||
        research.desc === '' ||
        research.desc === null
		) {
			logger.error(
				`Research description is blank ${research.name} ${research._id}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'level')) {
			logger.error(
				`Research level is missing  ${research.name} ${research._id}`
			);
		}
		else if (isNaN(research.level)) {
			logger.error(
				`Research ${research.name} ${research._id} level is not a number ${research.level}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'progress')) {
			logger.error(
				`Research progress is missing  ${research.name} ${research._id}`
			);
		}
		else if (isNaN(research.progress)) {
			logger.error(
				`Research ${research.name} ${research._id} progress is not a number ${research.progress}`
			);
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'type')) {
			logger.error(
				`Research type is missing  ${research.name} ${research._id}`
			);
		}
		else {
			if (!inArray(typeVals, research.type)) {
				logger.error(
					`Invalid type ${research.type} for Research ${research.name} ${research._id}`
				);
			}

			if (research.type === 'Knowledge') {
				if (research.status.completed) {
					if (!Object.prototype.hasOwnProperty.call(research, 'credit')) {
						logger.error(
							`Credit Team Field missing for Knowledge Research ${research.name} ${research._id}`
						);
					}
				}
				if (!Object.prototype.hasOwnProperty.call(research, 'field')) {
					logger.error(
						`Field missing for Knowledge Research ${research.name} ${research._id}`
					);
				}
				else if (!inArray(fields, research.field)) {
					logger.error(
						`Invalid field ${research.field} for Knowledge Research ${research.name} ${research._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(research, 'status')) {
					logger.error(
						`Knowledge Research status is missing  ${research.name} ${research._id}`
					);
				}
				else {
					if (!Object.prototype.hasOwnProperty.call(research.status, 'available')) {
						logger.error(
							`status.available missing for Research ${research.name} ${research._id}`
						);
					}
					else if (
						research.status.available === undefined ||
              research.status.available === null
					) {
						logger.error(
							`Knowledge Research status.available is not set ${research.name} ${research._id}`
						);
					}

					if (!Object.prototype.hasOwnProperty.call(research.status, 'completed')) {
						logger.error(
							`status.completed missing for Research ${research.name} ${research._id}`
						);
					}
					else if (
						research.status.completed === undefined ||
              research.status.completed === null
					) {
						logger.error(
							`Knowledge Research status.completed is not set ${research.name} ${research._id}`
						);
					}

					if (!Object.prototype.hasOwnProperty.call(research.status, 'published')) {
						logger.error(
							`status.published missing for Research ${research.name} ${research._id}`
						);
					}
					else if (
						research.status.published === undefined ||
              research.status.published === null
					) {
						logger.error(
							`Knowledge Research status.published is not set ${research.name} ${research._id}`
						);
					}
				}

				if (!Object.prototype.hasOwnProperty.call(research, 'teamProgress')) {
					logger.error(
						`Knowledge Research teamProgress is missing  ${research.name} ${research._id}`
					);
				}
				else {
					for (let i = 0; i < research.teamProgress.length; ++i) {
						if (!Object.prototype.hasOwnProperty.call(research.teamProgress[i], 'progress')) {
							logger.error(
								`teamProgress.progress missing for Knowledge Research ${i} ${research.name} ${research._id}`
							);
						}
						else if (
							research.teamProgress[i].progress === undefined ||
                research.teamProgress[i].progress === null
						) {
							logger.error(
								`Knowledge Research teamProgress.progress is not set ${research.name} ${research._id}`
							);
						}
						else if (isNaN(research.teamProgress[i].progress)) {
							logger.error(
								`Knowledge Research ${research.name} ${research._id} teamProgress ${i} progress is not a number ${research.teamProgress[i].progress}`
							);
						}

						if (!Object.prototype.hasOwnProperty.call(research.teamProgress[i], 'funding')) {
							logger.error(
								`teamProgress.funding missing for Knowledge Research ${i} ${research.name} ${research._id}`
							);
						}
						else if (
							research.teamProgress[i].funding === undefined ||
                research.teamProgress[i].funding === null
						) {
							logger.error(
								`Knowledge Research teamProgress.funding is not set ${research.name} ${research._id}`
							);
						}
						else if (isNaN(research.teamProgress[i].funding)) {
							logger.error(
								`Knowledge Research ${research.name} ${research._id} teamProgress ${i} funding is not a number ${research.teamProgress[i].funding}`
							);
						}

						if (!Object.prototype.hasOwnProperty.call(research.teamProgress[i], 'totalFunding')) {
							logger.error(
								`teamProgress.totalFunding missing for Knowledge Research ${i} ${research.name} ${research._id}`
							);
						}
						else if (
							research.teamProgress[i].totalFunding === undefined ||
                research.teamProgress[i].totalFunding === null
						) {
							logger.error(
								`Knowledge Research teamProgress.totalFunding is not set ${research.name} ${research._id}`
							);
						}
						else if (isNaN(research.teamProgress[i].totalFunding)) {
							logger.error(
								`Knowledge Research ${research.name} ${research._id} teamProgress ${i} totalFunding is not a number ${research.teamProgress[i].totalFunding}`
							);
						}

						if (!Object.prototype.hasOwnProperty.call(research.teamProgress[i], 'team')) {
							logger.error(
								`teamProgress.team missing for Knowledge Research ${i} ${research.name} ${research._id}`
							);
						}
						else {
							if (
								research.teamProgress[i].team === undefined ||
                research.teamProgress[i].team === null
							) {
								logger.error(
									`Knowledge Research teamProgress.team is not set ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.teamProgress[i].team, 'name')) {
								logger.error(
									`teamProgress.team.name missing for Knowledge Research ${i} ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.teamProgress[i].team, '_id')) {
								logger.error(
									`teamProgress.team_id missing for Knowledge Research ${i} ${research.name} ${research._id}`
								);
							}
						}
					}
				}
			}

			if (research.type === 'Analysis' || research.type === 'Technology') {
				if (!Object.prototype.hasOwnProperty.call(research, 'team')) {
					logger.error(
						`Team Field missing for ${research.type} Research ${research.name} ${research._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(research, 'status')) {
					logger.error(
						`${research.type} Research status is missing  ${research.name} ${research._id}`
					);
				}
				else {
					if (!Object.prototype.hasOwnProperty.call(research.status, 'available')) {
						logger.error(
							`status.available missing for Research ${research.name} ${research._id}`
						);
					}
					else if (
						research.status.available === undefined ||
              research.status.available === null
					) {
						logger.error(
							`${research.type} Research status.available is not set ${research.name} ${research._id}`
						);
					}

					if (!Object.prototype.hasOwnProperty.call(research.status, 'completed')) {
						logger.error(
							`status.available missing for Research ${research.name} ${research._id}`
						);
					}
					else if (
						research.status.completed === undefined ||
              research.status.completed === null
					) {
						logger.error(
							`${research.type} Research status.completed is not set ${research.name} ${research._id}`
						);
					}

					if (research.type === 'Technology') {
						if (!Object.prototype.hasOwnProperty.call(research.status, 'visible')) {
							logger.error(
								`status.visible missing for Technology Research ${research.name} ${research._id}`
							);
						}
						else if (
							research.status.visible === undefined ||
                research.status.visible === null
						) {
							logger.error(
								`${research.type} Research status.visible is not set ${research.name} ${research._id}`
							);
						}
					}
				}

				if (research.type === 'Analysis') {
					if (!Object.prototype.hasOwnProperty.call(research, 'salvage')) {
						logger.error(
							`Analysis Research salvage is missing  ${research.name} ${research._id}`
						);
					}
					else {
						for (let i = 0; i < research.salvage.length; ++i) {
							if (!Object.prototype.hasOwnProperty.call(research.salvage[i], 'outcome')) {
								logger.error(
									`salvage.outcome missing for Analysis Research ${i} ${research.name} ${research._id}`
								);
							}
							else if (!inArray(outcomes, research.salvage[i].outcome)) {
								logger.error(
									`Invalid salvage outcome ${i} ${research.salvage[i].outcome} for Analysis Research ${research.name} ${research._id}`
								);
							}

							if (!Object.prototype.hasOwnProperty.call(research.salvage[i], 'gear')) {
								logger.error(
									`salvage.gear missing for Analysis Research ${i} ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.salvage[i], 'system')) {
								logger.error(
									`salvage.system missing for Analysis Research ${i} ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.salvage[i], 'infrastructure')) {
								logger.error(
									`salvage.outcome missing for Analysis Research ${i} ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.salvage[i], 'facility')) {
								logger.error(
									`salvage.facility missing for Analysis Research ${i} ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.salvage[i], 'site')) {
								logger.error(
									`salvage.site missing for Analysis Research ${i} ${research.name} ${research._id}`
								);
							}
						}
					}
				}
				if (research.type === 'Technology') {
					if (!Object.prototype.hasOwnProperty.call(research, 'field')) {
						logger.error(
							`Field missing for Technology Research ${research.name} ${research._id}`
						);
					}
					else if (!inArray(techFields, research.field)) {
						logger.error(
							`Invalid field ${research.field} for Technology Research ${research.name} ${research._id}`
						);
					}

					if (!Object.prototype.hasOwnProperty.call(research, 'theoretical')) {
						logger.error(
							`theoretical missing for Technology Research ${research.name} ${research._id}`
						);
					}
					else {
						for (let i = 0; i < research.theoretical.length; ++i) {
							if (!Object.prototype.hasOwnProperty.call(research.theoretical[i], 'name')) {
								logger.error(
									`theoretical.name missing for Technology Research ${i} ${research.name} ${research._id}`
								);
							}
							else if (
								research.theoretical[i].name == undefined ||
                  research.theoretical[i].name === '' ||
                  research.theoretical[i].name === null
							) {
								logger.error(
									`Technology Research theoretical name ${i} has length of zero ${research.name} ${research._id}`
								);
							}

							if (!Object.prototype.hasOwnProperty.call(research.theoretical[i], 'level')) {
								logger.error(
									`theoretical.level missing for Technology Research ${i} ${research.name} ${research._id}`
								);
							}
							else if (
								research.theoretical[i].level == undefined ||
                  research.theoretical[i].level === undefined ||
                  research.theoretical[i].level === null
							) {
								logger.error(
									`Technology Research theoretical level ${i} has length of zero ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.theoretical[i], 'type')) {
								logger.error(
									`theoretical.type missing for Technology Research ${i} ${research.name} ${research._id}`
								);
							}
							else if (
								research.theoretical[i].type == undefined ||
                  research.theoretical[i].type === '' ||
                  research.theoretical[i].type === null
							) {
								logger.error(
									`Technology Research theoretical type ${i} has length of zero ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.theoretical[i], 'code')) {
								logger.error(
									`theoretical.code missing for Technology Research ${i} ${research.name} ${research._id}`
								);
							}
							else if (
								research.theoretical[i].code == undefined ||
                  research.theoretical[i].code === '' ||
                  research.theoretical[i].code === null
							) {
								logger.error(
									`Technology Research theoretical code ${i} has length of zero ${research.name} ${research._id}`
								);
							}

							if (!Object.prototype.hasOwnProperty.call(research.theoretical[i], 'desc')) {
								logger.error(
									`theoretical.desc missing for Technology Research ${i} ${research.name} ${research._id}`
								);
							}
							else if (
								research.theoretical[i].desc == undefined ||
                  research.theoretical[i].desc === '' ||
                  research.theoretical[i].desc === null
							) {
								logger.error(
									`Technology Research theoretical desc ${i} has length of zero ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.theoretical[i], 'field')) {
								logger.error(
									`theoretical.field missing for Technology Research ${i} ${research.name} ${research._id}`
								);
							}
							else if (
								research.theoretical[i].field == undefined ||
                  research.theoretical[i].field === '' ||
                  research.theoretical[i].field === null
							) {
								logger.error(
									`Technology Research theoretical field ${i} has length of zero ${research.name} ${research._id}`
								);
							}

							if (!Object.prototype.hasOwnProperty.call(research.theoretical[i], 'prereq')) {
								logger.error(
									`theoretical.prereq missing for Technology Research ${i} ${research.name} ${research._id}`
								);
							}
							else {
								for (
									let j = 0;
									j < research.theoretical[i].prereq[j].length;
									++j
								) {
									if (
										!Object.prototype.hasOwnProperty.call(research.theoretical[i].prereq[j], 'code')
									) {
										logger.error(
											`theoretical.prereq.code missing for Technology Research ${i} ${j} ${research.name} ${research._id}`
										);
									}
									else if (
										research.theoretical[i].prereq[j].code == undefined ||
                      research.theoretical[i].prereq[j].code === '' ||
                      research.theoretical[i].prereq[j].code === null
									) {
										logger.error(
											`Technology Research Theoretical ${i} prereq code ${j} is not set ${research.name} ${research._id}`
										);
									}
									if (
										!Object.prototype.hasOwnProperty.call(research.theoretical[i].prereq[j], 'type')
									) {
										logger.error(
											`theoretical.prereq.type missing for Technology Research ${i} ${j} ${research.name} ${research._id}`
										);
									}
									else if (
										research.theoretical[i].prereq[j].type == undefined ||
                      research.theoretical[i].prereq[j].type === '' ||
                      research.theoretical[i].prereq[j].type === null
									) {
										logger.error(
											`Technology Research Theoretical ${i} prereq type ${j} is not set ${research.name} ${research._id}`
										);
									}
								}
							}
						}
					}
					if (!Object.prototype.hasOwnProperty.call(research, 'knowledge')) {
						logger.error(
							`knowledge missing for Technology Research ${research.name} ${research._id}`
						);
					}
					else {
						for (let i = 0; i < research.knowledge.length; ++i) {
							if (!Object.prototype.hasOwnProperty.call(research.knowledge[i], 'field')) {
								logger.error(
									`knowledge.field missing for Technology Research ${i} ${research.name} ${research._id}`
								);
							}
							else if (
								research.knowledge[i].field == undefined ||
                  research.knowledge[i].field === '' ||
                  research.knowledge[i].field === null
							) {
								logger.error(
									`Technology Research knowledge field ${i} is blank ${research.name} ${research._id}`
								);
							}
							if (!Object.prototype.hasOwnProperty.call(research.knowledge[i], 'rolls')) {
								logger.error(
									`knowledge.rolls missing for Technology Research ${i} ${research.name} ${research._id}`
								);
							}
							else if (isNaN(research.knowledge[i].rolls)) {
								logger.error(
									`Research ${research.name} ${research._id} knowledge is not a number ${i} ${research.knowledge[i]}`
								);
							}
						}
					}
				}
			}
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'prereq')) {
			logger.error(
				`Research prereq is missing  ${research.name} ${research._id}`
			);
		}
		else {
			// researchCheckDebugger(`Research ${research.name} ${research._id} Check of Prereq ${research.prereq.length}`);
			for (let i = 0; i < research.prereq.length; ++i) {
				if (!Object.prototype.hasOwnProperty.call(research.prereq[i], 'code')) {
					logger.error(
						`prereq.code missing for Research ${i} ${research.name} ${research._id}`
					);
				}
				else if (
					research.prereq[i].code == undefined ||
            research.prereq[i].code === '' ||
            research.prereq[i].code === null
				) {
					logger.error(
						`Research prereq code ${i} has length of zero ${research.name} ${research._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(research.prereq[i], 'type')) {
					logger.error(
						`prereq.type missing for Research ${i} ${research.name} ${research._id}`
					);
				}
				else if (
					research.prereq[i].type == undefined ||
            research.prereq[i].type === '' ||
            research.prereq[i].type === null
				) {
					logger.error(
						`Research prereq type ${i} has length of zero ${research.name} ${research._id}`
					);
				}
			}
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'unlocks')) {
			logger.error(
				`Research unlocks is missing  ${research.name} ${research._id}`
			);
		}
		else {
			// researchCheckDebugger(`Research ${research.name} ${research._id} Check of Unlocks ${research.unlocks.length}`);
			for (let i = 0; i < research.unlocks.length; ++i) {
				if (!Object.prototype.hasOwnProperty.call(research.unlocks[i], 'code')) {
					logger.error(
						`unlocks.code missing for Research ${i} ${research.name} ${research._id}`
					);
				}
				else if (
					research.unlocks[i].code == undefined ||
            research.unlocks[i].code === '' ||
            research.unlocks[i].code === null
				) {
					logger.error(
						`Research unlocks code ${i} has length of zero ${research.name} ${research._id}`
					);
				}

				if (!Object.prototype.hasOwnProperty.call(research.unlocks[i], 'type')) {
					logger.error(
						`unlocks.type missing for Research ${i} ${research.name} ${research._id}`
					);
				}
				else if (
					research.unlocks[i].type == undefined ||
            research.unlocks[i].type === '' ||
            research.unlocks[i].type === null
				) {
					logger.error(
						`Research unlocks type ${i} has length of zero ${research.name} ${research._id}`
					);
				}
			}
		}

		if (!Object.prototype.hasOwnProperty.call(research, 'breakthrough')) {
			logger.error(
				`Research breakthrough is missing  ${research.name} ${research._id}`
			);
		}
		else {
			// researchCheckDebugger(`Research ${research.name} ${research._id} Check of Unlocks ${research.breakthrough.length}`);
			for (let i = 0; i < research.breakthrough.length; ++i) {
				if (!Object.prototype.hasOwnProperty.call(research.breakthrough[i], 'code')) {
					logger.error(
						`breakthrough.code missing for Research ${i} ${research.name} ${research._id}`
					);
				}
				else if (
					(research.breakthrough[i].code =
              undefined ||
              research.breakthrough[i].code === '' ||
              research.breakthrough[i].code === null)
				) {
					logger.error(
						`Research breakthrough code ${i} has length of zero ${research.name} ${research._id}`
					);
				}
				if (!Object.prototype.hasOwnProperty.call(research.breakthrough[i], 'type')) {
					logger.error(
						`breakthrough.type missing for Research ${i} ${research.name} ${research._id}`
					);
				}
				else if (
					research.breakthrough[i].type == undefined ||
            research.breakthrough[i].type === '' ||
            research.breakthrough[i].type === null
				) {
					logger.error(
						`Research breakthrough type ${i} has length of zero ${research.name} ${research._id}`
					);
				}
			}
		}

		// validate call
		try {
			const valMessage = await axios.get(`${gameServer}init/initResearch/validate/${research._id}`);
			if (!valMessage.data.type) {
				logger.error(`Validation Error: ${valMessage.data}`);
			}
		}
		catch (err) {
			logger.error(
				`Research Validation Error For ${research.code} ${research.name} Error: ${err.message}`
			);
		}

	}
	runFlag = true;
	return runFlag;
}

module.exports = chkResearch;
