const dice = require('./dice');

const randomCords = (lat, lng) => {
	let coinToss = dice.rand(2);
	const randLat = coinToss == 2 ? lat + (dice.rand(200) * 0.002) : lat - (dice.rand(200) * 0.002);
	coinToss = dice.rand(2);
	const randLng = coinToss == 2 ? lng + (dice.rand(200) * 0.002) : lng - (dice.rand(200) * 0.002);

	return { lat: randLat, lng: randLng };
};

module.exports = randomCords;