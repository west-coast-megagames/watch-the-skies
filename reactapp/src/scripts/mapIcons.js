//import fighter from '../img/Aircraft_generic.png'
//import ufo from '../img/UFO_generic.png'

const icon = {
	National: 'https://cdn.discordapp.com/attachments/481529413482315777/774161300020264960/Aircraft_generic.png',
	Alien: 'https://cdn.discordapp.com/attachments/481529413482315777/774161302259892234/UFO_generic.png',
	Unknown: 'https://cdn.discordapp.com/attachments/481529413482315777/774161297972527104/unknown_generic.png',
	PoI: 'https://cdn.discordapp.com/attachments/483851642605928449/775640807738310666/interest_site2.png',
	City: 'https://cdn.discordapp.com/attachments/483851642605928449/774234464548945940/City_site.png',
	Crash: 'https://cdn.discordapp.com/attachments/483851642605928449/775640725400453120/crash_site2.png'
}

const getMapIcon = (type) => {
	if (type === 'Point of Interest') type = 'PoI';
	return icon[type];
}

export default getMapIcon;