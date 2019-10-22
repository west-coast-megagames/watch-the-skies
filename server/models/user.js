const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  screenname: { type: String, required: true },
  firstName: { type: String, required: true},
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: true }
});

module.exports = User = mongoose.model('user', UserSchema);