const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterceptorSchema = new Schema({
  designation: { type: String, required: true },
  type: { type: String, defualt: "Interceptor" },
  team: String,
  location: { 
    zone: String, 
    country: String, 
    city: String
  },
  status: {
    docked: { type: Boolean, default: true },
    deployed: { type: Boolean, default: false },
    damaged: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    upgrading: { type: Boolean, default: false },
    repairing: { type: Boolean, default: false },
  },
  stats: {
    hull: { type: Number, default: 100 },
    hullMax: { type: Number, default: 100 },
    shield: { type: Number, default: 20 },
    ShieldMax: { type: Number, default: 20 },
  },
});

module.exports = Interceptor = mongoose.model('interceptor', InterceptorSchema)