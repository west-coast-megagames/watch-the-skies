//import fighter from '../img/Aircraft_generic.png'
//import ufo from '../img/UFO_generic.png'

const icon = {
	National: 'https://cdn.discordapp.com/attachments/481529413482315777/774161300020264960/Aircraft_generic.png',
	Alien: 'https://cdn.discordapp.com/attachments/481529413482315777/774161302259892234/UFO_generic.png',
	Unknown: 'https://cdn.discordapp.com/attachments/481529413482315777/774161297972527104/unknown_generic.png',
}

const getMapIcon = (type) => {
	return icon[type];
}

export default getMapIcon;