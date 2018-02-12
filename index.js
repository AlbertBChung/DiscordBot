const Discord = require('discord.js');
require('dotenv').load();
const TOKEN = process.env.TOKEN;
const PREFIX = "!"

const reminder = require('./reminder/reminder');




var bot = new Discord.Client();

bot.on('ready', function(message){
  console.log('ready');
});

bot.on('message', function(message){
  if(message.author.equals(bot.user)) return;
  if(!message.content.startsWith(PREFIX)) return;

  var args = message.content.substring(PREFIX.length).split(' ');

  switch(args[0].toLowerCase()){
    case 'remindme':
      reminder.setReminder(args, message.createdAt, function(time){
        
        message.channel.send('Reminder in UTC set for: '+time);
      });
      break;
    case 'introduce-bot':
        message.channel.send('Hi all, I am JoonBot (temporarily), I am currently being developed under the rule of Joon Lee. I am looking for developers to help me grow. This includes backend server, database, frontend, and simple HTML/CSS, so the only prerequisite is that you have seen code before. I dont care what your skills are as long as you are down to learn. Reply if you want to contribute :) hehexd');
    default:
  }
});

bot.login(TOKEN);


console.log("BOT booted.");
