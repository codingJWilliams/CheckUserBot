const fs = require("fs");
var storageLocation = "./storage/chome-left.json"
const getStorage = () => { // ES6 Functions for reasons
  return new Promise((resolve, reject) => {
    fs.readFile(storageLocation, {
      encoding: "utf-8"
    }, (err, data) => {
      if (err) throw err;
      resolve(JSON.parse(data))
    })
  })
}
const putStorage = (data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(storageLocation, JSON.stringify(data), (err) => {
      if (err) throw err;
      resolve();
    })
  })
}
exports.userLeft = (member) => {
  getStorage()
    .then((data) => { // Read the storage from memory
      console.log(data)
      if (data.indexOf(member.id) === -1) { // If the user is not in the storage
        data.push(member.id); // Add the user to the storage
        putStorage(data); // Write the storage and ignore return value
      } // We don't need an else as, if the user is in the storage, we don't want to add them again
    })
}
exports.userInStorage = (member) => {
  return new Promise((resolve, reject) => {
    getStorage()
      .then((data) => { // Read the storage from memory
        console.log(data)
        console.log(data.indexOf(member.id))
        if (data.indexOf(member.id) === -1) { // If the user is not in the storage
          resolve(false);
        } else { // User has previously left
          resolve(true);
        }
      })
  });
}
exports.internalFunctions = {
  getStorage: getStorage,
  putStorage: putStorage
}
