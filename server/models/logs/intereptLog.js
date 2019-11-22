const mongoose = require('mongoose');
const Log = require('./log');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const InterceptLog = Log.discriminator('InterceptLog', new Schema({
    logType: { type: String, default: 'Interception' },
    location: {
        zone: { type: String, require: true },
        country: { type: String, require: true },
        city: { type: String },
        poi: { type: String }
    },
    description: { type: String, required: true },
    unit: {
        _id: { type: ObjectId, required: true },
        description: { type: String, required: true },
        outcome: { 
            frameDmg: { type: Boolean },
            sysDmg: { type: Boolean },
            evasion: { type: Boolean },
            dmg: { type: Number }
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
}));

module.exports = InterceptLog;