const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    logType: { type: String, enum: ['Interception', 'Unit Construction', 'Deployment', 'repair', 'upgrade', 'mission'] },
    timestamp: {
        date: { type: Date, default: Date.now() },
        turn: { type: String },
        phase: { type: String }
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