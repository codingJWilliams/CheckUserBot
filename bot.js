var token = require("./token.json")
  .token;
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
console.log("ayy")
var dogapi = require("dogapi");
var options = {
  api_key: require("./token.json")
    .datadog.apikey,
  app_key: require("./token.json")
    .datadog.appkey,
};
dogapi.initialize(options);
console.log("lmao")

function clean(text) {
  if (typeof (text) === "string") {
    return text.replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
  } else {
    return text
  };
}
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

function doAutoban(arg) {
  var flags = JSON.parse(require("fs")
    .readFileSync("./storage/flags.json"))
  flags.autoban = arg;
  fs.writeFileSync("./storage/flags.json", JSON.stringify(flags))
}

function getAutoban() {
  var flags = JSON.parse(require("fs")
    .readFileSync("./storage/flags.json"))
  return flags.autoban
}
// Eval command. Only for Void
client.on("message", message => {
  const args = message.content.split(" ")
    .slice(1);
  if (message.content.startsWith("cu.eval")) {
    if (message.author.id !== options.ownerID) return;
    try {
      let evaled = eval(args.join(" "));
      if (typeof evaled !== "string") evaled = require("util")
        .inspect(evaled);
      message.channel.send(clean(evaled), {
        code: "xl"
      });
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
  if (message.content.startsWith("cu.silenteval")) {
    if (message.author.id !== options.ownerID) return;
    try {
      let evaled = eval(args.join(" "));
      if (typeof evaled !== "string") evaled = require("util")
        .inspect(evaled);
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
  console.log(member.user.tag + " slid in")
  client.guilds.get("300155035558346752")
    .members.get("102791315690901504")
    .createDM()
    .then(dm => {
      dm.send(member.user.tag + " just slid into Nightborn :D")
    })
  if ( /*member.guild.name === options.serverName*/ true) {
    var flags = JSON.parse(require("fs")
      .readFileSync("./storage/flags.json"));
    if (!flags.allowNewMembers) {
      member.createDM()
        .then(d => {
          d.send("An admin has disabled joining this server. Please try again later")
            .then(() => {
              member.kick("Joins Disabled");
              member.guild.channels.find("name", options.logChannelName)
                .send(new Discord.RichEmbed()
                  .setTitle("Kicked Member")
                  .setDescription(member.user.username + "#" + member.user.discriminator + " joined while new member joining is disabled D:")
                  .addBlankField()
                  .addField("Was this a mistake?", "Dons can disable this with `nb.flag allowNewMembers yes`")
                  .setColor(0x42F4EE))
            });
        });
      return;
    }
    checks.check(member)
      .then(results => {
        if (results.kick) {
          member.createDM()
            .then(d => {
              d.send({
                  embed: {
                    title: "You are softbanned from nightborn",
                    description: "If this is a mistake please contact @VoidCrafted#2483",
                    color: 0xFFFF00
                  }
                })
                .then(() => {
                  member.kick("Raid");
                  member.guild.channels.find("name", options.logChannelName)
                    .send(new Discord.RichEmbed()
                      .setTitle("Kicked Member")
                      .setDescription(member.user.username + "#" + member.user.discriminator + " is softbanned and has been thusly kicked.")
                      .setColor(0x42F4EE))
                });
            });
          return;
        }
        if (results.pass) {
          // If user has passed test, send a positive message
          member.guild.channels.find("name", options.logChannelName)
            .send({
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
          console.log("passed")
          dogapi.metric.send("checkuser.memberChecked", [
            1
          ], {
            type: "count",
            tags: ["success:y"]
          }, function (err, results) {
            console.log(err, results)
          })
        } else { // User failed one or more tests
          console.log(member.user.username)
          dogapi.metric.send("checkuser.memberChecked", [
            1
          ], {
            type: "count",
            tags: ["success:n"]
          }, function (err, results) {
            console.log(err, results)
          })
          member.guild.channels.find("name", options.logChannelName)
            .send(checks.pretty(results, member.user.tag, member.user.displayAvatarURL));
          var flags = JSON.parse(require("fs")
            .readFileSync("./storage/flags.json"));
          if (flags.autoban) {
            member.ban({
              reason: "CheckUser Failed",
              days: 1
            })
          }
          // :-)
        }
      })
  }
});
client.on("messageReactionAdd", async(messageReaction, user) => {
  console.log("React add")
  var channel = messageReaction.message.channel;
  console.log("Got channel")
  if (channel.name !== "welcome") return;
  if (!(messageReaction.emoji == "🚨" || messageReaction.emoji == "⛔")) return;
  console.log("Passed react chek")
  console.log(messageReaction.message.id)
  //if (messageReaction.message.id !== "392743506445074432") return;
  var labBunnyRole = "392736357715542017";
  var optoutRole = "392736650498932739";
  if (messageReaction.emoji.name === "🚨") {
    var member = await client.guilds.get("300155035558346752")
      .fetchMember(user);
    await member.addRole(labBunnyRole)
  } else if (messageReaction.emoji.name === "⛔") {
    var member = await client.guilds.get("300155035558346752")
      .fetchMember(user);
    await member.addRole(optoutRole)
  }
})
client.on("messageReactionRemove", async(messageReaction, user) => {
  console.log("React add")
  var channel = messageReaction.message.channel;
  console.log("Got channel")
  if (channel.name !== "welcome") return;
  if (!(messageReaction.emoji == "🚨" || messageReaction.emoji == "⛔")) return;
  console.log("Passed react chek")
  console.log(messageReaction.message.id)
  //if (messageReaction.message.id !== "392743506445074432") return;
  var labBunnyRole = "392736357715542017";
  var optoutRole = "392736650498932739";
  if (messageReaction.emoji.name === "🚨") {
    var member = await client.guilds.get("300155035558346752")
      .fetchMember(user);
    await member.removeRole(labBunnyRole)
  } else if (messageReaction.emoji.name === "⛔") {
    var member = await client.guilds.get("300155035558346752")
      .fetchMember(user);
    await member.removeRole(optoutRole)
  }
})
client.login(token);
