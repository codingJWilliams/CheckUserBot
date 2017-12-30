// Checks against https://bans.discordlist.net/
// ALl modules should expose a function under module.check which takes a GuildMember object.
// They should return a promise which should be resolved with (true, str passReason) if check passes
// If check doesn't pass then it should be __resolved__ with (false, str failReason)
var moment = require("moment");
exports.check = function (member) {
  return new Promise(function (resolve, reject) {
    var passes = moment(member.user.createdTimestamp)
      .isBefore(moment()
        .subtract(2, "day"));
    if (passes) {
      resolve({
        pass: true,
        name: "Account Older than 2 days",
        reason: ":white_check_mark: Account made `" + moment(member.user.createdTimestamp)
          .fromNow() + "`."
      })
    } else {
      resolve({
        pass: false,
        name: "Account older than 2 days",
        reason: ":x: Account made `" + moment(member.user.createdTimestamp)
          .fromNow() + "`."
      })
    }
  })
}
