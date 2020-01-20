const techDebugger = require('debug')('app:tech');

const { Team } = require('../../models/team');
const Research = require('../../models/sci/research');
const TechResearch = require('../../models/sci/techResearch');

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
            techDebugger(`${this.name}: Checking ${team.name}'s eligibility to research this tech...`);
            if (!currentTech) {
                let count = 0;
                let unlock = false;
                let msg = ""

                for (let req of this.prereq) {
                    techDebugger(`${this.name}: Checking for prereq ${req}...`);
                    let check = await Research.findOne({ name: req, team_id: team._id, 'status.completed': true })
                    if (check !== null) {
                        count++;
                        techDebugger(`${this.name}: prereq ${req} found...`);
                    } else {
                        techDebugger(`${this.name}: prereq ${req} not found...`);
                    }
                };

                if (count === this.prereq.length) {
                    unlock = true;
                }

                if (unlock === true) {
                    msg = `${this.name}: Unlocking this tech for ${team.name}`
                    techDebugger(msg);
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
                    msg = `${this.name}: ${team.name} is not eligible to research this tech...`
                    techDebugger(msg);
                };

            } else {
                msg = `${this.name}: This tech is already availible...`
                techDebugger(msg);
            }
        };
        return `Done updating eligibility to research ${this.name}`
    }
}



module.exports = Technology;