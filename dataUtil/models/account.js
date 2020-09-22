const mongoose = require("mongoose"); // Mongo DB object modeling module
const Joi = require("joi"); // Schema description & validation module
const { logger } = require("../middleware/winston"); // Loging midddleware
const nexusError = require("../middleware/util/throwError"); // Costom error handler util

// Global Constants
const Schema = mongoose.Schema; // Destructure of Schema
const { Team } = require("./team"); // Import of Team model [Mongoose]

// Transfer sub-schema
const TransferSchema = new Schema({
  to: { type: String },
  from: { type: String },
  amount: { type: Number },
  note: { type: String },
});

// Account Schema
const AccountSchema = new Schema({
  model: { type: String, default: "Account" },
  team: { type: Schema.Types.ObjectId, ref: "Team", require },
  owner: { type: String },
  name: { type: String, require },
  code: { type: String },
  balance: { type: Number, default: 0 },
  deposits: [Number],
  withdrawals: [Number],
  autoTransfers: [TransferSchema],
  gameState: [],
});

// validateAccount method
AccountSchema.methods.validateAccount = async function () {
  logger.info(`Validating ${this.model.toLowerCase()} ${this.name}...`);
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    code: Joi.string().min(3).max(3).required().uppercase(),
  };

  const { error } = Joi.validate(this, schema, { allowUnknown: true });
  if (error != undefined) nexusError(`${error}`, 400);

  if (this.team === undefined) nexusError("No team ID...", 400);
  if (!mongoose.Types.ObjectId.isValid(this.team))
    nexusError("Invalid Team ID...", 400);

  const team = await Team.findById(this.team);
  if (team.length < 1)
    nexusError(`No team exists with the ID: ${this.team}`, 400);
};

const Account = mongoose.model("account", AccountSchema); // Creation of Account Model

module.exports = { Account };
