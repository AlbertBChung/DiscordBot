const Discord = require('discord.js');
require('dotenv').load();

const TOKEN = process.env.TOKEN;

var bot = new Discord.Client();

bot.on('ready', function(message){
  console.log('ready');
});

bot.on('message', function(message){
  if(message.author.equals(bot.user)) return;

  if(message.content == "hello bot"){
    message.channel.send('hello '+message.author);
  }
});

bot.login(TOKEN);


console.log("BOT booted.");
