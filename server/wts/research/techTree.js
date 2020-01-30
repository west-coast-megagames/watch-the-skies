const fs = require('fs')
const file = fs.readFileSync(require.resolve('./research.json'));
const techData = JSON.parse(file);

const techTreeDebugger = require('debug')('app:techTree');

const Technology = require('./technology');

const techTree = []

function getTechTree() {
    return techTree;
}

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

    makeAvailible();

    return `${count} technology loaded into tech tree...`
};

module.exports = { techTree, getTechTree, makeAvailible, loadTech };