// Random die rolls - Exports d4, d6, d8, d10, d12, and d20.

function d4 () {
	return (1 + Math.floor(Math.random() * 4));
}

function d6 () {
	return (1 + Math.floor(Math.random() * 6));
}

function d8 () {
	return (1 + Math.floor(Math.random() * 8));
}

function d10 () {
	return (1 + Math.floor(Math.random() * 10));
}

function d12 () {
	return 1 + Math.floor(Math.random() * 12);
}

function d20 () {
	return 1 + Math.floor(Math.random() * 20);
}

function rand (num) {
	return 1 + Math.floor(Math.random() * num);
}

module.exports = { d4, d6, d8, d10, d12, d20, rand };