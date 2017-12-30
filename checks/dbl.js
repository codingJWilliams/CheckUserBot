// Checks against https://bans.discordlist.net/
// ALl modules should expose a function under module.check which takes a GuildMember object.
// They should return a promise which should be resolved with (true, str passReason) if check passes
// If check doesn't pass then it should be __resolved__ with (false, str failReason)
var request = require("request");
exports.check = function (member) {
  return new Promise(function (resolve, reject) {
    request.post({
      url: "https://bans.discordlist.net/api.php",
      form: {
        "token": "Yi8Qw9o48P",
        userid: member.id,
        version: "3"
      }
    }, function (err, httpResponse, body) {
      if (!err) {
        if (body === "False") {
          resolve({
            pass: true,
            name: "DiscordList.net Global Ban List",
            reason: ":white_check_mark: They're not banned on the discordlist.net ban list!"
          })
        } else {
          var jsonByte = JSON.parse(body.replace("\n", ""));
          resolve({
            pass: false,
            name: "DiscordList.net Global Ban List",
            reason: ":x: User **" + jsonByte[1] + "** was banned for *" + jsonByte[3] + "*. Case number `" + jsonByte[0] + "` on DBL. This info *may* be inaccurate. Take it with a pinch of salt"
          });
        }
      } else {
        reject(err)
      }
    })
  })
}
