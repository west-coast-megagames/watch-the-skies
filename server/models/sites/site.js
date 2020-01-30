const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Schema = mongoose.Schema;

const SiteSchema = new Schema({
    country: { type: Schema.Types.ObjectId, ref: 'Country'},
    siteCode: { type: String, minlength: 2, maxlength: 50 }
});

let Site = mongoose.model('site', SiteSchema);

module.exports = Site;