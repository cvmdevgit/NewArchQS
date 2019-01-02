var config = require('config');
var settings = config.get('settings');
console.log(settings);
module.exports.success = 0;
module.exports.error = -1;
module.exports.not_valid = -2;
module.exports.skip_command = -3;
module.exports.noData = -100;
module.exports.cDISPLAY_NOT_LOGIN_MSG = -5;
module.exports.cDISPLAY_CUSTOMER_INFO_FORM = -6;
module.exports.TokenAuthenticatedHeaderKey = 'Authorization';
module.exports.TokenAuthenticatedHeaderValuePrefix = 'TokenAuthenticated';
module.exports.settings = settings;
module.exports.ActiveFilter = "Active";
module.exports.Enable = "1";
module.exports.Disable = "0";
module.exports.serverURL = "http://localhost:3000";

