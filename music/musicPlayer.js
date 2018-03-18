const Discord = require('discord.js');
var YouTube = require('youtube-node');
var youTube = new YouTube();
var YTDL = require('ytdl-core');
youTube.setKey(process.env.YOUTUBE_KEY);
var Music = require('../database/models/music');
var Util = require('../util/util');
const numOfOptions = 4;
var dispatcher = [];







Music.remove({ }, function (err) {
  if (err) return handleError(err);
  console.log('d all')
});
/**
  STEPS:
  1. fetch youtube videos
  2. send embeds to channels
  3. remember sent embeds
  4. accept numeric reply
  5. delete sent embeds
  6. adds to queue.

*/

var getPlayer = function(serverId, callback){
  Music.findOne({ 'serverId': serverId}, function (err, musicPlayer) {
    if (err)  console.log(err);
    if(!musicPlayer){
      var musicPlayer = Music({
        serverId: serverId,
        queue: [],
        choicesList: [],
        metaDataList: [],
        userId: '',
        channel: '',
      });
      musicPlayer.save(function(err) {
        if (err) throw err;
        console.log('New music player', musicPlayer);
        callback(musicPlayer);
      });
    } else {
      callback(musicPlayer)
    }


  });
}

exports.music = function music(args, message){

  getPlayer(message.guild.id, function(musicPlayer){
    switch(args[1]){
      case 'play':
        if(!message.member.voiceChannel){
          message.channel.send('Join a voice channel first')
          return
        }
        if(musicPlayer.queue[0]){
          if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
            play(connection, musicPlayer, message.channel);
          }).catch(function(err){console.log(err)})
        } else {
          message.channel.send('Queue is empty! Add a song');
        }
        break;

      case 'add':
        if(!args.slice(2).join(' ')){
          message.channel.send('Enter search words for youtube video');
        } else {
          getVids(args.slice(2).join(' ')).then(function(vidsList){
            sendList(vidsList , message, musicPlayer)
          }).catch(console.log);
        }
        break;
      case 'skip':
        if(dispatcher[musicPlayer.serverId]) dispatcher[musicPlayer.serverId].end();
        break;
      case 'stop':
        if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        break;
      case 'help':
        message.channel.send('\`music [play, add, skip, stop]');
        break;
      default:

    }


  });
}


var sendList = function(vidsList, discord_message, musicPlayer){
  var count = 0;
  var messages = [];

  vidsList.forEach(function(vid){
    var embed = new Discord.RichEmbed()
      .addField(vid.index+')  '+vid.title, vid.channel, true)
      .setThumbnail(vid.thumbnailUrl)

    discord_message.channel.send('',embed).then(function(m){
      messages[count] = m.id;
      count++;
      if(count == numOfOptions){

        musicPlayer.userId = discord_message.author;
        musicPlayer.channel = discord_message.channel;
        musicPlayer.choicesList = messages;
        musicPlayer.metaDataList = vidsList;

        musicPlayer.save(function (err, updatedMusic) {
          if (err) console.log(err);
          console.log('listed music options!',updatedMusic);
        });

      }
    }).catch(console.error);
  })

}



var getVids = function(searchString){
  return new Promise(function(resolve, reject){
    youTube.search(searchString, numOfOptions, {'type': 'video'}, function(error, result) {
      if (error) {
        reject(error);
      }
      else {
        var vidsList = [];
        var idx = 1;
        result.items.forEach(function(vid){
          vidsList.push({
            id: vid.id.videoId,
            index: idx,
            title: vid.snippet.title,
            thumbnailUrl: vid.snippet.thumbnails.high.url,
            channel: vid.snippet.channelTitle,
          });
          idx++;
        });
        resolve(vidsList);
      }
    })
  })
}

exports.doesExist = function(server, author, channel){
  return new Promise(function(resolve, reject){
    Music.findOne({ 'serverId': server, 'userId': author, 'channel':channel }, function (err, music) {
      if (err)  reject(err);
      resolve(music);
    });
  })
}

exports.handleSelect = function(message, music){
  var choice = parseInt(message.content)
  if(Number.isInteger(choice) && choice > 0 && choice <= numOfOptions){
    var embed = new Discord.RichEmbed()
      .addField(music.metaDataList[choice-1].title, music.metaDataList[choice-1].channel, true)
      .setThumbnail(music.metaDataList[choice-1].thumbnailUrl);
    message.channel.send('Added to queue:',embed);
    music.queue.push('https://www.youtube.com/watch?v='+music.metaDataList[choice-1].id);
    music.metaDataList = [];
    music.userId = '';
    music.channel = '';
    music.choicesList.forEach(function(embedId){
      message.channel.fetchMessage(embedId).then(message => message.delete()).catch(console.log)
    });
    music.save(function(err) {
      if (err) throw err;
      console.log('reset Music player');
    });
  } else {
    Util.throwError(message.channel)
  }
}


var play = function(connection, musicPlayer, channel){
  const streamOptions = { volume: .03 };
  console.log(musicPlayer.queue[0])
  dispatcher[musicPlayer.serverId] = connection.playStream(YTDL(musicPlayer.queue[0], {filter: 'audioonly'}), streamOptions);
  musicPlayer.queue.shift();
  musicPlayer.save(function(err) {
    if (err) throw err;
  });
  dispatcher[musicPlayer.serverId].on('end', function(){
    var rand = Math.floor((Math.random() * 20) + 1);
    if(rand == 1){
      musicPlayer.queue.unshift('https://www.youtube.com/watch?v=2cjbSgy3vSw');
      var embed = new Discord.RichEmbed()
        .addField('AHHHHHHHHHHHHHHHHHHHHHHHHH', 'GO FURTHER BEYONDDD', true)
        .setThumbnail('https://i.ytimg.com/vi/2cjbSgy3vSw/hqdefault.jpg')
      channel.send('decided to disobey and play whatever I want',embed);
    }
    if(musicPlayer.queue[0]){
      play(connection, musicPlayer, channel);
    } else {
      connection.disconnect();
    }
  })
}
