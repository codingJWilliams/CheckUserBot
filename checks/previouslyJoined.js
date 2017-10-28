// Checks against https://bans.discordlist.net/

// ALl modules should expose a function under module.check which takes a GuildMember object.
// They should return a promise which should be resolved with (true, str passReason) if check passes
// If check doesn't pass then it should be __resolved__ with (false, str failReason)

var userLeaveStorage = require("../helpers/userLeaveStorage.js");

exports.check = function (member) {
  return new Promise(function (resolve, reject) {
    userLeaveStorage.userInStorage(member).then( (inStorage) => {
      if (!inStorage) {
        resolve({
          pass: true,
          name: "Account has joined before?",
          reason: ":white_check_mark: The account has never joined this server before." 
        })
      } else {
        resolve({
          pass: false,
          name: "Account has joined before?",
          reason: ":x: Account has previously joined this server, then been kicked or left." 
        })
      }
    })
  })
}