var Music = require('../music/musicPlayer');

//turns <#1234567890> or <@!1234567890> to 1234567890
exports.stripTag = function(tag){
  strTest = /[0-9]+/;
  return strTest.exec(tag)[0];
}

exports.throwError = function(channel){
  channel.send('Can\'t recognize the command.');
}

exports.handleOptionSelect = function(message){
  //check if its selecting a song
  Music.doesExist(message.guild.id, message.author.toString(), message.channel.toString())
    .then(function(obj){
      if(obj){
        Music.handleSelect(message, obj);
      } else {
        console.log('invalid select', message.content)
      }
    });
}


exports.idListToPingList = function(id_list){
  id_list = id_list.map(ele => '<@' + ele + '>')
  var append = (list, ele) => {return list + ', ' + ele}
  return id_list.reduce(append)
}
