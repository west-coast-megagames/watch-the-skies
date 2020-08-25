const request = require("supertest");
const { Zone } = require("../../models/zone");
const mongoose = require("mongoose");

let server;

describe("/zones/", () => {
  beforeEach(() => {
    server = require("../../server");
  });
  afterEach(async () => {
    await Zone.deleteOne({ code: "Z1" });
    await Zone.deleteOne({ code: "Z2" });
    await Zone.deleteOne({ code: "Z3" });
    await Zone.deleteOne({ code: "Z4" });
    await Zone.deleteOne({ code: "Z5" });
    await Zone.deleteOne({ code: "Z6" });
    await Zone.deleteOne({ code: "Z7" });
    await Zone.deleteOne({ code: "Z8" });
    await Zone.deleteOne({ code: "Z9" });
    await Zone.deleteOne({ code: "ZA" });
    await Zone.deleteOne({ code: "ZB" });
    await Zone.deleteOne({ code: "ZC" });
    await Zone.deleteOne({ code: "ZD" });
    await Zone.deleteOne({ code: "ZE" });
    await Zone.deleteOne({ code: "ZF" });
    await Zone.deleteOne({ code: "ZG" });
    server.close();
  });

  describe("Get /", () => {
    it("should return all zones", async () => {
      await Zone.collection.insertMany([
        { code: "Z1", name: "Zone Test 1", terror: 5 },
        { code: "Z2", name: "Zone Test 2", terror: 5 },
      ]);
      const res = await request(server).get("/api/zones");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body.some((z) => z.code === "Z1")).toBeTruthy();
      expect(res.body.some((z) => z.code === "Z2")).toBeTruthy();
      expect(res.body.some((z) => z.code === "NA")).toBeTruthy();
    });
  });

  describe("Get /:id", () => {
    it("should return a zone if valid id is passed", async () => {
      const zone = new Zone({ code: "Z3", name: "Zone Test 3", terror: 5 });
      await zone.save();

      const res = await request(server).get("/api/zones/id/" + zone._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", zone.name);
    });

    it("should return 404 if invalid id is passed", async () => {
      // pass in invalid id ... don't need to create a record
      testId = new mongoose.Types.ObjectId();
      const res = await request(server).get("/api/zones/id/" + testId);
      expect(res.status).toBe(404);
    });
  });

  describe("Get /:code", () => {
    it("should return a zone if valid code is passed", async () => {
      const zone = new Zone({ code: "Z4", name: "Zone Test 4", terror: 5 });
      await zone.save();

      const res = await request(server).get("/api/zones/code/" + zone.code);
      expect(res.status).toBe(200);
      //returns array of 1 object
      const returnedZoneCode = res.body[0].code;
      const returnedname = res.body[0].name;
      const returnedTerror = res.body[0].terror;
      expect(returnedZoneCode).toMatch(/Z4/);
      expect(returnedname).toMatch(/Zone Test 4/);
      expect(returnedTerror).toEqual(5);
    });

    it("should return 404 if invalid code is passed", async () => {
      // pass in invalid code ... don't need to create a record
      const res = await request(server).get("/api/zones/code/01");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    // sample of re-usable function from MOSH course
    let token;
    let newname;
    let newZoneCode;
    let newTerror;
    const exec = async () => {
      return await request(server)
        .post("api/zones/")
        .send({ code: newZoneCode, name: newname, terror: newTerror });
    };

    beforeEach(() => {
      newZoneCode = "Z5";
      newname = "Post Zone Test 1";
      newTerror = 5;
    });

    it("should return 400 if zone code is less than 2 characters", async () => {
      const res = await request(server)
        .post("/api/zones")
        .send({ code: "Z", name: "Test Zone Val 1", terror: 5 });
      expect(res.status).toBe(400);
    });

    it("should return 400 if zone code is greater than 2 characters", async () => {
      const res = await request(server)
        .post("/api/zones")
        .send({ code: "Z12", name: "Test Zone Val 2", terror: 5 });
      expect(res.status).toBe(400);
    });

    it("should return 400 if zone name is less than 3 characters", async () => {
      const res = await request(server)
        .post("/api/zones")
        .send({ code: "Z6", name: "12", terror: 5 });
      expect(res.status).toBe(400);
    });

    it("should return 400 if zone name is more than 50 characters", async () => {
      // generate a string from array number of elements minus 1 ... so 51 chars > 50 in joi validation
      const testname = new Array(52).join("a");
      const res = await request(server)
        .post("/api/zones")
        .send({ code: "Z6", name: testname, terror: 5 });
      expect(res.status).toBe(400);
    });

    it("should return 400 if zone terror is less than 0", async () => {
      const res = await request(server)
        .post("/api/zones")
        .send({ code: "Z6", name: "Test Zone Terror Post", terror: -1 });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/must be larger than/);
    });

    it("should return 400 if zone terror is greater than 250", async () => {
      const res = await request(server)
        .post("/api/zones")
        .send({ code: "Z6", name: "Test Zone Terror Post", terror: 300 });
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/must be less than/);
    });

    it("should return 400 if code is already used (in database)", async () => {
      const res = await request(server)
        .post("/api/zones")
        .send({ code: "NA", name: "Test Zone Unique", terror: 5 });

      expect(res.status).toBe(400);
    });

    it("should save the zone if it is valid", async () => {
      const res = await request(server)
        .post("/api/zones")
        .send({ code: "Z7", name: "Test Zone Post", terror: 5 });

      const zone = await Zone.find({ code: "Z7" });

      expect(zone).not.toBeNull();
      expect(res.status).toBe(200);
      //don't care what _id is ... just that we got one
      expect(res.body).toHaveProperty("_id");
      //testing for specific name
      expect(res.body).toHaveProperty("name", "Test Zone Post");
    });
  });

  describe("PUT /:id", () => {
    it("should return 400 if name is less than 3 characters", async () => {
      //create a zone
      const res0 = await request(server)
        .post("/api/zones")
        .send({ code: "Z8", name: "Test Zone PUT 1", terror: 5 });

      const zone = await Zone.findOne({ code: "Z8" });

      id = zone._id;

      newname = "T1";

      const res = await request(server)
        .put("/api/zones/" + id)
        .send({ code: zone.code, name: newname, terror: zone.terror });

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it("should return 400 if name is more than 50 characters", async () => {
      //create a zone
      const res0 = await request(server)
        .post("/api/zones/")
        .send({ code: "Z9", name: "Test Zone PUT 2", terror: 5 });

      const zone = await Zone.findOne({ code: "Z9" });

      id = zone._id;
      // generate a string from array number of elements minus 1 ... so 51 chars > 50 in joi validation
      newname = new Array(52).join("a");

      const res = await request(server)
        .put("/api/zones/" + id)
        .send({ code: "Z9", name: newname, terror: 5 });

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/length must be/);
    });

    it("should return 400 if zone terror is less than 0", async () => {
      // create a zone
      const res0 = await request(server)
        .post("/api/zones")
        .send({ code: "ZD", name: "Test Zone Terror", terror: 5 });

      const zone = await Zone.findOne({ code: "ZD" });

      id = zone._id;
      newTerror = -1;

      const res = await request(server)
        .put("/api/zones/" + id)
        .send({ code: "ZD", name: zone.name, terror: newTerror });

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/must be larger than/);
    });

    it("should return 400 if zone terror is greater than 250", async () => {
      // create a zone
      const res0 = await request(server)
        .post("/api/zones")
        .send({ code: "ZE", name: "Test Zone Terror 2", terror: 5 });

      const zone = await Zone.findOne({ code: "ZE" });

      id = zone._id;
      newTerror = 500;

      const res = await request(server)
        .put("/api/zones/" + id)
        .send({ code: "ZE", name: zone.name, terror: newTerror });

      expect(res.status).toBe(400);
      expect(res.text).toMatch(/must be less than/);
    });

    it("should return 404 if id is invalid", async () => {
      //create a zone
      zone = new Zone({ name: "Test Zone Put 3", code: "ZA" });
      await zone.save();

      let id = 1;
      newname = zone.name;

      const res = await request(server)
        .put("/api/zones/" + id)
        .send({ name: newname });

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/Invalid ID/);
    });

    it("should return 404 if zone with the given id was not found", async () => {
      id = mongoose.Types.ObjectId();
      newname = "Zone Put Test 4";

      const res = await request(server)
        .put("/api/zones/" + id)
        .send({ name: newname, code: "ZA" });

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/was not found/);
    });

    it("should update the zone if input is valid", async () => {
      //create a zone
      zone = new Zone({ name: "Zone Put Test 5", code: "ZA" });
      await zone.save();

      newname = "UpdPutZone5";

      const res = await request(server)
        .put("/api/zones/" + zone._id)
        .send({ name: newname, code: zone.code });

      const updatedZone = await Zone.findById(zone._id);

      expect(updatedZone.name).toBe(newname);
    });

    it("should return the updated zone if it is valid", async () => {
      //create a zone
      zone = new Zone({ name: "Zone Put Test 6", code: "ZB" });
      await zone.save();

      newname = "UpdPutZone6";

      const res = await request(server)
        .put("/api/zones/" + zone._id)
        .send({ name: newname, code: zone.code });

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", newname);
    });
  });

  describe("DELETE /:id", () => {
    let zone;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/zones/" + id)
        .send();
    };

    beforeEach(async () => {
      // Before each test we need to create a zone and
      // put it in the database.
      zone = new Zone({ name: "Delzone1", code: "ZC" });
      await zone.save();

      id = zone._id;
    });

    it("should return 404 if id is invalid", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/Invalid ID/);
    });

    it("should return 404 if no zone with the given id was found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
      expect(res.text).toMatch(/was not found/);
    });

    it("should delete the zone if input is valid", async () => {
      await exec();

      const zoneInDb = await Zone.findById(id);

      expect(zoneInDb).toBeNull();
    });

    it("should return the removed zone", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", zone._id.toHexString());
      expect(res.body).toHaveProperty("name", zone.name);
    });
  });

  describe("Patch /Zone/DeleteAll", () => {
    it("should be no zones if successful", async () => {
      const res = await request(server).patch("/api/zones/deleteAll");

      expect(res.status).toBe(200);

      const zoneAny = await Zone.find();
      expect(zoneAny.length).toEqual(0);
    });
  });
});
