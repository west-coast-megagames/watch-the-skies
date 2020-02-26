const fs = require('fs')
const file = fs.readFileSync(require.resolve('../json/knowledge.json'));
const knowledgeData = JSON.parse(file);

knowledgeDebugger = require('debug')('app:knowledge');

const { Team } = require('../../models/team/team');
const { National } = require('../../models/team/national');
const { Control } = require('../../models/team/control');
const Research = require('../../models/sci/research');
const KnowledgeResearch = require('../../models/sci/knowledgeResearch');
const { techTree } = require('./techTree'); // Import of the tech tree array from techTree.js
const { techCost } = require('./research');

const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science','Physics', 'Psychology', 'Social Science', 'Quantum Mechanics'];
const knowledgeTree = []
let controlTeam = {}
let tp = []

loadGlobalVariables();

async function loadGlobalVariables () {
    let progress = []
    let control = await Team.find({teamCode: 'TCN'});
    for (let team of await Team.find({teamType: 'N'})) {
        let el = { team: team._id, progress: 0 }
        progress.push(el);
    }
    knowledgeDebugger(progress);
    tp = progress;
    controlTeam = control;
}

// Load function to load all knowledge fields and levels into the the server side knowledgeTree.
async function loadKnowledge () {
    let count = 0;

    await knowledgeData.forEach(knowledge => {
        knowledgeTree[count] = new Knowledge(knowledge);
        knowledgeDebugger(`${knowledge.name} Loaded...`)
        count++;
    });

    return `${count} knowledge loaded into tree...`
};

async function knowledgeSeed() {
    await Research.deleteMany({ type: 'Knowledge'})
    let seeded = []
    let i = 1;

    // Iterates over the knowledge array above
    for await (let field of fields) {
        knowledgeDebugger(field);
        knowledgeDebugger(`Seed count: ${i}`) 
            let rand = 1 + Math.floor(Math.random() * 3);
            knowledgeDebugger(rand);
            let seed = await knowledgeTree.find(el => el.field === field && el.level === rand);
            seeded.push(seed);
            knowledgeDebugger(`${seed.name} rolled as seed...`);
        i++;
    }

    for await (let knowledge of seeded) {
        let newKnowledge = await knowledge.unlock();
        knowledgeDebugger(newKnowledge);

        let tree = knowledgeTree;

        // let index = tree.findIndex(field => field.field === newKnowledge.field && field.level === newKnowledge.level + 1);
        // await tree[index].unlock();

        let index = 0;

        while (newKnowledge.level !== 0 && index !== -1) {
            index = tree.findIndex(field => field.field === newKnowledge.field && field.level === newKnowledge.level - 1);
            console.log(`Index: ${index}`);
            if (index != -1) {
                newKnowledge = await tree[index].seed()
                rand = 1 + Math.floor(Math.random() * (newKnowledge.teamProgress.length - 1));
                knowledgeDebugger(rand);
                newKnowledge.teamProgress[rand].progress = newKnowledge.totalProgress;
                knowledgeDebugger(newKnowledge);
                await completeKnowledge(newKnowledge);
            }
        }
    };

    return;
}

// Knowledge Constructor Function
function Knowledge(knowledge) {
    this.name = knowledge.name;
    this.level = knowledge.level;
    this.prereq = knowledge.prereq;
    this.desc = knowledge.desc;
    this.field = knowledge.field;
    this.unlocks = knowledge.unlocks;
    this.teamProgress = tp;


    this.seed = async function() {
        let newKnowledge = new KnowledgeResearch({
            name: this.name,
            level: this.level,
            prereq: this.prereq,
            desc: this.desc,
            credit: controlTeam._id,
            field: this.field,
            desc: this.desc,
            unlocks: this.unlocks,
            totalProgress: techCost[this.level],
            status: {
                availible: false,
                completed: true,
                published: true
            },
            teamProgress: this.teamProgress
        });

        await newKnowledge.save();
        knowledgeDebugger(`${newKnowledge.name} seeded...`)
        knowledgeDebugger(`${newKnowledge.name} has been completed pre-game...`)

        return newKnowledge;
    }
    
    this.unlock = async function() {
        let newKnowledge = new KnowledgeResearch({
            name: this.name,
            level: this.level,
            prereq: this.prereq,
            desc: this.desc,
            field: this.field,
            unlocks: this.unlocks,
            status: {
                availible: true,
                completed: false,
                published: false,
            },
            teamProgress: this.teamProgress
        });

        newKnowledge = await newKnowledge.save();

        console.log(`${newKnowledge.name} has been unlocked for research!`)

        return newKnowledge;
    }
}
 
async function completeKnowledge (research) {
    knowledgeDebugger(`Enough progress has been made to complete ${research.name}...`);
    research.status.availible = false;
    research.status.completed = true;
  
    let high = 0;
    for await (let team of research.teamProgress) {
      if (team.progress > high) research.credit = team._id;
    }
    knowledgeDebugger(research)
    // credit = await Team.findById(research.credit);
    knowledgeDebugger(`${research.name} has been credited with advancing the world to ${research.name}`)
    
    if (research.level < 5) {
        let nextKnowledge = knowledgeTree.find(el => el.field === research.field && el.level === research.level + 1);
        nextKnowledge.unlock();
    };

    for await (let tech of research.unlocks) {
        let newTech = techTree.find(el => el.code === tech.code);
        await newTech.checkAvailible();
    }

    reserach = await research.save();
  
    return research;
  }

module.exports = { Knowledge, loadKnowledge, knowledgeSeed, completeKnowledge };