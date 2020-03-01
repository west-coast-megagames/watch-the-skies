const fs = require('fs')
const techTreeDebugger = require('debug')('app:techTree');

const militaryData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/military.json')));
const infrastructureData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/infrastructure.json')));
const medicalData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/medical.json')));
const agricultureData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/agriculture.json')));
const techData = [...militaryData, ...infrastructureData, ...medicalData, ...agricultureData];

const { Technology } = require('./technology');
const KnowledgeResearch = require('../../models/sci/research')

const techTree = [] // Server side array to track all availible technology.

function getTechTree() {
    return techTree;
}

async function techSeed() {
    for await (let research of await Research.find({'status.completed': true})) {
        for await (let tech of research.unlocks) {
            let newTech = techTree.find(el => el.code === tech.code);
            await newTech.checkAvailible();
        }
    }
    return;
}

// Load function to load all technology into the the server side tech-tree.
async function loadTech () {
    let count = 0;

    await techData.forEach(tech => {
        techTreeDebugger(tech);
        techTree[count] = new Technology(tech);
        count++;
    });

    return `${count} technology loaded into tech tree...`
};

module.exports = { techTree, getTechTree, loadTech, techSeed };