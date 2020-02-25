const fs = require('fs')
const techTreeDebugger = require('debug')('app:techTree');

const militaryData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/military.json')));
const infrastructureData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/infrastructure.json')));
const medicalData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/medical.json')));
const agricultureData = JSON.parse(fs.readFileSync(require.resolve('../json/tech/agriculture.json')));
const techData = [...militaryData, ...infrastructureData, ...medicalData, ...agricultureData];

const Technology = require('./technology');

const techTree = []

function getTechTree() {
    return techTree;
}

// TEMP function that goes through the whole tech tree and checks the availibility of each
async function makeAvailible() {
    for (let tech of techTree) {
        let res = await tech.checkAvailible();
        techTreeDebugger(res)
    }
}

// Load function to load all technology into the the server side tech-tree.
async function loadTech () {
    let count = 0;

    await techData.forEach(tech => {
        techTreeDebugger(tech);
        techTree[count] = new Technology(tech);
        count++;
    });

    await makeAvailible();

    return `${count} technology loaded into tech tree...`
};

module.exports = { techTree, getTechTree, makeAvailible, loadTech };