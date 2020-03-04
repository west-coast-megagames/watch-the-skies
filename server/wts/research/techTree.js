const fs = require('fs')
const techTreeDebugger = require('debug')('app:techTree');

const militaryData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/military.json')));
const infrastructureData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/infrastructure.json')));
const medicalData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/medical.json')));
const agricultureData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/agriculture.json')));
const analysisData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/analysis.json')));
const techData = [...militaryData, ...infrastructureData, ...medicalData, ...agricultureData, ...analysisData];

const { Technology } = require('./technology');
const KnowledgeResearch = require('../../models/sci/research')

const techTree = [] // Server side array to track all availible technology.

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

    techTreeDebugger(`${count} technology loaded into tech tree...`)
    return `${count} technology loaded into tech tree...`
};

module.exports = { techTree, getTechTree, loadTech, techSeed };