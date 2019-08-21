const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterceptorSchema = new Schema({
  _id: String,
  designation: { type: String, required: true },
  type: { type: String, default: "Interceptor"},
  team: { type: String },
  location: { 
    zone: { type: String }, 
    country: {type:String}, 
    poi: { type: String }
  },
  status: { 
    ready: { type: Boolean, default: true },
    damaged: { type: Boolean, default: false },
    upgrading: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    repairing: { type: Boolean, default: false },
    interceptable: { type: Boolean, default: false },
  },
  stats: {
    hull: { type: Number,  },
    hullMax: { type: Number, default: 100 },
    shield: { type: Number, default: 20 },
    ShieldMax: { type: Number, default: 20 },
    Systems: [
      {
        _ID: Number,
        class:{type: String, default: "Weapon" },
        type: {type: String, default: "Conventional" },
        Name: {type: String},
        Damage: { type: Number, default: 20 },
        status: {
          Damaged: { type:Boolean, default: false },
          Destroyed: { type:Boolean, default:false }
        }
      }, 
      {_ID: Number,
        class: {type: String, default: "Sensor"},
        type: {type: String, default: "Radar"},
        Name: {type: String},
        effeciency: {type: Number},
        status: {
          Damaged: { type:Boolean },
          Destroyed: { type:Boolean, default:false }
      }
      }
    ],
    interceptorUpgrades: {
      upgraded: { type: Boolean, default: false }
    },
  },
  base: {
    _ID: Number,
    name: { type: String },
    zone: { type: String },
    country: { type:String },
    poi: { type:String },
    hanger: { type: String }
    },
  log: [
    {_ID: Number,
    time: {type: Number},
    turn: {type: String},
    type: {type: String},
    results: {
      interception: {type: Boolean, default: false},
      unitDamaged: {type: Boolean, default: false},
      unitDestroyed: {type: Boolean, default: false},
        enemy: {
          _ID: Number,
          enemyDamaged: {type: Boolean, default: false},
          enemyDestroyed: {type: Boolean, default: false},
          debris: [
            {
              _ID: Number,
              class: {type: String},
              type: {type:String},
              country: {type:String}, 
              required: {type: Boolean, deffault: true}, 
              }
            ]
          }
        }
      }
    ]
  },
);

module.exports = Interceptor = mongoose.model('interceptor', InterceptorSchema)