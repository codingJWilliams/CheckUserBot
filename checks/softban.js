// Checks against https://bans.discordlist.net/
// ALl modules should expose a function under module.check which takes a GuildMember object.
// They should return a promise which should be resolved with (true, str passReason) if check passes
// If check doesn't pass then it should be __resolved__ with (false, str failReason)
var moment = require("moment");
exports.check = function (member) {
  return new Promise(function (resolve, reject) {
    delete require.cache[require.resolve("../ban.json")];
    var passes = require("../ban.json")
      .indexOf(member.id) === -1;
    Array.prototype.in
    if (passes) {
      resolve({
        pass: true,
        kick: false,
        name: "Softbanned?",
        reason: ":white_check_mark: The user was not softbanned."
      })
    } else {
      resolve({
        pass: false,
        kick: true,
        name: "Softbanned?",
        reason: ":x: User was softbanned."
      })
    }
  })
}
