const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterceptorSchema = new Schema({
  _ID: 0,
  designation: { type: String, required: true },
  type: { type: String, default: "Interceptor", required: true},
  team: String,
  location: { 
    zone: String, 
    country: String, 
    poi: String
  },
  status: { 
    ready: { type: Boolean, default: true },
    damaged: { type: Boolean, default: false },
    upgrading: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    destroyed: { type: Boolean, default: false },
    repairing: {type: Boolean, default: false},
    interceptable: { type: Boolean, default: false },
  },
  stats: {
    hull: { type: Number, default: 100 },
    hullMax: { type: Number, default: 100 },
    shield: { type: Number, default: 20 },
    ShieldMax: { type: Number, default: 20 },
    Systems: [
      {_ID: 1,
        class: "Weapon",
        type: {type: String, default: "Conventional"},
        Name: {type: String},
        Damage: {type: Number, default: 20}
      }, 
      {_ID: 2,
        class: "Sensor",
        type: "Radar",
        Name: String,
        effeciency: {type: Number}
      }
    ],
    interceptorUpgrades: {
      upgraded: {type: Boolean, default: false}
    },
  },
base: {
    _ID: 3,
    name: {type: String},
    zone: {type: String},
    country: {type:String},
    poi: {type:String},
    hanger: {type: String}
    },
log: [
  {_ID: 4,
  time: {type: Number},
  turn: {type: String},
  type: {type: String},
    results: {
      interception: {type: Boolean, default: false},
      unitDamaged: {type: Boolean, default: false},
      unitDestroyed: {type: Boolean, default: false},
        enemy: {
          _ID: 5,
          enemyDamaged: {type: Boolean, default: false},
          enemyDestroyed: {type: Boolean, default: false},
          artifact: [
            {
              _ID: 6,
              recoverable: {type: Boolean, default: false},
              class: {type: String},
              type: {type:String},
              country: {type:String}
              }
            ]
          }
        }
      }
    ]
  },
);

module.exports = Interceptor = mongoose.model('interceptor', InterceptorSchema)