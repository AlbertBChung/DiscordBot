

exports.setReminder = function setReminder(bot, args){
  var time;
  var message;
  var today = new Date();

  switch(args[1]){ //process day.
    case 'today':
      time = today;
      break;
    case 'tomorrow':
      time = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1);
      break;
    default:
      // 1/2/20
      var dayInfo = args[1].split('/');

      if(dayInfo[2] != undefined){
        if (dayInfo[2].length == 2){
          dayInfo[2] = '20' + dayInfo[2];
        }
      } else {
        dayInfo[2] = today.getFullYear();
      }

      
      time = new Date( dayInfo[2], parseInt(dayInfo[0]-1), dayInfo[1] );
  }

  console.log(time);

}
