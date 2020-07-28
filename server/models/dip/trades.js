const mongoose = require('mongoose');
const { boolean } = require('joi');
const Schema = mongoose.Schema;

const tradeDebugger = require('debug')('app:trade');

const TradeSchema = new Schema({
    offer: [{
        team: {type: Schema.Types.ObjectId, ref: 'Team'}, 
        megabucks: {type: Number, default: 0},
        untis: [{type: Schema.Types.ObjectId, ref: 'Aircraft'}],
        //intel here
        research: [{type: Schema.Types.ObjectId, ref: 'Research'}],
        //countries here
        equiptment: [{type: Schema.Types.ObjectId, ref: 'Equiptment'}],
        ratified: {type: Boolean, default: false}    
    }],//offer
    status: {
        draft: {type: Boolean, default: false},
        proposal: {type: Boolean, default: false},
        complete: {type: Boolean, default: false}
    }
});//const TradeSchema

let Trade = mongoose.model('Trade', TradeSchema);

module.exports = { Trade };