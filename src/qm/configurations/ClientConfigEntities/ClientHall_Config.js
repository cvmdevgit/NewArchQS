class ClientHall_Config {
    constructor(Hall_Config) {
        this.ID = Hall_Config.ID;
        this.Name_L1 = Hall_Config.Name_L1;
        this.Name_L2 = Hall_Config.Name_L2;
        this.Name_L3 = Hall_Config.Name_L3;
        this.Name_L4 = Hall_Config.Name_L4;
        this.Color = Hall_Config.Color;
        this.GuidingText_L1 = Hall_Config.GuidingText_L1;
        this.GuidingText_L2 = Hall_Config.GuidingText_L2;
        this.GuidingText_L3 = Hall_Config.GuidingText_L3;
        this.GuidingText_L4 = Hall_Config.GuidingText_L4;
    }
}

module.exports = ClientHall_Config;