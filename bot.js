var token = require("./token.json").token;
const Discord = require("discord.js");
const client = new Discord.Client();
var checks = require("./helpers/checks.js");
var fs = require("fs");
var userLeaveStorage = require("./helpers/userLeaveStorage");
var options = {
  ownerID: "193053876692189184",
  serverName: "Nightborn Estate",
  logChannelName: "checkuser-logs"
}
function clean(text) {
  if (typeof(text) === "string") { return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)) }
  else { return text };
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
function doAutoban(arg) {
  var flags = JSON.parse(require("fs").readFileSync("./storage/flags.json"))
  flags.autoban = arg;
  fs.writeFileSync("./storage/flags.json", JSON.stringify(flags))
}
function getAutoban() {
  var flags = JSON.parse(require("fs").readFileSync("./storage/flags.json"))
  return flags.autoban
}
// Eval command. Only for Void
client.on("message", message => {
  const args = message.content.split(" ").slice(1);
  if (message.content.startsWith("cu.eval")) {
    if(message.author.id !== options.ownerID) return;
    try {
      let evaled = eval(args.join(" "));
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
      message.channel.send(clean(evaled), {code:"xl"});
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
  if (message.content.startsWith("cu.silenteval")) {
    if(message.author.id !== options.ownerID) return;
    try {
      let evaled = eval(args.join(" "));
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
      //message.channel.send(clean(evaled), {code:"xl"});
    } catch (err) {
      //message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
});
client.on("guildMemberRemove", member => {
  userLeaveStorage.userLeft(member);
})
client.on('guildMemberAdd', member => {
  if (member.guild.name === options.serverName) {
    checks.check(member).then( results => {
      if (results.pass) {
        // If user has passed test, send a positive message
        member.guild.channels.find("name", options.logChannelName).send({
          "embed": {
            "title": `${member.user.username}#${member.user.discriminator} joined the server`,
            "description": "All the checks passed. **itz kk guyz :ok_hand:**",
            "color": 524032,
            "footer": {
              "text": `${results.passed.length}/${results.passed.length} checks passed`
            },
            "author": {
              "name": `New Member`
            }
          }
        });
      } else { // User failed one or more tests
        console.log(member.user.username)
        member.guild.channels.find("name", options.logChannelName)
        .send(
          checks.pretty(results, member.user.username + "#" + member.user.discriminator)
        );
        var flags = JSON.parse(require("fs").readFileSync("./storage/flags.json"))
        if (flags.autoban) {
          member.ban({
            reason: "CheckUser Failed",
            days: 1
          })
        }
        
        // :-)
      }
    } )
  }
});

client.login(token);