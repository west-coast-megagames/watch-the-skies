const mongoose = require('mongoose');
const { Log } = require('./log');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const InterceptLog = Log.discriminator('InterceptLog', new Schema({
    logType: { type: String, default: 'Interception', enum: ['Interception', 'Recon', 'Failure'] },
    position: { type: String },
    country: { type: Schema.Types.ObjectId, ref: 'Country'},
    site: { type: Schema.Types.ObjectId, ref: 'Site'},
    zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
    report: { type: String, required: true },
    unit: { type: Schema.Types.ObjectId, ref: 'Aircraft'},
    opponent: { type: Schema.Types.ObjectId, ref: 'Aircraft'},
    atkStats: {
        damage: {
            frameDmg: { type: Number },
            systemDmg: { type: Number },
        },
        outcome: { type: String }
    },
    defStats: {
        damage: {
            frameDmg: { type: Number },
            systemDmg: { type: Number },
        },
        outcome: { type: String }
    },
    salvage: [{ type: String }]
}));

module.exports = InterceptLog;