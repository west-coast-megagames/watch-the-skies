const fs = require('fs')
const file = fs.readFileSync(require.resolve('../json/knowledge.json'));
const knowledgeData = JSON.parse(file);

knowledgeDebugger = require('debug')('app:knowledge');

const { Team } = require('../../models/team');
const Research = require('../../models/sci/research');
const KnowledgeResearch = require('../../models/sci/knowledgeResearch');
const { techCost } = require('./research');

const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science','Physics', 'Psychology', 'Social Science', 'Quantum Mechanics'];
const knowledgeTree = []
const teamsProgress = teamProgress();

async function teamProgress () {
    progress = {}
    for (let team of await Team.find()) {
        progress[`${team.shortName}`] = 0;
    }
    knowledgeDebugger(progress);
    return progress;
}

// Load function to load all knowledge fields and levels into the the server side knowledgeTree.
async function loadKnowledge () {
    let count = 0;

    await knowledgeData.forEach(knowledge => {
        knowledgeTree[count] = new Knowledge(knowledge);
        count++;
    });

    return `${count} knowledge loaded into tree...`
};

async function knowledgeSeed() {
    await Research.deleteMany({ type: 'Knowledge'})
    let seeded = []
    let i = 1;
    for (let field of fields) {
        knowledgeDebugger(field);
        knowledgeDebugger(`Seed count: ${i}`) 
            let rand = 1 + Math.floor(Math.random() * 3);
            knowledgeDebugger(rand);
            let seed = await knowledgeTree.find(el => el.field === field && el.level === rand);
            seeded.push(seed);
            knowledgeDebugger(`${seed.name} rolled as seed...`);
            knowledgeDebugger(`${seed.name} seeded...`)

    }

    seeded.forEach(async (knowledge) => {
        let newKnowledge = await knowledge.unlock();
        console.log(newKnowledge);

        let tree = knowledgeTree;

        // let index = tree.findIndex(field => field.field === newKnowledge.field && field.level === newKnowledge.level + 1);
        // await tree[index].unlock();

        let index = 0;

        while (newKnowledge.level > 0 && index !== -1) {
            index = tree.findIndex(field => field.field === newKnowledge.field && field.level === newKnowledge.level - 1);
            console.log(`Index: ${index}`);
            index != -1 ? newKnowledge = await tree[index].seed() : null
        }
    });

    return;
}

// Knowledge Constructor Function
function Knowledge(knowledge) {
    this.name = knowledge.name;
    this.level = knowledge.level;
    this.desc = knowledge.desc;
    this.field = knowledge.field;

    this.seed = async function() {
        let newKnowledge = new KnowledgeResearch({
            name: this.name,
            level: this.level,
            prereq: this.prereq,
            desc: this.desc,
            field: this.field,
            status: {
                progress: techCost[this.level],
                availible: false,
                completed: true,
                published: true
            }
        });

        await newKnowledge.save();

        console.log(`${newKnowledge.name} has been completed pre-game...`)

        return newKnowledge;
    }
    
    this.unlock = async function() {
        let newKnowledge = new KnowledgeResearch({
            name: this.name,
            level: this.level,
            prereq: this.prereq,
            desc: this.desc,
            field: this.field,
            progress: teamsProgress,
            status: {
                progress: 0,
                availible: true,
                completed: false,
                published: false,
            }
        });

        newKnowledge = await newKnowledge.save();

        console.log(`${this.name} has been unlocked for research!`)

        return newKnowledge;
    }
}

module.exports = { Knowledge, loadKnowledge, knowledgeSeed };