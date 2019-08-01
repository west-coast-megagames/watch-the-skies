const mongoose = require('mongoose');
const Schema = mongoose.Schema;

  // budget brainstorming: 
  //1. is player,
  //2. country, 
  //3. location, 
  //4. Pr - Income, 
  //5. Terror,  
  //6. bases, 
  //7. hangers and interceptors stored,  
  //8. Budget divided how?, 
  //9. Anything someone else needs to pull //

const BudgetSchema = new Schema({
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
      },
      {PR: 9,
        Income: {type:Number, required:true}
      },
      {PR: 10,
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
    ]
  } 
)
  
