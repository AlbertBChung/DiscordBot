var Util = require('../util/util');
var moment = require('moment');

const LEAGUE_PING = '<@&357995607639588876>'
//<@&357995607639588876>
const BOT_ID = '415016319738445831'

const NOW = '⚔'
const LATER = '🛡'
const NIGHT = '🌃'
const NO = '🏳'

const prompt = 'React for gamez\n⚔: now\n🛡: later\n🌃: night\n🏳: not today\n\ndont spam reacts its gonna ping everyone'
var partyData = {};



var find_and_ping_diff = function(game, new_l, old_l, list_field, user_id, channel) {
  new_l = new_l.filter(user => user != BOT_ID && user != user_id);

  let joined = old_l.length > 0 ? (new_l.filter(u => !old_l.includes(u))) : new_l;
  let left = new_l.length > 0 ? (old_l.filter(u => !new_l.includes(u))) : old_l;
  let group = list_field.split('_')[0].toUpperCase()

  if (joined.length > 0) {
    channel.send(Util.idListToPingList(joined) + ' joined the ' + group + ' party! [' + game.toUpperCase() + '] ' +
      partyData[user_id][game].ping).then((message) => {
      message.delete()
    }).catch(() => {
      console.log("ERR")
    });
    partyData[user_id][game][list_field] = new_l
  }
  if (left.length > 0) {
    channel.send(Util.idListToPingList(left) + ' left the ' + group + ' party! [' + game.toUpperCase() + '] ' +
      partyData[user_id][game].ping).then((message) => {
      message.delete()
    }).catch(() => {
      console.log("ERR")
    });
    partyData[user_id][game][list_field] = new_l
  }
}

var check_joiners = function(user, game) {
  msg = partyData[user.id][game].message
  reacts = msg.reactions

  now_lst = reacts.get(NOW).users.map(u => u.id)
  later_lst = reacts.get(LATER).users.map(u => u.id)
  night_lst = reacts.get(NIGHT).users.map(u => u.id)
  no_lst = reacts.get(NO).users.map(u => u.id)

  find_and_ping_diff(game, now_lst, partyData[user_id][game].now_lst, 'now_lst', user_id, msg.channel)
  find_and_ping_diff(game, later_lst, partyData[user_id][game].later_lst, 'later_lst', user_id, msg.channel)
  find_and_ping_diff(game, night_lst, partyData[user_id][game].night_lst, 'night_lst', user_id, msg.channel)
}

exports.handleParty = function(user, game, channel) {
  channel.send(user + ' has started a party! [' + game.toUpperCase() + '] ' +
    LEAGUE_PING + '\n' + prompt).then(message => {
    message.react(NOW).then(() => {
      message.react(LATER).then(() => {
        message.react(NIGHT).then(() => {
          message.react(NO).then(() => {
            user_id = user.id
            //stop check if new party
            if (partyData[user_id] == undefined) {
              partyData[user_id] = {}
            }
            if (partyData[user_id][game] && partyData[user_id][game].repeater) {
              clearTimeout(partyData[user_id][game].repeater);
            }

            partyData[user_id][game] = {
              now_lst: [],
              later_lst: [],
              night_lst: [],
              no_lst: [],
              message: message,
              ping: LEAGUE_PING,
              repeater: setInterval(() => {
                check_joiners(user, game)
              }, 1000)
            }

            //reset at 6am next day
            setTimeout(function() {
              clearTimeout(partyData[user_id][game].repeater);
            }, moment(new Date().setHours(6)).add(1, 'days') - moment());
          })
        })
      })
    })
  });
}
