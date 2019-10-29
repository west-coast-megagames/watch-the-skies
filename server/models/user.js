const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  screenname: { type: String, required: true, unique: true, minlength: 5, maxlength: 15 },
  name: {
    first: { type: String, required: true, minlength: 3, maxlength: 25 },
    last: { type: String, required: true, minlength: 3, maxlength: 50 }
  },
  email: { type: String, required: true, minlength: 5, maxlength: 255 },
  password: {type: String, required: true, minlength: 5, maxlength: 1024},
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Non-Binary"]},
});

module.exports = User = mongoose.model('user', UserSchema);