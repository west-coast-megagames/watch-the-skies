const fs = require('fs')
const config = require('config');

const file = fs.readFileSync(require.resolve(config.get('initPathWTS') + 'json/systems.json'));
const systemData = JSON.parse(file);

systemsDebugger = require('debug')('app:systems');

const systems = []

const { System } = require('../../../models/ops/systems');

// Load function to load all systems.
async function loadSystems () {
    let count = 0;

    await systemData.forEach(system => {
        systemsDebugger(system);
        systems[count] = new Sys(system);
        count++;
    });

    return `${count} systems availible in WTS...`
};

// Knowledge Constructor Function
function Sys(system) {
    this.name = system.name;
    this.cost = system.cost;
    this.prereq = system.prereq;
    this.desc = system.desc;
    this.catagory = system.catagory;
    this.stats = system.stats

    this.build = async function() {
        let newSystem = new System(this)

        await newSystem.save();

        console.log(`${newSystem.name} has been built...`)

        return newSystem;
    }
}

module.exports = { loadSystems, systems };