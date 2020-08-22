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
        // console.log(`JESSICA - FIX MEEH: ${research.name}`)
        for await (let tech of research.unlocks) {
            // console.log(tech)
            let newTech = techTree.find(el => el.code === tech.code);
            // console.log(newTech)
            await newTech.checkAvailable();
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

    let control = await Team.findOne({type: 'Control'})

    let placeholderTech = new TechResearch({
        name: placeholderData.name,
        code: placeholderData.code,
        level: placeholderData.level,
        prereq: placeholderData.prereq,
        desc: placeholderData.desc,
        field: placeholderData.field,
        team: control._id,
        unlocks: placeholderData.unlocks,
        knowledge: placeholderData.knowledge,
    });

    placeholderTech = await placeholderTech.save();

    for await (let facility of await Facility.find({'capability.research.capacity': { $gt: 0 }})) {
        let { research } = facility.capability;
        for (let i = 0; i < research.capacity; i++) {
            research.damage.set(i, 'Active');
            research.funding.set(i, 0);
            research.projects.set(i, control._id);
            await facility.save();
        }
    }

    techTreeDebugger(`${count} technology loaded into tech tree...`)
    return `${count} technology loaded into tech tree...`
};

module.exports = { techTree, getTechTree, loadTech, techSeed };