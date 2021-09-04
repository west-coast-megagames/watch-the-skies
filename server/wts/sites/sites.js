const { Site, GroundSite } = require('../../models/site');
const randomCords = require('../../util/systems/lz');
const geo = require('../../util/systems/geo');

let count = 0; // How many sites have happened in the game.

async function generateSite (site) {
	const currentSite = await Site.findById({ _id: site }).populate('organization');

	const newDecimal = randomCords(currentSite.geoDecimal.latDecimal, currentSite.geoDecimal.longDecimal);

	const newNewDecimal = {
		latDecimal: newDecimal.lat,
		longDecimal: newDecimal.lng
	};

	const newDMS = {
		latDMS: geo.convertToDms(newDecimal.lat, false),
		longDMS: geo.convertToDms(newDecimal.lng, true)
	};

	const c0de = await genSiteCode();

	let newSite = {
		name: `${currentSite.organization.code} Site - ${c0de}`,
		team: currentSite.team,
		subType: 'Point of Interest',
		organization: currentSite.organization,
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

async function genSiteCode() {
	const phoneticArray = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'Xray', 'Yankee', 'Zulu'];
	const desArray = ['Yellow', 'Red', 'Blue', 'Green', 'Cyan', 'Magenta', 'Ruby', 'Sapphire', 'Emerald', 'Violet', 'Purple', 'Brown', 'Almond', 'Gold', 'Silver', 'Platnum'];

	let chkDoc = 1;
	let code = '';
	do {
		code = `${desArray[(Math.floor(Math.random() * desArray.length))]} - ${phoneticArray[(Math.floor(Math.random() * phoneticArray.length))]}`;
		chkDoc = await Site.find({ code: code });
	}
	while (chkDoc.length > 0);

	return code;
}


module.exports = { generateSite, genSiteCode };