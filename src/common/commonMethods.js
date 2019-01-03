function guid() {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}

function newDataID() {
  return Number(Math.random() * -10000000000);
}

function GenerateRequestID() {
  return Number(Math.random() * 100000000);
}

function clearArray(entities) {
  if (entities) {
    entities.splice(0, entities.length)
  }
}
function Now() {
  return new Date;
}
function Today() {
  let Now = new Date;
  let Today = Now.setHours(0, 0, 0, 0);
  return new Date(Today);
}

function Tomorrow() {
  let Now = new Date;
  let Tomorrow = Now.setHours(23, 59, 59, 9999);
  return new Date(Tomorrow);
}

module.exports.Tomorrow = Tomorrow;
module.exports.Today = Today;
module.exports.Now = Now;
module.exports.guid = guid;
module.exports.newDataID = newDataID;
module.exports.GenerateRequestID = GenerateRequestID;
module.exports.clearArray = clearArray;
