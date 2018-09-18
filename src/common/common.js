module.exports.success = 0;
module.exports.error = -1;
module.exports.not_valid = -2;
module.exports.noData = -100;



module.exports.TokenAuthenticatedHeaderKey = 'Authorization';
module.exports.TokenAuthenticatedHeaderValuePrefix = 'TokenAuthenticated';

module.exports.ActiveFilter = "Active";
module.exports.Enable = "1";
module.exports.Disable = "0";
module.exports.serverURL = "http://localhost:3000";
module.exports.settings = {
    OrgID : "1",
    ServerConnectionParameters : { Username: "SystemUser", Password: "123",   ServerURL : "http://Localhost:8080/CVMServer"  },
    dbType : "sql",
    dbConnection : "./db/queuing.db",
    sqldbConnection : {
        user: "sa",
        password: "sedco@123",
        server: "majd",
        database: "new"
    },
    mock : true
}



