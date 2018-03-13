var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var musicSchema = new Schema({
  serverId: { type: String, required: true },
  queue: [{ type: String, required: true }], //youtube urls
  choicesList: [{ type: String }], //this is the sent embeds
  metaDataList: [{ id: String, index: Number, title: String, thumbnailUrl: String, channel: String }],
  userId: { type: String },
  channel: { type: String },
});


// we need to create a model using it
var Music = mongoose.model('Music', musicSchema);

// make this available to our users in our Node applications
module.exports = Music;
