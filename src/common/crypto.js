// RSA with node-forge
"use strict";
// npm install node-forge
const fg = require("node-forge");

const cGLOBAL_ENCRYPTION_KEY = 'TEST1TEST2TESTESTEST1TES';
const cGLOBAL_ECRYPTION_VECTOR = 'abcdefgh';

//Decrypt the input text using (method)
function Decrypt(plainText) {
    try {
        var j;
        var hexes = plainText.match(/.{1,2}/g) || [];
        var back = "";
        for (j = 0; j < hexes.length; j++) {
            back += String.fromCharCode(parseInt(hexes[j], 16));
        }

        var decipher = fg.cipher.createDecipher('3DES-CBC', cGLOBAL_ENCRYPTION_KEY);
        decipher.start({ iv: cGLOBAL_ECRYPTION_VECTOR });
        decipher.update(fg.util.createBuffer(back));
        decipher.finish();

        var decipherOutput = decipher.output.getBytes();

        return decipherOutput;

    } catch (error) {
        logger.logError(error);
        return "";
    }
}

function Encrypt(plainText) {
    try {
        var cipher = fg.cipher.createCipher('3DES-CBC', cGLOBAL_ENCRYPTION_KEY);
        cipher.start({ iv: cGLOBAL_ECRYPTION_VECTOR });
        cipher.update(fg.util.createBuffer(plainText));
        cipher.finish();
        var encrypted = cipher.output;
        var encryptedData = encrypted.data;
        var hex, i;
        var result = "";

        for (i = 0; i < encryptedData.length; i++) {
            hex = ("00" + encryptedData.charCodeAt(i).toString(16)).slice(-2);
            result += (hex);
        }

        return result.toUpperCase();
    } catch (error) {
        logger.logError(error);
        return "";
    }
};


module.exports.Encrypt = Encrypt;
module.exports.Decrypt = Decrypt;
