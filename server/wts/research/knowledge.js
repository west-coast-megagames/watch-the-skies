const fs = require('fs')
const file = fs.readFileSync(require.resolve('./knowledge.json'));
const knowledgeData = JSON.parse(file);

knowledgeDebugger = require('debug')('app:knowledge');

const { Team } = require('../../models/team');
const Research = require('../../models/sci/research');
const KnowledgeResearch = require('../../models/sci/knowledgeResearch');
const { techCost } = require('./research');

const fields = ['Biology', 'Computer Science', 'Electronics', 'Engineering', 'Genetics', 'Material Science','Physics', 'Psychology', 'Social Science', 'Quantum Mechanics'];
const knowledgeTree = []

// Load function to load all knowledge fields and levels into the the server side knowledgeTree.
async function loadKnowledge () {
    let count = 0;

    await knowledgeData.forEach(knowledge => {
        knowledgeDebugger(knowledge);
        knowledgeTree[count] = new Knowledge(knowledge);
        count++;
    });

    return `${count} knowledge loaded into tree...`
};

async function knowledgeSeed() {
    let seeded = []
    for (let i = 0; i < 3; i++) {
        let done = false;
        while(done == false) {    
            let rand = 1 + Math.floor(Math.random() * knowledgeTree.length);
            let field = knowledgeTree[rand];
            if (field.level < 3 && seeded[i-1] !== field){
                seeded[i] = field;
                done = true;
            }
        }
    }

    console.log(seeded);

    seeded.forEach(async (knowledge) => {
        let newKnowledge = await knowledge.seed();
        console.log(newKnowledge);

        let tree = knowledgeTree;

        let index = tree.findIndex(field => field.field === newKnowledge.field && field.level === newKnowledge.level + 1);
        tree[index].unlock();

        index = tree.findIndex(field => field.field === newKnowledge.field && field.level === newKnowledge.level - 1);
        console.log(`Index: ${index}`);
        index != -1 ? tree[index].seed() : null;
    });
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
            progress: {
                USA: 0,
                TUK: 0,
                PRC: 0,
                RFD: 0,
                TFR: 0
            },
            status: {
                progress: 0,
                availible: true,
                completed: false,
                published: false,
            }
        });

        await newKnowledge.save();

        console.log(`${this.name} has been unlocked for research!`)
    }
}


module.exports = { Knowledge, loadKnowledge, knowledgeSeed };