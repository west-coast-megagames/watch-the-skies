const { Site, GroundSite } = require('../../models/site');
const randomCords = require('../../util/systems/lz');
const geo = require('../../util/systems/geo');
const { genSiteCode } = require('../util/construction/genSiteCode');


let count = 0; // How many sites have happened in the game.

async function generateSite (site) {
	const currentSite = await Site.findById({ _id: site }).populate('country');

	const newDecimal = randomCords(currentSite.geoDecimal.latDecimal, currentSite.geoDecimal.longDecimal);

	const newNewDecimal = {
		latDecimal: newDecimal.lat,
		longDecimal: newDecimal.lng
	};

	const newDMS = {
		latDMS: geo.convertToDms(newDecimal.lat, false),
		longDMS: geo.convertToDms(newDecimal.lng, true)
	};

	const c0de = await genSiteCode('', site.type);

	let newSite = {
		name: `${currentSite.country.name} Site - ${currentSite.country.code}0${count}`,
		team: currentSite.team,
		subType: 'Point of Interest',
		country: currentSite.country,
		zone: currentSite.zone,
		code: c0de,
		geoDMS: newDMS,
		geoDecimal: newNewDecimal,
		status: {
			public: false,
			secret: true
		}
	};
	newSite = new GroundSite(newSite);
	newSite = await newSite.save();
	count++;
	console.log(newSite);
}

module.exports = { generateSite };