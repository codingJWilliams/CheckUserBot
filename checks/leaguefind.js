// Checks against https://bans.discordlist.net/
// ALl modules should expose a function under module.check which takes a GuildMember object.
// They should return a promise which should be resolved with (true, str passReason) if check passes
// If check doesn't pass then it should be __resolved__ with (false, str failReason)
var moment = require("moment");
const Discord = require("discord.js");
exports.check = async function (member) {
  /**
   * @type {Discord.Client}
   */
  var selfclient = global.selfclient;
  var selfMember = await selfclient.guilds.get("300155035558346752")
    .fetchMember(member.id);
  var profile = await selfMember.user.fetchProfile();
  var badGuilds = ["297388957891690496"];
  if (profile.mutualGuilds.some(g => (badGuilds.indexOf(g.id) !== -1))) {
    return {
      pass: false,
      name: "Mutual Guild Check",
      reason: ":x: User is in: `" + profile.mutualGuilds.filter(g => (badGuilds.indexOf(g.id) !== -1))
        .map(g => g.name)
        .join(", ") + "`"
    });
} else {
  return {
    pass: true,
    name: "Mutual Guild Check",
    reason: ":white_check_mark: User isn't in any blacklisted guilds"
  });
}
}
