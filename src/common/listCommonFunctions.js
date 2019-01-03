function isArrayValid(ArrayOfEntities) {
    return ArrayOfEntities && ArrayOfEntities.length > 0;
}

function find(ArrayOfEntities, ID) {
    let Entity;
    if (isArrayValid(ArrayOfEntities) && ID) {
        Entity = ArrayOfEntities.find(function (value) {
            return value.ID.toString() == ID.toString();
        });
    }
    return Entity;
}

function clearArray(entities) {
    if (entities) {
      entities.splice(0, entities.length)
    }
  }

  module.exports.isArrayValid = isArrayValid;
  module.exports.find = find;
  module.exports.clearArray = clearArray;