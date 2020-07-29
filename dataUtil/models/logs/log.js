const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;
const modelDebugger = require('debug')('app:logModel');

const LogSchema = new Schema({
    date: { type: Date },
    timestamp: {
        turn: { type: String },
        phase: { type: String },
        turnNum: { type: Number },
        clock: { type: String } 
    },
    model: { type: String, default: 'Log'},
    team: { type: Schema.Types.ObjectId, ref: 'Team'}
});

let Log = mongoose.model('Log', LogSchema);

function validateLog(log) {
    //modelDebugger(`Validating ${site.siteCode}...`);
    
  const schema = {
    model: Joi.string().min(1).max(3)
  };
      
  return Joi.validate(log, schema, { "allowUnknown": true });
};

const TerrorLog = Log.discriminator('TerrorLog', new Schema({
    logType: { type: String, default: 'Terror' },
    country: { type: Schema.Types.ObjectId, ref: 'Country'},
    zone: { type: Schema.Types.ObjectId, ref: 'Zone'},
    targetSite: { type: Schema.Types.ObjectId, ref: 'Site'},
    startTerror: { type: Number },
    addTerror: { type: Number},
    endTerror: { type: Number },
    terrorMessage: { type: String }
}));

module.exports = { Log, validateLog, TerrorLog };