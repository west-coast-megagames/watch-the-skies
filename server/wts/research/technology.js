const techDebugger = require('debug')('app:tech');

const { Team } = require('../../models/team/team');
const Research = require('../../models/sci/research');
const KnowledgeResearch = require('../../models/sci/knowledgeResearch');
const TechResearch = require('../../models/sci/techResearch');

// Technology Constructor Function
function Technology(tech) {
    this.name = tech.name;
    this.level = tech.level;
    this.code = tech.code;
    this.prereq = tech.prereq;
    this.desc = tech.desc;
    this.field = tech.field;
    this.effects = tech.effects;
    this.unlocks = tech.unlocks;

    // Async Method to check if this technology is available for each team
    this.checkAvailable = async function() {
        for await (let team of await Team.find({ teamType: 'N' }, '_id name')) {
            let currentTech = await Research.findOne({ name: this.name, team: team._id });
            techDebugger(`${this.name}: Checking ${team.name}'s eligibility to research this tech...`);
            if (currentTech === null) {
                let count = 0;
                let unlock = false;
                let msg = ""

                for await (let req of this.prereq) {
                  
                  techDebugger(`${this.name}: Checking for prereq ${req.code}...`);
                  let checkTech = await Research.findOne({ code: req.code, team: team._id, 'status.completed': true });
                  let checkKnowledge = await Research.findOne({ code: req.code });
                  //console.log("checkKnowledge here ", checkKnowledge);
                  if (checkKnowledge !== null) {
                    if (checkKnowledge.status.completed) {              
                      if (checkKnowledge.credit.toHexString() === team._id.toHexString()) {
                        techDebugger(`COMPLETED - ${this.name} is availible to research for ${team.name}...`);
                      } else if (checkKnowledge.status.published) {
                        techDebugger(`PUBLISHED - ${checkKnowledge.name} is public information...`);
                      } else {
                        techDebugger(`UNKNOWN - ${checkKnowledge.name} is not availible to ${team.name}...`);
                        checkKnowledge = null
                      };
                    }
                  }
                    
                  if (checkTech !== null || checkKnowledge !== null) {
                        count++;
                        techDebugger(`${this.name}: Prereq ${req.code} found...`);
                  } else {
                        techDebugger(`${this.name}: Prereq ${req.code} not found...`);
                        break;
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
                        field: this.field,
                        team: team._id,
                        unlocks: this.unlocks
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

module.exports = { Technology };