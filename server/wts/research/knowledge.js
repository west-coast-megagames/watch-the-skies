const fs = require('fs')
const file = fs.readFileSync(require.resolve('../json/knowledge.json'));
const knowledgeData = JSON.parse(file);

knowledgeDebugger = require('debug')('app:knowledge');

const { Team } = require('../../models/team/team');
const { Research, KnowledgeResearch } = require('../../models/sci/research');
const { techTree } = require('./techTree'); // Import of the tech tree array from techTree.js

const techCost = [ 20, 30, 40, 50, 60, 70 ] // Arbitratily set at increments of 50 currently

const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science','Physics', 'Psychology', 'Social Science', 'Quantum Mechanics'];
const knowledgeTree = [];
let controlTeam = {};
let tp = [];
let seed = true;

async function loadGlobalVariables() {
    let progress = [];
    let count = 0;
    let control = await Team.find({teamCode: 'TCN'});
    for (let team of await Team.find({teamType: 'N'})) {
        let el = { team: team._id, progress: 0 }
        progress.push(el);
        count++
    }
    knowledgeDebugger(`Loaded ${count} teams into progress...`);
    tp = progress;
    controlTeam = control;
}

// Load function to load all knowledge fields and levels into the the server side knowledgeTree.
async function loadKnowledge () {
    let count = 0;

    await knowledgeData.forEach(knowledge => {
        knowledgeTree[count] = new Knowledge(knowledge);
        // knowledgeDebugger(`${knowledge.name} Loaded...`)
        count++;
    });
    knowledgeDebugger(`${count} knowledge loaded into tree...`)
    return `${count} knowledge loaded into tree...`
};

async function knowledgeSeed() {
    await Research.deleteMany()
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
        // knowledgeDebugger(seeded);
        // knowledgeDebugger(newKnowledge);
        
        let tree = knowledgeTree;

        // let index = tree.findIndex(field => field.field === newKnowledge.field && field.level === newKnowledge.level + 1);
        // await tree[index].unlock();

        let index = 0;

        while (newKnowledge.level !== 0 && index !== -1) {
            index = tree.findIndex(field => field.field === newKnowledge.field && field.level === newKnowledge.level - 1);
            console.log(`Index: ${index}`);

            if (index != -1) {
                console.log('Index: != -1')
                newKnowledge = await tree[index].seed()
                //knowledgeDebugger(newKnowledge)
                if (newKnowledge.teamProgress.length > 0) {
                  rand = Math.floor(Math.random() * (newKnowledge.teamProgress.length - 1));
                  rand = Math.max(rand, 0);   // don't go negative
                  //knowledgeDebugger(`Rand: ${rand} teamProgress.length: ${newKnowledge.teamProgress.length}`);
                  newKnowledge.teamProgress[rand].progress = newKnowledge.progress;
                  //knowledgeDebugger(newKnowledge);
                }
                knowledgeDebugger(`Completing knowledge`)
                await completeKnowledge(newKnowledge);
                knowledgeDebugger(`Publishing Science`)
                await publishKnowledge(newKnowledge);
            }
        }
    };
    for await (let knowledge of await Research.find({'status.completed': true}, 'name credit progress status')) {
        console.log(knowledge);
    }

    knowledgeDebugger(`Knowledge seed complete...`)
    return;
}

// Knowledge Constructor Function
function Knowledge(knowledge) {
    this.name = knowledge.name;
    this.level = knowledge.level;
    this.prereq = knowledge.prereq;
    this.desc = knowledge.desc;
    this.field = knowledge.field;
    this.code = knowledge.code;
    this.unlocks = knowledge.unlocks;
    this.teamProgress = tp;


    this.seed = async function() {
        
        console.log(`seeding ${this.name}`)
        let newKnowledge = new KnowledgeResearch({
            name: this.name,
            level: this.level,
            prereq: this.prereq,
            desc: this.desc,
            credit: controlTeam._id,
            field: this.field,
            desc: this.desc,
            code: this.code,
            unlocks: this.unlocks,
            progress: techCost[this.level],
            status: {
                available: false,
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
        console.log(`Unlocking ${this.name}`)
        let newKnowledge = new KnowledgeResearch({
            name: this.name,
            level: this.level,
            prereq: this.prereq,
            desc: this.desc,
            field: this.field,
            code: this.code,
            unlocks: this.unlocks,
            status: {
                available: true,
                completed: false,
                published: false,
            },
            teamProgress: this.teamProgress
        });

        newKnowledge = await newKnowledge.save();

        knowledgeDebugger(`${newKnowledge.name} has been unlocked for research!`)

        return newKnowledge;
    }
}
 
async function completeKnowledge (research) {
    knowledgeDebugger(`Enough progress has been made to complete ${research.name}...`);
    research.status.available = false;
    research.status.completed = true;
  
    let high = 0;
    for await (let team of research.teamProgress) {
      if (team.progress > high) research.credit = team.team;
    }
    let team = await Team.findById(research.credit);
    // credit = await Team.findById(research.credit);
    knowledgeDebugger(`${team.name} has been credited with advancing the world to ${research.name}`)
    
    if (research.level < 5) {
        let nextKnowledge = knowledgeTree.find(el => el.field === research.field && el.level === research.level + 1);
        nextKnowledge.unlock();
    };

    reserach = await research.save();

    if (!seed) {
        for await (let tech of research.unlocks) {
            let newTech = techTree.find(el => el.code === tech.code);
            await newTech.checkAvailable();
        }
    }
  
    return research;
}

async function publishKnowledge (research) {
    let team = await Team.findById(research.credit);
    knowledgeDebugger(`${team.name} is publishing ${research.name}...`);
    research.status.published = true;

    reserach = await research.save();
  
    return research;
};

module.exports = { Knowledge, loadKnowledge, knowledgeSeed, completeKnowledge, knowledgeTree, loadGlobalVariables };