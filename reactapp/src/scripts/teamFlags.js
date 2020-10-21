const flags = {
	USA: "https://cdn.countryflags.com/thumbs/united-states-of-america/flag-round-250.png",
	RFD: "https://cdn.countryflags.com/thumbs/russia/flag-round-250.png",
	PRC: "https://cdn.countryflags.com/thumbs/china/flag-round-250.png",
	TUK: "https://cdn.countryflags.com/thumbs/united-kingdom/flag-round-250.png",
	TFR: "https://cdn.countryflags.com/thumbs/france/flag-round-250.png",
	JPN: 'https://cdn.countryflags.com/thumbs/japan/flag-round-250.png',
	IRN: 'https://cdn.countryflags.com/thumbs/iran/flag-round-250.png',
	IND: 'https://cdn.countryflags.com/thumbs/india/flag-round-250.png',
	EPT: 'https://cdn.countryflags.com/thumbs/egypt/flag-round-250.png',
	BRZ: 'https://cdn.countryflags.com/thumbs/brazil/flag-round-250.png',
	AUS: 'https://cdn.countryflags.com/thumbs/australia/flag-round-250.png',
	RSA: 'https://cdn.countryflags.com/thumbs/south-africa/flag-round-250.png'
}

const getFlag = (code) => {
	return flags[code];
}

module.exports = getFlag;