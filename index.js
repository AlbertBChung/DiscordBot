const Discord = require('discord.js');
require('dotenv').load();
const TOKEN = process.env.TOKEN;
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const PREFIX = "\`"

const reminder = require('./reminder/reminder');
const musicPlayer = require('./music/musicPlayer');
const Util = require('./util/util');



var bot = new Discord.Client();

bot.on('ready', function(message){
  console.log('ready');

  reminder.checkReminders(bot);
});

bot.on('message', function(message){
  if(message.author.equals(bot.user)) return;

  if(!isNaN(parseInt(message.content))){
    Util.handleOptionSelect(message);
  }

  if(!message.content.startsWith(PREFIX)) return;

  var args = message.content.substring(PREFIX.length).split(' ');

  switch(args[0].toLowerCase()){
    case 'remindme':
      try{
        reminder.setReminder(args, message, function(time){
            message.channel.send('Message noted. Reminder at '+time);
        });
      } catch (err){
        console.log("reminder-error");
        Util.throwError(message.channel);
      }

      break;
    case 'music':
        musicPlayer.music(args, message);
        break;
    case 'introduce-bot':
        message.channel.send('Hi I\'m AIBot');
        console.log(bot.users.get('229979748959387648'));
        break;
    default:
  }
});

bot.login(TOKEN);


console.log("BOT booted.");
