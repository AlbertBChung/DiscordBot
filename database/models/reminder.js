// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var reminderSchema = new Schema({
  userId: { type: String, required: true },
  target: [{ type: String, required: true }],
  channel: { type: String },
  message: { type: String },
  date: { type: Date, required: true},
});


// we need to create a model using it
var Reminder = mongoose.model('Reminder', reminderSchema);

// make this available to our users in our Node applications
module.exports = Reminder;
