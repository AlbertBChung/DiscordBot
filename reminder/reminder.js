const TIMEZONESHIFT = 5;

exports.setReminder = function setReminder(args, now, callback){
  try{
    now = new Date(now);
    var time = processWhen(args.slice(1,3), now);

  } catch (err){
    console.log(err);
  }
  callback(time);
}

/**
* input timArr = [2/1/1998 , 10:32PM]
*/
const processWhen = function(timeArr, now){
  console.log(now, "now")
  var time = processSoonTime(timeArr[0], now); //already returns UTC
  if(time == null){
    now.setHours(now.getHours()-TIMEZONESHIFT);//timezone shift
    var dayInfo = timeArr[0].split('/');
    time = processDate(dayInfo, now);
    var timeInfo = timeArr[1].split(':');
    time = processTime(time, timeInfo, now);
    console.log(time,'minutes2', TIMEZONESHIFT);
    time.setHours(time.getHours()+TIMEZONESHIFT);//shift back to UTC
  }

  console.log(time, "time")
  return time;
}

/**
* input prompt = 1hour
*/
const processSoonTime = function(prompt, now){

  if(prompt.substring(prompt.length-4) === "hour" || prompt.substring(prompt.length-5) === "hours"){
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
    console.log(time, "time");
  } else {
    var month = parseInt(dayInfo[0]);
    var day = parseInt(dayInfo[1]);
    var year = dayInfo[2];
    if(year != undefined && year.length > 0){
      if (year.length == 2){
        year = '20' + year;
      }
    } else {
      year = now.getFullYear();
    }

    if(month < 1 || month > 12){
      throw 'month';
    }
    var tempDay = new Date(year, month, 0)
    if(day > tempDay.getDate() || day < 1){
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
  var hour = parseInt(timeInfoArr[0]);
  var min;

  if(timeInfoArr[1].substring(timeInfoArr[1].length-2) == 'am'){
    min = timeInfoArr[1].substring(0, timeInfoArr[1].length-2);
  } else if(timeInfoArr[1].substring(timeInfoArr[1].length-2) == 'pm'){
    min = timeInfoArr[1].substring(0, timeInfoArr[1].length-2);
    var hour = hour + 12;
    if(hour > 24){
      throw 'exceed24Hour';
    }
  } else {
    min =  timeInfoArr[1];
  }

  time.setHours(hour);
  time.setMinutes(min);
  console.log(time, 'minutes')
  return time;
}
