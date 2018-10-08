//User Data saved on server
class ClientUser_Config {
    constructor(User_Config) {
        this.ID =  User_Config.ID;
        this.Name_L1 = User_Config.Name_L1;
        this.Name_L2 = User_Config.Name_L2;
        this.Name_L3 = User_Config.Name_L3;
        this.Name_L4 = User_Config.Name_L4;
        this.LoginName = User_Config.LoginName;
    }
}
module.exports = ClientUser_Config;