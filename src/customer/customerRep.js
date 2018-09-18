var getAll = function () {


};

var getFilterBy = function (FilterName, FilterValue) {
    if (FilterName !== undefined) {
        return getAll();
    }
    if (FilterValue !== undefined) {
        return getAll();
    }


};

module.exports.getAll = getAll;
module.exports.getFilterBy = getFilterBy;