const dice = require('./dice');

const randomCords = (lat, lng) => {
	let coinToss = dice.rand(2);
	const randLat = coinToss == 2 ? lat + (dice.rand(400) * 0.008) : lat - (dice.rand(400) * 0.008);
	coinToss = dice.rand(2);
	const randLng = coinToss == 2 ? lng + (dice.rand(400) * 0.008) : lng - (dice.rand(200) * 0.008);

	return { lat: randLat, lng: randLng };
};

module.exports = randomCords;