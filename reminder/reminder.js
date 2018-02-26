var Reminder = require('../database/models/reminder');
var Util = require('../util/util');
/**
Reminder.remove({ }, function (err) {
  if (err) return handleError(err);
  // removed!
});
*/

exports.setReminder = function setReminder(args, message, callback){

  var time = processWhen(args.slice(1,3), message);
  var wordCount = time[1];
  time = time[0];

  var target = [];
  var tagTest = /<[^:].+>/
  while(tagTest.test(args[1+wordCount])){
    target.push(args[1+wordCount]);
    wordCount++;
  }
  if(target.length == 0){
    target.push(message.author);
  }

  //remindme 1hour @smash message
  var text = args.slice(1+wordCount).join(" ");
  var newReminder = Reminder({
    userId: message.author,
    target: target,
    channel: message.channel,
    message: text,
    date: time,
  });


  // save the reminder
  newReminder.save(function(err) {
    if (err) throw err;

    console.log('Reminder Set!');
    console.log(newReminder);
    var timeZoneShift = getTimeZoneShift(message.channel.guild.region);
    time.setHours(time.getHours()-timeZoneShift);
    callback(time.toLocaleString('en-GB', { timeZone: 'UTC'}));
  });

}

/**
* input timArr = [2/1/1998 , 10:32PM]
*/
const processWhen = function(timeArr, message){
  var now = new Date(message.createdAt);
  var timeZoneShift = getTimeZoneShift(message.channel.guild.region);
  var wordCount = 1; //check between '1hour' vs '10/20 10:30pm'

  var time = processSoonTime(timeArr[0], now); //already returns UTC
  if(time == null){
    now.setHours(now.getHours()-timeZoneShift);//timezone shift
    var dayInfo = timeArr[0].split('/');
    time = processDate(dayInfo, now);
    var timeInfo = timeArr[1].split(':');
    time = processTime(time, timeInfo, now);
    time.setHours(time.getHours()+timeZoneShift);//shift back to UTC
    wordCount = 2;
  }

  return [time, wordCount];
}

const getTimeZoneShift = function(region){
  switch(region){
    case 'us-east':
      return 5; break;
    case 'us-central':
        return 6; break;
    case 'us-west':
      return 8; break;
  }
}

/**
* input prompt = 1hour
*/
const processSoonTime = function(prompt, now){

  if(prompt.substring(prompt.length-3) === "sec" || prompt.substring(prompt.length-4) === "secs"){
    var shift = (prompt.substring(prompt.length-3) === "sec") ? 3:4;
    var number = parseInt(prompt.substring(0, prompt.length - shift));
    if(number < 1){
      throw 'GT0';
    }
    now.setSeconds(now.getSeconds()+number);
  } else if(prompt.substring(prompt.length-4) === "hour" || prompt.substring(prompt.length-5) === "hours"){
    var shift = (prompt.substring(prompt.length-4) === "hour") ? 4:5;
    var number = parseInt(prompt.substring(0, prompt.length - shift));
    if(number < 1){
      throw 'GT0';
    }
    now.setHours(now.getHours()+number);
  } else if(prompt.substring(prompt.length-3) === "min" || prompt.substring(prompt.length-4) === "mins") {
    var shift = (prompt.substring(prompt.length-3) === "min") ? 3:4;
    var number = parseInt(prompt.substring(0, prompt.length - shift));
    if(number < 1){
      throw 'GT0';
    }
    now.setMinutes(now.getMinutes()+number);
  } else if((prompt.substring(prompt.length-3) === "day" || prompt.substring(prompt.length-4) === "days") && prompt.substring(prompt.length-5) !== "today") {
    var shift = (prompt.substring(prompt.length-3) === "day") ? 3:4;
    var number = parseInt(prompt.substring(0, prompt.length - shift));
    if(number < 1){
      throw 'GT0';
    }
    now.setDate(now.getDate()+number);
  } else if(prompt.substring(prompt.length-5) === "month" || prompt.substring(prompt.length-6) === "months") {
    var shift = (prompt.substring(prompt.length-5) === "month") ? 5:6;
    var number = parseInt(prompt.substring(0, prompt.length - shift));
    if(number < 1){
      throw 'GT0';
    }
    now.setMonth(now.getMonth()+number);
  } else if(prompt.substring(prompt.length-4) === "year" || prompt.substring(prompt.length-5) === "years") {
    var shift = (prompt.substring(prompt.length-4) === "year") ? 4:5;
    var number = parseInt(prompt.substring(0, prompt.length - shift));
    if(number < 1){
      throw 'GT0';
    }
    now.setFullYear(now.getFullYear()+number);
  } else {
    return null;
  }
  return now;
}

/**
* input prompt = ['tomorrow']
* input prompt = ['2', '11', '1998']
*/
const processDate = function(dayInfo, now){
  var time;

  if(dayInfo[0] == 'today'){
    time = now;
  } else if( dayInfo[0] == 'tomorrow'){
    time = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
  } else {
    var month = parseInt(dayInfo[0]);
    var day = parseInt(dayInfo[1]);
    var year = dayInfo[2];

    if(year != undefined && year.length > 0){
      if(year%1!=0 || (year.length != 2 && year.length != 4)){
        throw 'year';
      }
      if (year.length == 2 ){
        year = '20' + year;
      }
    } else {
      year = now.getFullYear();
    }

    if(month%1!=0 || month < 1 || month > 12){
      throw 'month';
    }
    var tempDay = new Date(year, month, 0)
    if(day%1!=0 || day > tempDay.getDate() || day < 1){
      throw 'day';
    }
    time = new Date( year, month-1, day ); //-1 is just required.

  }

  return time;
}

/**
* input prompt = ['10', '30PM']
*/
const processTime = function(time, timeInfoArr, now){

  if(timeInfoArr.length == 1){
    var h = timeInfoArr[0];
    if(h.substring(h.length-2) == 'am' || h.substring(h.length-2) == 'pm'){
      timeInfoArr[1] = '00' + h.substring(h.length-2);
    } else {
      timeInfoArr[1] = '00';
    }
  }

  var hour = parseInt(timeInfoArr[0]);
  var min;



  if(timeInfoArr[1].substring(timeInfoArr[1].length-2) == 'am'){
    min = timeInfoArr[1].substring(0, timeInfoArr[1].length-2);
  } else if(timeInfoArr[1].substring(timeInfoArr[1].length-2) == 'pm'){
    min = timeInfoArr[1].substring(0, timeInfoArr[1].length-2);
    var hour = hour + 12;
  } else {
    min =  timeInfoArr[1];
  }

  if(hour > 23 || hour < 0 || min > 59 || min < 0 || hour%1!=0 || min%1!=0){
    throw 'exceed24Hour';
  }

  time.setUTCHours(hour);
  time.setUTCMinutes(min);
  return time;
}



exports.checkReminders = function(bot){
  setInterval(function(){
    Reminder.find( {date: {$lte : new Date()}}, function(err, rems){
      rems.forEach(function(r){
        Reminder.remove({ _id: r._id}, function (err) {
          if (err) console.log(err);
          console.log('deleted');
        });

        reply(bot, r);
      });
    })
  }, 1000);
}


const reply = function(bot, reminder){
  var channel = bot.channels.get(Util.stripTag(reminder.channel));
  inChannelTargetsStr = '';
  reminder.target.forEach(function(t){
    var id = Util.stripTag(t);
    var target = bot.users.get(id);
    if(target == undefined){
      inChannelTargetsStr = inChannelTargetsStr.concat(' '+t);
    } else {
      if(reminder.message){
        target.send('Reminder: \"'+reminder.message+'\"\n - set by ' + reminder.userId);
      } else {
        target.send('Reminder!\n - set by ' + reminder.userId);
      }
    }
  });

  if(inChannelTargetsStr){ //if exists
    if(reminder.message){
      channel.send('Reminder: '+inChannelTargetsStr+' \"'+reminder.message+'\"\n - set by ' + reminder.userId);
    } else {
      channel.send('Reminder: '+inChannelTargetsStr + '\n - set by ' + reminder.userId);
    }

  }

}
