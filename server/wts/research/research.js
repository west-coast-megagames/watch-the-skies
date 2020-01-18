const researchDebugger = require('debug')('app:research');

const availibleTech = []

function techTree() {
    return availibleTech;
}

function makeAvailible() {
    availibleTech.forEach((tech) => {
        tech.checkAvailible();
    })
}

module.exports = { availibleTech, techTree, makeAvailible }