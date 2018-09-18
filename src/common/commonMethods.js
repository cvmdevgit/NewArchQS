function guid() {
  return Math.random().toString() +
  Math.random().toString() +
  Math.random().toString();
}

function clearArray(entities) {
  if (entities) {
    entities.splice(0, entities.length)
  }
}
module.exports.guid = guid;
module.exports.clearArray = clearArray;