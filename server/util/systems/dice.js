// Random die rolls - Exports d4, d6, d8, d10, d12, and d20.

function d4 () {
	const num = 1 + Math.floor(Math.random() * 4);
	return num;
}

function d6 () {
	const num = 1 + Math.floor(Math.random() * 6);
	return num;
}

function d8 () {
	const num = 1 + Math.floor(Math.random() * 8);
	return num;
}

function d10 () {
	const num = 1 + Math.floor(Math.random() * 10);
	return num;
}

function d12 () {
	const num = 1 + Math.floor(Math.random() * 12);
	return num;
}

function d20 () {
	const num = 1 + Math.floor(Math.random() * 20);
	return num;
}

function rand (number) {
	const num = 1 + Math.floor(Math.random() * number);
	return num;
}

module.exports = { d4, d6, d8, d10, d12, d20, rand };