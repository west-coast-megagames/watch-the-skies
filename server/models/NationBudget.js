const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const NationalSchema = new Schema({
  _ID: Number,
  designation: { type: String, required: true },
  type: { type: String, default: "Player Nation", required: true},
  team: String,
  location: {
      zone: String,
      country: {type: String, required: true}
  },
  incomeAt: [
      {PR: 1,
        Income: {type:Number, required:true}
      },
      {PR: 2,
        Income: {type:Number, required:true}
      },
      {PR: 3,
        Income: {type:Number, required:true}
      },
      {PR: 4,
        Income: {type:Number, required:true}
      },
      {PR: 5,
        Income: {type:Number, required:true}
      },
      {PR: 6,
        Income: {type:Number, required:true}
      },
      {PR: 7,
        Income: {type:Number, required:true}
      },
      {PR: 8,
        Income: {type:Number, required:true}
      },
      {PR: 8,
        Income: {type:Number, required:true}
      }
    ],
    terror: {type:String, required:true},
    secretBases: [
        { designation: {type:String, required:true},
        location: {
            zone: String,
            country: {type:String, required:true},
            poi: {type:String, required:true}
        },
        hangers: [
            {_ID:Number,
                hanger1: [{
                    hangerSpace: {type:String, required:true},
                    inUse: {type:Boolean, required:true},
                    interceptorStored: {type:Number}
                },
                {
                  hangerSpace: {type:String, required:true},
                  inUse: {type:Boolean, required:true},
                  interceptorStored: {type:Number}
                },
                {
                  hangerSpace: {type:String, required:true},
                  inUse: {type:Boolean, required:true},
                  interceptorStored: {type:Number}
                },
                {
                  hangerSpace: {type:String, required:true},
                  inUse: {type:Boolean, required:true},
                  interceptorStored: {type:Number}
                },
                {
                  hangerSpace: {type:String, required:true},
                  inUse: {type:Boolean, required:true},
                  interceptorStored: {type:Number}
                }
              ]
            }
        ]

        }
    ], 
    budgeting: {
      treasury: {type:Number, required:true},
      allotment: {
        military: {type:Number, required:true},
        diplomacy: {type:Number, required:true},
        science: {type:Number, required:true},
        governance: {type:Number, required:true}
      }
    }
  } 
)
  
