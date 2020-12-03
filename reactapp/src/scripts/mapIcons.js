//import fighter from '../img/Aircraft_generic.png'
//import ufo from '../img/UFO_generic.png'

const icon = {
	FFG: 'https://cdn.discordapp.com/attachments/481529413482315777/774161302259892234/UFO_generic.png',
	Unknown: 'https://cdn.discordapp.com/attachments/481529413482315777/774161297972527104/unknown_generic.png',
	PoI: 'https://cdn.discordapp.com/attachments/483851642605928449/775640807738310666/interest_site2.png',
	City: 'https://cdn.discordapp.com/attachments/483851642605928449/774234464548945940/City_site.png',
	Crash: 'https://cdn.discordapp.com/attachments/483851642605928449/775640725400453120/crash_site2.png',
	USA: 'https://cdn.discordapp.com/attachments/582043597281427466/776279382368845824/USA_fighter.png',
	TUK: 'https://cdn.discordapp.com/attachments/582043597281427466/776290186580590612/UK_Fighter_v2.png',
	RSA: 'https://cdn.discordapp.com/attachments/582043597281427466/776290198027108352/SA_Fighter_v2.png',
	RFD: 'https://cdn.discordapp.com/attachments/582043597281427466/776290979430793236/RFD_Fighter_v2.png',
	JPN: 'https://cdn.discordapp.com/attachments/582043597281427466/776291390191173662/JPN_Fighter_v2.png',
	IRN: 'https://cdn.discordapp.com/attachments/582043597281427466/776291771986083860/IRN_Fighter_v2.png',
	IND: 'https://cdn.discordapp.com/attachments/582043597281427466/776292200673574952/IND_Fighter_v2.png',
	TFR: 'https://cdn.discordapp.com/attachments/582043597281427466/776292711031373854/TFR_Fighter_v2.png',
	EPT: 'https://cdn.discordapp.com/attachments/582043597281427466/776293590045425685/EPT_Fighter_v2.png',
	PRC: 'https://cdn.discordapp.com/attachments/582043597281427466/776294071831625728/PRC_Fighter_v2.png',
	BRZ: 'https://cdn.discordapp.com/attachments/582043597281427466/776294407031881738/BRZ_Fighter_v2.png',
	AUS: 'https://cdn.discordapp.com/attachments/582043597281427466/776294756921638912/AUS_Fighter_v2.png'
}

const milIcons = {
	USA: 'https://cdn.discordapp.com/attachments/582043597281427466/783187461974523924/UDS_tank_v5.1.png',
	TUK: 'https://cdn.discordapp.com/attachments/582043597281427466/783187554844672041/TUK_tank_v5.1.png',
	RSA: 'https://cdn.discordapp.com/attachments/582043597281427466/783187599136129044/RSA_tank_v5.1.png',
	RFD: 'https://cdn.discordapp.com/attachments/582043597281427466/783188099160735754/RFD_tank_v5.1.png',
	JPN: 'https://cdn.discordapp.com/attachments/582043597281427466/783182479829893130/tank_v5.1.png',
	IRN: 'https://cdn.discordapp.com/attachments/582043597281427466/783188119208853535/IRN_tank_v5.1.png',
	IND: 'https://cdn.discordapp.com/attachments/582043597281427466/783188453860311060/IND_tank_v5.1.png',
	TFR: 'https://cdn.discordapp.com/attachments/582043597281427466/783188488517451796/TFR_tank_v5.1.png',
	EPT: 'https://cdn.discordapp.com/attachments/582043597281427466/783188695594696724/EPT_tank_v5.1.png',
	PRC: 'https://cdn.discordapp.com/attachments/582043597281427466/783188841338634291/PRC_tank_v5.1.png',
	BRZ: 'https://cdn.discordapp.com/attachments/582043597281427466/783188867632201728/BRZ_tank_v5.1.png',
	AUS: 'https://cdn.discordapp.com/attachments/582043597281427466/783189080258248735/AUS_tank_v5.1.png'
}

export const getMapIcon = (site) => {
	// console.log(site)
	if (site.status.occupied === true) return 'https://cdn.discordapp.com/attachments/582043597281427466/783202988109856809/City_site_occupied.png';
	let type = site.subType;
	if (type === 'Point of Interest') type = 'PoI';
	if (!icon[type] || icon[type] === null) return ('https://cdn.discordapp.com/attachments/582043597281427466/776284440279515136/Unknown_Fighter_v2.png'); //the default '?' interceptor
	else return icon[type];
}

export const getAircraftIcon = (aircraft) => {
	return icon[aircraft]
}

export const getMilitaryIcon = (unit) => {
	// console.log(unit);
	if (unit.type === 'Corps' || unit.type == 'Fleet') {
		if (!milIcons[unit.team.code] || milIcons[unit.team.code] === null) return ('https://cdn.discordapp.com/attachments/582043597281427466/783190980333273128/UNKOWN_tank_v5.1.png'); //the default '?' tank
		else return milIcons[unit.team.code];		
	}
}