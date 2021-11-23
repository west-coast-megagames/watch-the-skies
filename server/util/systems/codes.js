const { rand } = require('./dice');

const IRDS = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 'GOLF', 'HOTEL', 'INDIA', 'JULIET', 'KILO', 'LIMA', 'MIKE', 'NOVEMBER', 'OSCAR', 'PAPA', 'QUEBEC', 'ROMEO', 'SIARRA', 'TANGO', 'UNIFORM', 'VICTOR', 'WHISKEY', 'XRAY', 'YANKEE', 'ZULU'];
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456-';

function randCode(length) {
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

module.exports = { randCode };