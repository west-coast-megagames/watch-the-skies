const mongoose = require('mongoose');
const log = require('./log');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const InterceptionLog =  new Schema({
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

module.exports = log.discriminator('Interceptor', InterceptionLog);

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