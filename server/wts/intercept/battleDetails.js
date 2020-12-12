const { rand } = require('../../util/systems/dice');

const IRDS = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL', 'INDIA', 'JULIET', 'KILO', 'LIMA', 'MIKE', 'NOVEMBER', 'OSCAR', 'PAPA', 'QUEBEC', 'ROMEO', 'SIARRA', 'TANGO', 'UNIFORM', 'VICTOR', 'WHISKEY', 'XRAY', 'YANKEE', 'ZULU'];
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456-';

function missedOpponent (unit) {
	const intro = [
		'No confirmed hits',
		'Target evaded',
		`${unit.name} was out maneuvered`,
		'Target dodged all shots',
		'The opponents evade level, it is over nine-thousand'
	];
	const outro = [
		'!',
		'.',
		', attempting to lock on.',
		', attempting to reengage target!',
		', continuing persuit of target.',
		', playtime is over!'
	];

	let string = intro[rand(intro.length) - 1];
	string = string + outro[rand(outro.length) - 1];
	return string;
}

function hitOpponent (unit) {
	const intro = [
		'Hit confirmed',
		'Target damage confirmed',
		`${unit.name} has confirmed a hit`,
		'We got em',
		'The opponents evade level, it is over nine-thousand'
	];
	const outro = [
		'!',
		'.',
		', he won\'t get away now.',
		', attempting to confirm the kill!',
		', continuing persuit of target.',
		', this is the way.'
	];

	let string = intro[rand(intro.length) - 1];
	string = string + outro[rand(outro.length) - 1];
	return string;
}

function hitDesc (unit) {
	const intro = [
		`${unit.name} has been hit`,
		'Damage sustained in engagement',
		'I\'ve been hit',
		'Assesing damage from hit'
	];
	const outro = [
		'!',
		'.',
		', attempting to evade enemy fire.',
		', I can\'t shake them.',
		', dank farrik!'
	];

	let string = intro[rand(intro.length) - 1];
	string = string + outro[rand(outro.length) - 1];
	return string;
}

function dodgeDesc (unit) {
	const intro = [
		'Evading enemy fire',
		'Activating countermeasures',
		`${unit.name} has evaded incoming weapons fire`,
		'They can\'t touch this'
	];
	const outro = [
		'!',
		'.',
		', enemy failed to confirm a hit.',
		', attempting to return fire!',
		', continuing persuit of target.',
		', this is the way.'
	];

	let string = intro[rand(intro.length) - 1];
	string = string + outro[rand(outro.length) - 1];
	return string;
}

// Attempting an interception
function engageDesc (unit, team) {
	const intro = [
		`${unit.name} has intercepted target craft.`,
		`${unit.name} reports target sighted`,
		`${unit.name} locked on to target.`,
		`${unit.name} confirms target.`
	];
	const outro = [
		'',
		'Interception underway.',
		`${team.name} command has given the order to engage.`,
		`${unit.name} is pressing the attack.`
	];
	let desc = intro[rand(intro.length) - 1];
	desc = desc + outro[rand(outro.length) - 1];

	return desc;
}

// Escorting an aircraft
function escortDesc (unit, target) {
	const intro = [
		`${unit.name} has assumed an escort formation with ${target.name}.`,
		`${unit.name} reports condition green, target formation established.`,
		`${unit.name} in formation with ${target.name}, en route to ${unit.country.name} airspace.`,
		`${unit.name} establshed ecort pattern ${IRDS[rand(IRDS.length) - 1]}-${rand(100)}.`
	];
	let desc = intro[rand(intro.length - 1)];
	const outro = [
		`${desc}`,
		`${desc} ${target.name} has entered ${unit.country.name} airspace and been engaged, intercepting incoming aircraft.`,
		`${desc} ${unit.name} broke away from ${target.name} to engage incoming aircraft.`
	];
	desc = outro[rand(outro.length) - 1];

	return desc;
}

// Engaging an escorted aircraft
function escortEngageDesc (unit) {
	const intro = [
		'Target seems to have an escort.',
		'Visual on target, target is in a formation.',
		'Clear run to the target, prepearing to engage.'
	];
	let desc = intro[rand(intro.length) - 1];
	const outro = [
		`${desc} Engaging hostiles.`,
		`${desc} Escort is breaking off to engage.`,
		`${desc} Aborting ${unit.mission}, target escort has engaged.`
	];
	desc = outro[rand(outro.length) - 1];

	return desc;
}

function randCode (length) {
	let code = '';
	let newChar = '';
	for (let i = 0; i < length; i++) {
		if (i == 2) code += '-';
		if (newChar === '-' || code === '' || i == length - 1) {
			newChar = characters.charAt(rand(characters.length - 1) - 1);
		}
		else {
			newChar = characters.charAt(rand(characters.length) - 1);
		}
		code += newChar;
	}

	return code;
}

module.exports = { engageDesc, escortDesc, escortEngageDesc, hitDesc, hitOpponent, missedOpponent, dodgeDesc, randCode };