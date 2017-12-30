// Import checks
var checks = [
  require("../checks/dbl")
  .check,
  require("../checks/softban")
  .check,
  require("../checks/age")
  .check,
  require("../checks/previouslyJoined")
  .check
];
exports.check = function (member) {
  return new Promise((resolve, reject) => {
    var promiseMeNoPromises = [];
    for (var i = 0; i < checks.length; i++) {
      promiseMeNoPromises.push(checks[i](member));
    }
    Promise.all(promiseMeNoPromises)
      .then((results) => {
        console.log(results)
        var kik = false;
        results.map(r => r.kick ? kik = true : null);
        console.log(kik)
        var failedResults = results.filter(result => {
          return !result.pass
        });
        var succeededResults = results.filter(result => {
          return result.pass
        });
        if (failedResults.length > 0 || kik) {
          // We have some failed results
          resolve({
            pass: false,
            kick: kik,
            failed: failedResults,
            passed: succeededResults
          })
        } else {
          // All results are good.
          resolve({
            pass: true,
            failed: [],
            passed: succeededResults
          })
        }
      })
  })
}
// Function to build pretty embed
exports.pretty = function (results, userTag, th) {
  var theFields = [];
  for (var i = 0; i < results.failed.length; i++) {
    theFields.push({
      name: results.failed[i].name,
      value: results.failed[i].reason
    })
  }
  for (var i = 0; i < results.passed.length; i++) {
    theFields.push({
      name: results.passed[i].name,
      value: results.passed[i].reason
    })
  }
  var flags = JSON.parse(require("fs")
    .readFileSync("./storage/flags.json"))
  var embed = {
    "embed": {
      "title": userTag + " joined the server",
      "description": "Poops :poo: some checks failed D:\n\n" + (flags.autoban || results.kick ? "Kicked\n" : ""),
      "color": 16711680,
      "footer": {
        "text": `${results.passed.length}/${results.passed.length + results.failed.length} checks passed`
      },
      "thumbnail": th,
      "author": {
        "name": "New Member"
      },
      "fields": theFields
    }
  };
  return embed;
}
