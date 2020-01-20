const fs = require('fs')
const techDebugger = require('debug')('app:tech');

const { Team } = require('../../models/team');
const Research = require('../../models/sci/research');
const TechResearch = require('../../models/sci/techResearch');

const { availibleTech, techTree, makeAvailible } = require('./research');
const file = fs.readFileSync(require.resolve('./research.json'));
const techData = JSON.parse(file);

// Technology Constructor Function
function Technology(tech) {
    this.name = tech.name;
    this.level = tech.level;
    this.prereq = tech.prereq;
    this.desc = tech.desc;
    this.catagory = tech.catagory;

    // Async Method to check if this technology is availible for each team
    this.checkAvailible = async function() {
        for (let team of await Team.find({ teamType: 'N' }, '_id name')) {
            let currentTech = await Research.findOne({ name: this.name, team_id: team._id });
            if (!currentTech) {
                console.log(`Checking ${team.name}'s eligibility to research ${this.name}`);

                let count = 0;
                let unlock = false;

                for (let req of this.prereq) {
                console.log(`Checking for prereq ${req}...`);
                let check = await Research.findOne({ name: req, team_id: team._id })
                console.log(check);
                if (check !== null) count++;
                console.log(count);
                };

                if (count === this.prereq.length) {
                    unlock = true;
                }

                if (unlock === true) {
                    console.log(`Unlocking ${this.name} for ${team.name}`);
                    let newTech = new TechResearch({
                        name: this.name,
                        level: this.level,
                        prereq: this.prereq,
                        desc: this.desc,
                        catagory: this.catagory,
                        team_id: team._id
                    });

                    await newTech.save();
                } else {
                    console.log(`${team.name} is not eligible to research ${this.name}`);
                };

            } else {
                console.log(`${this.name} is already availible...`)
            }
        };
    }
}

// Load function to load all technology into the the server side tech-tree.
async function loadTech () {
    let count = 0;

    await techData.forEach(tech => {
        techDebugger(tech);
        availibleTech[count] = new Technology(tech);
        count++;

        makeAvailible();
    });

    return `${count} technology loaded...`
};

// console.log(techTree());

// makeAvailible();

module.exports = loadTech;