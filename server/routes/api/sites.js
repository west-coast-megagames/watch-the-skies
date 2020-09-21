const routeDebugger = require('debug')('app:routes - sites');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../../middleware/validateObjectId');

const { logger } = require('../../middleware/winston');

const {
	Site,
	validateSite,
	BaseSite,
	validateBase,
	CitySite,
	validateCity,
	CrashSite,
	validateCrash,
	Spacecraft,
	validateSpacecraft
} = require('../../models/sites/site');
const { Country } = require('../../models/country');
const { Zone } = require('../../models/zone');
const { Team } = require('../../models/team/team');
const { Facility } = require('../../models/gov/facility/facility');
const { convertToDms } = require('../../util/systems/geo');

const {
	validUnitType
} = require('../../wts/util/construction/validateUnitType');
const {
	delFacilities
} = require('../../wts/util/construction/deleteFacilities');
const { delSystems } = require('../../wts/util/construction/deleteSystems');
const { genSiteCode } = require('../../wts/util/construction/genSiteCode');

// @route   GET api/sites
// @Desc    Get all sites
// @access  Public
router.get('/', async function (req, res) {
	routeDebugger('Looking up all sites...');
	const sites = await Site.find()
		.populate('country', 'name')
		.populate('team', 'shortName name')
		.populate('facilities', 'name type')
		.populate('zone', 'model name code')
		.sort({ name: -1 });

	res.status(200).json(sites);
});

// @route   GET api/sites/id
// @Desc    Get sites by id
// @access  Public
router.get('/id/:id', validateObjectId, async (req, res) => {
	const id = req.params.id;
	const site = await Site.findById(id)
		.populate('country', 'name')
		.populate('team', 'shortName name')
		.populate('facilities', 'name type')
		.populate('zone', 'model name code')
		.sort({ team: 1 });
	if (site != null) {
		res.json(site);
	} else {
		res.status(404).send(`The Site with the ID ${id} was not found!`);
	}
});

// @route   GET api/sites/base
// @Desc    Get all baseSites
// @access  Public
router.get('/base/', async function (req, res) {
	routeDebugger('Looking up all base sites...');
	const sites = await Site.find({ type: 'Base' })
		.populate('country', 'name')
		.populate('team', 'shortName name')
		.populate('facilities', 'name type')
		.populate('zone', 'model name code')
		.sort({ team: 1 });

	res.status(200).json(sites);
});

// @route   GET api/sites/spacecraft/
// @Desc    Get all spacecraft Sites
// @access  Public
router.get('/spacecraft/', async function (req, res) {
	routeDebugger('Looking up all spacecraft sites...');
	const sites = await Site.find({ type: 'Spacecraft' })
		.populate('country', 'name')
		.populate('team', 'shortName name')
		.populate('facilities', 'name type')
		.populate('zone', 'model name code')
		.sort({ team: 1 });

	res.status(200).json(sites);
});

// @route   GET api/sites/city/
// @Desc    Get all city Sites
// @access  Public
router.get('/city/', async function (req, res) {
	routeDebugger('Looking up all city sites...');
	const sites = await Site.find({ type: 'City' })
		.populate('country', 'name')
		.populate('team', 'shortName name')
		.populate('facilities', 'name type')
		.populate('zone', 'model name code')
		.sort({ team: 1 });

	res.status(200).json(sites);
});

// @route   GET api/sites/crash/
// @Desc    Get all crash Sites
// @access  Public
router.get('/crash/', async function (req, res) {
	routeDebugger('Looking up all crash sites...');
	const sites = await Site.find({ type: 'Crash' })
		.populate('country', 'name')
		.populate('team', 'shortName name')
		.populate('facilities', 'name type')
		.populate('zone', 'model name code')
		.populate('salvage', 'category name')
		.sort({ team: 1 });

	res.status(200).json(sites);
});

// @route   POST api/sites/spacecraft/
// @Desc    Post a new spacecraft
// @access  Public
router.post('/spacecraft/', async function (req, res) {
	if (facilitys.length < 1) {
		await loadFacilitys();
	}

	let {
		name,
		siteCode,
		shipType,
		team,
		country,
		status,
		teamCode,
		countryCode,
		hidden
	} = req.body;

	// check if unique ... if not gen one that will be
	const genCode = await genSiteCode(siteCode, 'Spacecraft');

	siteCode = genCode;

	const newLatDMS = convertToDms(req.body.latDecimal, false);
	const newLongDMS = convertToDms(req.body.longDecimal, true);
	const newSpacecraft = new Spacecraft({
		name,
		siteCode,
		shipType,
		team,
		country,
		status,
		geoDMS: { latDMS: newLatDMS, longDMS: newLongDMS },
		geoDecimal: {
			latDecimal: req.body.latDecimal,
			longDecimal: req.body.longDecimal
		}
	});

	const docs = await Spacecraft.find({ siteCode });
	if (!docs.length) {
		if (teamCode != '') {
			const team = await Team.findOne({ teamCode });
			if (!team) {
				// routeDebugger("Spacecraft Post Team Error, New Spacecraft:", name, " Team: ", teamCode);
				logger.error(
					`Spacecraft Post Team Error, New Spacecraft: ${name} Team Code ${teamCode}`
				);
				return res
					.status(404)
					.send(
						`Spacecraft Post Team Error, New Spacecraft: ${name} Team Code ${teamCode}`
					);
			} else {
				newSpacecraft.team = team._id;
				// routeDebugger("Spacecraft Post Team Found, Spacecraft:", name, " Team: ", teamCode, "Team ID:", team._id);
			}
		}

		const { error } = validateSpacecraft(newSpacecraft);
		if (error) {
			// routeDebugger("New Spacecraft Validate Error", siteCode, error.message);
			logger.error(
				`New Spacecraft Validate Error ${siteCode} ${error.message}`
			);
			return res
				.status(404)
				.send(`New Spacecraft Validate Error ${siteCode} ${error.message}`);
		}

		newSpacecraft.shipType = shipType;
		newSpacecraft.status = status;
		newSpacecraft.hidden = hidden;

		if (countryCode != '') {
			const country = await Country.findOne({ code: countryCode });
			if (!country) {
				// routeDebugger("Spacecraft Post Country Error, New Spacecraft:", name, " Country: ", countryCode);
				logger.error(
					`New Spacecraft Country Code Error ${siteCode} ${countryCode}`
				);
				return res
					.status(404)
					.send(`New Spacecraft Country Code Error ${siteCode} ${countryCode}`);
			} else {
				newSpacecraft.country = country._id;
				newSpacecraft.zone = country.zone;
				// routeDebugger("Spacecraft Post Country Found, New Spacecraft:", name, " Country: ", countryCode, "Country ID:", country._id);
			}
		} else {
			const country = await Country.findById({ country });
			if (!country) {
				// routeDebugger("Spacecraft Post Country Error, New Spacecraft:", name, " Country: ", country);
				logger.error(`New Spacecraft Country ID Error ${siteCode} ${country}`);
			} else {
				newSpacecraft.country = country._id;
				newSpacecraft.zone = country.zone;
				// routeDebugger("Spacecraft Post Country Found, New Spacecraft:", name, " Country: ", country.code, "Country ID:", country._id);
			}
		}

		newSpacecraft.facilities = [];
		// create facility records for spacecraft
		for (const fac of req.body.facilities) {
			let facError = true;
			let facId = null;
			const facRef =
        facilitys[
        	facilitys.findIndex((facility) => facility.code === fac.code)
        ];
			if (facRef) {
				if (validUnitType(facRef.unitType, 'Spacecraft')) {
					facError = false;
					const facType = facRef.type;
					// switch not working ... using if else
					if (facType == 'Factory') {
						newFacility = await new Factory(facRef);
						facId = newFacility._id;
					} else if (facType == 'Lab') {
						newFacility = await new Lab(facRef);
						facId = newFacility._id;
						newFacility.sciRate = facRef.sciRate;
						newFacility.bonus = facRef.bonus;
						newFacility.funding = facRef.funding;
					} else if (facType == 'Hanger') {
						newFacility = await new Hanger(facRef);
						facId = newFacility._id;
					} else if (facType == 'Crisis') {
						newFacility = await new Crisis(facRef);
						facId = newFacility._id;
					} else if (facType == 'Civilian') {
						newFacility = await new Civilian(facRef);
						facId = newFacility._id;
					} else {
						logger.error(
							'Invalid Facility Type In spacecraft Post:',
							facRef.type
						);
						facError = true;
					}
				} else {
					logger.debug(
						`Error in creation of facility ${fac} for  ${NewSpacraft.name} - wrong unitType`
					);
					facError = true;
				}
			} else {
				logger.debug(
					`Error in creation of facility ${fac} for  ${newSpacecraft.name}`
				);
				facError = true;
			}

			if (!facError) {
				newFacility.site = newSpacecraft._id;
				newFacility.team = newSpacecraft.team;
				newFacility.name = fac.name;

				await newFacility.save((err, newFacility) => {
					if (err) {
						logger.error(`New Spacecraft Facility Save Error: ${err}`);
						facError = true;
					}
					// routeDebugger(newSpacecraft.name, "Facility", fac.name, " add saved to facility collection.");
				});

				if (!facError) {
					newSpacecraft.facilities.push(facId);
				}
			}
		}

		await newSpacecraft.save((err, newSpacecraft) => {
			if (err) {
				logger.error(`New Spacecraft Save Error ${siteCode} ${err}`);
				delFacilities(spacecraft.facilities);
				return res
					.status(404)
					.send(`New Spacecraft Save Error ${siteCode} ${err}`);
			}
			routeDebugger(
				newSpacecraft.name + ' add saved to Spacecraft collection.'
			);

			res.status(200).json(newSpacecraft);
		});
	} else {
		logger.info(`Spacecraft already exists: ${siteCode}`);
		res.status(400).send(`Spacecraft ${siteCode} already exists!`);
	}
});

// @route   POST api/sites/base/
// @Desc    Post a new base
// @access  Public
router.post('/base/', async function (req, res) {
	if (facilitys.length < 1) {
		await loadFacilitys();
	}

	let {
		name,
		siteCode,
		team,
		country,
		teamCode,
		countryCode,
		hidden
	} = req.body;

	// check if unique ... if not gen one that will be
	const genCode = await genSiteCode(siteCode, 'Base');

	siteCode = genCode;

	const newLatDMS = convertToDms(req.body.latDecimal, false);
	const newLongDMS = convertToDms(req.body.longDecimal, true);
	const newBaseSite = new BaseSite({
		name,
		siteCode,
		team,
		country,
		geoDMS: { latDMS: newLatDMS, longDMS: newLongDMS },
		geoDecimal: {
			latDecimal: req.body.latDecimal,
			longDecimal: req.body.longDecimal
		}
	});

	const docs = await BaseSite.find({ siteCode });
	if (!docs.length) {
		if (teamCode != '') {
			const team = await Team.findOne({ teamCode });
			if (!team) {
				// routeDebugger("Base Post Team Error, New Base:", name, " Team: ", teamCode);
				logger.error(
					`Base Post Team Error, New Base: ${name} Team Code ${teamCode}`
				);
				return res
					.status(404)
					.send(
						`Base Post Team Error, New Base: ${name} Team Code ${teamCode}`
					);
			} else {
				newBaseSite.team = team._id;
				// routeDebugger("Base Post Team Found, Base:", name, " Team: ", teamCode, "Team ID:", team._id);
			}
		}

		const { error } = validateBase(newBaseSite);
		if (error) {
			// routeDebugger("New Base Validate Error", siteCode, error.message);
			logger.error(`New Base Validate Error ${siteCode} ${error.message}`);
			return res
				.status(404)
				.send(`New Base Validate Error ${siteCode} ${error.message}`);
		}

		newBaseSite.defenses = req.body.defenses;
		newBaseSite.public = req.body.public;
		newBaseSite.hidden = hidden;

		if (countryCode != '') {
			const country = await Country.findOne({ code: countryCode });
			if (!country) {
				// routeDebugger("Base Post Country Error, New Base:", name, " Country: ", countryCode);
				logger.error(`New Base Country Code Error ${siteCode} ${countryCode}`);
				return res
					.status(404)
					.send(`New Base Country Code Error ${siteCode} ${countryCode}`);
			} else {
				newBaseSite.country = country._id;
				newBaseSite.zone = country.zone;
				// routeDebugger("Base Post Country Found, New Base:", name, " Country: ", countryCode, "Country ID:", country._id);
			}
		} else {
			const country = await Country.findById({ country });
			if (!country) {
				// routeDebugger("Base Post Country Error, New Base:", name, " Country: ", country);
				logger.error(`New Base Country ID Error ${siteCode} ${country}`);
				return res
					.status(404)
					.send(`New Base Country ID Error ${siteCode} ${country}`);
			} else {
				newBaseSite.country = country._id;
				newBaseSite.zone = country.zone;
				// routeDebugger("Base Post Country Found, New Base:", name, " Country: ", country.code, "Country ID:", country._id);
			}
		}

		// create facility records for Base
		newBaseSite.facilities = [];
		for (const fac of req.body.facilities) {
			let facError = true;
			let facId = null;
			const facRef =
        facilitys[
        	facilitys.findIndex((facility) => facility.code === fac.code)
        ];

			if (facRef) {
				if (validUnitType(facRef.unitType, 'Base')) {
					const facType = facRef.type;
					facError = false;
					// switch not working ... using if else
					if (facType == 'Factory') {
						newFacility = await new Factory(facRef);
						facId = newFacility._id;
					} else if (facType == 'Lab') {
						newFacility = await new Lab(facRef);
						facId = newFacility._id;
						newFacility.sciRate = facRef.sciRate;
						newFacility.bonus = facRef.bonus;
						newFacility.funding = facRef.funding;
					} else if (facType == 'Hanger') {
						newFacility = await new Hanger(facRef);
						facId = newFacility._id;
					} else if (facType == 'Crisis') {
						newFacility = await new Crisis(facRef);
						facId = newFacility._id;
					} else if (facType == 'Civilian') {
						newFacility = await new Civilian(facRef);
						facId = newFacility._id;
					} else {
						logger.error(`Invalid Facility Type In Base Post: ${facRef.type}`);
						facError = true;
					}
				} else {
					logger.debug(
						`Error in creation of facility ${fac} for  ${baseSite.name} - wrong unitType`
					);
					facError = true;
				}
			} else {
				logger.debug(
					`Error in creation of facility ${fac} for ${newBaseSite.name}`
				);
				facError = true;
			}

			if (!facError) {
				newFacility.site = newBaseSite._id;
				newFacility.team = newBaseSite.team;
				newFacility.name = fac.name;

				await newFacility.save((err, newFacility) => {
					if (err) {
						logger.error(`New Base Facility Save Error: ${err}`);
						facError = true;
					}
					// routeDebugger(newBaseSite.name, "Facility", fac.name, " add saved to facility collection.");
				});

				if (!facError) {
					newBaseSite.facilities.push(facId);
				} else {
					logger.error(`New Base Facility Save Error ${siteCode} ${err}`);
				}
			}
		}

		await newBaseSite.save((err, newBaseSite) => {
			if (err) {
				delFacilities(newBaseSite.facilities);
				logger.error(`New Base Save Error ${siteCode} ${err}`);

				return res.status(404).send(`New Base Save Error ${siteCode} ${err}`);
			}
			routeDebugger(`${newBaseSite.name} add saved to Base collection.`);

			res.status(200).json(newBaseSite);
		});
	} else {
		logger.info(`Base already exists: ${siteCode}`);
		return res.status(400).send(`Base ${siteCode} already exists!`);
	}
});

// @route   POST api/sites/city/
// @Desc    Post a new city
// @access  Public
router.post('/city/', async function (req, res) {
	let {
		name,
		siteCode,
		team,
		country,
		teamCode,
		countryCode,
		hidden,
		dateline
	} = req.body;

	if (facilitys.length < 1) {
		await loadFacilitys();
	}

	// check if unique ... if not gen one that will be
	const genCode = await genSiteCode(siteCode, 'City');

	siteCode = genCode;

	const newLatDMS = convertToDms(req.body.latDecimal, false);
	const newLongDMS = convertToDms(req.body.longDecimal, true);
	const newCitySite = new CitySite({
		name,
		siteCode,
		team,
		country,
		dateline,
		geoDMS: { latDMS: newLatDMS, longDMS: newLongDMS },
		geoDecimal: {
			latDecimal: req.body.latDecimal,
			longDecimal: req.body.longDecimal
		}
	});

	const docs = await CitySite.find({ siteCode });
	if (!docs.length) {
		if (teamCode != '') {
			const team = await Team.findOne({ teamCode });
			if (!team) {
				// routeDebugger("City Post Team Error, New City:", name, " Team: ", teamCode);
				logger.error(
					`City Post Team Error, New City: ${name} Team Code ${teamCode}`
				);
			} else {
				newCitySite.team = team._id;
				// routeDebugger("City Post Team Found, City:", name, " Team: ", teamCode, "Team ID:", team._id);
			}
		}

		const { error } = validateCity(newCitySite);
		if (error) {
			// routeDebugger("New City Validate Error", siteCode, error.message);
			logger.error(`New City Validate Error ${siteCode} ${error.message}`);
			return res
				.status(404)
				.send(`New City Validate Error ${siteCode} ${error.message}`);
		}

		newCitySite.hidden = hidden;

		if (countryCode != '') {
			const country = await Country.findOne({ code: countryCode });
			if (!country) {
				// routeDebugger("City Post Country Error, New City:", name, " Country: ", countryCode);
				logger.error(`New City Country Code Error ${siteCode} ${countryCode}`);
			} else {
				newCitySite.country = country._id;
				newCitySite.zone = country.zone;
				// routeDebugger("City Post Country Found, New City:", name, " Country: ", countryCode, "Country ID:", country._id);
			}
		} else {
			const country = await Country.findById({ country });
			if (!country) {
				// routeDebugger("City Post Country Error, New City:", name, " Country: ", country);
				logger.error(`New City Country ID Error ${siteCode} ${country}`);
			} else {
				newCitySite.country = country._id;
				newCitySite.zone = country.zone;
				// routeDebugger("City Post Country Found, New City:", name, " Country: ", country.code, "Country ID:", country._id);
			}
		}

		// create facility records for City
		newCitySite.facilities = [];
		for (const fac of req.body.facilities) {
			let facError = true;
			let facId = null;
			const facRef =
        facilitys[
        	facilitys.findIndex((facility) => facility.code === fac.code)
        ];
			if (facRef) {
				if (validUnitType(facRef.unitType, 'City')) {
					const facType = facRef.type;
					facError = false;
					// switch not working ... using if else
					if (facType == 'Factory') {
						newFacility = await new Factory(facRef);
						facId = newFacility._id;
					} else if (facType == 'Lab') {
						newFacility = await new Lab(facRef);
						facId = newFacility._id;
						newFacility.sciRate = facRef.sciRate;
						newFacility.bonus = facRef.bonus;
						newFacility.funding = facRef.funding;
					} else if (facType == 'Hanger') {
						newFacility = await new Hanger(facRef);
						facId = newFacility._id;
					} else if (facType == 'Crisis') {
						newFacility = await new Crisis(facRef);
						facId = newFacility._id;
					} else if (facType == 'Civilian') {
						newFacility = await new Civilian(facRef);
						facId = newFacility._id;
					} else {
						logger.error(`Invalid Facility Type In City Post: ${facRef.type}`);
						facError = true;
					}
				} else {
					logger.error(
						`Error in creation of facility ${fac} for  ${newCitySite.name} - wrong unitType`
					);
					facError = true;
				}
			} else {
				logger.error(
					`Error in creation of facility ${fac} for  ${newCitySite.name}`
				);
				facError = true;
			}

			if (!facError) {
				newFacility.site = newCitySite._id;
				newFacility.team = newCitySite.team;
				newFacility.name = fac.name;

				await newFacility.save((err, newFacility) => {
					if (err) {
						logger.error(`New City Facility Save Error: ${err}`);
						facError = true;
					}
					// routeDebugger(newCitySite.name, "Facility", fac.name, " add saved to facility collection.");
				});

				if (!facError) {
					newCitySite.facilities.push(facId);
				}
			}
		}

		await newCitySite.save((err, newCitySite) => {
			if (err) {
				delFacilities(newCitySite.facilities);
				logger.error(`New City Save Error ${siteCode} ${err}`);
				return res.status(404).send(`New City Save Error ${siteCode} ${err}`);
			}
			routeDebugger(newCitySite.name + ' add saved to City collection.');

			res.status(200).json(newCitySite);
		});
	} else {
		logger.info(`City already exists: ${siteCode}`);
		res.status(400).send(`City ${siteCode} already exists!`);
	}
});

// @route   POST api/sites/crash/
// @Desc    Post a new crash
// @access  Public
/*
router.post("/crash/", async function (req, res) {
  let {
    name,
    siteCode,
    team,
    country,
    teamCode,
    countryCode,
    hidden,
    status,
  } = req.body;

  if (systems.length < 1) {
    await loadSystems(); // load wts/json/upgrade/systems.json data into array SCOTT: This may become upgrade/systems
  }
  if (facilitys.length < 1) {
    await loadFacilitys();
  }

  // check if unique ... if not gen one that will be
  let genCode = await genSiteCode(siteCode, "Crash");

  siteCode = genCode;

  let newLatDMS = convertToDms(req.body.latDecimal, false);
  let newLongDMS = convertToDms(req.body.longDecimal, true);
  const newCrashSite = new CrashSite({
    name,
    siteCode,
    team,
    country,
    status,
    geoDMS: { latDMS: newLatDMS, longDMS: newLongDMS },
    geoDecimal: {
      latDecimal: req.body.latDecimal,
      longDecimal: req.body.longDecimal,
    },
  });

  let docs = await CrashSite.find({ siteCode });
  if (!docs.length) {
    if (teamCode != "") {
      let team = await Team.findOne({ teamCode });
      if (!team) {
        //routeDebugger("Crash Post Team Error, New Crash Site:", name, " Team: ", teamCode);
        logger.error(
          `Crash Post Team Error, New Crash Site: ${name} Team Code ${teamCode}`
        );
        return res
          .status(404)
          .send(
            `Crash Post Team Error, New Crash Site: ${name} Team Code ${teamCode}`
          );
      } else {
        newCrashSite.team = team._id;
        //routeDebugger("Crash Post Team Found, City:", name, " Team: ", teamCode, "Team ID:", team._id);
      }
    }

    let { error } = validateCity(newCrashSite);
    if (error) {
      //routeDebugger("New Crash Site Validate Error", siteCode, error.message);
      logger.error(
        `New Crash Site Validate Error ${siteCode} ${error.message}`
      );
      return res
        .status(404)
        .send(`New Crash Site Validate Error ${siteCode} ${error.message}`);
    }

    newCrashSite.hidden = hidden;

    if (countryCode != "") {
      let country = await Country.findOne({ code: countryCode });
      if (!country) {
        //routeDebugger("Crash Post Country Error, New Crash Site:", name, " Country: ", countryCode);
        logger.error(
          `New Crash Site Country Code Error ${siteCode} ${countryCode}`
        );
        return res
          .status(404)
          .send(`New Crash Site Country Code Error ${siteCode} ${countryCode}`);
      } else {
        newCrashSite.country = country._id;
        newCrashSite.zone = country.zone;
        //routeDebugger("Crash Post Country Found, New Crash Site:", name, " Country: ", countryCode, "Country ID:", country._id);
      }
    } else {
      let country = await Country.findById({ country });
      if (!country) {
        //routeDebugger("Crash Post Country Error, New Crash Site:", name, " Country: ", country);
        logger.error(`New Crash Site Country ID Error ${siteCode} ${country}`);
        return res
          .status(404)
          .send(`New Crash Site Country ID Error ${siteCode} ${country}`);
      } else {
        newCrashSite.country = country._id;
        newCrashSite.zone = country.zone;
        //routeDebugger("Crash Post Country Found, New Crash Site:", name, " Country: ", country.code, "Country ID:", country._id);
      }
    }

    newCrashSite.facilities = [];
    // create facility records for Crash Site
    for (let fac of req.body.facilities) {
      let facError = true;
      let facId = null;
      let facRef =
        facilitys[
          facilitys.findIndex((facility) => facility.code === fac.code)
        ];

      if (facRef) {
        if (validUnitType(facRef.unitType, "Crash")) {
          let facType = facRef.type;
          facError = false;
          //switch not working ... using if else
          if (facType == "Factory") {
            newFacility = await new Factory(facRef);
            facId = newFacility._id;
          } else if (facType == "Lab") {
            newFacility = await new Lab(facRef);
            facId = newFacility._id;
            newFacility.sciRate = facRef.sciRate;
            newFacility.bonus = facRef.bonus;
            newFacility.funding = facRef.funding;
          } else if (facType == "Hanger") {
            newFacility = await new Hanger(facRef);
            facId = newFacility._id;
          } else if (facType == "Crisis") {
            newFacility = await new Crisis(facRef);
            facId = newFacility._id;
          } else if (facType == "Civilian") {
            newFacility = await new Civilian(facRef);
            facId = newFacility._id;
          } else {
            logger.error(
              `Invalid Facility Type In Crash Site Post: ${facRef.type}`
            );
            facError = true;
          }
        } else {
          logger.debug(
            `Error in creation of facility ${fac} for  ${newCrashSite.name} - wrong unitType`
          );
          facError = true;
        }
      } else {
        logger.debug(
          `Error in creation of facility ${fac} for  ${newCrashSite.name}`
        );
        facError = true;
      }

      if (!facError) {
        newFacility.site = newCrashSite._id;
        newFacility.team = newCrashSite.team;
        newFacility.name = fac.name;

        await newFacility.save((err, newFacility) => {
          if (err) {
            logger.error(`New Crash Site Facility Save Error: ${err}`);
            facError = true;
          }
          //routeDebugger(newCrashSite.name, "Facility", fac.name, " add saved to facility collection.");
        });

        if (!facError) {
          newCrashSite.facilities.push(facId);
        }
      }
    }

    newCrashSite.salvage = [];
    for (let sys of req.body.salvage) {
      let systemsError = true;

      let sysRef = systems[systems.findIndex((system) => system.code === sys)];
      //console.log("jeff in crash site systems ", sys, "sysRef:", sysRef);
      if (sysRef) {
        ///* do not care about unitType check for crash site
        //if (validUnitType(sysRef.unitType, "Any")) {
        
        systemsError = false;
        newSystem = await new System(sysRef);
        newSystem.team = newCrashSite.team;
        newSystem.manufacturer = newCrashSite.team;
        newSystem.status.building = false;
        newSystem.unitType = "CrashSite";
        //console.log("jeff in newCrashSite before systems save ... sysRef:", sysRef);
        await newSystem.save((err, newSystem) => {
          if (err) {
            logger.error(`New Crash Site System Save Error: ${err}`);
            systemsError = true;
          }
          //logger.debug(`newCrashSite.name, system ${sys} add saved to system collection.`);
        });

        if (!systemsError) {
          newCrashSite.salvage.push(newSystem._id);
        }
      } else {
        logger.debug(
          `Error in creation of system ${sys} for  ${newCrashSite.name}`
        );
      }
    }

    await newCrashSite.save((err, newCrashSite) => {
      if (err) {
        logger.error(`New Crash Site Save Error ${siteCode} ${err}`);
        delFacilities(newCrashSite.facilities);
        delSystems(newCrashSite.salvage);
        return res
          .status(404)
          .send(`New Crash Site Save Error ${siteCode} ${err}`);
      }
      //routeDebugger(newCrashSite.name + " add saved to City collection.");

      res.status(200).json(newCrashSite);
    });
  } else {
    logger.info(`Crash Site already exists: ${siteCode}`);
    res.status(400).send(`City ${siteCode} already exists!`);
  }
});
*/
module.exports = router;
