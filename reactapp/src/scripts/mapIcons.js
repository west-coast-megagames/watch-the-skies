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

const getMapIcon = (type) => {
	if (type === 'Point of Interest') type = 'PoI';


	if (!icon[type] || icon[type] === null) return ('https://cdn.discordapp.com/attachments/582043597281427466/776284440279515136/Unknown_Fighter_v2.png'); //the default '?' interceptor
	else return icon[type];
}

export default getMapIcon;