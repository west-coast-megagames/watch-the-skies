const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterceptorSchema = new Schema({
  designation: { type: String, required: true },
  type: { type: String, default: "Interceptor"} ,
  team: { type: String },
  stats: {
    hull: { type: Number, default: 2 },
    hullMax: { type: Number, default: 2 },
    damage: { type: Number, default: 1 },
  },
  location: { 
    zone: { type: String }, 
    country: {type:String }, 
    poi: { type: String }
  },
  status: { 
    aggressive: { type: Boolean, default: true },
    passive: { type: Boolean, default: false },
    disengage: { type: Boolean, default: false },
    damaged: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    ready: { type: Boolean, default: true },
    upgrade: { type: Boolean, default: false },
    repair: { type: Boolean, default: false },
    mission: { type: Boolean, default: false }
  }
});

module.exports = Interceptor = mongoose.model('interceptor', InterceptorSchema)