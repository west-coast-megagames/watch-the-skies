const fs = require('fs')
const techTreeDebugger = require('debug')('app:techTree');

const militaryData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/military.json')));
const infrastructureData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/infrastructure.json')));
const medicalData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/medical.json')));
const agricultureData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/agriculture.json')));
const analysisData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/analysis.json')));
const placeholderData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/placeholder.json')));
const techData = [...militaryData, ...infrastructureData, ...medicalData, ...agricultureData, ...analysisData];

const { Technology } = require('./technology');
const { Research, TechResearch } = require('../../models/sci/research');
const { Team } = require('../../models/team/team');
const { Facility } = require('../../models/gov/facility/facility');

const techTree = [] // Server side array to track all available technology.

function getTechTree() {
    return techTree;
}

async function techSeed() {
    for await (let research of await Research.find({'status.completed': true})) {
        for await (let tech of research.unlocks) {
            let newTech = techTree.find(el => el.code === tech.code);
            await newTech.checkAvailable();
        }
    }

    let control =await Team.findOne({type: 'Control'})
    let result = await Research.deleteMany({name: 'Empty Lab'});

    techTreeDebugger(`${result.deletedCount} placeholder deleted!`);

    let placeholderTech = new TechResearch({
        name: placeholderData[0].name,
        code: placeholderData[0].code,
        level: placeholderData[0].level,
        prereq: placeholderData[0].prereq,
        desc: placeholderData[0].desc,
        field: placeholderData[0].field,
        team: control._id,
        unlocks: placeholderData[0].unlocks,
        knowledge: placeholderData[0].knowledge,
    });

    placeholderTech = await placeholderTech.save();

    for await (let facility of await Facility.find({'capability.research.capacity': { $gt: 0 }})) {
        let { research } = facility.capability;
        for (let i = 0; i < research.capacity; i++) {
            research.damage.set(i, 'Active');
            research.funding.set(i, 0);
            research.projects.set(i, placeholderTech._id);
            await facility.save();
        }
    }

    return;
}

// Load function to load all technology into the the server side tech-tree.
async function loadTech () {
    let count = 0;

    for await (let tech of techData) {
        // techTreeDebugger(tech);
        techTree[count] = new Technology(tech);
        count++;
    };

    techTreeDebugger(`${count} technology loaded into tech tree...`)
    return `${count} technology loaded into tech tree...`
};

module.exports = { techTree, getTechTree, loadTech, techSeed };