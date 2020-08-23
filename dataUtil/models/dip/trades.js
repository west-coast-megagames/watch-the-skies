const mongoose = require('mongoose');
const { boolean } = require('joi');
const Schema = mongoose.Schema;
const Gameclock = require('../../wts/gameClock/gameClock');

const tradeDebugger = require('debug')('app:trade');

const ActivitySchema = new Schema({
    header: { type: String, default: "Trade Event"},
    date: { type: Date },
    timestamp: {type: Schema.Types.Mixed},
    data: [Schema.Types.Mixed] 
});

const TradeSchema = new Schema({
    initiator: {
        team: {type: Schema.Types.ObjectId, ref: 'Team'}, 
        ratified: {type: Boolean, default: false}, 
        modified: {type: Boolean, default: false},
        offer: {
            megabucks: {type: Number, default: 0},
            aircraft: [{type: Schema.Types.ObjectId, ref: 'Aircraft'}],
            //intel here
            research: [{type: Schema.Types.ObjectId, ref: 'Research'}],
            //sites here
            equipment: [{type: Schema.Types.ObjectId, ref: 'Equipment'}],
            comments: [],     
        },//initiator
    },
    tradePartner: {
        team: {type: Schema.Types.ObjectId, ref: 'Team'}, 
        ratified: {type: Boolean, default: false}, 
        modified: {type: Boolean, default: false},
        offer: {
            megabucks: {type: Number, default: 0},
            aircraft: [{type: Schema.Types.ObjectId, ref: 'Aircraft'}],
            //intel here
            research: [{type: Schema.Types.ObjectId, ref: 'Research'}],
            //sites here
            equipment: [{type: Schema.Types.ObjectId, ref: 'Equipment'}],
            comments: [],
        },//tradePartner
    },
    status: {
        draft: {type: Boolean, default: true},
        proposal: {type: Boolean, default: false},
        pending: {type: Boolean, default: false},
        rejected: {type: Boolean, default: false},
        complete: {type: Boolean, default: false},
        deleted: {type: Boolean, default: false},
    },
    activityFeed: [ActivitySchema],
    lastUpdated: {type: Date, default: Date.now()}
});//const TradeSchema

TradeSchema.methods.saveActivity = async (trade, incHeader) => {
    let activity = {
        header: incHeader,
        date: new Date(),
        timestamp: Gameclock.makeTimestamp()
    }
    
    trade.activityFeed.push(activity);
    trade = await trade.save();
    return trade;
}

let Trade = mongoose.model('Trade', TradeSchema);

module.exports = { Trade };