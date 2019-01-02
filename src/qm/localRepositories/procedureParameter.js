//The settings inside the BD and not from the server
class procedureParameter {
    constructor(pName, pValue, pDataType, pIsOutput) {
        this.Name = pName;
        this.Value = pValue;
        this.DataType = pDataType;
        this.IsOutput = pIsOutput;
    }
}
module.exports = procedureParameter;