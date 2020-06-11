const researchDebugger = require("debug")("app:research");
const majorDebugger = require("debug")("app:major");
const nexusEvent = require("../../startup/events");
const { logger } = require("../../middleware/winston");

const { Research } = require("../../models/sci/research"); // Imports the Research object which is the base Model for Technology, Knowledge and Analysis
const { d6 } = require("../../systems/dice"); // Import of the dice randomizer found in `dice.js`

const { techCost, fundingCost } = require("./sciState");

const { Facility } = require("../../models/gov/facility/facility");
const { Team } = require("../../models/team/team");
const { ResearchReport } = require("../reports/reportClasses");
const { techTree } = require("./techTree");
const { knowledgeTree } = require("./knowledge");

async function startResearch() {
  for await (let lab of await Facility.find({ type: "Lab" })) {
    if (lab.research.length < 1) {
      researchDebugger(`${lab.name} has no research to conduct...`);
      let projects = await Research.find({
        team: lab.team,
        "status.completed": false,
      });
      let rand = Math.floor(Math.random() * (projects.length - 1));

      if (projects.length > 0) {
        let project = projects[rand];
        researchDebugger(
          `${lab.name} has independently choosen to work on ${project.name}...`
        );
        lab.research.push(project);
        await calculateProgress(lab);
      }
    } else {
      researchDebugger(
        `${lab.name} has ${lab.research.length} research to conduct`
      );
      await calculateProgress(lab);
    }
  }
  nexusEvent.emit("updateResearch");
  nexusEvent.emit("updateFacilities");
}

// FUNCTION for calculating the progress applied to a single RESEARCH project
async function calculateProgress(lab) {
  researchDebugger(`${lab.name} has begun conducting research.`);
  let completedResearch = 0;
  for await (let project of lab.research) {
    let report = new ResearchReport();
    // majorDebugger(lab);

    try {
      let tech = await Research.findById(project).populate("team"); // Imports the specific Research object by _id
      if (tech != null) {
        researchDebugger(`Current Progress: ${tech.progress}`);
        report.progress.startingProgress = tech.progress; // Tracks progress in the Research Report
        // researchDebugger(tech)
        let team = await Team.findById(lab.team); // Finds the owner of the Lab
        report.project = tech._id; // Records the research being worked on
        report.lab = lab._id; // Records the lab working on the project
        // researchDebugger(lab)
        // researchDebugger(team);
        researchDebugger(
          `Team Sci Rate: ${team.sciRate} - type: ${typeof team.sciRate}`
        );
        researchDebugger(
          `Lab Sci Rate: ${lab.sciRate} - type: ${typeof lab.sciRate}`
        );
        let sciRate = team.sciRate + lab.sciRate;
        let sciBonus = lab.bonus;
        researchDebugger(`Science Rate: ${sciRate}`);
        let progressInfo = await researchMultiplyer(
          sciRate,
          lab.funding,
          sciBonus
        ); // Calculates progress by getting the teams sciRate, the funding level, and any relevant multiplery bonus

        if (tech.type === "Knowledge") {
          tech.teamProgress[team._id] += progressInfo.progress;
        } else {
          tech.progress += progressInfo.progress; // Adds progress to the current Research
        }

        // console.log(techCost)
        // console.log(tech.progress)
        tech.progress >= techCost[tech.level]
          ? (tech.status.completed = true)
          : null; // Checks for compleation of current research

        if (tech.status.completed === true) {
          researchDebugger(`${tech.name} completed!`);
          tech = await completeTech(tech, lab);
          completedResearch++;
        } else {
          researchDebugger(`${tech.progress} progress towards ${tech.name}...`);
        }

        report.team = team._id;
        report.lab = lab._id;
        report.project = tech._id;
        report.funding = lab.funding;
        report.progress.endingProgress = tech.progress;
        report.stats.sciRate = sciRate;
        report.stats.sciBonus = sciBonus;
        report.stats.completed = tech.status.completed;
        report.stats.finalMultiplyer = progressInfo.multiplyer;
        report.rolls = progressInfo.rolls;
        report.outcomes = progressInfo.outcomes;
        report.stats.breakthroughCount = progressInfo.breakthroughs;
        report.date = Date.now();
        await report.saveReport();

        lab.funding = 0;
        lab = await lab.save(); // Saves the modified lab
        tech = await tech.save(); // Saves the current project to the database

        // majorDebugger(lab);
        // majorDebugger(tech);
      }
    } catch (err) {
      logger.error(err);
      researchDebugger(`CalcProgress Error: ${err}`);
    }
  }
  if (completedResearch === lab.research.length || lab.status.hidden === true) {
    lab.research = [];
    lab = await lab.save(); // Saves the modified lab
  }
  return;
}

// Calculates the multiplier for the current research project and returns the progress
function researchMultiplyer(sciRate, funding, sciBonus) {
  let multiplyer = 1 + sciBonus; // Gives the base multiplier calculated as 1 + any sciBonus the team or lab have
  let rolls = [];
  let outcomes = [];
  let breakthroughs = 0;
  // For loop that rolls a d6 per funding level, and either adds or subtracts from the base multiplier
  for (let i = 0; i < funding + 1; i++) {
    let roll = d6(); // Roll of a d6
    rolls.push(roll);

    researchDebugger(roll);

    // Switch for assigning the outcome of the multiplier roll.
    switch (true) {
      case roll <= 1:
        researchDebugger("Set Back");
        multiplyer -= 0.5; // Reduction of the multiplier due to a set-back in the research
        outcomes.push("Setback");
        break;
      case roll <= 3:
        researchDebugger("Progress");
        multiplyer += 0.25; // Progress, an increase speed of 25% | TODO, make each level variable rather then hard coded
        outcomes.push("Progress");
        break;
      case roll <= 5:
        researchDebugger("Fast Progress");
        multiplyer += 0.6; // Fast Progress, an increase speed of 60% | TODO, make each level variable rather then hard coded
        outcomes.push("Development");
        break;
      case roll === 6:
        researchDebugger("Breakthrough");
        multiplyer += 0.2; // Breakthrough, an increase speed of 20% | TODO, make each level variable rather then hard coded
        outcomes.push("Breakthrough");
        breakthroughs += 1;
        break;
      default:
        researchDebugger("Got to default..."); // This should never happen, if it does we have a coding error....
    }
  }

  researchDebugger(`Research Multiplyer: ${multiplyer}`);
  let progress = sciRate * multiplyer; // Final calculation of progress on the technology
  researchDebugger(`Progress: ${progress}...`);
  return { progress, multiplyer, rolls, outcomes, breakthroughs }; // Returns progress to the Calculate Progress function.
}

async function completeTech(research, lab) {
  researchDebugger(
    `Enough progress has been made to complete ${research.name}...`
  );
  research.status.available = false;
  research.status.completed = true;

  majorDebugger(research.unlocks);

  for await (let item of research.unlocks) {
    console.log(item);
    if (item.type === "Technology") {
      let newTech = techTree.find((el) => el.code === item.code);
      researchDebugger(`New Theory: ${item.type} - ${newTech.name}`);
      // console.log(newTech)
      await newTech.unlock(lab);
    }

    if (research.type === "Knowledge") {
      if (research.level < 5) {
        let nextKnowledge = knowledgeTree.find(
          (el) => el.field === research.field && el.level === research.level + 1
        );
        await nextKnowledge.unlock();
        researchDebugger(`UNLOCKING: ${research.type} - ${nextKnowledge.name}`);
        console.log(nextKnowledge);
      }
    }
  }

  reserach = await research.save();

  return research;
}

module.exports = { startResearch, calculateProgress, techCost, fundingCost };
