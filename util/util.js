
//turns <#1234567890> or <@!1234567890> to 1234567890
exports.stripTag = function(tag){
  strTest = /[0-9]+/;
  return strTest.exec(tag)[0];
}

exports.throwError = function(channel){
  channel.send('Can\'t recognize the command.');
}
