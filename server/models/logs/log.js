const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    logType: { type: String, enum: ['Interception', 'Unit Construction', 'Deployment', 'repair', 'upgrade', 'mission'] },
    timestamp: {
        date: { type: Date, defualt: Date.now },
        turn: { type: String, default: "Test Turn"},
        phase: { type: String, default: "Test Phase"},
    },
    teamID: { type: String, },
    location: {
        zone: { type: String, require: true },
        country: { type: String, require: true },
        city: { type: String },
        poi: { type: String },
    },
    description: { type: String, required: true },
    unit: {
        _id: { type: ObjectId, required: true },
        description: { type: String, required: true },
        outcome: { 
            frameDmg: { type: Boolean },
            sysDmg: { type: Boolean },
            evasion: { type: Boolean },
            dmg: { type: Number },
        }
    },
    opponent: {
        _id: { type: ObjectId, required: true },
        description: { type: String, required: true },
        outcome: { 
            frameDmg: { type: Boolean },
            sysDmg: { type: Boolean },
            evasion: { type: Boolean },
            dmg: { type: Number },
        }
    }
});

//const logOptions = { descriminatorKey: 'logType', collection: 'logs' }

module.exports = Log = mongoose.model('log', LogSchema)

// log: [
//     {_ID: Number,
//     time: {type: Number},
//     turn: {type: String},
//     type: {type: String},
//     results: {
//       interception: {type: Boolean, default: false},
//       unitDamaged: {type: Boolean, default: false},
//       unitDestroyed: {type: Boolean, default: false},
//         enemy: {
//           _ID: Number,
//           enemyDamaged: {type: Boolean, default: false},
//           enemyDestroyed: {type: Boolean, default: false},
//           debris: [
//             {
//               _ID: Number,
//               class: {type: String},
//               type: {type:String},
//               country: {type:String}, 
//               required: {type: Boolean, deffault: true}, 
//               }
//             ]
//           }
//         }
//       }
//     ]