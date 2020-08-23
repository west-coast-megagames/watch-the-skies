const mongoose = require('mongoose');
const { Log } = require('./log');
const Schema = mongoose.Schema;

const OfferSchema = new Schema({
    team: {type: Schema.Types.ObjectId, ref: 'Team'}, 
    megabucks: {type: Number, default: 0},
    untis: [{type: Schema.Types.ObjectId, ref: 'Aircraft'}],
    //intel here
    research: [{type: Schema.Types.ObjectId, ref: 'Research'}],
    //sites here
    equiptment: [{type: Schema.Types.ObjectId, ref: 'Equiptment'}],
    ratified: {type: Boolean, default: false}    
  });

const TradeLog = Log.discriminator('TradeLog', new Schema({
    logType: { type: String, default: 'Trade' },
    country1: { type: Schema.Types.ObjectId, ref: 'Country'},
    country2: { type: Schema.Types.ObjectId, ref: 'Country'},
    offer1: [OfferSchema],
    offer2: [OfferSchema],
    comment1: { type: String },
    comment2: { type: String },
}));





module.exports = TradeLog;