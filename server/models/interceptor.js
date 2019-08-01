const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterceptorSchema = new Schema({
  _ID: Number,
  designation: { type: String, required: true },
  type: { type: String, default: "Interceptor", required: true},
  team: { type: String },
  location: { 
    zone: { type: String }, 
    country: {type:String, required: true}, 
    poi: { type: String }
  },
  status: { 
    ready: { type: Boolean, default: true, required: true },
    damaged: { type: Boolean, default: false, required: true},
    upgrading: { type: Boolean, default: false},
    deployed: { type: Boolean, default: false, required: true },
    destroyed: { type: Boolean, default: false, required: true },
    repairing: {type: Boolean, default: false},
    interceptable: { type: Boolean, default: false, required: true },
  },
  stats: {
    hull: { type: Number, default: 100, required: true },
    hullMax: { type: Number, default: 100, required: true },
    shield: { type: Number, default: 20, required: true },
    ShieldMax: { type: Number, default: 20, required: true },
    Systems: [
      {
        _ID: Number,
        class:{type: String, default: "Weapon"},
        type: {type: String, default: "Conventional"},
        Name: {type: String},
        Damage: {type: Number, default: 20, required: true},
        status: {
          Damaged: {type:Boolean, default: false},
          Destroyed: {type:Boolean, default:false}
        }
      }, 
      {_ID: Number,
        class: {type: String, default: "Sensor"},
        type: {type: String, default: "Radar"},
        Name: {type: String},
        effeciency: {type: Number, required: true},
        status: {
          Damaged: {type:Boolean, default: false},
          Destroyed: {type:Boolean, default:false}
      }
      }
    ],
    interceptorUpgrades: {
      upgraded: {type: Boolean, default: false}
    },
  },
  base: {
    _ID: Number,
    name: {type: String, required: true},
    zone: {type: String},
    country: {type:String},
    poi: {type:String},
    hanger: {type: String}
    },
  log: [
    {_ID: Number,
    time: {type: Number, required: true},
    turn: {type: String, required: true},
    type: {type: String, required: true},
    results: {
      interception: {type: Boolean, default: false, required: true},
      unitDamaged: {type: Boolean, default: false},
      unitDestroyed: {type: Boolean, default: false},
        enemy: {
          _ID: Number,
          enemyDamaged: {type: Boolean, default: false, required: true},
          enemyDestroyed: {type: Boolean, default: false, required: true},
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