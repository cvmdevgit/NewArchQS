function getEntityAttributes(entity) {
    let attributesStr = "";
    let attributes = Object.getOwnPropertyNames(entity).filter(function (value) { return !value.startsWith("_"); });
    for (var index = 0; index < attributes.length; index++) {
        attributesStr = attributesStr + "[" + attributes[index] + "]";
        if (index != (attributes.length - 1)) {
            attributesStr = attributesStr + ",";
        }
    }
    return attributesStr;
}
module.exports.getEntityAttributes = getEntityAttributes;
