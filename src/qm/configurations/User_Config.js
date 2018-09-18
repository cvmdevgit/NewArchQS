//User Data saved on server
class User_Config {
    constructor() {
        this.ID = "";
        this.OrgID = "";
        this.Department_ID = "";
        this.Name_L1 = "";
        this.Name_L2 = "";
        this.Name_L3 = "";
        this.Name_L4 = "";
        this.LoginName = "";
        this.Password = "";
        this.MobilePhone = "";
        this.Email = "";
        this.PinCode = "";
        this.AuthenticationType_LV = ""; //  System = 0,Windows = 1
        this.UserADGUID = "";
        this.ShouldChangePassword = "";
        this.Locked = "";
        this.LastLoginTime = "";
        this.LastLogoutTime = "";
        this.Language_ID = "";
        this.FailedLogins = "";
        this.LastPasswordChangeTime = "";
        this.ActiveOnBranch_ID = "";
        this.Type_LV = "";   // Normal = 0,InternalAPI = 1,ExternalAPI = 2
        this.SegmentAllocationType = ""; //   SelectAll = 1,Customize = 2
    }
}
module.exports = User_Config;