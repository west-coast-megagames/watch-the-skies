const request = require('supertest');
const { Organization } = require('../../models/organization');
const mongoose = require('mongoose');

let server;

describe('/organizations/', () => {
	beforeEach(() => { server = require('../../server'); });
	afterEach(async () => {
		await Organization.deleteOne({ code: 'C1' });
		await Organization.deleteOne({ code: 'C2' });
		await Organization.deleteOne({ code: 'C3' });
		await Organization.deleteOne({ code: 'C4' });
		await Organization.deleteOne({ code: 'C5' });
		await Organization.deleteOne({ code: 'C6' });
		await Organization.deleteOne({ code: 'C7' });
		await Organization.deleteOne({ code: 'C8' });
		await Organization.deleteOne({ code: 'C9' });
		await Organization.deleteOne({ code: 'T1' });
		await Organization.deleteOne({ code: 'T2' });
		await Organization.deleteOne({ code: 'T3' });
		server.close();
	});

	describe('Get /', () => {
		it('should return all organizations', async () => {
			await Organization.collection.insertMany([
				{ code: 'C1',
					name: 'Organization Test 1' },
				{ code: 'C2',
					name: 'Organization Test 2' }
			]);
			const res = await request(server).get('/api/organization');
			expect(res.status).toBe(200);
			expect(res.body.length).toBeGreaterThanOrEqual(2);
			expect(res.body.some(c => c.code === 'C1')).toBeTruthy();
			expect(res.body.some(c => c.code === 'C2')).toBeTruthy();
			expect(res.body.some(c => c.code === 'US')).toBeTruthy();
		});
	});

	describe('Get /:id', () => {
		it('should return a organization if valid id is passed', async () => {
			const organization = new Organization(
				{ code: 'C3',
					name: 'Organization Test 3'
				});
			await organization.save();

			const res = await request(server).get('/api/organization/id/' + organization._id);
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('name', organization.name);
		});


		it('should return 404 if invalid id is passed', async () => {
			// pass in invalid id ... don't need to create a record
			testId = new mongoose.Types.ObjectId();
			const res = await request(server).get('/api/organization/id/' + testId);
			expect(res.status).toBe(404);
		});
	});

	describe('Get /:code', () => {
		it('should return a organization if valid code is passed', async () => {
			const organization = new Organization(
				{ code: 'C4',
					name: 'Organization Test 4'
				});
			await organization.save();

			const res = await request(server).get('/api/organization/code/' + organization.code);
			expect(res.status).toBe(200);
			// returns array of 1 object
			const returnedCode = res.body[0].code;
			const returnedName = res.body[0].name;
			expect(returnedCode).toMatch(/C4/);
			expect(returnedName).toMatch(/Organization Test 4/);
		});

		it('should return 404 if invalid code is passed', async () => {
			// pass in invalid code ... don't need to create a record
			const res = await request(server).get('/api/organization/code/01');
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
				.post('api/organization/')
				.send({ code: newCode, name: newName, unrest: newUnrest, zoneCode: newZoneCode, teamCode: newTeamCode });
		};

		beforeEach(() => {
			newCode = 'C5';
			newName = 'Post Organization Test 1';
			newUnrest = 7;
			newZoneCode = 'NA';
			newTeamCode = 'USA';
		});

		it('should return 400 if organization code is less than 2 characters', async () => {
			const res = await request(server).post('/api/organization').send({ code: 'C', name: 'Test Organization Val 1', zoneCode: 'NA' });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);
		});

		it('should return 400 if organization code is greater than 2 characters', async () => {
			const res = await request(server).post('/api/organization').send({ code: 'C12', name: 'Test Organization Val 2', zoneCode: 'NA' });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);
		});


		it('should return 400 if organization name is less than 3 characters', async () => {
			const res = await request(server).post('/api/organization').send({ code: 'C6', name: '12', zoneCode: 'NA' });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);
		});

		it('should return 400 if organization name is more than 75 characters', async () => {

			// generate a string from array number of elements minus 1 ... so 76 chars > 75 in joi validation
			const testName = new Array(77).join('a');
			const res = await request(server).post('/api/organization').send({ code: 'C6', name: testName, zoneCode: 'NA' });
			expect(res.status).toBe(400);
		});

		it('should return 400 if unrest is less than 0', async () => {
			const res = await request(server).post('/api/organization').send({ code: 'C6', name: 'Test Organization Val 1', unrest: -1 });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/must be larger than/);
		});

		it('should return 400 if organization unrest is greater than 250', async () => {
			const res = await request(server).post('/api/organization').send({ code: 'C12', name: 'Test Organization Val 2', unrest: 500 });
			expect(res.status).toBe(400);
			expect(res.text).toMatch(/must be less than/);
		});

		it('should return 400 if code is already used (in database)', async () => {

			const res = await request(server).post('/api/organization').send({ code: 'US', name: 'Test Organization Unique', unrest: 5 });

			expect(res.status).toBe(400);
		});

		it('should save the organization if it is valid', async () => {

			const res = await request(server).post('/api/organization')
				.send({ code: 'C7', name: 'Test Organization Post', unrest: 7, zoneCode: 'NA', teamCode: 'USA' });

			const organization = await Organization.find({ code: 'C7' });

			expect(organization).not.toBeNull();
			expect(res.status).toBe(200);
			// don't care what _id is ... just that we got one
			expect(res.body).toHaveProperty('_id');
			// testing for specific name
			expect(res.body).toHaveProperty('name', 'Test Organization Post');
		});

	});

	describe('PUT /:id', () => {

		it('should return 400 if name is less than 3 characters', async () => {
			// create a organization
			const res0 = await request(server).post('/api/organization').send({ code: 'C8', name: 'Test Organization PUT 1', teamCode: 'PRC' });

			const organization = await Organization.findOne({ code: 'C8' });

			id = organization._id;

			newName = 'T1';

			const res = await request(server).put('/api/organization/' + id).send({ code: organization.code, name: newName, teamCode: organization.loadTeamCode });

			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);

		});

		it('should return 400 if name is more than 75 characters', async () => {
			// create a organization
			// generate a string from array number of elements minus 1 ... so 77 chars > 75 in joi validation
			const res0 = await request(server).post('/api/organization/').send({ code: 'C9', name: 'Test Organization PUT 2', teamCode: 'USA' });

			const organization = await Organization.findOne({ code: 'C9' });

			id = organization._id;
			newName = new Array(77).join('a');

			const res = await request(server).put('/api/organization/' + id).send({ code: 'C9', name: newName, teamCode: organization.loadTeamCode });

			expect(res.status).toBe(400);
			expect(res.text).toMatch(/length must be/);
		});

		it('should return 404 if id is invalid', async () => {
			// create a organization
			organization = new Organization({ name: 'Test Organization Put 3',
				code: 'T1',
				loadTeamCode: 'TUK'
			});
			await organization.save();

			const id = 1;
			newName = organization.name;

			const res = await request(server).put('/api/organization/' + id).send({ name: newName, teamCode: organization.loadTeamCode });

			expect(res.status).toBe(404);
			expect(res.text).toMatch(/Invalid ID/);
		});

		it('should return 404 if organization with the given id was not found', async () => {
			id = mongoose.Types.ObjectId();
			newName = 'Organization Put Test 4';

			const res = await request(server).put('/api/organization/' + id).send({ name: newName,
				code: 'T1',
				loadTeamCode: 'TUK'
			});

			expect(res.status).toBe(404);
			expect(res.text).toMatch(/was not found/);
		});

		it('should update the organization if input is valid', async () => {

			// create a organization
			organization = new Organization({ name: 'Organization Put Test 5',
				code: 'T1',
				unrest: 13,
				zoneCode: 'EU',
				loadTeamCode: 'TUK'
			});
			await organization.save();

			newName = 'UpdPutZone5';

			const res = await request(server).put('/api/organization/' + organization._id)
				.send({ name: newName,
					code: organization.code,
					teamCode: organization.loadTeamCode
				});

			const updatedZone = await Organization.findById(organization._id);

			expect(updatedZone.name).toBe(newName);
		});


		it('should return the updated organization if it is valid', async () => {

			// create a organization
			organization = new Organization({ name: 'Organization Put Test 6',
				code: 'T2',
				unrest: 13,
				zoneCode: 'EU',
				loadTeamCode: 'TUK'
			});
			await organization.save();

			newName = 'UpdPutZone6';

			const res = await request(server).put('/api/organization/' + organization._id).send({ name: newName,
				code: organization.code,
				teamCode: organization.loadTeamCode
			});

			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name', newName);
		});
	});

	describe('DELETE /:id', () => {
		let organization;
		let id;

		const exec = async () => {
			return await request(server)
				.delete('/api/organization/' + id)
				.send();
		};

		beforeEach(async () => {
			// Before each test we need to create a organization and
			// put it in the database.
			organization = new Organization({ name: 'Delzone1',
				code: 'T3'
			});
			await organization.save();

			id = organization._id;
		});

		it('should return 404 if id is invalid', async () => {
			id = 1;

			const res = await exec();

			expect(res.status).toBe(404);
			expect(res.text).toMatch(/Invalid ID/);
		});

		it('should return 404 if no organization with the given id was found', async () => {
			id = mongoose.Types.ObjectId();

			const res = await exec();

			expect(res.status).toBe(404);
			expect(res.text).toMatch(/was not found/);
		});

		it('should delete the organization if input is valid', async () => {
			await exec();

			const zoneInDb = await Organization.findById(id);

			expect(zoneInDb).toBeNull();
		});

		it('should return the removed organization', async () => {
			const res = await exec();

			expect(res.body).toHaveProperty('_id', organization._id.toHexString());
			expect(res.body).toHaveProperty('name', organization.name);
		});

	});

	describe('Patch /Organization/DeleteAll', () => {

		it('should be no organizations if successful', async () => {

			const res = await request(server).patch('/api/organization/deleteAll');

			expect(res.status).toBe(200);

			const organizationAny = await Organization.find();
			expect(organizationAny.length).toEqual(0);
		});
	});

});