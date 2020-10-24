const request = require('supertest');
const { Country } = require('../../models/country');
const mongoose = require('mongoose');

let server;

describe('/countrys/', () => {
	beforeEach(() => { server = require('../../server'); });
	afterEach(async () => {
		await Country.deleteOne({ code: 'C1' });
		await Country.deleteOne({ code: 'C2' });
		await Country.deleteOne({ code: 'C3' });
		await Country.deleteOne({ code: 'C4' });
		await Country.deleteOne({ code: 'C5' });
		await Country.deleteOne({ code: 'C6' });
		await Country.deleteOne({ code: 'C7' });
		await Country.deleteOne({ code: 'C8' });
		await Country.deleteOne({ code: 'C9' });
		await Country.deleteOne({ code: 'T1' });
		await Country.deleteOne({ code: 'T2' });
		await Country.deleteOne({ code: 'T3' });
		server.close();
	});

	describe('Get /', () => {
		it('should return all countrys', async () => {
			await Country.collection.insertMany([
				{ code: 'C1',
					name: 'Country Test 1' },
				{ code: 'C2',
					name: 'Country Test 2' }
			]);
			const res = await request(server).get('/api/country');
			expect(res.status).toBe(200);
			expect(res.body.length).toBeGreaterThanOrEqual(2);
			expect(res.body.some(c => c.code === 'C1')).toBeTruthy();
			expect(res.body.some(c => c.code === 'C2')).toBeTruthy();
			expect(res.body.some(c => c.code === 'US')).toBeTruthy();
		});
	});

	describe('Get /:id', () => {
		it('should return a country if valid id is passed', async () => {
			const country = new Country(
				{ code: 'C3',
					name: 'Country Test 3'
				});
			await country.save();

			const res = await request(server).get('/api/country/id/' + country._id);
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('name', country.name);
		});


		it('should return 404 if invalid id is passed', async () => {
			// pass in invalid id ... don't need to create a record
			testId = new mongoose.Types.ObjectId();
			const res = await request(server).get('/api/country/id/' + testId);
			expect(res.status).toBe(404);
		});
	});

	describe('Get /:code', () => {
		it('should return a country if valid code is passed', async () => {
			const country = new Country(
				{ code: 'C4',
					name: 'Country Test 4'
				});
			await country.save();

			const res = await request(server).get('/api/country/code/' + country.code);
			expect(res.status).toBe(200);
			// returns array of 1 object
			const returnedCode = res.body[0].code;
			const returnedName = res.body[0].name;
			expect(returnedCode).toMatch(/C4/);
			expect(returnedName).toMatch(/Country Test 4/);
		});

		it('should return 404 if invalid code is passed', async () => {
			// pass in invalid code ... don't need to create a record
			const res = await request(server).get('/api/country/code/01');
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {

		// sample of re-usable function from MOSH course
		let newName;
		let newCode;
		let newUnrest;
		let newZoneCode;
		let newTeamCode;
		const exec = async () => {
			return await request(server)
				.post('api/country/')
				.send({ code: newCode, name: newName, unrest: newUnrest, zoneCode: newZoneCode, teamCode: newTeamCode });
		};

		beforeEach(() => {
			newCode = 'C5';
			newName = 'Post Country Test 1';
			newUnrest = 7;
			newZoneCode = 'NA';
			newTeamCode = 'USA';
		});

		it('should return 400 if country code is less than 2 characters', async () => {
			const res = await request(server).post('/api/country').send({ code: 'C', name: 'Test Country Val 1', zoneCode: 'NA' });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);
		});

		it('should return 400 if country code is greater than 2 characters', async () => {
			const res = await request(server).post('/api/country').send({ code: 'C12', name: 'Test Country Val 2', zoneCode: 'NA' });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);
		});


		it('should return 400 if country name is less than 3 characters', async () => {
			const res = await request(server).post('/api/country').send({ code: 'C6', name: '12', zoneCode: 'NA' });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);
		});

		it('should return 400 if country name is more than 75 characters', async () => {

			// generate a string from array number of elements minus 1 ... so 76 chars > 75 in joi validation
			const testName = new Array(77).join('a');
			const res = await request(server).post('/api/country').send({ code: 'C6', name: testName, zoneCode: 'NA' });
			expect(res.status).toBe(400);
		});

		it('should return 400 if unrest is less than 0', async () => {
			const res = await request(server).post('/api/country').send({ code: 'C6', name: 'Test Country Val 1', unrest: -1 });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/must be larger than/);
		});

		it('should return 400 if country unrest is greater than 250', async () => {
			const res = await request(server).post('/api/country').send({ code: 'C12', name: 'Test Country Val 2', unrest: 500 });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/must be less than/);
		});

		it('should return 400 if code is already used (in database)', async () => {

			const res = await request(server).post('/api/country').send({ code: 'US', name: 'Test Country Unique', unrest: 5 });

			expect(res.status).toBe(400);
		});

		it('should save the country if it is valid', async () => {

			const res = await request(server).post('/api/country')
				.send({ code: 'C7', name: 'Test Country Post', unrest: 7, zoneCode: 'NA', teamCode: 'USA' });

			const country = await Country.find({ code: 'C7' });

			expect(country).not.toBeNull();
			expect(res.status).toBe(200);
			// don't care what _id is ... just that we got one
			expect(res.body).toHaveProperty('_id');
			// testing for specific name
			expect(res.body).toHaveProperty('name', 'Test Country Post');
		});

	});

	describe('PUT /:id', () => {

		it('should return 400 if name is less than 3 characters', async () => {
			// create a country
			const res0 = await request(server).post('/api/country').send({ code: 'C8', name: 'Test Country PUT 1', teamCode: 'PRC' });

			const country = await Country.findOne({ code: 'C8' });

			id = country._id;

			newName = 'T1';

			const res = await request(server).put('/api/country/' + id).send({ code: country.code, name: newName, teamCode: country.loadTeamCode });

			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);

		});

		it('should return 400 if name is more than 75 characters', async () => {
			// create a country
			// generate a string from array number of elements minus 1 ... so 77 chars > 75 in joi validation
			const res0 = await request(server).post('/api/country/').send({ code: 'C9', name: 'Test Country PUT 2', teamCode: 'USA' });

			const country = await Country.findOne({ code: 'C9' });

			id = country._id;
			newName = new Array(77).join('a');

			const res = await request(server).put('/api/country/' + id).send({ code: 'C9', name: newName, teamCode: country.loadTeamCode });

			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);
		});

		it('should return 404 if id is invalid', async () => {
			// create a country
			country = new Country({ name: 'Test Country Put 3',
				code: 'T1',
				loadTeamCode: 'TUK'
			});
			await country.save();

			const id = 1;
			newName = country.name;

			const res = await request(server).put('/api/country/' + id).send({ name: newName, teamCode: country.loadTeamCode });

			expect(res.status).toBe(404);
			expect(res.text).toMatch(/Invalid ID/);
		});

		it('should return 404 if country with the given id was not found', async () => {
			id = mongoose.Types.ObjectId();
			newName = 'Country Put Test 4';

			const res = await request(server).put('/api/country/' + id).send({ name: newName,
				code: 'T1',
				loadTeamCode: 'TUK'
			});

			expect(res.status).toBe(404);
			expect(res.text).toMatch(/was not found/);
		});

		it('should update the country if input is valid', async () => {

			// create a country
			country = new Country({ name: 'Country Put Test 5',
				code: 'T1',
				unrest: 13,
				zoneCode: 'EU',
				loadTeamCode: 'TUK'
			});
			await country.save();

			newName = 'UpdPutZone5';

			const res = await request(server).put('/api/country/' + country._id)
				.send({ name: newName,
					code: country.code,
					teamCode: country.loadTeamCode
				});

			const updatedZone = await Country.findById(country._id);

			expect(updatedZone.name).toBe(newName);
		});


		it('should return the updated country if it is valid', async () => {

			// create a country
			country = new Country({ name: 'Country Put Test 6',
				code: 'T2',
				unrest: 13,
				zoneCode: 'EU',
				loadTeamCode: 'TUK'
			});
			await country.save();

			newName = 'UpdPutZone6';

			const res = await request(server).put('/api/country/' + country._id).send({ name: newName,
				code: country.code,
				teamCode: country.loadTeamCode
			});

			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name', newName);
		});
	});

	describe('DELETE /:id', () => {
		let country;
		let id;

		const exec = async () => {
			return await request(server)
				.delete('/api/country/' + id)
				.send();
		};

		beforeEach(async () => {
			// Before each test we need to create a country and
			// put it in the database.
			country = new Country({ name: 'Delzone1',
				code: 'T3'
			});
			await country.save();

			id = country._id;
		});

		it('should return 404 if id is invalid', async () => {
			id = 1;

			const res = await exec();

			expect(res.status).toBe(404);
			expect(res.text).toMatch(/Invalid ID/);
		});

		it('should return 404 if no country with the given id was found', async () => {
			id = mongoose.Types.ObjectId();

			const res = await exec();

			expect(res.status).toBe(404);
			expect(res.text).toMatch(/was not found/);
		});

		it('should delete the country if input is valid', async () => {
			await exec();

			const zoneInDb = await Country.findById(id);

			expect(zoneInDb).toBeNull();
		});

		it('should return the removed country', async () => {
			const res = await exec();

			expect(res.body).toHaveProperty('_id', country._id.toHexString());
			expect(res.body).toHaveProperty('name', country.name);
		});

	});

	describe('Patch /Country/DeleteAll', () => {

		it('should be no countrys if successful', async () => {

			const res = await request(server).patch('/api/country/deleteAll');

			expect(res.status).toBe(200);

			const countryAny = await Country.find();
			expect(countryAny.length).toEqual(0);
		});
	});

});