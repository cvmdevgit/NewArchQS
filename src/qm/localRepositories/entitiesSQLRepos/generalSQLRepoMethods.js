var logger = require("../../../common/logger");
var common = require("../../../common/common");
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

async function getAll(db, tableName, RepoEntity) {
    try {
        let attributesStr = getEntityAttributes(RepoEntity);
        let sql = "SELECT " + attributesStr + " FROM " + tableName;
        let sqlResult = await db.all(sql);
        return sqlResult;
    }
    catch (error) {
        logger.logError(error);
        return undefined;
    }
};

module.exports.getAll = getAll;
