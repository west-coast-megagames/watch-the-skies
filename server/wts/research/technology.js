const techDebugger = require('debug')('app:tech');
const { Team } = require('../../models/team/team');
const { Research, KnowledgeResearch, AnalysisResearch, TechResearch } = require('../../models/sci/research');

const { TheoryReport } = require('../reports/reportClasses');

// Technology Constructor Function
function Technology(tech) {
  this.name = tech.name;
  this.type = tech.type;
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
          let currentTech = await Research.findOne({ name: this.name, team: team._id }); // Checks if team has the research already!!
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
                      code: this.code,
                      level: this.level,
                      prereq: this.prereq,
                      desc: this.desc,
                      field: this.field,
                      team: team._id,
                      unlocks: this.unlocks,
                      status: {
                        available: true
                      }
                  });

                  let theories = [];
                  for await (let unlock of newTech.unlocks) {
                    if (unlock.type === 'Technology') {
                      const { techTree } = require('./techTree');
                      let theory = techTree.find(el => el.code === unlock.code);
                      techDebugger(`It's gunna be the future soon: ${theory.type} - ${theory.name}`);
                      console.log(theory)
                      
                      let newTheory = {
                        name: theory.name,
                        level: theory.level,
                        prereq: theory.prereq,
                        field: theory.field,
                        type: theory.type,
                        code: theory.code,
                        desc: theory.desc
                      } 

                      theories.push(newTheory);
                    }
       
                  }
                  newTech.theoretical = theories
                  await newTech.save(); // Newly unlocked tech!
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

  this.unlock = async function(lab) {
    let currentTech = await Research.findOne({ name: this.name, team: lab.team }); // Checks if team has the research already!!
    let team = await Team.findById({_id: lab.team});
      if (currentTech === null) {
        techDebugger(`UNLOCKING ${this.name} Theory for ${team.name}...`);
        let newTech = new TechResearch({
            name: this.name,
            code: this.code,
            level: this.level,
            prereq: this.prereq,
            desc: this.desc,
            field: this.field,
            team: team._id,
            unlocks: this.unlocks
        });

        let report = new TheoryReport

        report.team = lab.team,
        report.lab = lab._id,
        report.project = newTech._id

        report.saveReport()

        let theories = [];
        for await (let unlock of newTech.unlocks) {
          if (unlock.type === 'Technology') {
            const { techTree } = require('./techTree');
            let theory = techTree.find(el => el.code === unlock.code);
            techDebugger(`It's gunna be the future soon: ${theory.type} - ${theory.name}`);
            console.log(theory)
            
            let newTheory = {
              name: theory.name,
              level: theory.level,
              prereq: theory.prereq,
              field: theory.field,
              type: theory.type,
              code: theory.code,
              desc: theory.desc
            } 

            theories.push(newTheory);
          }
        }
        newTech.theoretical = theories
        await newTech.save(); // Newly unlocked tech!

      } else {
        techDebugger(`${this.name} is already availible for ${team.name}...`);
      }
  }
}

async function techCheck() {
  for await (let research of Research.find().populate('team')) {
    if (research.status.visible && !research.status.availible) {
        let count = 0;
        for await (let req of research.prereq) {
          techDebugger(`${research.name}: Checking for prereq ${req.code}...`);
          let checkTech = await Research.findOne({ code: req.code, team: research.team._id, 'status.completed': true });
          let checkKnowledge = await Research.findOne({ code: req.code }).populate('credit');
          if (checkKnowledge !== null) {
            if (checkKnowledge.status.completed) { 
              console.log(`${research.name} vs. ${checkKnowledge.name}`)
              // console.log(`${research.team.name}`)
              // console.log(checkKnowledge);
              // console.log(`${checkKnowledge.credit.name}`)

              if (checkKnowledge.credit.name === research.team.name) {
                techDebugger(`COMPLETED - ${research.name} is availible to research for ${research.team.name}...`);
              } else if (checkKnowledge.status.published) {
                techDebugger(`PUBLISHED - ${checkKnowledge.name} is public information...`);
              } else {
                techDebugger(`UNKNOWN - ${checkKnowledge.name} is not availible to ${research.team.name}...`);
                checkKnowledge = null
              };
            }
          }
            
          if (checkTech !== null || checkKnowledge !== null) {
                count++;
                techDebugger(`${research.name}: Prereq ${req.code} found...`);
          } else {
                techDebugger(`${research.name}: Prereq ${req.code} not found...`);
                break;
          }
        };
  
        if (count === research.prereq.length) {
          research.status.availible = true;
        }

      await research.save();
    }
  }
  return;
}

module.exports = { Technology, techCheck };