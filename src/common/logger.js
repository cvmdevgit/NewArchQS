var fs = require("fs");
const dateformat = require("dateformat");

var logError = function (error) {
    try {
        var stack = new Error().stack

        var str = dateformat(new Date().getTime(), "HH:MM:ss dd/mm/yyyy") + "\n\r";
        str = str + error;
        str = str + "\n\r";
        str = str + "Stack: \n\r" + stack;
        str = str + "\n\r";


        fs.appendFile("sedco.log", str, function (err) {
            if (err) {
                console.log("there was an error: " + err);
                return;
            }
        });
        console.log(str);
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
};

module.exports.logError = logError;